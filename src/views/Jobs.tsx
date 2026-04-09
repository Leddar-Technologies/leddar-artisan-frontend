"use client";

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Package, Calendar, Hash, Eye } from 'lucide-react';
import JobDetails from './JobDetails';

export default function Jobs() {
  const { jobs, user } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="info">Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (selectedJobId) {
    return <JobDetails jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Assigned Jobs</h1>
        <p className="text-stone-600 mt-1">View and manage your production jobs</p>
      </div>

      {user?.kycStatus !== 'verified' && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="py-4">
            <p className="text-stone-700 font-medium">
              Your KYC verification is pending. You may view jobs but cannot accept or work on them until verified.
            </p>
          </CardContent>
        </Card>
      )}

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Package className="mx-auto text-stone-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-stone-900 mb-2">No Jobs Assigned</h3>
            <p className="text-stone-600">You don't have any jobs assigned yet. Check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map(job => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{job.productType}</CardTitle>
                    <p className="text-sm text-stone-500 mt-1">
                      Assigned on {new Date(job.assignedDate).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Hash size={18} className="text-stone-500" />
                    <div>
                      <p className="text-xs text-stone-500">Quantity</p>
                      <p className="font-semibold">{job.quantity} units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Calendar size={18} className="text-stone-500" />
                    <div>
                      <p className="text-xs text-stone-500">Deadline</p>
                      <p className="font-semibold">{new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Package size={18} className="text-stone-500" />
                    <div>
                      <p className="text-xs text-stone-500">Status</p>
                      <p className="font-semibold capitalize">{job.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedJobId(job.id)}
                    className="flex items-center gap-2"
                  >
                    <Eye size={18} />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
