import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqData = [
  {
    id: "item-1",
    question: "How long does it take to integrate Hamming?",
    answer:
      "Integration typically takes 1-2 weeks depending on your existing infrastructure and requirements. Our team provides dedicated support throughout the process to ensure smooth implementation.",
  },
  {
    id: "item-2",
    question: "Which security & compliance standards do you meet?",
    answer:
      "We meet SOC 2 Type II, GDPR, CCPA, and HIPAA compliance standards. Our platform is built with enterprise-grade security including end-to-end encryption and regular security audits.",
  },
  {
    id: "item-3",
    question: "What scale of load testing can you generate?",
    answer:
      "Our platform can generate load testing at massive scale, supporting thousands of concurrent calls and conversations. We can simulate real-world traffic patterns and peak usage scenarios.",
  },
  {
    id: "item-4",
    question: "What metrics do you use measure voice and conversational quality? Can I define my own metrics?",
    answer:
      "We provide comprehensive metrics including call quality scores, conversation flow analysis, response accuracy, and latency measurements. Yes, you can define custom metrics tailored to your specific use cases and business requirements.",
  },
  {
    id: "item-5",
    question: "What does a 'heartbeat test' actually do?",
    answer:
      "Heartbeat tests continuously monitor your voice systems by making regular automated calls to verify availability, response times, and basic functionality. They help detect issues before they impact your users.",
  },
  {
    id: "item-6",
    question: "Does Hamming cover IVRs, outbound dialing, and DTMF?",
    answer:
      "Yes, Hamming provides comprehensive coverage for Interactive Voice Response (IVR) systems, outbound dialing campaigns, and Dual-Tone Multi-Frequency (DTMF) signaling testing and monitoring.",
  },
]

export function FAQ() {
  return (
    <div className="w-full bg-[#fafafa] py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-semibold text-center mb-12 text-balance text-[#18181b]">Frequently asked questions</h1>

        <Accordion type="single" collapsible className="space-y-4">
        {faqData.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="bg-white border border-[#e4e4e7] rounded-lg px-6 shadow-sm"
          >
            <AccordionTrigger className="text-left py-6 px-0 hover:no-underline border-0">
              <span className="text-base font-normal text-[#18181b]">{item.question}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 px-0 border-0">
              <p className="text-[#71717a] leading-relaxed">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
        </Accordion>
      </div>
    </div>
  )
}
