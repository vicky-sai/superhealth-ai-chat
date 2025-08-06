import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatControls } from "@/components/ChatControls";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Message {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

interface OllamaModel {
  name: string;
  size: string;
  digest: string;
  modified_at: string;
}

// Ollama API configuration
const API_BASE_URL = "http://localhost:11434";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      message: "Hello! I'm Superhealth, your AI healthcare assistant. I'm here to help answer your health-related questions and provide medical information. Please note that I'm not a replacement for professional medical advice. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("llama3");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tags`);
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models || []);
          // Set the first available model as default if none selected
          if (data.models && data.models.length > 0 && !selectedModel) {
            setSelectedModel(data.models[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        toast({
          title: "Model Loading Error",
          description: "Could not fetch available models from Ollama.",
          variant: "destructive",
        });
      }
    };

    fetchModels();
  }, []);

  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      message: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create a placeholder message for streaming
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      message: "",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, initialBotMessage]);

    try {
      // Build conversation history in Ollama format
      const conversationMessages = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.message
      }));
      
      // Add current user message
      conversationMessages.push({
        role: 'user',
        content: messageText
      });

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: conversationMessages,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = "";

      if (reader) {
        // Handle streaming response
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              // Parse Ollama streaming format
              const data = JSON.parse(line);
              
              // Ollama sends content in the 'content' field of the message
              const content = data.message?.content || '';
              
              if (content) {
                accumulatedMessage += content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === botMessageId 
                      ? { ...msg, message: accumulatedMessage }
                      : msg
                  )
                );
              }
              
              // Check if the stream is done
              if (data.done === true) {
                break;
              }
            } catch (parseError) {
              console.log('Parse error:', parseError, 'Line:', line);
              // Skip invalid JSON lines
            }
          }
        }
      } else {
        // Fallback for non-streaming response
        const data = await response.json();
        const finalMessage = data.response || "I apologize, but I couldn't process your request at the moment. Please try again.";
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, message: finalMessage }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response when API is unavailable
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: "I'm sorry, but I'm currently unable to connect to the backend service. Please ensure your backend server is running on " + API_BASE_URL + " or update the configuration. In the meantime, I can still provide general health information and guidance.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to the backend service. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: "1",
        message: "Hello! I'm Superhealth, your AI healthcare assistant. I'm here to help answer your health-related questions and provide medical information. Please note that I'm not a replacement for professional medical advice. How can I assist you today?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "New Chat Started",
      description: "Started a fresh conversation.",
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared.",
    });
  };

  const handleSettingsClick = () => {
    toast({
      title: "Settings",
      description: "Configure your backend URL in the code to connect to your localhost server.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-chat-bg">
      <ChatHeader onSettingsClick={handleSettingsClick} />
      
      {/* Model Selection and Chat Controls */}
      <div className="border-b border-muted bg-chat-bg px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Model:</span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-64 border-muted-foreground/30">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ChatControls 
            messages={messages} 
            onNewChat={handleNewChat}
            onClearChat={handleClearChat}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.message}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
          
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};