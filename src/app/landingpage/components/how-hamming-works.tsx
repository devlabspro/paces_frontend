"use client"

import { useState } from "react"

export function HowHammingWorks() {
  const [activeStep, setActiveStep] = useState("01")

  const steps = [
    {
      number: "01",
      title: "Generate test suites",
      description: "Auto-generate diverse caller personas with edge-cases to cover every branch of your voice agent.",
    },
    {
      number: "02",
      title: "Run automated tests",
      description:
        "Execute comprehensive testing scenarios automatically across multiple voice agent configurations and environments.",
    },
    {
      number: "03",
      title: "Real-time call analytics",
      description: "Monitor and analyze call performance in real-time with detailed metrics and conversation insights.",
    },
    {
      number: "04",
      title: "Heartbeats",
      description: "Continuous health monitoring of your voice agents with automated alerts and performance tracking.",
    },
  ]

  const currentStep = steps.find((step) => step.number === activeStep)

  return (
    <section className="w-full bg-[#fafafa] py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#18181b] mb-4 text-balance">How Hamming works</h2>
          <p className="text-lg text-[#71717a] max-w-3xl mx-auto text-pretty">
            Effortlessly test, optimize, and monitor your AI voice agents with real-world simulations and AI-driven
            insights.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-6 gap-12 items-start">
        {/* Steps List */}
        <div className="lg:col-span-2 space-y-4 relative">
          {steps.map((step) => {
            const isActive = step.number === activeStep
            return (
              <div
                key={step.number}
                className={`flex gap-6 relative cursor-pointer transition-all duration-200 hover:opacity-80 bg-white p-4 rounded-lg ${isActive ? "pl-6" : "pl-6"}`}
                onClick={() => setActiveStep(step.number)}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b82f6] rounded-full"></div>}

                {/* Step Number */}
                <div className="flex-shrink-0 pt-2">
                  <span
                    className={`text-2xl font-bold transition-colors duration-200 ${
                      isActive ? "text-[#3b82f6]" : "text-[#a1a1aa]"
                    }`}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-2">
                  <h3
                    className={`text-xl font-semibold mb-2 transition-colors duration-200 ${isActive ? "text-[#3b82f6]" : "text-[#a1a1aa]"}`}
                  >
                    {step.title}
                  </h3>
                  {isActive && (
                    <p className="text-[#71717a] leading-relaxed animate-in fade-in duration-300">{step.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Interface Mockups */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-lg overflow-hidden">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bkdXVsi5tPEEtI2IX5I2wWTZN2GReC.png"
              alt="Hamming AI interface showing test suite generation"
              className="w-full h-auto"
            />
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
