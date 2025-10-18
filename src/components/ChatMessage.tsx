import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  image?: string;
  video?: string;
}

export const ChatMessage = ({ role, content, image, video }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn(
      "flex w-full mb-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl p-4 backdrop-blur-sm",
        isUser 
          ? "bg-gradient-primary shadow-glow" 
          : "bg-card border border-border shadow-elegant"
      )}>
        {image && (
          <img 
            src={image} 
            alt="Uploaded" 
            className="rounded-xl mb-3 w-full h-auto object-cover"
          />
        )}
        {video && (
          <video 
            src={video} 
            controls 
            className="rounded-xl mb-3 w-full h-auto"
          />
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
};
