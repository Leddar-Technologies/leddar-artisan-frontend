"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateJobStatus } from "../redux/slices/jobsSlice";
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
import {
  getReferenceImageAlt,
  getReferenceImageSrc,
} from "../utils/referenceImages";

export default function JobDetails({ jobId, onBack }) {
  const dispatch = useDispatch();

  // Access state from Redux
  const { jobs } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const job = jobs.find((j) => j.id === jobId);

  const [activityEntries, setActivityEntries] = useState([]);
  const [note, setNote] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

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

  const handleAccept = () => {
    if (user?.kycStatus !== "verified") {
      alert("Please complete KYC verification before accepting jobs");
      return;
    }
    dispatch(updateJobStatus({ jobId, status: "in_progress" }));
  };

  const handleAdvanceStatus = () => {
    if (job.jobType === "sample") {
      if (job.status === "in_progress") {
        const hasVideo = activityEntries.some(
          (entry) => entry.videos.length > 0,
        );
        if (!hasVideo) {
          alert("Upload a sample video before marking as Video Uploaded");
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

  const handleAddUpdate = (e) => {
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

  const handleFiles = (files, setFiles) => {
    if (!files) {
      setFiles([]);
      return;
    }
    setFiles(Array.from(files).map((file) => file.name));
  };

  const currentStepIndex = pipeline.indexOf(job.status);
  const steps = pipeline.map((step, index) => {
    const labels = {
      assigned: "Assigned",
      in_progress: "In Progress",
      video_uploaded: "Video Uploaded",
      completed: "Completed",
    };
    return {
      key: step,
      label: labels[step],
      isDone: currentStepIndex >= index && job.status !== "declined",
      isCurrent: currentStepIndex === index,
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <Button
        variant="outline"
        onClick={onBack}
        className="inline-flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Back to jobs
      </Button>

      {/* Main Content */}
      <section className="overflow-hidden rounded-3xl border border-surface-500/80 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-8">
            <h1 className="text-3xl font-bold">{job.productType}</h1>
            <div className="mt-4 flex gap-2">
              <Badge variant={job.jobType === "sample" ? "warning" : "info"}>
                {job.jobType === "sample" ? "Sample" : "Production"}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{job.specifications}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.status === "assigned" && (
              <Button variant="success" fullWidth onClick={handleAccept}>
                Accept Job
              </Button>
            )}
            {(job.status === "in_progress" ||
              job.status === "video_uploaded") && (
              <Button variant="success" fullWidth onClick={handleAdvanceStatus}>
                {job.jobType === "sample" && job.status === "in_progress"
                  ? "Mark Video Uploaded"
                  : "Mark as Completed"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
