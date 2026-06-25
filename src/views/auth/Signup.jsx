"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { registerArtisan, resetAuth } from "../../redux/slices/authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  UserPlus,
  Upload,
  CheckCircle,
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  ArrowLeft,
} from "lucide-react";

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
    email: "",
    whatsapp: "",
    capacityPerWeek: "",
    numberOfWorkers: "",
    password: "",
    confirmPassword: "",
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  const SPECIALTIES = [
    { value: "BAGS",    label: "Bags & Accessories" },
    { value: "WALLETS", label: "Wallets & Small Goods" },
    { value: "BELTS",   label: "Belts" },
    { value: "SHOES",   label: "Footwear" },
    { value: "JACKETS", label: "Apparel / Jackets" },
  ];

  const toggleSpecialty = (value) => {
    setSelectedSpecialties((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
    if (errors.specialty) setErrors((prev) => ({ ...prev, specialty: "" }));
  };

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({}); // Stores validation messages for each field
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioError, setPortfolioError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    dispatch(resetAuth());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for a field when the user starts typing again
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.productionGender)
      newErrors.productionGender = "Please select a production category";
    if (selectedSpecialties.length === 0)
      newErrors.specialty = "Please select at least one specialty";
    if (!formData.whatsapp.trim())
      newErrors.whatsapp = "WhatsApp number is required";

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must agree to the terms to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePortfolioChange = (e) => {
    setPortfolioError("");
    const files = Array.from(e.target.files || []);

    if (files.length + portfolioImages.length > 4) {
      setPortfolioError("Maximum 4 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png"].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) setPortfolioError("Only JPG and PNG formats allowed");
      if (!isValidSize) setPortfolioError("Each image must be under 5MB");

      return isValidType && isValidSize;
    });

    setPortfolioImages((prev) => [...prev, ...validFiles]);
  };

  const removePortfolioImage = (index) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPortfolioError("");

    const isFormValid = validateForm();

    if (portfolioImages.length < 3) {
      setPortfolioError("Please upload at least 3 portfolio images");
      return;
    }

    if (!isFormValid) return;

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    // Send each specialty value individually so the server receives an array
    selectedSpecialties.forEach((s) => data.append("specialty", s));
    data.append("acceptedTerms", String(acceptedTerms));
    portfolioImages.forEach((file) => data.append("portfolio", file));

    dispatch(registerArtisan(data));
  };

  // Helper component for displaying error text
  const ErrorMsg = ({ message }) =>
    message ? (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1">
        <AlertCircle size={12} /> {message}
      </p>
    ) : null;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-espresso via-leather to-espresso flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-3xl border border-[#FFFFFF22] bg-[#FFFFFF12] p-3 backdrop-blur-sm">
          <div className="bg-cream rounded-2xl border border-surface-500 p-8 text-center shadow-card">
            <CheckCircle className="text-success mx-auto mb-4" size={56} />
            <h2 className="text-2xl font-bold text-ink mb-2">
              Application Received
            </h2>
            <p className="text-neutral-800 mb-6">
              Check your email (<strong>{formData.email}</strong>) to confirm
              your account.
            </p>
            <Link href="/login">
              <Button variant="primary">Back to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-espresso via-leather to-espresso flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <img
            src="/leddar-logo.svg"
            alt="Leddar"
            className="mx-auto mb-3 h-12 w-auto"
          />
          <p className="text-surface-200 font-medium">
            Artisan Portal Registration
          </p>
        </div>

        <div className="rounded-3xl border border-[#FFFFFF22] bg-[#FFFFFF12] p-3 backdrop-blur-sm mb-6">
          <div className="bg-cream rounded-2xl border border-surface-500 p-6 sm:p-10 shadow-card">
            <div className="flex items-center gap-3 mb-8 border-b border-surface-400 pb-5">
              <div className="p-2.5 bg-leather/10 rounded-xl">
                <UserPlus className="text-leather" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-ink tracking-tight">
                Create Account
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Details */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Kola Lawal"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className={
                      errors.fullName ? "border-red-500 focus:ring-red-200" : ""
                    }
                  />
                  <ErrorMsg message={errors.fullName} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Production For *
                  </label>
                  <select
                    value={formData.productionGender}
                    onChange={(e) =>
                      handleChange("productionGender", e.target.value)
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl bg-white outline-none transition-all ${
                      errors.productionGender
                        ? "border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-surface-500 focus:ring-2 focus:ring-gold"
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option value="male">Male Wear</option>
                    <option value="female">Female Wear</option>
                    <option value="both">Unisex / Both</option>
                  </select>
                  <ErrorMsg message={errors.productionGender} />
                </div>
              </div>

              {/* Specialty — multi-select chips */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Your Specialties * <span className="font-normal text-neutral-500">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(({ value, label }) => {
                    const active = selectedSpecialties.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleSpecialty(value)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          active
                            ? "bg-leather border-leather text-white"
                            : "bg-white border-surface-500 text-neutral-700 hover:border-leather hover:text-leather"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <ErrorMsg message={errors.specialty} />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Input
                    type="email"
                    label="Email Address *"
                    placeholder="artisan@leddar.ng"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={
                      errors.email ? "border-red-500 focus:ring-red-200" : ""
                    }
                  />
                  <ErrorMsg message={errors.email} />
                </div>
                <div>
                  <Input
                    label="WhatsApp Number *"
                    placeholder="e.g. +234..."
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    className={
                      errors.whatsapp ? "border-red-500 focus:ring-red-200" : ""
                    }
                  />
                  <ErrorMsg message={errors.whatsapp} />
                </div>
              </div>

              {/* Capacity fields */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Input
                    type="number"
                    label="Production Capacity (units/week)"
                    placeholder="e.g. 50"
                    value={formData.capacityPerWeek}
                    onChange={(e) => handleChange("capacityPerWeek", e.target.value)}
                  />
                  <p className="text-xs text-neutral-500 mt-1">How many units can you produce per week?</p>
                </div>
                <div>
                  <Input
                    type="number"
                    label="Number of Workers"
                    placeholder="e.g. 5"
                    value={formData.numberOfWorkers}
                    onChange={(e) => handleChange("numberOfWorkers", e.target.value)}
                  />
                  <p className="text-xs text-neutral-500 mt-1">Including yourself</p>
                </div>
              </div>

              {/* Portfolio Showcase */}
              <div className="border-t border-surface-400 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="text-leather" size={20} />
                  <label className="block text-sm font-bold text-neutral-900">
                    Portfolio (3-4 Images) *
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
                  {portfolioImages.map((file, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-surface-500"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        alt="Preview"
                      />
                      <button
                        onClick={() => removePortfolioImage(index)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        type="button"
                      >
                        <X size={20} className="bg-red-500 p-1 rounded-full" />
                      </button>
                    </div>
                  ))}
                  {portfolioImages.length < 4 && (
                    <label
                      htmlFor="portfolio-upload"
                      className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-surface-500 rounded-2xl cursor-pointer hover:bg-surface-50 transition-all"
                    >
                      <Upload size={20} className="text-neutral-400 mb-1" />
                      <span className="text-[10px] font-bold text-neutral-500">
                        ADD
                      </span>
                      <input
                        type="file"
                        id="portfolio-upload"
                        accept="image/jpeg,image/png"
                        multiple
                        onChange={handlePortfolioChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <ErrorMsg message={portfolioError} />
              </div>

              {/* Security */}
              <div className="grid md:grid-cols-2 gap-5 border-t border-surface-400 pt-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className={`w-full px-4 py-2.5 pr-12 border rounded-xl bg-white outline-none transition-all ${
                        errors.password
                          ? "border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-surface-500 focus:ring-2 focus:ring-gold"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMsg message={errors.password} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      className={`w-full px-4 py-2.5 pr-12 border rounded-xl bg-white outline-none transition-all ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-surface-500 focus:ring-2 focus:ring-gold"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <ErrorMsg message={errors.confirmPassword} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3 rounded-xl border border-surface-400 bg-white px-4 py-3 cursor-pointer hover:bg-surface-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (errors.terms)
                          setErrors((prev) => ({ ...prev, terms: "" }));
                      }}
                      className="h-4 w-4 accent-leather rounded"
                    />
                    <span className="text-sm text-neutral-700 font-medium">
                      I agree to the{" "}
                      <Link
                        href="/terms-and-conditions"
                        target="_blank"
                        className="text-leather underline hover:text-espresso"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="text-leather underline hover:text-espresso"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  <ErrorMsg message={errors.terms} />
                </div>

                {serverError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={18} /> {serverError}
                  </div>
                )}

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
                    "Submit Artisan Application"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-surface-200 hover:text-white transition-colors text-sm font-medium group"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
