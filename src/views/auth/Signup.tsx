"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { UserPlus, Upload, CheckCircle, Mail } from "lucide-react";

export default function Signup() {
  const { signup } = useApp();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    specialty: "",
    email: "",
    phone: "",
    whatsapp: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [portfolioError, setPortfolioError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPortfolioError("");
    const files = Array.from(e.target.files || []);

    if (files.length + portfolioImages.length < 3) {
      setPortfolioError("Please upload at least 3 images");
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

    if (validFiles.length === files.length) {
      setPortfolioImages([...portfolioImages, ...validFiles]);
    }
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPortfolioError("");

    if (
      !formData.fullName ||
      !formData.specialty ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (portfolioImages.length < 3) {
      setPortfolioError("Please upload at least 3 portfolio images");
      return;
    }

    if (portfolioImages.length > 4) {
      setPortfolioError("Maximum 4 images allowed");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const success = signup(
      {
        fullName: formData.fullName,
        specialty: formData.specialty,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
      },
      formData.password,
    );

    if (!success) {
      setError("Failed to create account");
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
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

              <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2 text-left">
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
                      <strong>{formData.email}</strong>. Please check your inbox
                      and spam folder.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-left mb-6">
                <h3 className="font-semibold text-ink">What happens next:</h3>
                <ol className="space-y-2 text-sm text-neutral-800">
                  <li className="flex gap-3">
                    <span className="font-bold text-leather flex-shrink-0">
                      1.
                    </span>
                    <span>
                      Our team will review your portfolio and profile
                      information
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-leather flex-shrink-0">
                      2.
                    </span>
                    <span>
                      You'll receive an approval email with your login details
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-leather flex-shrink-0">
                      3.
                    </span>
                    <span>
                      Once approved, you can log in and start receiving jobs
                    </span>
                  </li>
                </ol>
              </div>

              <p className="text-xs text-neutral-700 mb-6">
                This typically takes 24-48 hours. We appreciate your patience!
              </p>

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
          <h1 className="text-4xl font-bold text-gold mb-2">Leddar</h1>
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
                  Skill/Specialty *
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => handleChange("specialty", e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-500 rounded-xl bg-white/90 focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none"
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
                type="email"
                label="Email Address *"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />

              <Input
                type="tel"
                label="WhatsApp Number"
                placeholder="+234 801 234 5678"
                value={formData.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
              />
            </div>

            <div className="border-t border-surface-400 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="text-leather" size={20} />
                <label className="block text-sm font-medium text-neutral-900">
                  Portfolio Images *{" "}
                  <span className="text-xs text-neutral-700">
                    (3-4 images, JPG/PNG, 5MB max each)
                  </span>
                </label>
              </div>

              <div className="border-2 border-dashed border-surface-500 rounded-xl p-6 text-center hover:border-leather/50 transition-colors">
                <input
                  type="file"
                  id="portfolio-upload"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handlePortfolioChange}
                  className="hidden"
                />
                <label
                  htmlFor="portfolio-upload"
                  className="cursor-pointer block"
                >
                  <Upload className="mx-auto text-neutral-700 mb-2" size={32} />
                  <p className="text-sm font-medium text-ink">
                    Click to upload portfolio images
                  </p>
                  <p className="text-xs text-neutral-700 mt-1">
                    JPG or PNG • 5MB each • Min 3, Max 4 images
                  </p>
                </label>
              </div>

              {portfolioImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-ink mb-3">
                    Uploaded: {portfolioImages.length}/4 images
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {portfolioImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-surface-400"
                        />
                        <button
                          onClick={() => removePortfolioImage(index)}
                          className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {portfolioError && (
                <p className="text-sm text-danger mt-2">{portfolioError}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="Password *"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />

              <Input
                type="password"
                label="Confirm Password *"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
              />
            </div>

            {error && (
              <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-500 text-center">
            <span className="text-neutral-800">Already have an account? </span>
            <Link
              href="/login"
              className="text-leather hover:text-espresso font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
