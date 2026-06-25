import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

// Backend uses UPPER_CASE, frontend displays lower_case — normalize on fetch
function normalizeJob(job) {
  return {
    ...job,
    status:  job.status?.toLowerCase(),
    jobType: job.type?.toLowerCase() || "sample",
  };
}

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const fetchJobs = createAsyncThunk("jobs/fetchJobs", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get("/artisans/jobs");
    return res.data.data.map(normalizeJob);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to load jobs");
  }
});

export const fetchJobById = createAsyncThunk("jobs/fetchJobById", async (jobId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/artisans/jobs/${jobId}`);
    return normalizeJob(res.data.data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to load job");
  }
});

export const acceptJob = createAsyncThunk("jobs/acceptJob", async (jobId, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch(`/artisans/jobs/${jobId}/accept`, {});
    return normalizeJob(res.data.data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to accept job");
  }
});

export const declineJob = createAsyncThunk("jobs/declineJob", async (jobId, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch(`/artisans/jobs/${jobId}/decline`, {});
    return normalizeJob(res.data.data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to decline job");
  }
});

// payload: { jobId, status: "VIDEO_UPLOADED"|"COMPLETED", videoId? }
export const advanceJobStatus = createAsyncThunk("jobs/advanceJobStatus", async ({ jobId, status, videoId }, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch(
      `/artisans/jobs/${jobId}/status`,
      { status, ...(videoId ? { videoId } : {}) },
    );
    return normalizeJob(res.data.data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update status");
  }
});

// payload: { jobId, message, fileId? }
export const addJobUpdate = createAsyncThunk("jobs/addJobUpdate", async ({ jobId, message, fileId }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post(
      `/artisans/jobs/${jobId}/updates`,
      { message, ...(fileId ? { fileId } : {}) },
    );
    return { jobId, update: res.data.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to post update");
  }
});

// Upload video file → returns { fileId, url }
export const uploadJobVideo = createAsyncThunk("jobs/uploadJobVideo", async ({ jobId, file }, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("video", file);
    const res = await apiClient.post(
      `/artisans/jobs/${jobId}/upload-video`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data; // { fileId, url }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to upload video");
  }
});

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const jobsSlice = createSlice({
  name: "jobs",
  initialState: {
    jobs:        [],
    activeJob:   null,  // full job detail for JobDetails view
    loading:     false,
    actionLoading: false,
    error:       null,
    actionError: null,
  },
  reducers: {
    clearActionError(state) { state.actionError = null; },
    clearActiveJob(state)   { state.activeJob = null; },
  },
  extraReducers: (builder) => {
    // fetchJobs
    builder
      .addCase(fetchJobs.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, { payload }) => { state.loading = false; state.jobs = payload; })
      .addCase(fetchJobs.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });

    // fetchJobById
    builder
      .addCase(fetchJobById.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.activeJob = payload;
        // Also update in list if present
        const idx = state.jobs.findIndex((j) => j.id === payload.id);
        if (idx >= 0) state.jobs[idx] = payload;
      })
      .addCase(fetchJobById.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });

    // acceptJob / declineJob / advanceJobStatus — update job in list + activeJob
    const updateJobInState = (state, payload) => {
      state.actionLoading = false;
      state.activeJob = payload;
      const idx = state.jobs.findIndex((j) => j.id === payload.id);
      if (idx >= 0) state.jobs[idx] = payload;
    };

    [acceptJob, declineJob, advanceJobStatus].forEach((thunk) => {
      builder
        .addCase(thunk.pending,   (state) => { state.actionLoading = true; state.actionError = null; })
        .addCase(thunk.fulfilled, (state, { payload }) => updateJobInState(state, payload))
        .addCase(thunk.rejected,  (state, { payload }) => { state.actionLoading = false; state.actionError = payload; });
    });

    // addJobUpdate — append update to activeJob.updates
    builder
      .addCase(addJobUpdate.pending,   (state) => { state.actionLoading = true; })
      .addCase(addJobUpdate.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        if (state.activeJob?.id === payload.jobId) {
          state.activeJob.updates = [...(state.activeJob.updates || []), payload.update];
        }
      })
      .addCase(addJobUpdate.rejected,  (state, { payload }) => { state.actionLoading = false; state.actionError = payload; });

    // uploadJobVideo — just loading state, result used by caller
    builder
      .addCase(uploadJobVideo.pending,   (state) => { state.actionLoading = true; state.actionError = null; })
      .addCase(uploadJobVideo.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(uploadJobVideo.rejected,  (state, { payload }) => { state.actionLoading = false; state.actionError = payload; });
  },
});

export const { clearActionError, clearActiveJob } = jobsSlice.actions;
export default jobsSlice.reducer;
