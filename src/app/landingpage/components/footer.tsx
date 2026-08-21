import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#fafafa] border-t border-[#e4e4e7]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Image 
                src="/hamming-logo.svg" 
                alt="Hamming" 
                width={100} 
                height={28} 
                className="h-7 w-auto"
              />
            </div>
          </div>

          {/* Learn Column */}
          <div>
            <h3 className="font-medium text-sm mb-4 text-[#18181b]">Learn</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/what-is-hamming"
                  className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors"
                >
                  What is Hamming
                </Link>
              </li>
              <li>
                <Link
                  href="/documentation"
                  className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-medium text-sm mb-4 text-[#18181b]">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/product" className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors">
                  Product
                </Link>
              </li>
              <li>
                <Link
                  href="/customers"
                  className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors"
                >
                  Customers
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legals Column */}
          <div>
            <h3 className="font-medium text-sm mb-4 text-[#18181b]">Legals</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="font-medium text-sm mb-4 text-[#18181b]">Connect</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="mailto:hello@hamming.ai"
                  className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors"
                >
                  Email
                </Link>
              </li>
              <li>
                <Link
                  href="https://twitter.com/hamming"
                  className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="https://linkedin.com/company/hamming"
                  className="text-sm text-[#71717a] hover:text-[#18181b] transition-colors"
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-8 border-t border-[#e4e4e7]">
          {/* Awards/Badges */}
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            {/* HIPAA Badge */}
            <Image src="/hipaa_badge.webp" alt="HIPAA Compliant" width={60} height={60} className="h-12 w-auto" />
            {/* Product Hunt Badge */}
            <Image
              src="/product-hunt.svg"
              alt="Product Hunt"
              width={80}
              height={60}
              className="h-12 w-auto"
            />
            {/* Product of the Day Badge */}
            <Image
              src="/daily2.svg"
              alt="Product of the day 2nd place"
              width={80}
              height={60}
              className="h-12 w-auto"
            />
          </div>

          {/* Copyright */}
          <p className="text-xs text-[#71717a]">© Forward Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
