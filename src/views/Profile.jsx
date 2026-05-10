"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../store/slices/authSlice"; // Adjust path to your auth slice
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
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    specialty: user?.specialty || "",
    whatsapp: user?.whatsapp || "",
  });

  const [portfolioImages, setPortfolioImages] = useState(
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
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        specialty: user.specialty || "",
        whatsapp: user.whatsapp || "",
      });
      setBankData({
        accountName: user.bankAccount?.accountName || "",
        accountNumber: user.bankAccount?.accountNumber || "",
        bankName: user.bankAccount?.bankName || "",
      });
      setPortfolioImages(user.portfolioImages || []);
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleBankChange = (field, value) => {
    setBankData({ ...bankData, [field]: value });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (portfolioImages.length < 3) {
      setPortfolioError("Please keep at least 3 portfolio images");
      return;
    }

    dispatch(
      updateProfile({
        ...profileData,
        portfolioImages,
      }),
    );
    alert("Profile updated successfully");
  };

  const handlePortfolioChange = async (e) => {
    setPortfolioError("");
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

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

    if (validFiles.length !== files.length) return;

    const imageUrls = await Promise.all(
      validFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () =>
              reject(new Error("Unable to read portfolio file"));
            reader.readAsDataURL(file);
          }),
      ),
    );

    setPortfolioImages((prev) => [...prev, ...imageUrls]);
  };

  const removePortfolioImage = (index) => {
    const remaining = portfolioImages.filter(
      (_, imageIndex) => imageIndex !== index,
    );
    setPortfolioImages(remaining);
    if (remaining.length >= 3) setPortfolioError("");
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ bankAccount: bankData }));
    alert("Bank details updated successfully");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Please fill in all password fields");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    // Dispatch password change action here
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
              <Badge
                variant={
                  user?.kycStatus === "verified"
                    ? "success"
                    : user?.kycStatus === "pending"
                      ? "warning"
                      : "danger"
                }
              >
                {user?.kycStatus || "Not Verified"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleProfileSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} /> Personal Information
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
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg outline-none"
                >
                  <option value="">Select specialty</option>
                  <option value="Footwear - shoes and boots">
                    Footwear - shoes and boots
                  </option>
                  <option value="Bags">Bags</option>
                  <option value="Wallets, Belts">Wallets, Belts</option>
                </select>
              </div>
            </div>
            {/* Portfolio Section */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-3 border-2 border-dashed border-stone-300 rounded-xl p-4 text-center">
                <input
                  id="p-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioChange}
                  className="hidden"
                />
                <label htmlFor="p-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-stone-500" size={24} />
                  <p className="text-sm font-medium">Upload portfolio images</p>
                </label>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {portfolioImages.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      className="h-24 w-full rounded-lg object-cover"
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(i)}
                      className="absolute top-0 right-0 bg-red-600 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              className="ml-auto flex items-center gap-2"
            >
              <Save size={18} /> Save Profile
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
