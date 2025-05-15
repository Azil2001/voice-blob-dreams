
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from 'lucide-react'; // Loader2 for processing

interface VoiceControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  transcription: string;
  error: string | null;
  hasApiKey: boolean;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isRecording,
  isProcessing,
  startRecording,
  stopRecording,
  transcription,
  error,
  hasApiKey,
}) => {
  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-lg p-4">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing || !hasApiKey}
        className="w-32 h-16 rounded-full text-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        variant={isRecording ? "destructive" : "default"}
      >
        {isProcessing ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-7 w-7 mr-2" />
        ) : (
          <Mic className="h-7 w-7 mr-2" />
        )}
        {isProcessing ? "Processing..." : isRecording ? "Stop" : "Speak"}
      </Button>
      
      {!hasApiKey && (
        <p className="text-sm text-destructive">
          Please enter your OpenAI API key above to enable voice recognition.
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
          <p>Error: {error}</p>
        </div>
      )}

      {transcription && !error && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg shadow w-full">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Transcription:</h3>
          <p className="text-md text-foreground/80 italic">"{transcription}"</p>
        </div>
      )}
      {isRecording && !isProcessing && (
         <p className="text-sm text-muted-foreground">Listening...</p>
      )}
    </div>
  );
};

export default VoiceControls;
