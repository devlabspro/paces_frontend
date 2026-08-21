import { Puzzle, FileText, BarChart3, Search, Phone, FileBarChart } from "lucide-react"

const features = [
  {
    icon: Puzzle,
    title: "Easy integration",
    description:
      "Dial your SIP number or call our number to load-test, or connect straight to LiveKit / Pipecat—no SIP required. One-click import for Hopper, Retell, and VAPI.",
  },
  {
    icon: FileText,
    title: "One-click prod → test",
    description:
      "Convert any live conversation into a replayable test case with caller audio, ASR text, and expected intent in one click.",
  },
  {
    icon: BarChart3,
    title: "Auto-generated tests & scoring",
    description:
      "We auto-generate test cases and evaluate how your voice agent performs—no manual setup or rules required.",
  },
  {
    icon: Search,
    title: "Red-teaming suite",
    description:
      "Run a curated set of safety tests built from patterns across many production deployments—no custom prompts required.",
  },
  {
    icon: Phone,
    title: "DTMF & IVR emulation",
    description:
      "Simulate IVR trees, send DTMF tones, and verify your agent navigates legacy systems without human help.",
  },
  {
    icon: FileBarChart,
    title: "Detailed reports",
    description:
      "Receive rich PDF test reports to share results across teams—ideal for QA signoff, compliance, or stakeholder reviews.",
  },
]

export function FeaturesSection() {
  return (
    <section className="w-full bg-[#fafafa] py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const isLastColumn = {
            mobile: index === 0, // Not applicable for mobile (1 column)
            tablet: (index + 1) % 2 === 0, // Every 2nd item in 2-column grid
            desktop: (index + 1) % 3 === 0, // Every 3rd item in 3-column grid
          }

          const isLastRow = {
            mobile: index === 5, // Last item (6th) in 1-column grid
            tablet: index >= 4, // Items 5-6 in 2-column grid
            desktop: index >= 3, // Items 4-6 in 3-column grid
          }

          return (
            <div
              key={index}
              className={`flex flex-col space-y-4 p-8 bg-white border-[#e4e4e7]
                ${!isLastColumn.mobile ? "border-r" : ""} 
                ${!isLastRow.mobile ? "border-b" : ""}
                ${!isLastColumn.tablet ? "md:border-r" : "md:border-r-0"} 
                ${!isLastRow.tablet ? "md:border-b" : "md:border-b-0"}
                ${!isLastColumn.desktop ? "lg:border-r" : "lg:border-r-0"} 
                ${!isLastRow.desktop ? "lg:border-b" : "lg:border-b-0"}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-lg font-semibold text-[#18181b]">{feature.title}</h3>
              </div>
              <p className="text-[#71717a] leading-relaxed text-sm">{feature.description}</p>
            </div>
          )
        })}
        </div>
      </div>
    </section>
  )
}
