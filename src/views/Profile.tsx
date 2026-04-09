"use client";

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { User, Building2, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useApp();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    specialty: user?.specialty || '',
    whatsapp: user?.whatsapp || '',
  });

  const [bankData, setBankData] = useState({
    accountName: user?.bankAccount?.accountName || '',
    accountNumber: user?.bankAccount?.accountNumber || '',
    bankName: user?.bankAccount?.bankName || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleBankChange = (field: string, value: string) => {
    setBankData({ ...bankData, [field]: value });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profileData);
    alert('Profile updated successfully');
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      bankAccount: bankData,
    });
    alert('Bank details updated successfully');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    alert('Password changed successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Profile & Settings</h1>
        <p className="text-stone-600 mt-1">Manage your account information</p>
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-stone-50 border-l-4 border-l-amber-700">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-stone-900 text-lg">{user?.fullName}</h3>
              <p className="text-sm text-stone-600 mt-1">{user?.email}</p>
              <p className="text-sm text-stone-600">{user?.specialty}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">KYC Status</p>
              {user?.kycStatus === 'verified' ? (
                <Badge variant="success">Verified</Badge>
              ) : user?.kycStatus === 'pending' ? (
                <Badge variant="warning">Pending</Badge>
              ) : (
                <Badge variant="danger">Not Verified</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleProfileSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileData.fullName}
                onChange={(e) => handleProfileChange('fullName', e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Skill/Specialty
                </label>
                <select
                  value={profileData.specialty}
                  onChange={(e) => handleProfileChange('specialty', e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none"
                >
                  <option value="">Select specialty</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Bags">Bags & Accessories</option>
                  <option value="Leather Goods">Leather Goods</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                className="bg-stone-50"
              />

              <Input
                label="Phone Number"
                value={user?.phone || ''}
                disabled
                className="bg-stone-50"
              />
            </div>

            <Input
              label="WhatsApp Number"
              type="tel"
              placeholder="+234 801 234 5678"
              value={profileData.whatsapp}
              onChange={(e) => handleProfileChange('whatsapp', e.target.value)}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" className="flex items-center gap-2">
                <Save size={18} />
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <form onSubmit={handleBankSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={20} />
              Bank Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Account Name"
              placeholder="Your full name"
              value={bankData.accountName}
              onChange={(e) => handleBankChange('accountName', e.target.value)}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Account Number"
                placeholder="0123456789"
                value={bankData.accountNumber}
                onChange={(e) => handleBankChange('accountNumber', e.target.value)}
              />

              <Input
                label="Bank Name"
                placeholder="e.g., First Bank"
                value={bankData.bankName}
                onChange={(e) => handleBankChange('bankName', e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" className="flex items-center gap-2">
                <Save size={18} />
                Update Bank Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <form onSubmit={handlePasswordSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              />

              <Input
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="secondary" className="flex items-center gap-2">
                <Lock size={18} />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
