import { useState, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export const useWhisperTranscription = (apiKey: string, speak?: (text: string) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!apiKey) {
      setError('OpenAI API key is not set.');
      toast({ title: "API Key Missing", description: "Please set your OpenAI API key first.", variant: "destructive" });
      return;
    }
    if (isRecording) return;

    setTranscription('');
    setError(null);
    setIsProcessing(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          toast({ title: "Transcription Complete!", description: "Your speech has been transcribed."});

          if (speak && transcribedText) {
            speak(transcribedText); // Speak the transcribed text
          }

        } catch (err: any) {
          console.error('Whisper API error:', err);
          setError(err.message || 'Failed to transcribe audio.');
          toast({ title: "Transcription Error", description: err.message || 'Failed to transcribe audio.', variant: "destructive" });
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
      toast({ title: "Recording Error", description: "Could not access microphone. Please check permissions.", variant: "destructive" });
      setIsRecording(false);
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
  };
};
