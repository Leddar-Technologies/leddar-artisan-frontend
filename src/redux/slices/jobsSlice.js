import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobs: [],
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    // Updates a specific job status in the array
    updateJobStatus: (state, action) => {
      const { jobId, status } = action.payload;
      const existingJob = state.jobs.find((job) => job.id === jobId);
      if (existingJob) {
        existingJob.status = status;
      }
    },
    // Used to populate the job list after an API call
    setJobs: (state, action) => {
      state.jobs = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { updateJobStatus, setJobs, setLoading, setError } =
  jobsSlice.actions;
export default jobsSlice.reducer;
