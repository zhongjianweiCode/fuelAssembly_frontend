"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DJANGO_BASE_URL } from "@/config/default";

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

interface FormData {
  email: string;
  password: string;
  confirm_password: string;
}

interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

const registerFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = registerFormSchema.parse(formData);
      const requestBody = {
        email: validatedData.email,
        password: validatedData.password,
        confirm_password: validatedData.confirm_password,
      };

      const response = await fetch(`${DJANGO_BASE_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.detail) {
          if (Array.isArray(responseData.detail)) {
            const errorMessages = responseData.detail.map((err: ValidationError) => {
              if (err.loc && err.loc[2]) {
                setErrors(prev => ({
                  ...prev,
                  [err.loc[2]]: err.msg
                }));
              }
              return err.msg;
            });
            throw new Error(errorMessages.join(', '));
          } else {
            throw new Error(responseData.detail);
          }
        } else {
          throw new Error("Registration failed");
        }
      }

      toast.success(responseData.message || "Registration successful!");
      router.push("/login");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<FormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please check your input");
      } else {
        const errorMessage = error instanceof Error ? error.message : "Registration failed";
        toast.error(errorMessage);
        console.error("Registration error details:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-gray-50 p-4", className)} {...props}>
      <Card className="w-full max-w-md shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="space-y-1 px-8 pt-10 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-gray-500/90">
            Join our community to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  "h-11 rounded-lg border-gray-300 bg-white/95 text-gray-700",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "transition-all duration-200",
                  errors.email && "border-red-500 focus:ring-red-500/20"
                )}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1.5">{errors.email}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={cn(
                  "h-11 rounded-lg border-gray-300 bg-white/95 text-gray-700",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "transition-all duration-200",
                  errors.password && "border-red-500 focus:ring-red-500/20"
                )}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1.5">{errors.password}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={cn(
                  "h-11 rounded-lg border-gray-300 bg-white/95 text-gray-700",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "transition-all duration-200",
                  errors.confirm_password && "border-red-500 focus:ring-red-500/20"
                )}
                disabled={isLoading}
              />
              {errors.confirm_password && (
                <p className="text-sm text-red-600 mt-1.5">{errors.confirm_password}</p>
              )}
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500",
                "text-white font-semibold shadow-md shadow-blue-500/20",
                "hover:from-blue-700 hover:to-blue-600 hover:shadow-lg",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 pt-4">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}