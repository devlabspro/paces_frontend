"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please agree to the terms and conditions");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.email,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {/* Background Blur Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/12 w-96 h-96 bg-[#60a5fa]/45 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-[#fafafa] p-4 flex items-center justify-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/hamming-logo.svg"
            alt="Hamming"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e4e4e7]">
            {/* Card header */}
            <div className="bg-white p-8 border-b border-[#e4e4e7]">
              <h1 className="text-3xl font-bold text-[#18181b] text-center">
                Ready to Get Started?
              </h1>
              <p className="text-[#71717a] text-center mt-2">
                Sign up for your Hamming account
              </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#18181b] font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="border-[#e4e4e7] bg-white focus:ring-[#3b82f6] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#18181b] font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="border-[#e4e4e7] bg-white focus:ring-[#3b82f6] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-[#18181b] font-medium">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select defaultValue="+1">
                      <SelectTrigger className="w-[100px] border-[#e4e4e7] focus:ring-[#3b82f6]">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44</SelectItem>
                        <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="flex-1 border-[#e4e4e7] focus:ring-[#3b82f6] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#18181b] font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-[#e4e4e7] focus:ring-[#3b82f6] focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#18181b] font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="border-[#e4e4e7] focus:ring-[#3b82f6] focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-[#71717a]" />
                      ) : (
                        <Eye className="h-5 w-5 text-[#71717a]" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(checked) =>
                        setAgreed(checked as boolean)
                      }
                      className="border-[#e4e4e7] text-[#3b82f6]"
                    />
                    <span className="text-[#71717a]">
                      By clicking Sign up, I agree to the{" "}
                      <Link href="#" className="text-[#3b82f6] hover:underline">
                        Terms of Use
                      </Link>
                      ,{" "}
                      <Link href="#" className="text-[#3b82f6] hover:underline">
                        Privacy Policy
                      </Link>
                      , and{" "}
                      <Link href="#" className="text-[#3b82f6] hover:underline">
                        SaaS Agreement
                      </Link>
                      .
                    </span>
                  </label>

                  <Button
                    type="submit"
                    className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-lg"
                    disabled={!agreed}
                  >
                    Sign up
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[#71717a]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#3b82f6] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[#71717a] text-sm relative z-10 bg-[#fafafa]">
        <p>© 2025 Hamming. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function Register() {
  return <RegisterForm />;
}
