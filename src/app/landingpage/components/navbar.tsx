import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="w-full bg-[#fafafa] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/hamming-logo.svg" 
                alt="Hamming" 
                width={120} 
                height={32} 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/product" className="text-[#71717a] hover:text-[#18181b] transition-colors">
              Product
            </Link>
            <Link href="/pricing" className="text-[#71717a] hover:text-[#18181b] transition-colors">
              Pricing
            </Link>
            <Link href="/demo" className="text-[#71717a] hover:text-[#18181b] transition-colors">
              Demo
            </Link>
            <Link href="/docs" className="text-[#71717a] hover:text-[#18181b] transition-colors">
              Docs
            </Link>
            <Link href="/about" className="text-[#71717a] hover:text-[#18181b] transition-colors">
              About
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#dbeafe]"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              >
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
