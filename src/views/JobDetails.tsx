"use client";

import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ArrowLeft, Package, Calendar, FileText, Hash } from 'lucide-react';

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
}

export default function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const { jobs, updateJobStatus, user } = useApp();
  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-600">Job not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (job.status) {
      case 'assigned':
        return <Badge variant="info">Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge>{job.status}</Badge>;
    }
  };

  const handleAccept = () => {
    if (user?.kycStatus !== 'verified') {
      alert('Please complete KYC verification before accepting jobs');
      return;
    }
    updateJobStatus(jobId, 'in_progress');
    alert('Job accepted and marked as In Progress');
  };

  const handleDecline = () => {
    if (confirm('Are you sure you want to decline this job?')) {
      alert('Job declined (this is a demo - job still visible)');
    }
  };

  const handleMarkInProgress = () => {
    updateJobStatus(jobId, 'in_progress');
    alert('Job marked as In Progress');
  };

  const handleMarkCompleted = () => {
    if (confirm('Are you sure this job is completed?')) {
      updateJobStatus(jobId, 'completed');
      alert('Job marked as Completed. Awaiting admin approval.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{job.productType}</h1>
            <p className="text-stone-600 mt-1">Job Details and Actions</p>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <Hash className="text-stone-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Quantity</p>
                    <p className="text-lg font-semibold text-stone-900">{job.quantity} units</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <Calendar className="text-stone-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Deadline</p>
                    <p className="text-lg font-semibold text-stone-900">
                      {new Date(job.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
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
                    <p className="text-lg font-semibold text-stone-900">{job.productType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-stone-100 rounded-lg">
                    <Calendar className="text-stone-700" size={20} />
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
              <p className="text-stone-700 leading-relaxed">{job.specifications}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.status === 'assigned' && (
                <>
                  <Button
                    variant="success"
                    fullWidth
                    onClick={handleAccept}
                    disabled={user?.kycStatus !== 'verified'}
                  >
                    Accept Job
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleDecline}>
                    Decline Job
                  </Button>
                </>
              )}

              {job.status === 'assigned' && user?.kycStatus === 'verified' && (
                <Button variant="primary" fullWidth onClick={handleMarkInProgress}>
                  Mark as In Progress
                </Button>
              )}

              {job.status === 'in_progress' && (
                <Button variant="success" fullWidth onClick={handleMarkCompleted}>
                  Mark as Completed
                </Button>
              )}

              {job.status === 'completed' && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
                  This job has been completed and is awaiting admin approval.
                </div>
              )}

              {user?.kycStatus !== 'verified' && job.status === 'assigned' && (
                <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                  Complete your KYC verification to accept this job.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${job.status === 'assigned' || job.status === 'in_progress' || job.status === 'completed' ? 'bg-green-500' : 'bg-stone-300'}`} />
                <div>
                  <p className="font-medium text-stone-900">Assigned</p>
                  <p className="text-xs text-stone-500">
                    {new Date(job.assignedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${job.status === 'in_progress' || job.status === 'completed' ? 'bg-green-500' : 'bg-stone-300'}`} />
                <div>
                  <p className="font-medium text-stone-900">In Progress</p>
                  <p className="text-xs text-stone-500">
                    {job.status === 'in_progress' || job.status === 'completed' ? 'Current' : 'Pending'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${job.status === 'completed' ? 'bg-green-500' : 'bg-stone-300'}`} />
                <div>
                  <p className="font-medium text-stone-900">Completed</p>
                  <p className="text-xs text-stone-500">
                    {job.status === 'completed' ? 'Current' : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
