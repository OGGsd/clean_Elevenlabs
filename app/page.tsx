"use client";

import type React from "react";
import { useState, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Calendar, User, Mail } from "lucide-react";
import { useConversation } from "@11labs/react";

async function getSignedUrl(): Promise<string> {
  console.log("Fetching signed URL...");
  const response = await fetch("/api/signed-url");
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(errorData.error || "Failed to get signed url");
  }
  
  const data = await response.json();
  console.log("Got signed URL successfully");
  return data.signedUrl;
}

function HomeContent() {
  const [currentStep, setCurrentStep] = useState<"name_collection" | "email_collection" | "booking_conversation">("name_collection");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to conversation");
      setError(null);
    },
    onDisconnect: () => {
      console.log("Disconnected from conversation");
    },
    onMessage: (message: string) => {
      console.log("Message:", message);
    },
    onError: (error: Error) => {
      console.error("Conversation Error:", error);
      setError(`Conversation error: ${error.message}`);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      console.log("Starting booking conversation");
      
      // Request microphone permission
      console.log("Requesting microphone permission...");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted");
      
      // Get signed URL
      const signedUrl = await getSignedUrl();
      console.log("Starting session with signed URL");
      
      // Start the conversation with your agent
      await conversation.startSession({
        signedUrl,
        clientTools: {
          set_ui_state: ({ step }: { step: string }): string => {
            console.log("Agent navigating to step:", step);
            setCurrentStep(step as "name_collection" | "email_collection" | "booking_conversation");
            return `Navigated to ${step}`;
          },
        },
      });
      
      console.log("Conversation started successfully");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError(error instanceof Error ? error.message : String(error));
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      console.log("Conversation ended");
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  }, [conversation]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      console.log("Names collected:", { firstName, lastName });
      // The agent will handle the transition to email collection
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      console.log("Email collected:", email);
      // The agent will handle the transition to booking conversation
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case "name_collection":
        return <User className="h-6 w-6" />;
      case "email_collection":
        return <Mail className="h-6 w-6" />;
      case "booking_conversation":
        return <Calendar className="h-6 w-6" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "name_collection":
        return "Let's Get Started";
      case "email_collection":
        return "Contact Information";
      case "booking_conversation":
        return "Book Your Consultation";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "name_collection":
        return "Please provide your name so we can personalize your experience";
      case "email_collection":
        return "We'll need your email to send booking confirmation";
      case "booking_conversation":
        return `Hi ${firstName}! Let's discuss your AI agent needs and find the perfect consultation time`;
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            AXIE STUDIO
          </h1>
          <p className="text-sm text-gray-400 mt-1">AI Agent Consultation Booking</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
            <p className="text-red-400 text-xs mt-2">
              Please check that your ElevenLabs agent is properly configured.
            </p>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === "name_collection" ? "bg-purple-600" : "bg-gray-700"
            }`}>
              <User className="h-5 w-5" />
            </div>
            <div className={`h-1 w-8 ${
              ["email_collection", "booking_conversation"].includes(currentStep) ? "bg-purple-600" : "bg-gray-700"
            }`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === "email_collection" ? "bg-purple-600" : "bg-gray-700"
            }`}>
              <Mail className="h-5 w-5" />
            </div>
            <div className={`h-1 w-8 ${
              currentStep === "booking_conversation" ? "bg-purple-600" : "bg-gray-700"
            }`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === "booking_conversation" ? "bg-purple-600" : "bg-gray-700"
            }`}>
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Name Collection Step */}
        <div className={currentStep === "name_collection" ? "block" : "hidden"}>
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {getStepIcon()}
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                {getStepTitle()}
              </h1>
              <p className="text-lg text-gray-300 mt-4">
                {getStepDescription()}
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name" className="text-sm text-gray-400">
                    First Name
                  </Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="John"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last-name" className="text-sm text-gray-400">
                    Last Name
                  </Label>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Doe"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={startConversation}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
                disabled={!firstName.trim() || !lastName.trim() || conversation.status === "connected"}
              >
                <span>
                  {conversation.status === "connected" ? "Connected - Speak Now" : "Start Conversation"}
                </span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              {conversation.status === "connecting" && (
                <p className="text-center text-gray-400 text-sm">Connecting...</p>
              )}
            </form>
          </div>
        </div>

        {/* Email Collection Step */}
        <div className={currentStep === "email_collection" ? "block" : "hidden"}>
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {getStepIcon()}
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                {getStepTitle()}
              </h1>
              <p className="text-lg text-gray-300 mt-4">
                {getStepDescription()}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email-input" className="text-sm text-gray-400">
                  Email Address
                </Label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="john.doe@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  Continue speaking with Alex to proceed to the booking conversation.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Booking Conversation Step */}
        <div className={currentStep === "booking_conversation" ? "block" : "hidden"}>
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {getStepIcon()}
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                {getStepTitle()}
              </h1>
              <p className="text-lg text-gray-300 mt-4">
                {getStepDescription()}
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-purple-400" />
                  <span className="text-sm text-gray-300">{firstName} {lastName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <span className="text-sm text-gray-300">{email}</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                  <strong>Continue your conversation with Alex to:</strong>
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Discuss your business and AI agent needs</li>
                  <li>• Find the perfect consultation time</li>
                  <li>• Get answers to your questions</li>
                </ul>
              </div>

              <Button
                onClick={stopConversation}
                variant="outline"
                className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                End Conversation
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by{" "}
          <a
            href="https://axiestudio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors underline"
          >
            Axie Studio
          </a>
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            AXIE STUDIO
          </h1>
          <p className="text-sm text-gray-400 mt-1">AI Agent Consultation Booking</p>
        </div>
        <div className="space-y-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Loading...
          </h1>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}