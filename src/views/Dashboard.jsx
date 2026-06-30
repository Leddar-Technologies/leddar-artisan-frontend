"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchJobs } from "../redux/slices/jobsSlice";
import StatCard from "../components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { Briefcase, Clock, CheckCircle, Wallet, TrendingUp, Loader2,
         ShieldCheck, Fingerprint, MapPin, CreditCard, Lock, ChevronRight } from "lucide-react";
import { getArtisanKycStatus } from "../services/artisanKycService";

// ─── KYC Progress Card ────────────────────────────────────────────────────────

function KycProgressCard({ kycProfile }) {
  const ninDone  = kycProfile.ninStatus === "verified" || kycProfile.status === "verified";
  const addrDone = !!(kycProfile.hasAddress);
  const bankDone = !!(kycProfile.hasBankDetails);

  const steps = [
    {
      id: 1, Icon: Fingerprint, label: "NIN Verification",
      desc: ninDone ? "Verified via QoreID" : "Verify your National ID Number",
      done: ninDone,
    },
    {
      id: 2, Icon: MapPin, label: "Business Address",
      desc: addrDone ? "Address saved" : "Enter your workshop address",
      done: addrDone,
    },
    {
      id: 3, Icon: CreditCard, label: "Bank Details",
      desc: bankDone ? "Verified & saved" : "Add your payout bank account",
      done: bankDone,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-amber-200/70">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <ShieldCheck className="text-amber-700" size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">Complete Your Verification ({doneCount}/3)</p>
            <p className="text-xs text-amber-700 mt-0.5">All 3 steps required before you can receive jobs and payments.</p>
          </div>
        </div>
        <a href="/kyc" className="hidden sm:flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 transition-colors shrink-0">
          Continue <ChevronRight size={13} />
        </a>
      </div>
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-200/70">
        {steps.map((s) => {
          const Icon = s.Icon;
          return (
            <div key={s.id} className={`flex items-start gap-3 px-5 py-4 ${s.done ? "opacity-70" : ""}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
                s.done ? "bg-emerald-100 text-emerald-600" : "bg-white border border-amber-300 text-amber-700"
              }`}>
                {s.done ? <CheckCircle size={16} /> : <Icon size={16} />}
              </div>
              <div>
                <p className={`text-xs font-bold ${s.done ? "text-emerald-700" : "text-amber-900"}`}>
                  {s.label} {s.done && "✓"}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 sm:hidden">
        <a href="/kyc" className="flex items-center justify-center gap-1 rounded-lg bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800 transition-colors w-full">
          Continue Verification <ChevronRight size={13} />
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    assigned:       <Badge variant="info">Assigned</Badge>,
    in_progress:    <Badge variant="warning">In Progress</Badge>,
    video_uploaded: <Badge variant="warning">Video Uploaded</Badge>,
    completed:      <Badge variant="success">Completed</Badge>,
    declined:       <Badge variant="danger">Declined</Badge>,
  };
  return map[status] || <Badge>{status}</Badge>;
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user }    = useSelector((s) => s.auth);
  const { jobs, loading } = useSelector((s) => s.jobs);

  const [kycProfile, setKycProfile] = useState(null);

  useEffect(() => {
    if (jobs.length === 0) dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    getArtisanKycStatus().then((p) => setKycProfile(p)).catch(() => {});
  }, []);

  const totalJobs      = jobs.length;
  const inProgressJobs = jobs.filter((j) => ["in_progress", "video_uploaded"].includes(j.status)).length;
  const completedJobs  = jobs.filter((j) => j.status === "completed").length;
  const sampleJobs     = jobs.filter((j) => j.jobType === "sample").length;
  const productionJobs = jobs.filter((j) => j.jobType === "production").length;
  const pendingJobs    = jobs.filter((j) => j.status === "assigned").length;
  const recentJobs     = [...jobs].slice(0, 4);

  const artisanName = user?.artisan?.fullName || user?.email?.split("@")[0] || "Artisan";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="overflow-hidden rounded-3xl border border-surface-500/80 bg-gradient-to-br from-[#2C1810] via-leather to-[#5A2F22] p-6 sm:p-8 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.18em] text-white/60">Leddar Artisan Portal</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
          Welcome back, {artisanName}.
        </h1>
        <p className="mt-1 text-sm text-white/70">
          {pendingJobs > 0
            ? `You have ${pendingJobs} job${pendingJobs > 1 ? "s" : ""} waiting for your response.`
            : inProgressJobs > 0
            ? `You have ${inProgressJobs} job${inProgressJobs > 1 ? "s" : ""} in progress.`
            : "No active jobs right now. Check back soon."}
        </p>
      </div>

      {/* KYC 3-step progress reminder */}
      {kycProfile && !(kycProfile.ninStatus === "verified" && kycProfile.hasAddress && kycProfile.hasBankDetails) && (
        <KycProgressCard kycProfile={kycProfile} />
      )}

      {/* Stats */}
      {loading && jobs.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-leather" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard title="Total Jobs"      value={totalJobs}      icon={Briefcase}   iconColor="text-leather" />
            <StatCard title="Active Work"     value={inProgressJobs} icon={Clock}       iconColor="text-gold" />
            <StatCard title="Pending Accept"  value={pendingJobs}    icon={Briefcase}   iconColor="text-amber-500" />
            <StatCard title="Completed"       value={completedJobs}  icon={CheckCircle} iconColor="text-success" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Sample Jobs"     value={sampleJobs}     icon={CheckCircle} iconColor="text-leather" />
            <StatCard title="Production Jobs" value={productionJobs} icon={Wallet}      iconColor="text-espresso" />
          </div>

          {/* Recent jobs */}
          <Card>
            <CardHeader><CardTitle>Recent Jobs</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {recentJobs.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No jobs assigned yet.</p>
              ) : (
                recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-100 p-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">{job.productType}</p>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        Qty: {job.quantity} · {job.jobType === "sample" ? "Sample" : "Production"}
                        {job.deadline ? ` · Due ${new Date(job.deadline).toLocaleDateString("en-NG")}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
