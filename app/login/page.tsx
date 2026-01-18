"use client";

import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
      );
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Google sign in failed");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F3EE] via-white to-emerald-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative">
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowRight className="w-5 h-5 rotate-180 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            <span className="text-sm text-gray-500 group-hover:text-emerald-600 transition-colors">
              Back
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="text-sm text-gray-500">
                Secure Your Communications
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-start gap-3 animate-in slide-in-from-top">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all placeholder:text-gray-400"
                  required
                />
                {email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all pr-12 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1E9A80] text-white font-semibold rounded-xl hover:bg-[#29ba9a] focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 group">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group">
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="group-hover:text-gray-900 transition-colors">
              Continue with Google
            </span>
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-emerald-600 font-semibold hover:text-emerald-700 underline-offset-4 hover:underline transition-all">
              Create account
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-gray-400 text-xs mt-6">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-gray-500 hover:text-gray-700 underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-gray-700 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 relative overflow-hidden p-12 items-center justify-center">
        {/* Floating decorative shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 backdrop-blur-lg rounded-3xl rotate-12 animate-float"></div>
        <div className="absolute bottom-32 left-20 w-56 h-56 bg-white/10 backdrop-blur-lg rounded-3xl -rotate-12 animate-float-delayed"></div>

        {/* Main content */}
        <div className="relative z-10 space-y-6 max-w-lg">
          {/* Welcome Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl animate-slide-in-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome back to <span className="text-emerald-600">Message</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Sign in to continue your secure conversations and stay connected.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 animate-slide-in-right-delayed">
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure Login</h3>
              <p className="text-sm text-gray-600">
                Protected with industry-standard encryption
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Smart Features</h3>
              <p className="text-sm text-gray-600">
                AI-powered chat assistance and more
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Your Privacy Matters
                  </h3>
                  <p className="text-sm text-gray-600">
                    End-to-end encryption ensures your conversations stay
                    private and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl animate-slide-in-right-more-delayed">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">256-bit</div>
                <div className="text-xs text-gray-600 mt-1">Encryption</div>
              </div>
              <div className="border-l border-r border-gray-200">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-xs text-gray-600 mt-1">Support</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-xs text-gray-600 mt-1">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-white/40 rounded-full animate-ping delay-700"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(12deg);
          }
          50% {
            transform: translateY(-20px) rotate(12deg);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(-12deg);
          }
          50% {
            transform: translateY(-30px) rotate(-12deg);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right-delayed {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right-more-delayed {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        .animate-slide-in-right-delayed {
          animation: slide-in-right-delayed 0.8s ease-out;
        }
        .animate-slide-in-right-more-delayed {
          animation: slide-in-right-more-delayed 1s ease-out;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}
