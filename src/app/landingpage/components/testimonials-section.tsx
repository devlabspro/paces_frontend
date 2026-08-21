"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Building2, Users, UserCheck, Phone } from "lucide-react"

const testimonialsData = {
  "ai-sales-agents": {
    company: "11x",
    logo: "11x",
    quote: "Hamming's continuous heartbeat monitoring catches regressions in production before our customers notice.",
    author: {
      name: "Prabhav Jain",
      title: "CEO at 11x",
      avatar: "/ceo-headshot.png",
    },
    category: "11x - AI Sales Agents",
  },
  "clinical-trials": {
    company: "Grove AI",
    logo: "Grove AI",
    quote:
      "Participant engagement is critical in clinical trials. Hamming's call analytics helped us identify areas where Grace was falling short, allowing us to improve faster than we imagined.",
    author: {
      name: "Sohit Gatiganti",
      title: "Co-Founder and CPO, Grove AI",
      avatar: "/professional-headshot.png",
    },
    category: "Grove AI - Clinical Trials",
  },
  "customer-support": {
    company: "Podium",
    logo: "Podium",
    quote:
      "We rely on our AI agents to drive revenue, and Hamming ensures they perform without errors. Hamming's load testing gives us the confidence to deploy our voice agents even during high-traffic campaigns.",
    author: {
      name: "Jordan Farnworth",
      title: "Director of Engineering, Podium",
      avatar: "/professional-headshot.png",
    },
    category: "Podium - Customer Support",
  },
  "high-volume-recruiting": {
    company: "PurpleFish",
    logo: "PurpleFish",
    quote:
      "Hamming didn't just help us test our AI faster — its call quality reports highlighted subtle flaws in how we screened candidates, making our process much more robust, engaging and fair.",
    author: {
      name: "Anonymous",
      title: "PurpleFish Team",
      avatar: "/professional-headshot.png",
    },
    category: "PurpleFish - High Volume Recruiting",
  },
  "ai-receptionists": {
    company: "Smith.ai",
    logo: "Smith.ai",
    quote:
      "Hamming transformed how we ensure our AI receptionists handle complex calls. We can now test thousands of scenarios - from appointment scheduling to emergency escalations - giving us confidence that our 3,500+ clients receive flawless service 24/7.",
    author: {
      name: "Anonymous",
      title: "Smith.ai Team",
      avatar: "/professional-headshot.png",
    },
    category: "Smith.ai - AI Receptionists",
  },
}

const useCases = [
  {
    id: "ai-sales-agents",
    label: "AI Sales Agents",
    icon: RefreshCw,
  },
  {
    id: "clinical-trials",
    label: "Clinical Trials",
    icon: Building2,
  },
  {
    id: "customer-support",
    label: "Customer Support",
    icon: Users,
  },
  {
    id: "high-volume-recruiting",
    label: "High Volume Recruiting",
    icon: UserCheck,
  },
  {
    id: "ai-receptionists",
    label: "AI Receptionists",
    icon: Phone,
  },
]

export function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState("ai-sales-agents")

  const testimonial = testimonialsData[activeTestimonial as keyof typeof testimonialsData]

  return (
    <section className="w-full bg-[#fafafa] py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#18181b] mb-2 text-balance">Trusted by AI-forward enterprises</h2>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar with use cases */}
        <div className="space-y-2">
          {useCases.map((useCase) => {
            const Icon = useCase.icon
            return (
              <div
                key={useCase.id}
                onClick={() => setActiveTestimonial(useCase.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTestimonial === useCase.id
                    ? "bg-[#dbeafe] text-[#1d4ed8] border-l-4 border-[#3b82f6]"
                    : "text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f4f5]"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{useCase.label}</span>
              </div>
            )
          })}
        </div>

        {/* Main testimonial content */}
        <div className="flex flex-col items-center justify-center">
          <Card className="w-full max-w-2xl bg-white shadow-sm border border-[#e4e4e7]">
            <CardContent className="p-8 text-center">
              {/* Company logo */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 text-2xl font-bold text-[#18181b]">
                  {testimonial.company === "11x" && <span className="text-3xl">✕</span>}
                  <span>{testimonial.logo}</span>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-xl text-[#18181b] leading-relaxed mb-8 text-balance">
                "{testimonial.quote}"
              </blockquote>

              {/* Author info */}
              <div className="flex items-center justify-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.author.avatar || ""} alt={testimonial.author.name} />
                  <AvatarFallback className="bg-[#f4f4f5] text-[#71717a]">
                    {testimonial.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-semibold text-[#18181b] text-sm">{testimonial.category}</div>
                  <div className="text-[#71717a] text-sm">
                    {testimonial.author.name}, {testimonial.author.title}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </section>
  )
}
