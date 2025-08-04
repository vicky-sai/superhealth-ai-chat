import { Button } from "@/components/ui/button";
import { Download, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatExportActionsProps {
  messages: Message[];
}

export const ChatExportActions = ({ messages }: ChatExportActionsProps) => {
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

  const exportAsPDF = () => {
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

  const exportAsDocument = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Superhealth Chat Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .message { margin-bottom: 20px; padding: 10px; border-radius: 8px; }
          .user { background-color: #e3f2fd; margin-left: 20px; }
          .bot { background-color: #f5f5f5; margin-right: 20px; }
          .timestamp { font-size: 12px; color: #666; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <h1>Superhealth Chat Export</h1>
        <p>Exported on: ${new Date().toLocaleString()}</p>
        ${messages.map(msg => `
          <div class="message ${msg.isUser ? 'user' : 'bot'}">
            <div class="timestamp">${msg.isUser ? 'You' : 'Superhealth'} - ${msg.timestamp.toLocaleString()}</div>
            <div>${msg.message}</div>
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
      title: "Document Exported",
      description: "Your chat has been downloaded as an HTML document.",
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={saveToLocal}
        className="text-foreground border-gray-300"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Local
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportAsPDF}
        className="text-foreground border-gray-300"
      >
        <Download className="w-4 h-4 mr-2" />
        Export Text
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportAsDocument}
        className="text-foreground border-gray-300"
      >
        <FileText className="w-4 h-4 mr-2" />
        Export HTML
      </Button>
    </div>
  );
};