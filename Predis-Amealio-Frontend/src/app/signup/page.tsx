'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/AuthContext"; // Old approach - commented out

export default function SignupPage() {
  const router = useRouter();
  // const { register } = useAuth(); // Old approach - commented out
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/register", {
        fullName,
        email,
        password,
        companyName: companyName || undefined,
      });

      const result = response.data;

      // Handle direct login response (no OTP required)
      if (result.token && result.user) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        
        toast.success("Account created successfully!", {
          description: "Welcome to Amealio",
        });
        
        router.push("/merchant/dashboard");
      } else {
        toast.error("Signup failed", {
          description: "Invalid response from server",
        });
      }
    } catch (error: any) {
      toast.error("Signup failed", {
        description: error.response?.data?.message || error.message || "Failed to create account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Old signup handler using useAuth hook - commented out
  // const handleSignup = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //
  //   try {
  //     await register(fullName, email, password);
  //     toast.success("Account created!", {
  //       description: "Welcome to Amealio",
  //     });
  //   } catch (error: any) {
  //     toast.error("Signup failed", {
  //       description: error.message || "Failed to create account",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = await apiClient.post("/auth/verify-email-otp", {
        email: email,
        otp: otp,
      });

      const data = response.data;

      toast.success("Email verified ✅");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setShowOtpDialog(false);
      router.push("/merchant/dashboard");
    } catch (err: any) {
      toast.error("OTP verification failed", {
        description: err.response?.data?.message || err.message || "Invalid OTP"
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      await apiClient.post("/auth/resend-email-otp", {
        email: email,
      });
      toast.success("OTP resent!", {
        description: `OTP has been resent to ${email}`
      });
      setOtp("");
    } catch (err: any) {
      toast.error("Failed to resend OTP", {
        description: err.response?.data?.message || err.message
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>
            Get started with Amealio today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name (Optional)</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <input type="checkbox" className="rounded" required />
              <span className="text-muted-foreground">
                I agree to the terms and conditions
              </span>
            </div>
            <Button 
              className="w-full"
              variant="gradient"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* OTP Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Check your email inbox for the OTP code
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleResendOtp}
                disabled={isResendingOtp}
              >
                {isResendingOtp ? "Resending..." : "Resend OTP"}
              </Button>
              <Button
                className="flex-1"
                variant="gradient"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otp.length !== 6}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
