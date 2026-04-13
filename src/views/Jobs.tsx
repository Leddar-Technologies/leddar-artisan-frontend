"use client";

import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Calendar, Eye, Hash, Image, Package, Tag } from "lucide-react";
import JobDetails from "./JobDetails";
import {
  getReferenceImageAlt,
  getReferenceImageSrc,
} from "../utils/referenceImages";

type JobFilter = "all" | "sample" | "production";

export default function Jobs() {
  const { jobs, user, updateJobStatus } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filter, setFilter] = useState<JobFilter>("all");

  const filteredJobs = jobs.filter(
    (job) => filter === "all" || job.jobType === filter,
  );

  const counts = {
    all: jobs.length,
    sample: jobs.filter((job) => job.jobType === "sample").length,
    production: jobs.filter((job) => job.jobType === "production").length,
    active: jobs.filter(
      (job) =>
        job.status === "assigned" ||
        job.status === "in_progress" ||
        job.status === "video_uploaded",
    ).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return <Badge variant="info">Assigned</Badge>;
      case "in_progress":
        return <Badge variant="warning">In Progress</Badge>;
      case "video_uploaded":
        return <Badge variant="warning">Video Uploaded</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "declined":
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getJobTypeBadge = (jobType: string) => {
    if (jobType === "sample") {
      return <Badge variant="warning">Sample Job</Badge>;
    }

    return <Badge variant="info">Production Job</Badge>;
  };

  const handleAccept = (jobId: string) => {
    if (user?.kycStatus !== "verified") {
      alert("Please complete KYC verification before accepting jobs");
      return;
    }

    updateJobStatus(jobId, "in_progress");
  };

  const handleDecline = (jobId: string) => {
    if (confirm("Decline this job?")) {
      updateJobStatus(jobId, "declined");
    }
  };

  if (selectedJobId) {
    return (
      <JobDetails jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-surface-500/80 bg-gradient-to-br from-white via-[#f6f1e8] to-[#e7f1ec] px-6 py-7 text-ink shadow-card sm:px-8 sm:py-10">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-leather/20 bg-white px-3 py-1 text-sm font-semibold text-leather shadow-sm">
            <Tag size={16} />
            Assigned Jobs
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Sample and production jobs assigned by Admin
          </h1>
          <p className="max-w-2xl text-sm sm:text-base leading-7 text-neutral-900">
            Review job requirements, accept or decline assignments, and manage
            each job through the correct pipeline.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-surface-500/80 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-700">
              Total jobs
            </p>
            <p className="mt-1 text-2xl font-bold text-ink">{counts.all}</p>
          </div>
          <div className="rounded-2xl border border-surface-500/80 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-700">
              Sample jobs
            </p>
            <p className="mt-1 text-2xl font-bold text-ink">{counts.sample}</p>
          </div>
          <div className="rounded-2xl border border-surface-500/80 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-700">
              Production jobs
            </p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {counts.production}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-500/80 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-700">
              Active jobs
            </p>
            <p className="mt-1 text-2xl font-bold text-ink">{counts.active}</p>
          </div>
        </div>
      </section>

      {user?.kycStatus !== "verified" && (
        <Card className="border-l-4 border-l-gold">
          <CardContent className="py-4">
            <p className="text-neutral-700 font-medium">
              Your KYC verification is pending. You may view jobs but cannot
              accept or work on them until verified.
            </p>
          </CardContent>
        </Card>
      )}

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="mx-auto text-stone-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-ink mb-2">
              No jobs assigned
            </h3>
            <p className="text-neutral-700">
              You do not have any jobs assigned yet. Check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {[
              { id: "all", label: `All jobs (${counts.all})` },
              { id: "sample", label: `Sample jobs (${counts.sample})` },
              {
                id: "production",
                label: `Production jobs (${counts.production})`,
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id as JobFilter)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  filter === item.id
                    ? "border-leather bg-leather text-white"
                    : "border-surface-400 bg-white text-neutral-700 hover:border-leather/40 hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Image className="mx-auto text-stone-400 mb-4" size={60} />
                <h3 className="text-xl font-semibold text-ink mb-2">
                  No jobs in this category
                </h3>
                <p className="text-neutral-700">
                  Try switching the filter to see other assigned jobs.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="overflow-hidden border-surface-400/70 hover:shadow-card transition-shadow"
                >
                  <CardHeader className="bg-surface-100/60 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-xl">
                            {job.productType}
                          </CardTitle>
                          {getJobTypeBadge(job.jobType)}
                        </div>
                        <p className="text-sm text-neutral-600">
                          Assigned on{" "}
                          {new Date(job.assignedDate).toLocaleDateString()} ·
                          Deadline {new Date(job.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-start gap-3 rounded-2xl bg-surface-100 p-4">
                        <Hash size={18} className="mt-0.5 text-stone-500" />
                        <div>
                          <p className="text-xs text-neutral-500">Quantity</p>
                          <p className="font-semibold text-ink">
                            {job.quantity}{" "}
                            {job.jobType === "sample" ? "piece" : "units"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl bg-surface-100 p-4">
                        <Calendar size={18} className="mt-0.5 text-stone-500" />
                        <div>
                          <p className="text-xs text-neutral-500">Deadline</p>
                          <p className="font-semibold text-ink">
                            {new Date(job.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl bg-surface-100 p-4">
                        <Package size={18} className="mt-0.5 text-stone-500" />
                        <div>
                          <p className="text-xs text-neutral-500">
                            Pipeline stage
                          </p>
                          <p className="font-semibold text-ink capitalize">
                            {job.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-surface-400/70 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        Specifications
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        {job.specifications}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-ink">
                        <Image size={16} className="text-leather" />
                        Reference images
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {(job.referenceImages || []).length > 0 ? (
                          job.referenceImages!.map((image, index) => (
                            <figure
                              key={
                                typeof image === "string"
                                  ? image
                                  : `${image.label}-${index}`
                              }
                              className="overflow-hidden rounded-2xl border border-surface-400/70 bg-white shadow-sm"
                            >
                              <img
                                src={getReferenceImageSrc(image)}
                                alt={getReferenceImageAlt(image)}
                                className="h-36 w-full object-cover"
                              />
                              <figcaption className="border-t border-surface-300 px-3 py-2 text-xs font-medium text-neutral-700">
                                {getReferenceImageAlt(image)}
                              </figcaption>
                            </figure>
                          ))
                        ) : (
                          <p className="text-sm text-neutral-500">
                            No reference images provided.
                          </p>
                        )}
                      </div>
                    </div>

                    {job.jobType === "sample" &&
                      job.status === "video_uploaded" && (
                        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-leather">
                          Sample video uploaded. Admin reviews this before
                          forwarding the sample to the brand.
                        </div>
                      )}

                    <div className="flex flex-col gap-3 border-t border-surface-400/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-3">
                        {job.status === "assigned" && (
                          <>
                            <Button
                              variant="success"
                              onClick={() => handleAccept(job.id)}
                              disabled={user?.kycStatus !== "verified"}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDecline(job.id)}
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
                          <Eye size={18} />
                          View details
                        </Button>
                      </div>

                      {job.status === "assigned" &&
                        user?.kycStatus !== "verified" && (
                          <p className="text-sm text-neutral-600">
                            Complete KYC before accepting any job.
                          </p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
