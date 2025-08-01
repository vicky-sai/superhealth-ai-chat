import { Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onSettingsClick?: () => void;
}

export const ChatHeader = ({ onSettingsClick }: ChatHeaderProps) => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-2xl"></div>
            <div className="absolute top-1 left-1 w-6 h-6 bg-white/10 rounded-full"></div>
            <span className="relative text-white font-bold text-sm">SH</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              SUPERHEALTH
            </h1>
            <p className="text-sm text-muted-foreground">Your AI Healthcare Assistant</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onSettingsClick}
          className="rounded-full"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};