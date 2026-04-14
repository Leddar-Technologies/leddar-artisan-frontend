"use client";

import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import {
  User,
  Building2,
  Lock,
  Save,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useApp();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    specialty: user?.specialty || "",
    whatsapp: user?.whatsapp || "",
  });
  const [portfolioImages, setPortfolioImages] = useState<string[]>(
    user?.portfolioImages || [],
  );
  const [portfolioError, setPortfolioError] = useState("");

  const [bankData, setBankData] = useState({
    accountName: user?.bankAccount?.accountName || "",
    accountNumber: user?.bankAccount?.accountNumber || "",
    bankName: user?.bankAccount?.bankName || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setProfileData({
      fullName: user?.fullName || "",
      specialty: user?.specialty || "",
      whatsapp: user?.whatsapp || "",
    });
    setBankData({
      accountName: user?.bankAccount?.accountName || "",
      accountNumber: user?.bankAccount?.accountNumber || "",
      bankName: user?.bankAccount?.bankName || "",
    });
    setPortfolioImages(user?.portfolioImages || []);
  }, [user]);

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
    if (portfolioImages.length < 3) {
      setPortfolioError("Please keep at least 3 portfolio images");
      return;
    }

    updateUser({
      ...profileData,
      portfolioImages,
    });
    alert("Profile updated successfully");
  };

  const handlePortfolioChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPortfolioError("");
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    if (files.length + portfolioImages.length > 4) {
      setPortfolioError("Maximum 4 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setPortfolioError("Only JPG and PNG formats are allowed");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPortfolioError("Each image must be less than 5MB");
        return false;
      }
      return true;
    });

    if (validFiles.length !== files.length) {
      return;
    }

    const imageUrls = await Promise.all(
      validFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () =>
              reject(new Error("Unable to read portfolio file"));
            reader.readAsDataURL(file);
          }),
      ),
    );

    setPortfolioImages((prev) => [...prev, ...imageUrls]);
  };

  const removePortfolioImage = (index: number) => {
    const remaining = portfolioImages.filter(
      (_, imageIndex) => imageIndex !== index,
    );
    setPortfolioImages(remaining);
    if (remaining.length >= 3) {
      setPortfolioError("");
    }
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      bankAccount: bankData,
    });
    alert("Bank details updated successfully");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    alert("Password changed successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">
          Profile & Settings
        </h1>
        <p className="text-stone-600 mt-1">Manage your account information</p>
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-stone-50 border-l-4 border-l-amber-700">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-stone-900 text-lg">
                {user?.fullName}
              </h3>
              <p className="text-sm text-stone-600 mt-1">{user?.email}</p>
              <p className="text-sm text-stone-600">{user?.specialty}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">KYC Status</p>
              {user?.kycStatus === "verified" ? (
                <Badge variant="success">Verified</Badge>
              ) : user?.kycStatus === "pending" ? (
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
                onChange={(e) =>
                  handleProfileChange("fullName", e.target.value)
                }
              />

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Skill/Specialty
                </label>
                <select
                  value={profileData.specialty}
                  onChange={(e) =>
                    handleProfileChange("specialty", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none"
                >
                  <option value="">Select specialty</option>
                  <option value="Footwear - shoes and boots">
                    Footwear - shoes and boots
                  </option>
                  <option value="Footwear - slippers, sandals and heels">
                    Footwear - slippers, sandals and heels
                  </option>
                  <option value="Bags">Bags</option>
                  <option value="Wallets, Belts">Wallets, Belts</option>
                  <option value="Small goods">Small goods</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                value={user?.email || ""}
                disabled
                className="bg-stone-50"
              />

              <Input
                label="Phone Number"
                value={user?.phone || ""}
                disabled
                className="bg-stone-50"
              />
            </div>

            <Input
              label="WhatsApp Number"
              type="tel"
              placeholder="+234 801 234 5678"
              value={profileData.whatsapp}
              onChange={(e) => handleProfileChange("whatsapp", e.target.value)}
            />

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ImageIcon size={18} className="text-stone-700" />
                <p className="text-sm font-semibold text-stone-800">
                  Portfolio Images
                </p>
              </div>

              <div className="mb-3 border-2 border-dashed border-stone-300 rounded-xl p-4 text-center">
                <input
                  id="profile-portfolio-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handlePortfolioChange}
                  className="hidden"
                />
                <label
                  htmlFor="profile-portfolio-upload"
                  className="cursor-pointer"
                >
                  <Upload className="mx-auto mb-2 text-stone-500" size={24} />
                  <p className="text-sm font-medium text-stone-800">
                    Upload portfolio images
                  </p>
                  <p className="text-xs text-stone-600">
                    JPG or PNG • 5MB each • Min 3, Max 4 images
                  </p>
                </label>
              </div>

              {portfolioImages.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-stone-700">
                    Uploaded: {portfolioImages.length}/4 images
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {portfolioImages.map((imageUrl, index) => (
                      <div
                        key={`${imageUrl.slice(0, 16)}-${index}`}
                        className="relative group"
                      >
                        <img
                          src={imageUrl}
                          alt={`Portfolio ${index + 1}`}
                          className="h-24 w-full rounded-lg border border-stone-300 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePortfolioImage(index)}
                          className="absolute -top-2 -right-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {portfolioError && (
                <p className="mt-2 text-sm text-red-700">{portfolioError}</p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="flex items-center gap-2"
              >
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
              onChange={(e) => handleBankChange("accountName", e.target.value)}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Account Number"
                placeholder="0123456789"
                value={bankData.accountNumber}
                onChange={(e) =>
                  handleBankChange("accountNumber", e.target.value)
                }
              />

              <Input
                label="Bank Name"
                placeholder="e.g., First Bank"
                value={bankData.bankName}
                onChange={(e) => handleBankChange("bankName", e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="flex items-center gap-2"
              >
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
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
              />

              <Input
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                className="flex items-center gap-2"
              >
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
