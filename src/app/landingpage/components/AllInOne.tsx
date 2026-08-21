import { BarChart3, Zap, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafafa] py-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#18181b] mb-8 text-balance">
            All-in-one experimentation platform for AI voice agents
          </h1>
          <p className="text-base md:text-lg text-[#71717a] max-w-3xl mx-auto leading-relaxed text-pretty">
            AI voice agents are hard to get right. Small changes in prompts or function call definitions can cause large
            changes in voice agent call quality.
          </p>
        </div>
      </div>

      {/* Feature Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-[#e4e4e7] rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#dbeafe] rounded-lg">
                    <BarChart3 className="w-6 h-6 text-[#3b82f6]" />
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[#18181b]">Edge-case & stress testing</h2>
                <p className="text-sm text-[#71717a] leading-relaxed">
                  We simulate users with diverse accents, speaking styles, interruptions, or unexpected intents to test
                  how your agents handle real-world variability. Identify failure points early and improve resilience
                  before going live.
                </p>
              </div>

              {/* Right Mockup */}
              <div className="relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TdPgs1wipifsnoK3G1rzM2u7fCepwW.png"
                  alt="Testing interface showing status badges for Healthcare, Impatient, Hesitant, and Software Bug scenarios, along with configuration options for Language, Accent, Gender, Background noise, Talking speed, and Call from Humming number"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Infra Integration Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-[#e4e4e7] rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#dcfce7] rounded-lg">
                    <Zap className="w-6 h-6 text-[#16a34a]" />
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[#18181b]">Seamless voice infra integration</h2>
                <p className="text-sm text-[#71717a] leading-relaxed">
                  We provide platform-agnostic hooks that integrate with any AI voice or chat system, so you can
                  simulate real-world conversations at scale. Analyze conversation quality, flag issues, and logs traces
                  for in-depth review.
                </p>
              </div>

              {/* Right Image */}
              <div className="relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bkby9KlvhgdL6bqGJncyzO65ksPPjj.png"
                  alt="Integration flow diagram showing successful data integration into Hamming with various service icons connected in a network pattern"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Agent Performance Benchmarking Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-[#e4e4e7] rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#f3e8ff] rounded-lg">
                    <TrendingUp className="w-6 h-6 text-[#9333ea]" />
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[#18181b]">Voice agent performance benchmarking</h2>
                <p className="text-sm text-[#71717a] leading-relaxed">
                  We automatically benchmark your AI agent's performance against production calls and industry-wide
                  standards. Track trends over time, surface weak spots, and use continuous feedback loops to drive
                  better outcomes and agent reliability.
                </p>
              </div>

              {/* Right Image */}
              <div className="relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qU18h08bbvegyJ4TU0hhd3IKfkQn9d.png"
                  alt="Analytics dashboard showing call status chart with finished and incomplete calls over time, and a data table with test run details including status and type columns"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
