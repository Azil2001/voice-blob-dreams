
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from "@/hooks/use-toast";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const speak = useCallback((text: string) => {
    if (!synth) {
      toast({ title: "TTS Error", description: "Text-to-speech is not supported in this browser.", variant: "destructive" });
      return;
    }
    if (!text.trim()) return;

    // Cancel any existing speech first
    cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      toast({ title: "TTS Error", description: `Could not speak: ${event.error}`, variant: "destructive" });
    };
    
    // Optional: Voice selection (can be expanded)
    // const voices = synth.getVoices();
    // utterance.voice = voices[0]; // Choose a specific voice

    synth.speak(utterance);
  }, [synth]);

  // Pause speech when human starts speaking
  const pauseSpeech = useCallback(() => {
    if (synth && isSpeaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
      console.log("Speech paused due to human input");
    }
  }, [synth, isSpeaking, isPaused]);

  // Resume speech after a delay
  const resumeSpeech = useCallback((delay: number = 5000) => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    
    resumeTimeoutRef.current = setTimeout(() => {
      if (synth && isPaused) {
        synth.resume();
        setIsPaused(false);
        console.log("Speech resumed after pause");
      }
      resumeTimeoutRef.current = null;
    }, delay);
  }, [synth, isPaused]);

  // Cancel speech if component unmounts or on demand
  useEffect(() => {
    return () => {
      if (synth && (isSpeaking || isPaused)) {
        synth.cancel();
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [synth, isSpeaking, isPaused]);

  const cancel = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    }
  }, [synth]);

  return { 
    speak, 
    cancel, 
    pauseSpeech,
    resumeSpeech,
    isSpeaking, 
    isPaused 
  };
};
