"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
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
import { Eye, EyeOff } from "lucide-react";

const loginSchema = zod.object({
  email: zod.string().email({ message: "Please enter a valid email address" }),
  password: zod.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    clearError();
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setSubmitError(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-[0_20px_40px_rgba(0,0,0,0.04)] border-white/40 bg-white/70 backdrop-blur-xl rounded-2xl">
      <CardHeader className="space-y-2 text-center pb-8 pt-8">
        <CardTitle className="text-4xl tracking-tight font-normal">
          <span className="serif-italic">Welcome</span> back
        </CardTitle>
        <CardDescription className="text-slate-500 text-base">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-8">
          {/* Display general errors */}
          {(submitError || error) && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium">
              {submitError || error}
            </div>
          )}

          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="h-12 bg-white/80 border-slate-200/60 focus-visible:ring-blue-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 uppercase tracking-wide text-xs">Password</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-12 pr-10 bg-white/80 border-slate-200/60 focus-visible:ring-blue-500"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Role info — read-only, determined by database */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role-based access</p>
            <p className="text-xs text-slate-500">Your role is assigned during registration and enforced by the system. You will only see pages relevant to your approved role.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pb-8 px-8 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full disabled:opacity-50 transition-transform active:scale-[0.98]"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-sm text-center text-slate-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-slate-900 font-medium hover:underline">
              Get started
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
