
import React, { useState, useEffect, useCallback } from 'react';
import AnimatedBlob from '@/components/AnimatedBlob';
import ApiKeyInput from '@/components/ApiKeyInput';
import VoiceControls from '@/components/VoiceControls';
import { useWhisperTranscription } from '@/hooks/useWhisperTranscription';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useGPT4o } from '@/hooks/useGPT4o';
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [conversationActive, setConversationActive] = useState(false);

  const { speak, cancel, pauseSpeech, resumeSpeech, isSpeaking, isPaused } = useTextToSpeech();
  const { generateResponse, isProcessing: isGeneratingResponse } = useGPT4o(apiKey);

  // Handle human speech detection - pause the AI response
  const handleHumanSpeechDetected = useCallback(() => {
    if (isSpeaking) {
      pauseSpeech();
    }
  }, [isSpeaking, pauseSpeech]);

  // Handle completed transcription - generate AI response
  const handleTranscriptionComplete = useCallback(async (text: string) => {
    if (text && conversationActive) {
      const response = await generateResponse(text);
      if (response) {
        setAiResponse(response);
        speak(response);
        resumeSpeech(5000); // Resume after 5 seconds if was paused
      }
    }
  }, [generateResponse, speak, resumeSpeech, conversationActive]);

  const {
    isRecording,
    isProcessing: isTranscribing,
    transcription,
    error,
    startListeningMode,
    stopListeningMode,
    isListeningMode
  } = useWhisperTranscription(
    apiKey, 
    handleTranscriptionComplete,
    handleHumanSpeechDetected
  );

  const isProcessing = isTranscribing || isGeneratingResponse;

  useEffect(() => {
    // Check localStorage for API key on initial load
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setShowApiKeyInput(false); // Hide input if key already exists
    }
  }, []);

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    setShowApiKeyInput(false); // Hide input after key is set
  };

  const startConversation = async () => {
    if (!apiKey) {
      toast({ 
        title: "API Key Missing", 
        description: "Please set your OpenAI API key first.", 
        variant: "destructive" 
      });
      return;
    }

    setConversationActive(true);
    toast({ 
      title: "Conversation Started", 
      description: "Start speaking. The AI will respond after you finish a sentence." 
    });
    
    // Start in listening mode
    await startListeningMode();
  };

  const stopConversation = () => {
    setConversationActive(false);
    stopListeningMode();
    cancel(); // Stop any ongoing speech
    toast({ 
      title: "Conversation Ended", 
      description: "Thanks for chatting!" 
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center overflow-hidden">
      <header className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Interactive Voice Blob
        </h1>
        <p className="text-md md:text-lg text-muted-foreground mt-2">
          Start a conversation with the AI-powered blob!
        </p>
      </header>

      {showApiKeyInput && <ApiKeyInput apiKey={apiKey} setApiKey={handleApiKeySet} />}

      <AnimatedBlob isListening={isRecording || isProcessing || isSpeaking} />

      <VoiceControls
        isRecording={isRecording}
        isProcessing={isProcessing}
        startConversation={startConversation}
        stopConversation={stopConversation}
        transcription={transcription}
        error={error}
        hasApiKey={!!apiKey}
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        isListeningMode={isListeningMode}
        aiResponse={aiResponse}
      />
      
      <footer className="mt-auto py-4">
        <p className="text-xs text-muted-foreground">
          Powered by OpenAI Whisper, GPT-4o & Lovable.
        </p>
      </footer>
    </div>
  );
};

export default Index;
