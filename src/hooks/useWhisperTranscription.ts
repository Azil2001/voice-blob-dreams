
import { useState, useRef, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export const useWhisperTranscription = (
  apiKey: string, 
  onTranscriptionComplete?: (text: string) => void,
  onHumanSpeechDetected?: () => void
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isListeningMode, setIsListeningMode] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to start continuous listening mode
  const startListeningMode = useCallback(async () => {
    if (!apiKey) {
      setError('OpenAI API key is not set.');
      toast({ title: "API Key Missing", description: "Please set your OpenAI API key first.", variant: "destructive" });
      return;
    }

    setIsListeningMode(true);
    await startRecording();
  }, [apiKey]);

  // Function to stop continuous listening mode
  const stopListeningMode = useCallback(() => {
    setIsListeningMode(false);
    stopRecording();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    if (!apiKey) {
      setError('OpenAI API key is not set.');
      toast({ title: "API Key Missing", description: "Please set your OpenAI API key first.", variant: "destructive" });
      return;
    }
    if (isRecording) return;

    setError(null);

    try {
      // Notify that human speech is detected
      if (onHumanSpeechDetected) {
        onHumanSpeechDetected();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size === 0) {
            console.error("Audio blob is empty.");
            setError("No audio was recorded. Please check your microphone.");
            setIsProcessing(false);
            setIsRecording(false); 
            toast({ title: "Recording Error", description: "No audio data captured.", variant: "destructive" });
            return;
        }
        
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');

        try {
          const response = await fetch(WHISPER_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || 'Transcription failed');
          }
          
          const transcribedText = data.text;
          setTranscription(transcribedText);
          
          // Call the callback with the transcribed text
          if (onTranscriptionComplete && transcribedText) {
            onTranscriptionComplete(transcribedText);
          }

        } catch (err: any) {
          console.error('Whisper API error:', err);
          setError(err.message || 'Failed to transcribe audio.');
          toast({ title: "Transcription Error", description: err.message || 'Failed to transcribe audio.', variant: "destructive" });
        } finally {
          setIsProcessing(false);
          
          // In listening mode, restart recording after processing
          if (isListeningMode) {
            startRecording();
          } else {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
          }
        }
      };

      // Start with a 3-second recording segment
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Set a timeout to stop recording after a short period
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false); 
        }
      }, 5000); // 5-second recording segments

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
      toast({ title: "Recording Error", description: "Could not access microphone. Please check permissions.", variant: "destructive" });
      setIsRecording(false);
      setIsListeningMode(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false); 
    }
  };

  return {
    isRecording,
    isProcessing,
    transcription,
    error,
    startRecording,
    stopRecording,
    isListeningMode,
    startListeningMode,
    stopListeningMode
  };
};
