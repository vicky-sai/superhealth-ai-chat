import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

// Mock API configuration - replace with your localhost backend URL
const API_BASE_URL = "http://localhost:8000"; // Update this to match your backend

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversation_history: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.message
          }))
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
              // Handle different streaming formats
              let content = '';
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') break;
                const data = JSON.parse(jsonStr);
                content = data.choices?.[0]?.delta?.content || data.response || data.content || '';
              } else {
                // Try parsing as direct JSON
                const data = JSON.parse(line);
                content = data.response || data.content || '';
              }

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
            } catch (parseError) {
              // If it's not JSON, treat as plain text
              accumulatedMessage += chunk;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, message: accumulatedMessage }
                    : msg
                )
              );
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

  const handleSettingsClick = () => {
    toast({
      title: "Settings",
      description: "Configure your backend URL in the code to connect to your localhost server.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-chat-bg">
      <ChatHeader onSettingsClick={handleSettingsClick} />
      
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