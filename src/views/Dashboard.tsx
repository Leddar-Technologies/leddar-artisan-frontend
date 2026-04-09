"use client";

import { useApp } from '../context/AppContext';
import StatCard from '../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Briefcase, Clock, CheckCircle, Wallet, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, jobs, payments, notifications } = useApp();

  const totalJobs = jobs.length;
  const inProgressJobs = jobs.filter(j => j.status === 'in_progress').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const totalEarnings = payments
    .filter(p => p.status === 'received')
    .reduce((sum, p) => sum + p.amount, 0);

  const recentJobs = jobs.slice(0, 3);
  const recentNotifications = notifications.slice(0, 4);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Dashboard</h1>
        <p className="text-neutral-700 mt-1">Overview of your work and earnings</p>
      </div>

      {user?.kycStatus !== 'verified' && (
        <Card className="border-l-4 border-l-gold">
          <CardContent className="flex items-start gap-3">
            <div className="p-2 bg-gold/15 rounded-lg">
              <TrendingUp className="text-leather" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-ink">Complete Your KYC Verification</h3>
              <p className="text-sm text-neutral-700 mt-1">
                You cannot receive jobs or payments until your KYC is verified. Please complete your verification.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon={Briefcase}
          iconColor="text-leather"
        />
        <StatCard
          title="In Progress"
          value={inProgressJobs}
          icon={Clock}
          iconColor="text-gold"
        />
        <StatCard
          title="Completed"
          value={completedJobs}
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatCard
          title="Total Earnings"
          value={`₦${totalEarnings.toLocaleString()}`}
          icon={Wallet}
          iconColor="text-espresso"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentJobs.length === 0 ? (
              <p className="text-stone-500 text-center py-8">No jobs assigned yet</p>
            ) : (
              recentJobs.map(job => (
                <div key={job.id} className="flex items-start justify-between p-4 bg-stone-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-900">{job.productType}</h4>
                    <p className="text-sm text-stone-600 mt-1">
                      Quantity: {job.quantity} units
                    </p>
                    <p className="text-sm text-stone-600">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-stone-500 text-center py-8">No recent activity</p>
            ) : (
              recentNotifications.map(notif => (
                <div key={notif.id} className="p-3 bg-stone-50 rounded-lg">
                  <h4 className="font-medium text-stone-900 text-sm">{notif.title}</h4>
                  <p className="text-xs text-stone-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {new Date(notif.date).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
