"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchJobs, acceptJob, declineJob } from "../redux/slices/jobsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Calendar, Eye, Hash, Package, Tag, Loader2, RefreshCw, Banknote,
         ShieldCheck, Fingerprint, MapPin, CreditCard, CheckCircle2, ChevronRight } from "lucide-react";
import JobDetails from "./JobDetails";
import { getArtisanKycStatus } from "../services/artisanKycService";

// ─── KYC Banner for Jobs page ────────────────────────────────────────────────

function JobsKycBanner({ kycProfile }) {
  const ninDone  = kycProfile.ninStatus === "verified" || kycProfile.status === "verified";
  const addrDone = !!(kycProfile.hasAddress);
  const bankDone = !!(kycProfile.hasBankDetails);

  const incomplete = [
    !ninDone  && { Icon: Fingerprint, text: "NIN Verification" },
    !addrDone && { Icon: MapPin,      text: "Business Address" },
    !bankDone && { Icon: CreditCard,  text: "Bank Details" },
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-5 py-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <ShieldCheck size={18} className="text-amber-700" />
        <p className="text-sm font-bold text-amber-900">Verification required to accept jobs</p>
      </div>
      <div className="flex flex-wrap gap-2 flex-1">
        {incomplete.map(({ Icon, text }) => (
          <span key={text} className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
            <Icon size={11} /> {text}
          </span>
        ))}
      </div>
      <a href="/kyc" className="inline-flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 transition-colors shrink-0">
        Complete <ChevronRight size={13} />
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function formatNaira(n) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`;
}

function PaymentBadge({ payments = [] }) {
  if (!payments.length) return null;
  const total = payments.reduce((s, p) => s + p.amount, 0);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
      <Banknote size={12} /> Payment Released · {formatNaira(total)}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    assigned:             <Badge variant="info">Assigned</Badge>,
    in_progress:          <Badge variant="warning">In Progress</Badge>,
    video_uploaded:       <Badge variant="warning">Video Uploaded</Badge>,
    correction_requested: <Badge variant="danger">Correction Requested</Badge>,
    sample_approved:      <Badge variant="success">Sample Approved</Badge>,
    pending_delivery:     <Badge variant="warning">Ready for Dispatch</Badge>,
    dispatched:           <Badge variant="info">Dispatched</Badge>,
    delivered:            <Badge variant="success">Delivered</Badge>,
    completed:            <Badge variant="success">Completed</Badge>,
    declined:             <Badge variant="danger">Declined</Badge>,
  };
  return map[status] || <Badge>{status}</Badge>;
}

export default function Jobs() {
  const dispatch = useDispatch();
  const { jobs, loading, error, actionLoading, actionError } = useSelector((s) => s.jobs);
  const { user } = useSelector((s) => s.auth);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [filter, setFilter]               = useState("all");
  const [kycProfile, setKycProfile]       = useState(null);

  const kycVerified = !!(
    kycProfile &&
    (kycProfile.ninStatus === "verified" || kycProfile.status === "verified") &&
    kycProfile.hasAddress &&
    kycProfile.hasBankDetails
  );

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  useEffect(() => {
    getArtisanKycStatus().then((profile) => setKycProfile(profile)).catch(() => {});
  }, []);

  const filteredJobs = jobs.filter((j) => filter === "all" || j.jobType === filter);

  const counts = {
    all:        jobs.length,
    sample:     jobs.filter((j) => j.jobType === "sample").length,
    production: jobs.filter((j) => j.jobType === "production").length,
    active:     jobs.filter((j) => ["assigned", "in_progress", "video_uploaded", "correction_requested", "sample_approved", "pending_delivery", "dispatched"].includes(j.status)).length,
  };

  const handleAccept = async (jobId) => {
    if (!kycVerified) {
      alert("Please complete KYC verification before accepting jobs.");
      return;
    }
    await dispatch(acceptJob(jobId));
  };

  const handleDecline = async (jobId) => {
    if (!confirm("Are you sure you want to decline this job?")) return;
    await dispatch(declineJob(jobId));
  };

  if (selectedJobId) {
    return <JobDetails jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <section className="rounded-3xl border border-surface-500/80 bg-gradient-to-br from-white via-[#f6f1e8] to-[#e7f1ec] px-6 py-7 text-ink shadow-card sm:px-8 sm:py-10">
        <div className="flex items-start justify-between gap-3">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-leather/20 bg-white px-3 py-1 text-sm font-semibold text-leather shadow-sm">
              <Tag size={16} /> Assigned Jobs
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Your Sample & Production Jobs
            </h1>
            <p className="text-sm sm:text-base leading-7 text-neutral-900">
              Review job requirements, accept or decline assignments, and manage each job through to completion.
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchJobs())}
            disabled={loading}
            className="mt-1 rounded-xl border border-[#E8DED5] bg-white p-2 text-[#6A5B54] hover:bg-atmosphere transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total jobs",      value: counts.all },
            { label: "Sample jobs",     value: counts.sample },
            { label: "Production jobs", value: counts.production },
            { label: "Active jobs",     value: counts.active },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-surface-500/80 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-700">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-ink">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KYC step reminder */}
      {kycProfile && !kycVerified && (
        <JobsKycBanner kycProfile={kycProfile} />
      )}

      {/* Action error */}
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {/* Loading */}
      {loading && jobs.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-leather" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center text-red-500">{error}</CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="mx-auto text-stone-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-ink mb-2">No jobs assigned yet</h3>
            <p className="text-neutral-700">Check back later when the admin assigns you a job.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {[
              { id: "all",        label: `All (${counts.all})` },
              { id: "sample",     label: `Sample (${counts.sample})` },
              { id: "production", label: `Production (${counts.production})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f.id
                    ? "border-leather bg-leather text-white"
                    : "border-surface-400 bg-white text-neutral-700 hover:border-leather/40 hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Job cards */}
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden border-surface-400/70 hover:shadow-card transition-shadow">
                <CardHeader className="bg-surface-100/60 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">{job.productType}</CardTitle>
                        <Badge variant={job.jobType === "sample" ? "warning" : "info"}>
                          {job.jobType === "sample" ? "Sample" : "Production"}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {job.order?.brand?.businessName && `Brand: ${job.order.brand.businessName} · `}
                        Created {new Date(job.createdAt).toLocaleDateString("en-NG")}
                        {job.deadline ? ` · Due ${new Date(job.deadline).toLocaleDateString("en-NG")}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <StatusBadge status={job.status} />
                      <PaymentBadge payments={job.order?.payments} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-surface-100 p-4">
                      <Hash size={18} className="mt-0.5 text-stone-500" />
                      <div>
                        <p className="text-xs text-neutral-500">Quantity</p>
                        <p className="font-semibold text-ink">{job.quantity} {job.jobType === "sample" ? "piece" : "units"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-surface-100 p-4">
                      <Calendar size={18} className="mt-0.5 text-stone-500" />
                      <div>
                        <p className="text-xs text-neutral-500">Deadline</p>
                        <p className="font-semibold text-ink">
                          {job.deadline ? new Date(job.deadline).toLocaleDateString("en-NG") : "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-surface-100 p-4">
                      <Package size={18} className="mt-0.5 text-stone-500" />
                      <div>
                        <p className="text-xs text-neutral-500">Status</p>
                        <p className="font-semibold text-ink capitalize">{job.status?.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-surface-400/70 pt-4 sm:flex-row sm:items-center">
                    {job.status === "assigned" && (
                      <>
                        <Button
                          variant="success"
                          onClick={() => handleAccept(job.id)}
                          disabled={actionLoading || !kycVerified}
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept Job"}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDecline(job.id)}
                          disabled={actionLoading}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setSelectedJobId(job.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye size={18} /> View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
