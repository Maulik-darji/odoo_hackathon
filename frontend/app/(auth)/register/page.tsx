"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register: registerApi } = useAuth();
  const [step, setStep] = useState(1); // 1: Input details, 2: OTP Verification
  
  // Registration Form Fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Fleet Manager");
  
  // Verification State
  const [otp, setOtp] = useState("");
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local hackathon convenience: show OTP in UI so they don't need terminal logs
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);

  // Triggered when clicking "Create account" in Step 1
  const handleRequestOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      // First, trigger OTP to the email address
      const res = await api.sendOtp(email);
      setReceivedOtp(res.otp);
      toast.success("OTP sent to your email!");
      setStep(2); // Go to verification step
    } catch (err: any) {
      setError(err.message || "Failed to initiate registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.sendOtp(email);
      toast.success("A new verification code has been sent!");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Triggered when submitting the OTP in Step 2
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Verify OTP first
      await api.verifyOtp(email, otp);
      
      // 2. Perform actual registration and log in
      await registerApi(name, email, password, role);
      toast.success("Registration complete! Awaiting administrator approval.");
    } catch (err: any) {
      setError(err.message || "Invalid verification code or registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-[0_20px_40px_rgba(0,0,0,0.04)] border-white/40 bg-white/70 backdrop-blur-xl rounded-2xl">
      <CardHeader className="space-y-2 text-center pb-8 pt-8">
        <CardTitle className="text-4xl tracking-tight font-normal">
          <span className="serif-italic">Create</span> account
        </CardTitle>
        <CardDescription className="text-slate-500 text-base">
          {step === 1 && "Fill out your details to request operational access"}
          {step === 2 && `Enter the 6-digit verification code sent to ${email}`}
        </CardDescription>
      </CardHeader>

      {/* Step 1: Full Registration Details Form */}
      {step === 1 && (
        <form onSubmit={handleRequestOtpAndSubmit}>
          <CardContent className="space-y-5 px-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">Full Name</Label>
              <Input
                id="name"
                placeholder="Maulik Darji"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-white/80 border-slate-200/60 focus-visible:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/80 border-slate-200/60 focus-visible:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10 bg-white/80 border-slate-200/60 focus-visible:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="role" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">Operational Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 px-3 rounded-lg border border-slate-200/60 bg-white/80 focus-visible:ring-blue-500 text-sm focus:outline-none"
              >
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-8 px-8 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full disabled:opacity-50 transition-transform active:scale-[0.98]"
            >
              {isLoading ? "Initiating..." : "Create Account"}
            </Button>
            <div className="text-sm text-center text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-slate-900 font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      )}

      {/* Step 2: OTP verification dialog/screen */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtpAndRegister}>
          <CardContent className="space-y-5 px-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="otp" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-12 text-center text-xl tracking-widest bg-white/80 border-slate-200/60 focus-visible:ring-blue-500"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-8 px-8 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full disabled:opacity-50 transition-transform active:scale-[0.98]"
            >
              {isLoading ? "Verifying..." : "Verify & Create"}
            </Button>
            <div className="flex justify-between items-center w-full pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Edit details
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
              >
                Resend OTP
              </button>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
