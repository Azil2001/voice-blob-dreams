
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setLocalApiKey(storedApiKey);
      setApiKey(storedApiKey);
    }
  }, [setApiKey]);

  const handleSaveKey = () => {
    if (localApiKey.trim()) {
      localStorage.setItem('openai_api_key', localApiKey);
      setApiKey(localApiKey);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved in browser storage.",
      });
    } else {
      toast({
        title: "Error",
        description: "API Key cannot be empty.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2 my-4 p-4 border rounded-lg shadow-sm bg-card">
      <label htmlFor="api-key-input" className="text-sm font-medium text-foreground">
        OpenAI API Key
      </label>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Enter your OpenAI API key. It will be stored in your browser's local storage.
        For production, use a secure backend solution.
      </p>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          id="api-key-input"
          type="password"
          placeholder="sk-..."
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSaveKey}>Save</Button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
