
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react'; // Adding Volume2 icon for speaking state

interface VoiceControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  startConversation: () => void;
  stopConversation: () => void;
  transcription: string;
  error: string | null;
  hasApiKey: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isListeningMode: boolean;
  aiResponse: string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isRecording,
  isProcessing,
  startConversation,
  stopConversation,
  transcription,
  error,
  hasApiKey,
  isSpeaking,
  isPaused,
  isListeningMode,
  aiResponse,
}) => {
  const buttonText = () => {
    if (isProcessing) return "Processing...";
    if (isListeningMode) return "End Conversation";
    return "Start Conversation";
  };

  const buttonIcon = () => {
    if (isProcessing) return <Loader2 className="h-7 w-7 animate-spin" />;
    if (isListeningMode) return <MicOff className="h-7 w-7 mr-2" />;
    return <Mic className="h-7 w-7 mr-2" />;
  };

  const buttonVariant = isListeningMode ? "destructive" : "default";

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-lg p-4">
      <Button
        onClick={isListeningMode ? stopConversation : startConversation}
        disabled={isProcessing || !hasApiKey}
        className="w-52 h-16 rounded-full text-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        variant={buttonVariant}
      >
        {buttonIcon()}
        {buttonText()}
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

      <div className="flex flex-col w-full space-y-4">
        {transcription && !error && (
          <div className="p-4 bg-muted/50 rounded-lg shadow w-full">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <Mic className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">You:</h3>
            </div>
            <p className="text-md text-foreground/80 pl-10">{transcription}</p>
          </div>
        )}

        {aiResponse && !error && (
          <div className="p-4 bg-primary/5 rounded-lg shadow w-full">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                {isSpeaking && !isPaused ? (
                  <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                ) : (
                  <Volume2 className="h-4 w-4 text-primary" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground">AI:</h3>
              {isPaused && <span className="ml-2 text-xs text-muted-foreground">(paused)</span>}
            </div>
            <p className="text-md text-foreground/80 pl-10">{aiResponse}</p>
          </div>
        )}
      </div>

      {isListeningMode && !isProcessing && !isSpeaking && (
        <p className="text-sm text-muted-foreground">Listening for your voice...</p>
      )}
      
      {isProcessing && (
        <p className="text-sm text-muted-foreground">Processing your speech...</p>
      )}
      
      {isSpeaking && !isPaused && (
        <p className="text-sm text-muted-foreground">AI is speaking...</p>
      )}
      
      {isPaused && (
        <p className="text-sm text-muted-foreground">AI speech paused, listening to you...</p>
      )}
    </div>
  );
};

export default VoiceControls;
