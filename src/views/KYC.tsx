"use client";

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Upload, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function KYC() {
  const { user, updateKYC } = useApp();
  const [formData, setFormData] = useState({
    location: user?.location || '',
    accountName: user?.bankAccount?.accountName || '',
    accountNumber: user?.bankAccount?.accountNumber || '',
    bankName: user?.bankAccount?.bankName || '',
  });
  const [idFile, setIdFile] = useState<string | null>(null);
  const [cacFile, setCacFile] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (type: 'id' | 'cac', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'id') {
        setIdFile(file.name);
      } else {
        setCacFile(file.name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKYC({
      location: formData.location,
      bankAccount: {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
      },
      kycStatus: 'pending',
    });
    alert('KYC information submitted for review');
  };

  const getStatusBadge = () => {
    switch (user?.kycStatus) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="default">Not Submitted</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (user?.kycStatus) {
      case 'verified':
        return <CheckCircle2 className="text-green-700" size={48} />;
      case 'pending':
        return <FileCheck className="text-yellow-700" size={48} />;
      case 'rejected':
        return <AlertCircle className="text-red-700" size={48} />;
      default:
        return <Upload className="text-stone-700" size={48} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">KYC Verification</h1>
        <p className="text-stone-600 mt-1">Complete your verification to start receiving jobs</p>
      </div>

      <Card className="border-l-4 border-l-amber-700">
        <CardContent className="flex items-center gap-6 py-6">
          <div className="p-4 bg-amber-50 rounded-lg">
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-stone-900">Verification Status</h3>
              {getStatusBadge()}
            </div>
            <p className="text-stone-600">
              {user?.kycStatus === 'verified' ? (
                'Your account is fully verified. You can receive jobs and payments.'
              ) : user?.kycStatus === 'pending' ? (
                'Your documents are under review. You will be notified once verification is complete.'
              ) : user?.kycStatus === 'rejected' ? (
                'Your verification was rejected. Please resubmit with correct information.'
              ) : (
                'You cannot receive jobs or payments until your KYC is verified. Please complete the form below.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identity Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Upload ID (NIN / Voter's Card)
              </label>
              <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-stone-400 transition-colors">
                <input
                  type="file"
                  id="id-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('id', e)}
                />
                <label htmlFor="id-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-stone-400 mb-2" size={32} />
                  {idFile ? (
                    <p className="text-sm text-stone-700 font-medium">{idFile}</p>
                  ) : (
                    <>
                      <p className="text-sm text-stone-600">Click to upload ID document</p>
                      <p className="text-xs text-stone-500 mt-1">PDF, PNG, JPG up to 5MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Upload CAC Document (Optional)
              </label>
              <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-stone-400 transition-colors">
                <input
                  type="file"
                  id="cac-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('cac', e)}
                />
                <label htmlFor="cac-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-stone-400 mb-2" size={32} />
                  {cacFile ? (
                    <p className="text-sm text-stone-700 font-medium">{cacFile}</p>
                  ) : (
                    <>
                      <p className="text-sm text-stone-600">Click to upload CAC document</p>
                      <p className="text-xs text-stone-500 mt-1">PDF, PNG, JPG up to 5MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Location"
              placeholder="e.g., Lagos, Nigeria"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Account Name"
                placeholder="Your full name"
                value={formData.accountName}
                onChange={(e) => handleChange('accountName', e.target.value)}
              />

              <Input
                label="Account Number"
                placeholder="0123456789"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
              />
            </div>

            <Input
              label="Bank Name"
              placeholder="e.g., First Bank"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" variant="primary" size="lg">
            Submit for Verification
          </Button>
        </div>
      </form>
    </div>
  );
}
