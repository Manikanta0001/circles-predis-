import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginClient />;
}

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from "@/components/ui/card";
// import Link from "next/link";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription
// } from "@/components/ui/dialog";
// import apiClient from "@/lib/api";
// import { useRouter } from "next/navigation";
// // import { useAuth } from "@/contexts/AuthContext"; // Old approach - commented out

// export default function LoginPage() {
//   const router = useRouter();
//   // const { login } = useAuth(); // Old approach - commented out
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
//   const [isResendingOtp, setIsResendingOtp] = useState(false);
//   const [showOtpDialog, setShowOtpDialog] = useState(false);
  
//   // Old state variables - commented out
//   // const [phone, setPhone] = useState("");

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await apiClient.post("/auth/login", {
//         email,
//         password,
//       });

//       const result = response.data;
      
//       // Store the token in localStorage
//       if (result.token) {
//         localStorage.setItem('token', result.token);
        
//         // Store user data if available
//         if (result.user) {
//           localStorage.setItem('user', JSON.stringify(result.user));
//         }
        
//         toast.success("Login successful!");
//         // Redirect to merchant dashboard
//         window.location.href = '/merchant/dashboard';
//       } else {
//         // Fallback in case response format is not as expected
//         throw new Error('Invalid response format from server');
//       }
//     } catch (error: any) {
//       toast.error("Login failed", {
//         description: error.response?.data?.message || error.message || "Invalid credentials"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Old login handler using useAuth hook - commented out
//   // const handleLogin = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setIsLoading(true);
//   //
//   //   try {
//   //     const result = await login(email, password);
//   //
//   //     if (result?.otpRequired) {
//   //       setPhone(result.phone);
//   //       setShowOtpDialog(true);
//   //       toast.success("OTP sent!", {
//   //         description: "Enter the OTP sent to your phone"
//   //       });
//   //     } else {
//   //       toast.success("Login successful!");
//   //     }
//   //   } catch (error: any) {
//   //     toast.error("Login failed", {
//   //       description: error.message || "Invalid credentials"
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const handleVerifyOtp = async () => {
//     if (!otp || otp.length !== 6) {
//       toast.error("Please enter a valid 6-digit OTP");
//       return;
//     }

//     setIsVerifyingOtp(true);

//     try {
//       const response = await apiClient.post("/auth/verify-email-otp", {
//         email: userEmail,
//         otp: otp,
//       });

//       const data = response.data;

//       toast.success("OTP Verified ✅");

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       setShowOtpDialog(false);
//       router.push(
//         data.user.role === "admin"
//           ? "/admin/dashboard"
//           : "/merchant/dashboard"
//       );
//     } catch (err: any) {
//       toast.error("OTP verification failed", {
//         description: err.response?.data?.message || err.message || "Invalid OTP"
//       });
//     } finally {
//       setIsVerifyingOtp(false);
//     }
//   };

//   // Old OTP verification using phone - commented out
//   // const handleVerifyOtp = async () => {
//   //   try {
//   //     const res = await fetch(
//   //       `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/auth/verify-otp`,
//   //       {
//   //         method: "POST",
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify({ phone, otp })
//   //       }
//   //     );
//   //
//   //     const data = await res.json();
//   //     if (!res.ok) throw new Error(data.message || "Invalid OTP");
//   //
//   //     toast.success("OTP Verified ✅");
//   //
//   //     localStorage.setItem("token", data.token);
//   //     localStorage.setItem("user", JSON.stringify(data.user));
//   //
//   //     window.location.href =
//   //       data.user.role === "admin"
//   //         ? "/admin/dashboard"
//   //         : "/merchant/dashboard";
//   //   } catch (err: any) {
//   //     toast.error("OTP validation failed", { description: err.message });
//   //   }
//   // };

//   const handleResendOtp = async () => {
//     setIsResendingOtp(true);
//     try {
//       await apiClient.post("/auth/resend-email-otp", {
//         email: userEmail,
//       });
//       toast.success("OTP resent!", {
//         description: `OTP has been resent to ${userEmail}`
//       });
//       setOtp("");
//     } catch (err: any) {
//       toast.error("Failed to resend OTP", {
//         description: err.response?.data?.message || err.message
//       });
//     } finally {
//       setIsResendingOtp(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
//             <span className="text-white font-bold text-lg">A</span>
//           </div>
//           <CardTitle className="text-2xl">Welcome back</CardTitle>
//           <CardDescription>
//             Sign in to your Amealio account
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>

//             <Button
//               className="w-full"
//               variant="gradient"
//               type="submit"
//               disabled={isLoading}
//             >
//               {isLoading ? "Signing In..." : "Sign In"}
//             </Button>
//           </form>

//           <div className="mt-4 text-center text-sm text-muted-foreground">
//             Don't have an account?{" "}
//             <Link href="/signup" className="text-primary hover:underline font-medium">
//               Sign up
//             </Link>
//           </div>

//           {/* Demo Login Credentials */}
//           <div className="mt-6 space-y-3 border-t pt-4">
//             <p className="text-xs text-center text-muted-foreground font-medium mb-3">
//               Demo Accounts (Quick Login)
//             </p>
            
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//               <p className="font-semibold text-secondary-blue mb-2 flex items-center gap-2 text-sm">
//                 <span className="text-base">👨‍💼</span> Demo Merchant Account
//               </p>
//               <div className="text-xs text-secondary-blue space-y-1 mb-2">
//                 <p><strong>Email:</strong> merchant@amealio.com</p>
//                 <p><strong>Password:</strong> merchant123</p>
//               </div>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 className="w-full border-secondary-blue text-secondary-blue hover:bg-secondary-blue/10 text-xs"
//                 onClick={() => {
//                   setEmail('merchant@amealio.com');
//                   setPassword('merchant123');
//                 }}
//                 disabled={isLoading}
//               >
//                 Use Merchant Demo
//               </Button>
//             </div>

//             <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//               <p className="font-semibold text-error mb-2 flex items-center gap-2 text-sm">
//                 <span className="text-base">👨‍💼</span> Demo Admin Account
//               </p>
//               <div className="text-xs text-error space-y-1 mb-2">
//                 <p><strong>Email:</strong> admin@amealio.com</p>
//                 <p><strong>Password:</strong> admin123</p>
//               </div>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 className="w-full border-error text-error hover:bg-error/10 text-xs"
//                 onClick={() => {
//                   setEmail('admin@amealio.com');
//                   setPassword('admin123');
//                 }}
//                 disabled={isLoading}
//               >
//                 Use Admin Demo
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* OTP Dialog */}
//       <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Enter Verification Code</DialogTitle>
//             <DialogDescription>
//               We've sent a 6-digit OTP to <strong>{userEmail}</strong>
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label htmlFor="otp">OTP Code</Label>
//               <Input
//                 id="otp"
//                 placeholder="Enter 6-digit OTP"
//                 maxLength={6}
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                 className="text-center text-2xl tracking-widest"
//                 autoFocus
//               />
//               <p className="text-xs text-muted-foreground text-center">
//                 Check your email inbox for the OTP code
//               </p>
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 className="flex-1"
//                 onClick={handleResendOtp}
//                 disabled={isResendingOtp}
//               >
//                 {isResendingOtp ? "Resending..." : "Resend OTP"}
//               </Button>
//               <Button
//                 className="flex-1"
//                 variant="gradient"
//                 onClick={handleVerifyOtp}
//                 disabled={isVerifyingOtp || otp.length !== 6}
//               >
//                 {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
