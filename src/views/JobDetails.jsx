"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchJobById, acceptJob, declineJob,
  advanceJobStatus, addJobUpdate, uploadJobVideo, clearActiveJob,
} from "../redux/slices/jobsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import {
  ArrowLeft, CheckCircle2, Clock, FileText,
  Loader2, Package, Send, Upload, Video, AlertCircle, Banknote,
  ShieldCheck, Fingerprint, MapPin, CreditCard, ChevronRight,
} from "lucide-react";

function formatNaira(n) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`;
}

const STAGE_LABEL = {
  SAMPLE_FLAT_FEE: "Sample Fee",
  MATERIAL:        "Raw Materials (Stage 1)",
  SERVICE:         "Service Fee (Stage 2)",
  FULL_PAYMENT:    "Full Payment",
};
import { getArtisanKycStatus } from "../services/artisanKycService";

// ─── KYC missing steps hint (shown under Accept button) ──────────────────────

function KycMissingSteps({ kycProfile }) {
  const ninDone  = kycProfile.ninStatus === "verified" || kycProfile.status === "verified";
  const addrDone = !!(kycProfile.hasAddress);
  const bankDone = !!(kycProfile.hasBankDetails);

  const missing = [
    !ninDone  && { Icon: Fingerprint, text: "NIN Verification" },
    !addrDone && { Icon: MapPin,      text: "Business Address" },
    !bankDone && { Icon: CreditCard,  text: "Bank Details" },
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-amber-700 shrink-0" />
        <p className="text-xs font-bold text-amber-800">Complete verification to accept jobs</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {missing.map(({ Icon, text }) => (
          <span key={text} className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-amber-800">
            <Icon size={10} /> {text}
          </span>
        ))}
      </div>
      <a href="/kyc" className="flex items-center justify-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 transition-colors w-full">
        Go to Verification <ChevronRight size={12} />
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    assigned:      <Badge variant="info">Assigned</Badge>,
    in_progress:   <Badge variant="warning">In Progress</Badge>,
    video_uploaded:<Badge variant="warning">Video Uploaded</Badge>,
    completed:     <Badge variant="success">Completed</Badge>,
    declined:      <Badge variant="danger">Declined</Badge>,
  };
  return map[status] || <Badge>{status}</Badge>;
}

/**
 * Shows a live countdown to acceptanceDeadline.
 * Returns null if no deadline or if it has already passed.
 */
function DeadlineCountdown({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deadline) return;
    const end = new Date(deadline).getTime();

    function tick() {
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      const totalMins = Math.floor(diff / 60000);
      const hours     = Math.floor(totalMins / 60);
      const mins      = totalMins % 60;
      setTimeLeft({ hours, mins, diff });
    }

    tick();
    const id = setInterval(tick, 30000); // update every 30s
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;

  const isExpiringSoon = timeLeft && timeLeft.diff < 2 * 60 * 60 * 1000; // < 2 hours
  const isPast = !timeLeft;

  if (isPast) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        <div className="text-sm text-red-700">
          <strong>Acceptance window has closed.</strong>{" "}
          This job may have been auto-expired. Please contact support if this is an error.
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border px-4 py-3 flex items-start gap-2 ${
      isExpiringSoon
        ? "border-red-200 bg-red-50"
        : "border-amber-200 bg-amber-50"
    }`}>
      <Clock className={`h-4 w-4 mt-0.5 shrink-0 ${isExpiringSoon ? "text-red-500" : "text-amber-600"}`} />
      <div className={`text-sm ${isExpiringSoon ? "text-red-700" : "text-amber-800"}`}>
        <strong>Respond before deadline:</strong>{" "}
        {timeLeft.hours > 0
          ? `${timeLeft.hours}h ${timeLeft.mins}m remaining`
          : `${timeLeft.mins} minute${timeLeft.mins !== 1 ? "s" : ""} remaining`}
        {" — "}
        <span className="text-[11px] opacity-75">
          {new Date(deadline).toLocaleString("en-NG", {
            dateStyle: "medium", timeStyle: "short",
          })}
        </span>
        {isExpiringSoon && (
          <div className="mt-1 font-semibold text-red-700">
            Accept or decline now — this job will auto-expire soon!
          </div>
        )}
      </div>
    </div>
  );
}

