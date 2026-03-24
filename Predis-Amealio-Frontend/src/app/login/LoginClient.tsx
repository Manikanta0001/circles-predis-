'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const result = response.data;

      if (result.token) {
        localStorage.setItem("token", result.token);
        if (result.user) localStorage.setItem("user", JSON.stringify(result.user));
        toast.success("Login successful!");
        router.push("/merchant/dashboard");
        return;
      }

      throw new Error("Invalid response format from server");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;

      if (errorMessage?.includes("User not found")) {
        toast.error("User not found", {
          description: "This email is not registered. Please sign up first.",
          action: {
            label: "Sign Up",
            onClick: () => router.push("/signup"),
          },
        });
        return;
      }

      if (errorMessage?.includes("Invalid password")) {
        toast.error("Invalid password", {
          description: "The password you entered is incorrect. Please try again.",
        });
        return;
      }

      if (errorMessage?.includes("OAuth login")) {
        toast.error("OAuth account", {
          description: "This account uses Google sign-in. Please sign in with Google.",
        });
        return;
      }

      toast.error("Login failed", {
        description: errorMessage || "An error occurred during login",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Amealio account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button className="w-full" variant="gradient" type="submit" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

