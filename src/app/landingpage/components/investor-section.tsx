import { Button } from "@/components/ui/button"
import Image from "next/image"

export function InvestorSection() {
  const investors = [
    { name: "AI GRANT", logoPath: "/ai-grant-logo.svg" },
    { name: "Coalition", logoPath: "/coalition-op-logo.svg" },
    { name: "MISCHIEF", logoPath: "/mischief-logo.svg" },
    { name: "COUCHDB CAPITAL", logoPath: "/coughdrop-mock-logo.svg" },
    { name: "Y Combinator", logoPath: "/yc-logo.svg" },
    { name: "AI GRANT", logoPath: "/ai-grant-logo.svg" },
    { name: "Coalition", logoPath: "/coalition-op-logo.svg" },
    { name: "MISCHIEF", logoPath: "/mischief-logo.svg" },
    { name: "COUCHDB CAPITAL", logoPath: "/coughdrop-mock-logo.svg" },
    { name: "Y Combinator", logoPath: "/yc-logo.svg" },
  ]

  return (
    <section className="py-16 px-4 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-4xl font-bold text-[#18181b] mb-4 text-balance">Backed by leading investors</h2>

        {/* Subtitle */}
        <p className="text-lg text-[#71717a] mb-8 max-w-2xl mx-auto text-pretty">
          Supported by industry-leading partners who champion innovation and long-term value.
        </p>

        {/* CTA Button */}
        <Button
          variant="outline"
          className="mb-12 border-[#3b82f6] text-[#3b82f6] hover:bg-[#dbeafe] px-6 py-2 bg-transparent"
        >
          Learn about our Seed Funding Round
        </Button>

        {/* Investor Logos */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll gap-12 items-center justify-center">
            {investors.map((investor, index) => (
              <div key={index} className="flex-shrink-0 flex items-center justify-center">
                <Image
                  src={investor.logoPath || "/placeholder.svg"}
                  alt={investor.name}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
