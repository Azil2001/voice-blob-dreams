
import React, { useState, useEffect } from 'react';
import AnimatedBlob from '@/components/AnimatedBlob';
import ApiKeyInput from '@/components/ApiKeyInput';
import VoiceControls from '@/components/VoiceControls';
import { useWhisperTranscription } from '@/hooks/useWhisperTranscription';
import { useTextToSpeech } from '@/hooks/useTextToSpeech'; // Import the new hook

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const { speak, isSpeaking } = useTextToSpeech(); // Use the TTS hook
  const {
    isRecording,
    isProcessing,
    transcription,
    error,
    startRecording,
    stopRecording,
  } = useWhisperTranscription(apiKey, speak); // Pass speak function to Whisper hook

  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center overflow-hidden">
      <header className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Interactive Voice Blob
        </h1>
        <p className="text-md md:text-lg text-muted-foreground mt-2">
          Speak to the blob and see your words appear!
        </p>
      </header>

      {showApiKeyInput && <ApiKeyInput apiKey={apiKey} setApiKey={handleApiKeySet} />}

      <AnimatedBlob isListening={isRecording || isProcessing || isSpeaking} />

      <VoiceControls
        isRecording={isRecording}
        isProcessing={isProcessing || isSpeaking} // Consider TTS speaking as part of processing
        startRecording={startRecording}
        stopRecording={stopRecording}
        transcription={transcription}
        error={error}
        hasApiKey={!!apiKey}
      />
      
      <footer className="mt-auto py-4">
        <p className="text-xs text-muted-foreground">
          Powered by OpenAI Whisper & Lovable.
        </p>
      </footer>
    </div>
  );
};

export default Index;
