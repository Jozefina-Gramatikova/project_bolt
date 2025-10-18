import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
  video?: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Fashion AI! 👗✨\n\nLet's create your perfect virtual try-on. First, please upload a photo of yourself.",
    },
  ]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"user-photo" | "clothing-photo" | "complete">("user-photo");
  const { toast } = useToast();

  const handleUserPhotoUpload = async (file: File, preview: string) => {
    setUserPhoto(preview);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Here's my photo!", image: preview },
      {
        role: "assistant",
        content: "Perfect! Now upload a photo of the clothing item you'd like to try on.",
      },
    ]);
    setStep("clothing-photo");
  };

  const handleClothingPhotoUpload = async (file: File, preview: string) => {
    setClothingPhoto(preview);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Here's the clothing I want to try!", image: preview },
    ]);
  };

  const generateVideo = async () => {
    if (!userPhoto || !clothingPhoto) return;

    setIsProcessing(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Creating your virtual try-on video... This may take a moment! ✨",
      },
    ]);

    try {
      const { data, error } = await supabase.functions.invoke("fashion-chat", {
        body: {
          userPhoto,
          clothingPhoto,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Here's your virtual try-on! 🎥✨",
          video: data.videoUrl,
        },
      ]);
      setStep("complete");

      toast({
        title: "Success!",
        description: "Your virtual try-on is ready!",
      });
    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Error",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Welcome to Fashion AI! 👗✨\n\nLet's create your perfect virtual try-on. First, please upload a photo of yourself.",
      },
    ]);
    setUserPhoto(null);
    setClothingPhoto(null);
    setStep("user-photo");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Fashion AI
                </h1>
                <p className="text-xs text-muted-foreground">Virtual Try-On Studio</p>
              </div>
            </div>
            {step === "complete" && (
              <Button onClick={resetChat} variant="secondary" size="sm">
                Start Over
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} {...msg} />
          ))}
        </div>

        {/* Upload Section */}
        {step === "user-photo" && !userPhoto && (
          <div className="max-w-md mx-auto">
            <ImageUpload
              onUpload={handleUserPhotoUpload}
              label="Click to upload your photo"
              isLoading={isProcessing}
            />
          </div>
        )}

        {step === "clothing-photo" && !clothingPhoto && (
          <div className="max-w-md mx-auto">
            <ImageUpload
              onUpload={handleClothingPhotoUpload}
              label="Click to upload clothing photo"
              isLoading={isProcessing}
            />
          </div>
        )}

        {step === "clothing-photo" && clothingPhoto && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={generateVideo}
              size="lg"
              variant="hero"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Try-On Video
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      {/* Footer Gradient Glow */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-glow pointer-events-none" />
    </div>
  );
};

export default Index;
