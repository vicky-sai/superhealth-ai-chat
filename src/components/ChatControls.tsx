import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Save, Download, FileText, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatControlsProps {
  messages: Message[];
  onNewChat: () => void;
  onClearChat: () => void;
}

export const ChatControls = ({ messages, onNewChat, onClearChat }: ChatControlsProps) => {
  const { toast } = useToast();

  const saveToLocal = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages
    };
    localStorage.setItem(`chat_${Date.now()}`, JSON.stringify(chatData));
    toast({
      title: "Chat Saved",
      description: "Your chat has been saved locally.",
    });
  };

  const exportAsText = () => {
    const chatContent = messages.map(msg => 
      `${msg.isUser ? 'You' : 'Superhealth'} (${msg.timestamp.toLocaleString()}): ${msg.message}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `superhealth_chat_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Chat Exported",
      description: "Your chat has been downloaded as a text file.",
    });
  };

  const exportAsPDF = () => {
    // For now, export as text (PDF generation would require additional libraries)
    exportAsText();
  };
  const exportAsHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Superhealth Chat Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f8fafc; }
          .message { margin-bottom: 20px; padding: 15px; border-radius: 12px; }
          .user { background-color: #dbeafe; margin-left: 20px; border-left: 4px solid #3b82f6; }
          .bot { background-color: #ffffff; margin-right: 20px; border-left: 4px solid #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .timestamp { font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
          .content { color: #374151; line-height: 1.6; }
          h1 { color: #1f2937; margin-bottom: 30px; }
          .export-info { color: #6b7280; margin-bottom: 30px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>Superhealth Chat Export</h1>
        <div class="export-info">Exported on: ${new Date().toLocaleString()}</div>
        ${messages.map(msg => `
          <div class="message ${msg.isUser ? 'user' : 'bot'}">
            <div class="timestamp">${msg.isUser ? 'You' : 'Superhealth'} - ${msg.timestamp.toLocaleString()}</div>
            <div class="content">${msg.message}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `superhealth_chat_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Document Exported",
      description: "Your chat has been downloaded as an HTML document.",
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onNewChat}
        className="text-foreground border-muted-foreground/30 hover:bg-muted"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        New Chat
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearChat}
        className="text-red-500 border-muted-foreground/30 hover:bg-muted"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Clear Chat
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={saveToLocal}
        className="text-foreground border-muted-foreground/30 hover:bg-muted"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Chat
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-foreground border-muted-foreground/30 hover:bg-muted"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Chat
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportAsText}>
            <FileText className="w-4 h-4 mr-2" />
            Export as Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportAsPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportAsHTML}>
            <FileText className="w-4 h-4 mr-2" />
            Export as HTML
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
