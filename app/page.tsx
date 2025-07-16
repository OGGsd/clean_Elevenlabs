"use client";

import type React from "react";
import { useState, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { useConversation } from "@11labs/react";

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/signed-url");
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

function HomeContent() {
  const [currentStep, setCurrentStep] = useState<"initial" | "email">("initial");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message: string) => console.log("Message:", message),
    onError: (error: Error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Start the conversation with your agent
      const signedUrl = await getSignedUrl();
      await conversation.startSession({
        signedUrl,
        dynamicVariables: {
          user_name: userName,
        },
        clientTools: {
          set_ui_state: ({ step }: { step: string }): string => {
            // Allow agent to navigate the UI.
            setCurrentStep(step as "initial" | "email");
            return `Navigated to ${step}`;
          },
        },
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation, userName]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    stopConversation();
    // You can add any additional logic here for what happens after email submission
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 flex justify-right">
          <img
            src="/elevenlabs-logo-white.svg"
            alt="ElevenLabs Logo"
            className="h-12 w-auto"
          />
        </div>

        {/* Initial Step - Name Input */}
        <div className={currentStep === "initial" ? "block" : "hidden"}>
          <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Let's Get Started
            </h1>
            <p className="text-lg text-gray-300">
              Enter your name and let's have a conversation!
            </p>

            <div className="space-y-4">
              <Label htmlFor="name-input" className="text-sm text-gray-400">
                Your Name
              </Label>
              <Input
                id="name-input"
                type="text"
                placeholder="Enter your name"
                className="bg-gray-800 border-gray-700 text-white"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
              />
            </div>

            <Button
              type="button"
              onClick={startConversation}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
              disabled={!userName.trim() || conversation.status === "connected"}
            >
              <span>Start Conversation</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Email Step */}
        <div className={currentStep === "email" ? "block" : "hidden"}>
          <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Your Email
            </h1>
            <div className="bg-gray-900 rounded-lg p-6">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Label htmlFor="email-input" className="text-sm text-gray-400">
                  Email Address
                </Label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="you@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
                >
                  <span>Submit</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by{" "}
          <a
            href="https://elevenlabs.io/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors underline"
          >
            ElevenLabs ConversationalAI
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
        <div className="mb-8 flex justify-right">
          <img
            src="/elevenlabs-logo-white.svg"
            alt="ElevenLabs Logo"
            className="h-12 w-auto"
          />
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