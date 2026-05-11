"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { registerArtisan, resetAuth } from "../../store/slices/authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { UserPlus, Upload, CheckCircle, Mail, Loader2 } from "lucide-react";

export default function Signup() {
  const dispatch = useDispatch();
  const {
    loading,
    error: serverError,
    success,
  } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: "",
    productionGender: "",
    specialty: "",
    email: "",
    phone: "",
    whatsapp: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localError, setLocalError] = useState("");
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioError, setPortfolioError] = useState("");

  // Reset auth state on component mount/unmount
  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePortfolioChange = (e) => {
    setPortfolioError("");
    const files = Array.from(e.target.files || []);

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

    setPortfolioImages((prev) => [...prev, ...validFiles]);
  };

  const removePortfolioImage = (index) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setPortfolioError("");

    // Validation
    if (
      !formData.fullName ||
      !formData.productionGender ||
      !formData.specialty ||
      !formData.email ||
      !formData.password
    ) {
      setLocalError("Please fill in all required fields");
      return;
    }

    if (!acceptedTerms) {
      setLocalError("You must accept the Terms and Conditions to continue");
      return;
    }

    if (portfolioImages.length < 3) {
      setPortfolioError("Please upload at least 3 portfolio images");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    // Prepare FormData for Backend (Multer)
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("productionGender", formData.productionGender);
    data.append("specialty", formData.specialty);
    data.append("phone", formData.phone);
    data.append("whatsapp", formData.whatsapp);
    data.append("acceptedTerms", String(acceptedTerms));

    // Append images with the key "portfolio" to match backend router
    portfolioImages.forEach((file) => {
      data.append("portfolio", file);
    });

    dispatch(registerArtisan(data));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-espresso via-leather to-espresso flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-3xl border border-[#FFFFFF22] bg-[#FFFFFF12] p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-cream rounded-2xl border border-surface-500 shadow-card p-6 sm:p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-success" size={56} />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">
                Request Submitted
              </h2>
              <p className="text-neutral-800 mb-4">
                Thank you for signing up to become an artisan on Leddar!
              </p>

              <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <Mail
                    className="text-success flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="font-semibold text-success mb-1">
                      Email Confirmation Sent
                    </p>
                    <p className="text-sm text-neutral-800">
                      We've sent a confirmation email to{" "}
                      <strong>{formData.email}</strong>.
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/login" className="inline-block">
                <Button variant="primary">Back to Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-espresso via-leather to-espresso flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-[#FFFFFF22] bg-[#FFFFFF12] p-3 sm:p-4 backdrop-blur-sm max-h-[90vh] md:max-h-none overflow-y-auto lg:overflow-visible">
        <div className="text-center mb-7">
          <img
            src="/leddar-logo.svg"
            alt="Leddar"
            className="mx-auto mb-2 h-12 w-auto sm:h-14"
          />
          <p className="text-surface-200">Create Your Artisan Account</p>
        </div>

        <div className="bg-cream rounded-2xl border border-surface-500 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="text-leather" size={28} />
            <h2 className="text-2xl font-bold text-ink">Sign Up</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="John Adebayo"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1.5">
                  Gender You Can Produce For *
                </label>
                <select
                  value={formData.productionGender}
                  onChange={(e) =>
                    handleChange("productionGender", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-surface-500 rounded-xl bg-white focus:ring-2 focus:ring-gold outline-none"
                >
                  <option value="">Select option</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <Input
              type="email"
              label="Email Address *"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <div className="border-t border-surface-400 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="text-leather" size={20} />
                <label className="block text-sm font-medium text-neutral-900">
                  Portfolio Images * (3-4 images)
                </label>
              </div>
              <div className="border-2 border-dashed border-surface-500 rounded-xl p-6 text-center cursor-pointer">
                <input
                  type="file"
                  id="portfolio-upload"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handlePortfolioChange}
                  className="hidden"
                />
                <label htmlFor="portfolio-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-neutral-700 mb-2" size={32} />
                  <p className="text-sm font-medium">
                    Click to upload portfolio images
                  </p>
                </label>
              </div>

              {portfolioImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {portfolioImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-24 object-cover rounded-lg"
                        alt=""
                      />
                      <button
                        onClick={() => removePortfolioImage(index)}
                        className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="Password *"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <Input
                type="password"
                label="Confirm Password *"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-surface-400 bg-white px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span className="text-sm">
                I agree to the Terms and Conditions *
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" size={24} />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
