
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

export const useGPT4o = (apiKey: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'system', content: 'You are a helpful, friendly AI assistant. Respond concisely and conversationally.' } as any
  ]);

  const generateResponse = async (userMessage: string) => {
    if (!apiKey) {
      setError('OpenAI API key is not set.');
      toast({ title: "API Key Missing", description: "Please set your OpenAI API key first.", variant: "destructive" });
      return null;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // Add user message to conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];
      
      setConversationHistory(updatedHistory);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: updatedHistory,
          max_tokens: 150,
          temperature: 0.7,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response from GPT-4o');
      }

      const assistantResponse = data.choices[0]?.message?.content || '';
      
      // Add assistant response to conversation history
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: assistantResponse }
      ]);

      return assistantResponse;
    } catch (err: any) {
      console.error('GPT-4o API error:', err);
      setError(err.message || 'Failed to get response from GPT-4o');
      toast({ title: "GPT-4o Error", description: err.message || 'Failed to get AI response', variant: "destructive" });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    generateResponse,
    isProcessing,
    error,
    conversationHistory
  };
};
