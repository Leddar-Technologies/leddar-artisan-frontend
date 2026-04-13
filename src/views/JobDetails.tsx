"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Image,
  Package,
  Send,
  Upload,
  Video,
} from "lucide-react";
import type { JobStatus } from "../types";
import {
  getReferenceImageAlt,
  getReferenceImageSrc,
} from "../utils/referenceImages";

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
}

interface ActivityEntry {
  id: string;
  note: string;
  images: string[];
  videos: string[];
  createdAt: string;
  status: JobStatus;
}

export default function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const { jobs, updateJobStatus, user } = useApp();
  const job = jobs.find((j) => j.id === jobId);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [note, setNote] = useState("");
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<string[]>([]);

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-700">Job not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const pipeline =
    job.jobType === "sample"
      ? ["assigned", "in_progress", "video_uploaded", "completed"]
      : ["assigned", "in_progress", "completed"];

  const getStatusBadge = (status = job.status) => {
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

  const getJobTypeBadge = () => {
    if (job.jobType === "sample") {
      return <Badge variant="warning">Sample Job</Badge>;
    }

    return <Badge variant="info">Production Job</Badge>;
  };

  const handleAccept = () => {
    if (user?.kycStatus !== "verified") {
      alert("Please complete KYC verification before accepting jobs");
      return;
    }
    updateJobStatus(jobId, "in_progress");
  };

  const handleDecline = () => {
    if (confirm("Are you sure you want to decline this job?")) {
      updateJobStatus(jobId, "declined");
    }
  };

  const handleAdvanceStatus = () => {
    if (job.jobType === "sample") {
      if (job.status === "in_progress") {
        const hasUploadedSampleVideo = activityEntries.some(
          (entry) => entry.videos.length > 0,
        );

        if (!hasUploadedSampleVideo) {
          alert(
            "Upload at least one sample video before marking as Video Uploaded",
          );
          return;
        }

        updateJobStatus(jobId, "video_uploaded");
        return;
      }

      if (job.status === "video_uploaded") {
        updateJobStatus(jobId, "completed");
        return;
      }
    }

    if (job.jobType === "production" && job.status === "in_progress") {
      updateJobStatus(jobId, "completed");
    }
  };

  const handleQuickMediaUpload = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (imageFiles.length === 0 && videoFiles.length === 0) {
      alert("Please select at least one image or video to upload");
      return;
    }

    setActivityEntries((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        note: "Media uploaded",
        images: imageFiles,
        videos: videoFiles,
        createdAt: new Date().toISOString(),
        status: job.status,
      },
      ...prev,
    ]);

    setImageFiles([]);
    setVideoFiles([]);
  };

  const handleAddUpdate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!note.trim() && imageFiles.length === 0 && videoFiles.length === 0) {
      return;
    }

    setActivityEntries((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        note: note.trim(),
        images: imageFiles,
        videos: videoFiles,
        createdAt: new Date().toISOString(),
        status: job.status,
      },
      ...prev,
    ]);

    setNote("");
    setImageFiles([]);
    setVideoFiles([]);
  };

  const handleFiles = (
    files: FileList | null,
    setFiles: (value: string[]) => void,
  ) => {
    if (!files) {
      setFiles([]);
      return;
    }

    setFiles(Array.from(files).map((file) => file.name));
  };

  const currentStepIndex = pipeline.indexOf(job.status);

  const steps = pipeline.map((step, index) => {
    const isDone = currentStepIndex >= index && job.status !== "declined";
    const isCurrent = currentStepIndex === index;

    const labels: Record<string, string> = {
      assigned: "Assigned",
      in_progress: "In Progress",
      video_uploaded: "Video Uploaded",
      completed: "Completed",
    };

    return {
      key: step,
      label: labels[step],
      isDone,
      isCurrent,
    };
  });

  const totalUpdates = activityEntries.length;
  const sampleInstructions =
    job.jobType === "sample"
      ? "Produce one finished sample piece and upload a video for review before completion."
      : "Work through production in stages and upload supporting images or videos as you progress.";

  return (
    <div className="space-y-6 sm:space-y-8">
      <Button
        variant="outline"
        onClick={onBack}
        className="inline-flex items-center gap-2"
      >
        <ArrowLeft size={18} />
        Back to jobs
      </Button>

      <section className="overflow-hidden rounded-3xl border border-surface-500/80 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative bg-gradient-to-br from-white via-[#f7f2ea] to-[#e9f2ed] px-6 py-7 sm:px-8 sm:py-10">
            <div className="absolute inset-0 opacity-90 [background-image:radial-gradient(circle_at_top_right,rgba(209,166,103,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(24,19,16,0.05),transparent_30%)]" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {getJobTypeBadge()}
                {getStatusBadge()}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                {job.productType}
              </h1>
              <p className="max-w-2xl text-sm sm:text-base leading-7 text-neutral-900">
                {sampleInstructions}
              </p>
            </div>
          </div>

          <div className="bg-surface-100/70 px-6 py-7 sm:px-8 sm:py-10">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-surface-400/70 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                  Assigned date
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {new Date(job.assignedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-2xl border border-surface-400/70 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                  Deadline
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {new Date(job.deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="rounded-2xl border border-surface-400/70 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                  Quantity
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {job.quantity}{" "}
                  {job.jobType === "sample" ? "sample piece" : "units"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <Package className="text-stone-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Job Type</p>
                    <p className="text-lg font-semibold text-stone-900">
                      {job.jobType === "sample"
                        ? "Sample Job"
                        : "Production Job"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <Calendar className="text-stone-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Deadline</p>
                    <p className="text-lg font-semibold text-stone-900">
                      {new Date(job.deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <Package className="text-stone-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Product Type</p>
                    <p className="text-lg font-semibold text-stone-900">
                      {job.productType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <Clock className="text-stone-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Assigned Date</p>
                    <p className="text-lg font-semibold text-stone-900">
                      {new Date(job.assignedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700 leading-relaxed">
                {job.specifications}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image size={20} />
                Reference Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(job.referenceImages || []).map((image, index) => (
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
                      className="h-40 w-full object-cover"
                    />
                    <figcaption className="border-t border-surface-300 px-3 py-2 text-xs font-medium text-neutral-700">
                      {getReferenceImageAlt(image)}
                    </figcaption>
                  </figure>
                ))}
                {(job.referenceImages || []).length === 0 && (
                  <p className="text-sm text-neutral-500">
                    No reference images supplied for this job.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Upload Images and Videos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.jobType === "sample" && (
                <div className="rounded-2xl border border-gold/30 bg-gold/10 p-3 text-sm text-leather">
                  Sample jobs require at least one finished sample video.
                </div>
              )}

              <form onSubmit={handleQuickMediaUpload} className="space-y-4">
                <div className="grid gap-4">
                  <label className="block rounded-2xl border border-dashed border-surface-400 bg-surface-100 p-4 text-sm text-neutral-700">
                    <span className="mb-3 flex items-center gap-2 font-medium text-ink">
                      <Image size={16} /> Supporting images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleFiles(e.target.files, setImageFiles)
                      }
                      className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-leather file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#592f22]"
                    />
                    {imageFiles.length > 0 && (
                      <p className="mt-3 text-xs text-neutral-500">
                        {imageFiles.join(", ")}
                      </p>
                    )}
                  </label>

                  <label className="block rounded-2xl border border-dashed border-surface-400 bg-surface-100 p-4 text-sm text-neutral-700">
                    <span className="mb-3 flex items-center gap-2 font-medium text-ink">
                      <Video size={16} /> Supporting videos
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) =>
                        handleFiles(e.target.files, setVideoFiles)
                      }
                      className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-900"
                    />
                    {videoFiles.length > 0 && (
                      <p className="mt-3 text-xs text-neutral-500">
                        {videoFiles.join(", ")}
                      </p>
                    )}
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Upload media
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.status === "declined" && (
                <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                  This job has been declined.
                </div>
              )}

              {job.status === "assigned" && (
                <>
                  <Button
                    variant="success"
                    fullWidth
                    onClick={handleAccept}
                    disabled={user?.kycStatus !== "verified"}
                  >
                    Accept Job
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleDecline}>
                    Decline Job
                  </Button>
                </>
              )}

              {(job.status === "in_progress" ||
                job.status === "video_uploaded") && (
                <Button
                  variant="success"
                  fullWidth
                  onClick={handleAdvanceStatus}
                >
                  {job.jobType === "sample" && job.status === "in_progress"
                    ? "Mark Video Uploaded"
                    : "Mark as Completed"}
                </Button>
              )}

              {job.status === "completed" && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
                  This job has been completed.
                </div>
              )}

              {job.jobType === "sample" && job.status === "video_uploaded" && (
                <div className="rounded-lg bg-gold/10 px-4 py-3 text-sm text-leather">
                  Admin reviews the sample video before it is forwarded to the
                  brand.
                </div>
              )}

              {user?.kycStatus !== "verified" && job.status === "assigned" && (
                <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                  Complete your KYC verification to accept this job.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step) => (
                <div key={step.key} className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border ${
                      step.isDone
                        ? "border-success bg-success text-white"
                        : step.isCurrent
                          ? "border-gold bg-gold/20 text-leather"
                          : "border-surface-400 bg-white text-neutral-400"
                    }`}
                  >
                    {step.isDone ? (
                      <CheckCircle2 size={14} />
                    ) : step.isCurrent ? (
                      <BadgeCheck size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{step.label}</p>
                    <p className="text-xs text-stone-500">
                      {step.isCurrent
                        ? "Current stage"
                        : step.isDone
                          ? "Completed"
                          : "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Progress Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddUpdate} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Work note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setNote(e.target.value)
                    }
                    rows={4}
                    className="w-full rounded-xl border border-surface-500 bg-white/90 px-4 py-3 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/40"
                    placeholder="Add progress notes, issues, or handoff details"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block rounded-2xl border border-dashed border-surface-400 bg-surface-100 p-4 text-sm text-neutral-700">
                    <span className="mb-3 flex items-center gap-2 font-medium text-ink">
                      <Image size={16} /> Supporting images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleFiles(e.target.files, setImageFiles)
                      }
                      className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-leather file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#592f22]"
                    />
                    {imageFiles.length > 0 && (
                      <p className="mt-3 text-xs text-neutral-500">
                        {imageFiles.join(", ")}
                      </p>
                    )}
                  </label>

                  <label className="block rounded-2xl border border-dashed border-surface-400 bg-surface-100 p-4 text-sm text-neutral-700">
                    <span className="mb-3 flex items-center gap-2 font-medium text-ink">
                      <Video size={16} /> Supporting videos
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) =>
                        handleFiles(e.target.files, setVideoFiles)
                      }
                      className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-900"
                    />
                    {videoFiles.length > 0 && (
                      <p className="mt-3 text-xs text-neutral-500">
                        {videoFiles.join(", ")}
                      </p>
                    )}
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Save progress update
                </Button>
              </form>

              <div className="space-y-3 border-t border-surface-400/70 pt-4">
                <p className="text-sm font-medium text-ink">Update history</p>
                {totalUpdates === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No updates added yet.
                  </p>
                ) : (
                  activityEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl bg-surface-100 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-ink">
                          {getStatusBadge(entry.status)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {entry.note && (
                        <p className="mt-2 text-sm leading-6 text-neutral-700">
                          {entry.note}
                        </p>
                      )}
                      {entry.images.length > 0 && (
                        <p className="mt-2 text-xs text-neutral-500">
                          Images: {entry.images.join(", ")}
                        </p>
                      )}
                      {entry.videos.length > 0 && (
                        <p className="mt-1 text-xs text-neutral-500">
                          Videos: {entry.videos.join(", ")}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
