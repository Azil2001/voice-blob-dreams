
import { useState, useCallback, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const speak = useCallback((text: string) => {
    if (!synth) {
      toast({ title: "TTS Error", description: "Text-to-speech is not supported in this browser.", variant: "destructive" });
      return;
    }
    if (isSpeaking) {
      // Optionally stop current speech or queue, for now, just return
      return;
    }
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
      toast({ title: "TTS Error", description: `Could not speak: ${event.error}`, variant: "destructive" });
    };
    
    // Optional: Voice selection (can be expanded)
    // const voices = synth.getVoices();
    // utterance.voice = voices[0]; // Choose a specific voice

    synth.speak(utterance);
  }, [synth, isSpeaking]);

  // Cancel speech if component unmounts or on demand
  useEffect(() => {
    return () => {
      if (synth && isSpeaking) {
        synth.cancel();
      }
    };
  }, [synth, isSpeaking]);

  const cancel = useCallback(() => {
    if (synth && isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth, isSpeaking]);

  return { speak, isSpeaking, cancel };
};
