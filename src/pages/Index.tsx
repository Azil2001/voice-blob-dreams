
import React, { useState } from 'react';
import AnimatedBlob from '@/components/AnimatedBlob';
import ApiKeyInput from '@/components/ApiKeyInput';
import VoiceControls from '@/components/VoiceControls';
import { useWhisperTranscription } from '@/hooks/useWhisperTranscription';

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const {
    isRecording,
    isProcessing,
    transcription,
    error,
    startRecording,
    stopRecording,
  } = useWhisperTranscription(apiKey);

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

      <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />

      <AnimatedBlob isListening={isRecording || isProcessing} />

      <VoiceControls
        isRecording={isRecording}
        isProcessing={isProcessing}
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
