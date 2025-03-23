"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiLock,
  FiArrowRight,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

// const LOGIN_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/token/pair`;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
  });

  // Get the redirect URL from query parameters
  const redirect = searchParams.get("redirect") || "/dashboard";

  // If already authenticated, redirect to the specified page
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  const isFormValid = email.trim().length > 0 && password.trim().length >= 6;

  // Immediate validation feedback
  const showEmailError = touchedFields.email && email.trim().length === 0;
  const showPasswordError = touchedFields.password && password.trim().length < 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 调用登录方法，现在它会在出错时抛出异常，成功时返回true
      await login(email, password);
      console.log('Login successful, redirecting to:', redirect);
      // 认证上下文将处理重定向
    } catch (err: unknown) {
      console.error('Login failed:', err);
      // 显示错误消息，现在应该是从AuthContext中抛出的
      setError(err instanceof Error ? err.message : "登录失败，请重试。");
    } finally {
      setSubmitting(false);
    }
  };

  // Automatically hide error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <FiAlertCircle className="flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-800 hover:text-red-900"
                aria-label="Close error message"
              >
                &times;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-blue-500" />

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500">Please sign in to continue</p>
          </div>

          <div className="space-y-4">
            {/* Email input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <FiUser className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTouchedFields((prev) => ({ ...prev, email: true }));
                }}
                required
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg border ${
                  showEmailError
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-indigo-500"
                } focus:ring-2 focus:ring-indigo-200 transition-all outline-none`}
                disabled={submitting}
              />
              {showEmailError && (
                <p className="text-sm text-red-500">Email is required</p>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <FiLock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setTouchedFields((prev) => ({ ...prev, password: true }));
                  }}
                  required
                  placeholder="Enter your password (min 6 chars)"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    showPasswordError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-indigo-500"
                  } focus:ring-2 focus:ring-indigo-200 transition-all outline-none pr-12`}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-indigo-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {showPasswordError && (
                <p className="text-sm text-red-500">
                  Password must be at least 8 characters
                </p>
              )}
            </div>
          </div>

          {/* Login button */}
          <motion.button
            whileHover={isFormValid && !submitting ? { scale: 1.02 } : {}}
            whileTap={isFormValid && !submitting ? { scale: 0.98 } : {}}
            type="submit"
            disabled={!isFormValid || submitting}
            className={`w-full text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              isFormValid && !submitting
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                Sign In
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          <div className="text-center text-sm text-gray-500">
            Don{"'"}t have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              Create one
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
