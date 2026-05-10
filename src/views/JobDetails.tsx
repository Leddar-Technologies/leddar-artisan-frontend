"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
// Import your types and actions
import { RootState } from "../store";
import { updateJobStatus } from "../store/jobsSlice";
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
  Image as ImageIcon,
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
  const dispatch = useDispatch();

  // Access state from Redux slices
  const { jobs } = useSelector((state: RootState) => state.jobs);
  const { user } = useSelector((state: RootState) => state.auth);

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
    return job.jobType === "sample" ? (
      <Badge variant="warning">Sample Job</Badge>
    ) : (
      <Badge variant="info">Production Job</Badge>
    );
  };

  const handleAccept = () => {
    if (user?.kycStatus !== "verified") {
      alert("Please complete KYC verification before accepting jobs");
      return;
    }
    dispatch(updateJobStatus({ jobId, status: "in_progress" }));
  };

  const handleDecline = () => {
    if (confirm("Are you sure you want to decline this job?")) {
      dispatch(updateJobStatus({ jobId, status: "declined" }));
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

        dispatch(updateJobStatus({ jobId, status: "video_uploaded" }));
        return;
      }

      if (job.status === "video_uploaded") {
        dispatch(updateJobStatus({ jobId, status: "completed" }));
        return;
      }
    }

    if (job.jobType === "production" && job.status === "in_progress") {
      dispatch(updateJobStatus({ jobId, status: "completed" }));
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
    if (!note.trim() && imageFiles.length === 0 && videoFiles.length === 0)
      return;

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

    return { key: step, label: labels[step], isDone, isCurrent };
  });

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

      {/* Header Section */}
      <section className="overflow-hidden rounded-3xl border border-surface-500/80 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative bg-gradient-to-br from-white via-[#f7f2ea] to-[#e9f2ed] px-6 py-7 sm:px-8 sm:py-10">
            <div className="absolute inset-0 opacity-90 [background-image:radial-gradient(circle_at_top_right,rgba(209,166,103,0.14),transparent_35%)]" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {getJobTypeBadge()}
                {getStatusBadge()}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                {job.productType}
              </h1>
              <p className="max-w-2xl text-sm sm:text-base leading-7 text-neutral-900">
                {job.jobType === "sample"
                  ? "Produce one finished sample piece and upload a video for review before completion."
                  : "Work through production in stages and upload supporting images or videos."}
              </p>
            </div>
          </div>
          <div className="bg-surface-100/70 px-6 py-7 sm:px-8 sm:py-10">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-surface-400/70 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                  Assigned Date
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {new Date(job.assignedDate).toLocaleDateString()}
                </p>
              </div>
              {/* Add Deadline and Quantity cards similarly */}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700">{job.specifications}</p>
            </CardContent>
          </Card>

          {/* Reference Images Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon size={20} /> Reference Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(job.referenceImages || []).map((img, idx) => (
                  <figure
                    key={idx}
                    className="overflow-hidden rounded-2xl border bg-white"
                  >
                    <img
                      src={getReferenceImageSrc(img)}
                      alt={getReferenceImageAlt(img)}
                      className="h-40 w-full object-cover"
                    />
                  </figure>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Pipeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step) => (
                <div key={step.key} className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border ${step.isDone ? "bg-success text-white" : "text-neutral-400"}`}
                  >
                    {step.isDone ? (
                      <CheckCircle2 size={14} />
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
        </div>
      </div>
    </div>
  );
}
