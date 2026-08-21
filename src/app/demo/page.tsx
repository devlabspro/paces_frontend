"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Building2, Car, Stethoscope, Loader2 } from "lucide-react";
// Simple inline alert components
const Alert = ({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: "default" | "destructive"; className?: string }) => (
  <div className={`relative w-full rounded-lg border p-4 ${variant === "destructive" ? "border-red-200 bg-red-50 text-red-800" : "bg-white text-gray-900 border-gray-200"} ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm ${className}`}>
    {children}
  </div>
);

interface VoiceAgent {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

const voiceAgents: VoiceAgent[] = [
  {
    id: "founder",
    name: "Alex Chen",
    title: "Startup Founder",
    description: "Passionate entrepreneur ready to discuss your next big idea, funding strategies, and scaling challenges.",
    icon: <Building2 className="w-12 h-12" />,
    prompt: "You are Alex Chen, a successful serial entrepreneur and startup founder. You're passionate about innovation, have raised multiple rounds of funding, and love helping other entrepreneurs. You're energetic, optimistic, and always ready to discuss business ideas, funding strategies, scaling challenges, and market opportunities. Keep responses concise but insightful, and always ask follow-up questions to understand their business better.",
    color: "bg-blue-500"
  },
  {
    id: "drive-thru",
    name: "Mike Rodriguez",
    title: "Big Burger Drive-Thru Operator",
    description: "Friendly drive-thru operator at Big Burger, ready to take your order and make recommendations.",
    icon: <Car className="w-12 h-12" />,
    prompt: "You are Mike Rodriguez, a cheerful and efficient drive-thru operator at Big Burger. You're friendly, patient, and know the menu inside and out. You love helping customers find the perfect meal, suggesting popular items, and ensuring everyone has a great experience. You're always upbeat and professional, even during busy times. Keep responses short and focused on food service, menu items, and customer satisfaction.",
    color: "bg-orange-500"
  },
  {
    id: "vet-receptionist",
    name: "Sarah Johnson",
    title: "Vet Clinic Receptionist",
    description: "Caring veterinary clinic receptionist who can help schedule appointments and answer pet health questions.",
    icon: <Stethoscope className="w-12 h-12" />,
    prompt: "You are Sarah Johnson, a compassionate and knowledgeable veterinary clinic receptionist. You're caring, professional, and have extensive experience with pet health and clinic operations. You can help schedule appointments, answer basic pet health questions, provide information about services, and offer comfort to worried pet owners. You're always gentle and understanding, especially when dealing with emergency situations or anxious pet parents.",
    color: "bg-green-500"
  }
];

export default function DemoPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCall = async (agent: VoiceAgent) => {
    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter a phone number");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ""))) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }

    setSelectedAgent(agent);
    setIsCalling(true);
    setCallStatus("calling");
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/demo-trigger-voice-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: agent.prompt,
          identifier: agent.name,
          input_prompt: `You are calling ${phoneNumber} to demonstrate the ${agent.title} voice agent.`,
          voice_agent_id: agent.id,
          phone_number: phoneNumber
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCallStatus("success");
        setTimeout(() => {
          setCallStatus("idle");
          setIsCalling(false);
          setSelectedAgent(null);
        }, 3000);
      } else {
        setCallStatus("error");
        setErrorMessage(data.message || "Failed to initiate call");
        setIsCalling(false);
      }
    } catch (error) {
      console.error("Error making call:", error);
      setCallStatus("error");
      setErrorMessage("Network error. Please try again.");
      setIsCalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Agents call your Agent
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Think you can handle a call from one of our simulated agents?
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Experience how our automated system challenges voice agents with realistic scenarios.
          </p>
          
          {/* Phone Number Input */}
          <div className="max-w-md mx-auto mb-8">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Your Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-center text-lg"
              disabled={isCalling}
            />
            <p className="text-sm text-gray-500 mt-2">
              Include country code (e.g., +1 for US)
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Success Alert */}
        {callStatus === "success" && selectedAgent && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Call initiated successfully! {selectedAgent.name} will be calling you shortly.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Voice Agent Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {voiceAgents.map((agent) => (
            <Card key={agent.id} className="relative overflow-hidden hover:shadow-lg transition-shadow bg-white border-2 border-gray-200">
              <CardHeader className="text-center">
                <div className={`${agent.color} w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-4`}>
                  {agent.icon}
                </div>
                <CardTitle className="text-xl font-bold">{agent.name}</CardTitle>
                <CardDescription className="text-sm font-medium text-gray-600">
                  {agent.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {agent.description}
                </p>
                <Button
                  onClick={() => handleCall(agent)}
                  disabled={isCalling || !phoneNumber.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCalling && selectedAgent?.id === agent.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calling...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Call {agent.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            This demo uses AI-powered voice agents to simulate real-world conversations.
            <br />
            Calls are made through our voice agent system and may take a few moments to connect.
          </p>
        </div>
      </div>
    </div>
  );
}
