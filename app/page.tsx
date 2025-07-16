"use client";

import type React from "react";
import { useState, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState<"initial" | "email">("initial");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
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
      console.log("Starting conversation for user:", userName);
      
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
        dynamicVariables: {
          user_name: userName,
        },
        clientTools: {
          set_ui_state: ({ step }: { step: string }): string => {
            console.log("Agent navigating to step:", step);
            setCurrentStep(step as "initial" | "email");
            return `Navigated to ${step}`;
          },
        },
      });
      
      console.log("Conversation started successfully");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError(error instanceof Error ? error.message : String(error));
    }
  }, [conversation, userName]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      console.log("Conversation ended");
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  }, [conversation]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    stopConversation();
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            AXIE STUDIO
          </h1>
          <p className="text-sm text-gray-400 mt-1">AI Agent Creation Platform</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
            <p className="text-red-400 text-xs mt-2">
              Please check that your ElevenLabs agent is properly configured with the system prompt and tools.
            </p>
          </div>
        )}

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
              <span>
                {conversation.status === "connected" ? "Connected" : "Start Conversation"}
              </span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            
            {conversation.status === "connecting" && (
              <p className="text-center text-gray-400 text-sm">Connecting...</p>
            )}
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
          <p className="text-sm text-gray-400 mt-1">AI Agent Creation Platform</p>
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