const SAMPLE_PIPELINE     = ["assigned", "in_progress", "video_uploaded", "sample_approved", "completed"];
const PRODUCTION_PIPELINE = ["assigned", "in_progress", "video_uploaded", "pending_delivery", "dispatched", "delivered"];

const STEP_LABEL = {
  assigned:       "Assigned",
  in_progress:    "In Progress",
  video_uploaded: "Admin Review",
  sample_approved:"Sample Approved",
  pending_delivery:"Pending Delivery",
  dispatched:     "Dispatched",
  delivered:      "Delivered",
  completed:      "Completed",
};

export default function JobDetails({ jobId, onBack }) {
  const dispatch = useDispatch();
  const { activeJob: job, loading, actionLoading, actionError } = useSelector((s) => s.jobs);
  const { user } = useSelector((s) => s.auth);

  const [note, setNote]                     = useState("");
  const [videoFile, setVideoFile]           = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError]         = useState("");
  const [kycProfile, setKycProfile]         = useState(null);
  const videoInputRef                       = useRef(null);

  // Auto-dismiss video size error after 4 seconds
  useEffect(() => {
    if (!videoError) return;
    const t = setTimeout(() => setVideoError(""), 4000);
    return () => clearTimeout(t);
  }, [videoError]);

  // All 3 steps must be complete before the artisan can accept
  const kycVerified = !!(
    kycProfile &&
    (kycProfile.ninStatus === "verified" || kycProfile.status === "verified") &&
    kycProfile.hasAddress &&
    kycProfile.hasBankDetails
  );

  useEffect(() => {
    dispatch(fetchJobById(jobId));
    return () => dispatch(clearActiveJob());
  }, [dispatch, jobId]);

  useEffect(() => {
    getArtisanKycStatus().then((profile) => setKycProfile(profile)).catch(() => {});
  }, []);

  if (loading && !job) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-leather" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-700">Job not found.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">Go Back</Button>
      </div>
    );
  }

  const isSample        = job.jobType === "sample";
  const pipeline        = isSample ? SAMPLE_PIPELINE : PRODUCTION_PIPELINE;
  const isCorrection    = job.status === "correction_requested";
  // Show correction in pipeline after video_uploaded
  const displayStatus   = isCorrection ? "video_uploaded" : job.status;
  const stepIdx         = pipeline.indexOf(displayStatus);
  const isDeclined      = job.status === "declined";
  const isTerminal      = ["completed", "declined", "delivered"].includes(job.status);
  const isActive        = !isTerminal;

  const handleAccept = async () => {
    if (!kycVerified) {
      alert("Please complete KYC verification before accepting jobs.");
      return;
    }
    await dispatch(acceptJob(jobId));
  };

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this job?")) return;
    await dispatch(declineJob(jobId));
  };

  const handleAdvance = async () => {
    // Both sample and production: upload video when active
    if (isVideoUploadActive) {
      if (!videoFile) { setVideoError("Please select a video file first."); return; }
      setVideoError("");
      setUploadingVideo(true);
      try {
        const result = await dispatch(uploadJobVideo({ jobId, file: videoFile })).unwrap();
        await dispatch(advanceJobStatus({ jobId, status: "VIDEO_UPLOADED", videoId: result.fileId }));
        if (note.trim()) {
          await dispatch(addJobUpdate({ jobId, message: note.trim() }));
        }
        setVideoFile(null);
        setNote("");
      } catch (err) {
        setVideoError(typeof err === "string" ? err : "Upload failed. Try again.");
      } finally {
        setUploadingVideo(false);
      }
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await dispatch(addJobUpdate({ jobId, message: note.trim() }));
    setNote("");
  };

  // Is the video upload section active?
  // Sample: in_progress, correction_requested, or admin-rejected re-upload
  // Production: in_progress (initial upload), or admin-rejected re-upload
  const isVideoUploadActive =
    job.status === "in_progress" ||
    (job.status === "correction_requested" && isSample) ||
    (job.status === "video_uploaded" && job.adminVideoStatus === "rejected");

  const advanceLabel = () => {
    if (job.status === "in_progress")                                                       return isSample ? "Upload Sample Video" : "Submit Production Video";
    if (job.status === "correction_requested" && isSample)                                  return "Re-upload Corrected Video";
    if (job.status === "video_uploaded" && job.adminVideoStatus === "rejected")             return "Re-upload (Admin Correction)";
    return null;
  };

  const canAdvance = isActive && job.status !== "assigned" && !!advanceLabel();

  return (
    <div className="space-y-6 sm:space-y-8">
      <Button variant="outline" onClick={onBack} className="inline-flex items-center gap-2">
        <ArrowLeft size={18} /> Back to jobs
      </Button>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {actionError}
        </div>
      )}

      {/* Header */}
      <section className="overflow-hidden rounded-3xl border border-surface-500/80 bg-white shadow-card">
        <div className="bg-gradient-to-br from-[#f6f1e8] to-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink">{job.productType}</h1>
              <p className="mt-1 text-sm text-neutral-600">
                {job.order?.brand?.businessName && `Brand: ${job.order.brand.businessName} · `}
                {job.ref || `#${job.id.slice(0, 8).toUpperCase()}`}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={isSample ? "warning" : "info"}>
                {isSample ? "Sample Job" : "Production Job"}
              </Badge>
              <StatusBadge status={job.status} />
            </div>
          </div>
        </div>

        {/* Pipeline stepper */}
        {!isDeclined && (
          <div className="px-6 pb-6 sm:px-8">
            <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
              {pipeline.map((step, i) => {
                const done    = i < stepIdx || job.status === "completed" || job.status === "delivered";
                const current = i === stepIdx;
                // Blank out future steps when admin is reviewing (video_uploaded)
                const adminReview = displayStatus === "video_uploaded";
                const blanked = !done && !current;
                return (
                  <div key={step} className="flex items-center gap-1 min-w-0">
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                      done    ? "bg-emerald-100 text-emerald-700"
                      : current ? (adminReview ? "bg-amber-100 text-amber-700 border border-amber-300" : "bg-leather text-white")
                      : "bg-surface-100 text-neutral-300"
                    }`}>
                      {done    ? <CheckCircle2 className="h-3.5 w-3.5" />
                      : current && adminReview ? <Clock className="h-3.5 w-3.5 animate-pulse" />
                      : <Clock className="h-3.5 w-3.5" />}
                      {STEP_LABEL[step] || step.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </div>
                    {i < pipeline.length - 1 && (
                      <div className={`h-0.5 w-5 flex-shrink-0 ${i < stepIdx ? "bg-emerald-300" : "bg-surface-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specs */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={18} /> Specifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Quantity</p>
                  <p className="mt-1 font-semibold text-ink">{job.quantity} {isSample ? "piece" : "units"}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Deadline</p>
                  <p className="mt-1 font-semibold text-ink">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString("en-NG") : "Not set"}
                  </p>
                </div>
              </div>
              {job.specifications && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-neutral-700 leading-relaxed">{job.specifications}</p>
                </div>
              )}
              {/* Reference files */}
              {job.order?.quote?.files?.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
                    Reference Files ({job.order.quote.files.length})
                  </p>
                  {/* Image thumbnails */}
                  {job.order.quote.files.some((f) => f.mimeType?.startsWith("image/")) && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {job.order.quote.files
                        .filter((f) => f.mimeType?.startsWith("image/"))
                        .map((f) => (
                          <a key={f.id} href={f.url} target="_blank" rel="noreferrer"
                            className="block aspect-square rounded-lg overflow-hidden border border-[#E8DED5] bg-[#FAF7F4] hover:opacity-80 transition-opacity">
                            <img src={f.url} alt="Reference" className="h-full w-full object-cover" />
                          </a>
                        ))}
                    </div>
                  )}
                  {/* PDF / video links */}
                  <div className="flex flex-wrap gap-2">
                    {job.order.quote.files
                      .filter((f) => !f.mimeType?.startsWith("image/"))
                      .map((f) => (
                        <a key={f.id} href={f.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-[#E8DED5] bg-atmosphere px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#F0E8DE]">
                          <Package className="h-3.5 w-3.5" />
                          {f.mimeType?.includes("pdf") ? "PDF Brief" : "Video Ref"}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded video */}
          {job.video?.url && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Video size={18} /> Sample Video</CardTitle></CardHeader>
              <CardContent>
                <video src={job.video.url} controls className="w-full rounded-xl max-h-72 bg-black" />
              </CardContent>
            </Card>
          )}

          {/* Updates */}
          <Card>
            <CardHeader><CardTitle>Progress Updates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {job.updates?.length > 0 ? (
                <div className="space-y-3">
                  {job.updates.map((u) => (
                    <div key={u.id} className="rounded-xl bg-surface-100 p-4">
                      <p className="text-sm text-ink">{u.message || "—"}</p>
                      {u.file?.url && (
                        <a href={u.file.url} target="_blank" rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-leather hover:underline">
                          View attachment
                        </a>
                      )}
                      <p className="mt-1 text-xs text-neutral-500">
                        {new Date(u.createdAt).toLocaleString("en-NG")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No updates yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {job.status === "assigned" && (
                <>
                  <DeadlineCountdown deadline={job.acceptanceDeadline} />
                  <Button variant="success" fullWidth onClick={handleAccept}
                    disabled={actionLoading || !kycVerified}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Accept Job"}
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleDecline} disabled={actionLoading}>
                    Decline Job
                  </Button>
                  {!kycVerified && kycProfile && (
                    <KycMissingSteps kycProfile={kycProfile} />
                  )}
                </>
              )}

              {/* Admin rejection banner */}
              {job.adminVideoStatus === "rejected" && job.adminVideoNote && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                    {isSample ? "Sample" : "Production"} Video Rejected by Admin
                  </p>
                  <p className="text-sm text-red-900">{job.adminVideoNote}</p>
                </div>
              )}

              {/* Brand correction feedback banner */}
              {job.status === "correction_requested" && job.correctionNote && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-1">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Correction {job.correctionCount}/2 — Brand Feedback
                  </p>
                  <p className="text-sm text-amber-900">{job.correctionNote}</p>
                </div>
              )}

              {/* Video upload + optional note — combined into one submit */}
              {isVideoUploadActive && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    {job.status === "correction_requested" ? "Upload Corrected Video"
                      : job.adminVideoStatus === "rejected" ? "Re-upload Video"
                      : isSample ? "Sample Video" : "Production Completion Video"}
                  </p>
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 100 * 1024 * 1024) {
                        setVideoError("Video must be 100 MB or less.");
                        setVideoFile(null);
                        e.target.value = "";
                        return;
                      }
                      setVideoFile(file);
                      setVideoError("");
                    }} />
                  <button type="button"
                    onClick={() => videoInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0] || null;
                      if (!file) return;
                      if (file.size > 100 * 1024 * 1024) {
                        setVideoError("Video must be 100 MB or less.");
                        setVideoFile(null);
                        return;
                      }
                      setVideoFile(file);
                      setVideoError("");
                    }}
                    className="w-full rounded-xl border-2 border-dashed border-[#D7CBC1] bg-atmosphere p-4 text-center hover:border-leather transition-colors">
                    <Upload className="mx-auto h-6 w-6 text-[#A39289] mb-1" />
                    <p className="text-xs text-neutral-600">
                      {videoFile ? videoFile.name : "Click or drag a video here"}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Max 100 MB</p>
                  </button>
                  {videoError && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {videoError}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">
                      Note <span className="font-normal normal-case text-neutral-400">(optional)</span>
                    </p>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note for the admin..."
                      rows={3}
                      className="w-full rounded-xl border border-[#E8DED5] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-leather/20 focus:border-leather resize-none"
                    />
                  </div>
                </div>
              )}

              {canAdvance && (
                <Button variant="success" fullWidth onClick={handleAdvance}
                  disabled={actionLoading || uploadingVideo}>
                  {actionLoading || uploadingVideo
                    ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                    : advanceLabel()
                  }
                </Button>
              )}

              {isDeclined && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center">
                  This job was declined.
                </div>
              )}
              {job.status === "video_uploaded" && job.adminVideoStatus !== "rejected" && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 text-center">
                  {job.adminVideoStatus === "approved"
                    ? isSample
                      ? "Video approved by admin — awaiting brand review."
                      : "Video approved — packaging for dispatch."
                    : `${isSample ? "Sample" : "Production"} video submitted — awaiting admin review.`}
                </div>
              )}
              {job.status === "sample_approved" && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 text-center font-semibold">
                  ✓ Sample approved — admin is confirming completion.
                </div>
              )}
              {job.status === "pending_delivery" && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 text-center">
                  {isSample ? "Marked ready — awaiting admin dispatch." : "Video approved — awaiting courier dispatch."}
                </div>
              )}
              {job.status === "dispatched" && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 text-center">
                  🚚 Order dispatched — awaiting brand confirmation.
                </div>
              )}
              {(job.status === "completed" || job.status === "delivered") && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 text-center font-semibold">
                  ✓ Job Complete
                </div>
              )}
            </CardContent>
          </Card>

          {/* Earnings */}
          {(() => {
            const order = job.order;
            if (!order) return null;
            const SAMPLE_ARTISAN_RATE  = 0.70;
            const PROD_STAGE1_RATE     = order.snapshotStage1Rate ?? 0.40;
            const PROD_STAGE2_RATE     = order.snapshotStage2Rate ?? 0.40;

            if (isSample) {
              const base     = order.flatFeePaid || 0;
              const earning  = Math.round(SAMPLE_ARTISAN_RATE * base);
              return (
                <Card className="border-amber-200 bg-amber-50/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-amber-800 text-sm">
                      <Banknote size={16} /> Your Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-700">Sample Fee</span>
                      <span className="font-bold text-amber-900">{formatNaira(earning)}</span>
                    </div>
                    <p className="text-[11px] text-amber-600">
                      Released by admin after you accept/complete the job. Sent to your bank via Paystack.
                    </p>
                  </CardContent>
                </Card>
              );
            }

            // Production job
            const base       = order.escrowBalance || order.totalAmount || order.quote?.price || 0;
            const stage1     = Math.round(PROD_STAGE1_RATE * base);
            const stage2     = Math.round(PROD_STAGE2_RATE * base);
            const total      = stage1 + stage2;
            return (
              <Card className="border-amber-200 bg-amber-50/60">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-amber-800 text-sm">
                    <Banknote size={16} /> Your Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-700">Stage 1 — Materials</span>
                    <span className="font-semibold text-amber-900">{formatNaira(stage1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Stage 2 — Service</span>
                    <span className="font-semibold text-amber-900">{formatNaira(stage2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-amber-200 pt-2">
                    <span className="font-bold text-amber-800">Total</span>
                    <span className="font-extrabold text-amber-900">{formatNaira(total)}</span>
                  </div>
                  <p className="text-[11px] text-amber-600">
                    Released in two stages by admin. Sent to your bank via Paystack.
                  </p>
                </CardContent>
              </Card>
            );
          })()}

          {/* Meta */}
          <Card>
            <CardContent className="pt-4 space-y-3 text-sm">
              {[
                { label: "Job Ref",   value: job.ref  || job.id.slice(0, 8).toUpperCase() },
                { label: "Order Ref", value: job.order?.ref || job.orderId?.slice(0, 8).toUpperCase() },
                ...(job.order?.quote?.ref ? [{ label: "Quote Ref", value: `[${job.order.quote.ref}]` }] : []),
                { label: "Type",     value: job.jobType },
                { label: "Qty",      value: job.quantity },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-neutral-500">{r.label}</span>
                  <span className="font-semibold capitalize font-mono text-xs">{r.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment status */}
          {job.order?.payments?.length > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-emerald-800 text-sm">
                  <Banknote size={16} /> Payment Released
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {job.order.payments.map((p) => (
                  <div key={p.id} className="rounded-xl bg-white border border-emerald-100 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">
                        {STAGE_LABEL[p.stage] || p.stage}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        ✓ Released
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-800">{formatNaira(p.amount)}</p>
                    <p className="text-[11px] text-emerald-600">
                      {new Date(p.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                ))}
                <p className="text-[11px] text-emerald-700 text-center">
                  Funds transferred to your bank account via Paystack
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
