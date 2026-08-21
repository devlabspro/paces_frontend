import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/12 w-96 h-96 bg-[#60a5fa]/45 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center py-20 lg:py-32 relative">
          <div className="absolute top-3/4 left-2/5 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-[#2563eb]/40 via-[#3b82f6]/80 to-[#2563eb]/40 rounded-full blur-[180px] -z-10"></div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#f4f4f5]/80 backdrop-blur-sm border border-[#e4e4e7] rounded-full px-3 py-1.5 text-xs text-[#18181b]">
              <span className="text-sm">🎉</span>
              <span>Hamming raised $3.8M Seed Round led by Mischief</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#18181b] mb-8 leading-tight relative z-10">
            <span className="text-balance">At-scale </span>
            <span className="text-[#3b82f6]">testing</span>
            <span className="text-balance"> & </span>
            <br />
            <span className="text-[#3b82f6]">production monitoring</span>
            <br />
            <span className="text-balance">for AI voice agents</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#71717a] max-w-3xl mx-auto mb-12 leading-relaxed text-pretty">
            Simulate thousands of calls before launch, audit every live conversation, and catch regressions instantly
            with always-on heartbeat checks.
          </p>

          <Button
            size="lg"
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 text-base font-medium h-12"
          >
            Get started with Hamming
          </Button>
        </div>

        {/* Trusted By Section */}
        <div className="pb-8 lg:pb-12 relative -mt-8 lg:-mt-12">
          <div className="text-center mb-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-[#18181b] mb-4">
              Trusted by industry leading teams
            </h2>
          </div>

          <div className="flex items-center justify-center gap-8 lg:gap-12 flex-wrap opacity-60">
            {/* Grove */}
            <div className="flex items-center">
              <Image src="/grove-ai.svg" alt="Grove AI" width={100} height={40} className="h-8 w-auto" />
            </div>

            {/* Podium */}
            <div className="flex items-center">
              <Image src="/podium.svg" alt="Podium" width={121} height={38} className="h-7 w-auto" />
            </div>

            {/* Luma */}
            <div className="flex items-center">
              <Image src="/luma-health.svg" alt="Luma Health" width={146} height={34} className="h-6 w-auto" />
            </div>

            {/* 11x */}
            <div className="flex items-center">
              <Image src="/11x.svg" alt="11x" width={75} height={28} className="h-5 w-auto" />
            </div>

            {/* Smith.ai */}
            <div className="flex items-center">
              <Image src="/smith.svg" alt="Smith.ai" width={99} height={20} className="h-4 w-auto" />
            </div>

            {/* Mia */}
            <div className="flex items-center">
              <Image src="/mia.svg" alt="Mia" width={75} height={30} className="h-6 w-auto" />
            </div>
          </div>
        </div>

      </main>

       {/* Dashboard Preview - Full Width */}
       <div className="mt-16 mb-8 px-16 lg:px-24 relative z-20">
         <Image 
           src="/hamming-dash.svg" 
           alt="Hamming Dashboard Preview" 
           width={2400} 
           height={1200} 
           className="w-full h-auto rounded-lg"
         />
       </div>
    </div>
  )
}
