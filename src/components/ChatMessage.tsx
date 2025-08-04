import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-2 shadow-sm",
        isUser 
          ? "bg-user-message text-white" 
          : "bg-bot-message text-gray-800 border border-gray-200"
      )}>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="m-0">{message}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="ml-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="ml-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">{children}</pre>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          )}
        </div>
        
        <div className={cn(
          "text-xs mt-2 opacity-70",
          isUser ? "text-white/70" : "text-gray-500"
        )}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};