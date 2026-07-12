"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { api } from "@/lib/api";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.forgotPassword(email);
      toast.success("Reset verification code sent to your email!");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to initiate password reset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError("Please fill out all fields");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.resetPassword(email, otp, newPassword);
      toast.success("Password reset successful! Please log in.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.forgotPassword(email);
      toast.success("A new verification code has been sent!");
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-[0_20px_40px_rgba(0,0,0,0.04)] border-white/40 bg-white/70 backdrop-blur-xl rounded-2xl">
      <CardHeader className="space-y-2 text-center pb-8 pt-8">
        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
          <KeyRound className="w-5 h-5" />
        </div>
        <CardTitle className="text-4xl tracking-tight font-normal">
          <span className="serif-italic">Reset</span> password
        </CardTitle>
        <CardDescription className="text-slate-500 text-base">
          {step === 1 
            ? "Enter your email to receive a password reset code" 
            : "Enter the code sent to your email and choose a new password"}
        </CardDescription>
      </CardHeader>

      {/* Step 1: Request Reset Code */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp}>
          <CardContent className="space-y-5 px-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">Email</Label>
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-8 px-8 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full disabled:opacity-50 transition-transform active:scale-[0.98]"
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
            <div className="text-sm text-center text-slate-500">
              Remembered your password?{" "}
              <Link href="/login" className="text-slate-900 font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      )}

      {/* Step 2: Verification and Reset */}
      {step === 2 && (
        <form onSubmit={handleResetPassword}>
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

            <div className="space-y-2.5">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {newPassword && (() => {
                const getStrength = (pass: string) => {
                  let score = 0;
                  if (pass.length >= 8) score += 1;
                  if (/[A-Z]/.test(pass)) score += 1;
                  if (/[0-9]/.test(pass)) score += 1;
                  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
                  
                  if (score <= 1) return { score, label: "Weak", color: "bg-red-500", text: "text-red-500" };
                  if (score <= 3) return { score, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
                  return { score, label: "Safe & Strong", color: "bg-emerald-500", text: "text-emerald-500" };
                };
                const strength = getStrength(newPassword);
                return (
                  <div className="space-y-1.5 mt-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-400">Password strength:</span>
                      <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strength.color} transition-all duration-300`} 
                        style={{ width: `${(strength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-8 px-8 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full disabled:opacity-50 transition-transform active:scale-[0.98]"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
            <div className="flex justify-between items-center w-full pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
              >
                Resend Code
              </button>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
