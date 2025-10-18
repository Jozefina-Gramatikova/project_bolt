import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShoppingCart, User, Sparkles, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/components/ui/use-toast";
import { generateTryOnImage, generateTryOnVideo, getDownloadUrl } from "@/services/tryonApi";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
  video?: string;
}

const products: Product[] = [
  { id: 1, name: "Classic Black T-Shirt", category: "Men's Fashion", price: "$129.99", image: "/clothes/men/00761323800-000-e1.jpg" },
  { id: 2, name: "Casual Denim Jeans", category: "Men's Fashion", price: "$69.99", image: "/clothes/men/00774350407-e1.jpg" },
  { id: 3, name: "Urban Polo Sweater", category: "Men's Fashion", price: "$149.99", image: "/clothes/men/02142313710-e1.jpg" },
  { id: 4, name: "Modern Blazer", category: "Men's Fashion", price: "$179.99", image: "/clothes/men/05854181706-e1.jpg" },
  { id: 5, name: "Elegant Pleated Dress", category: "Women's Fashion", price: "$89.99", image: "/clothes/women/02298171431-e1.jpg" },
  { id: 6, name: "Classic Wool Blazer", category: "Women's Fashion", price: "$119.99", image: "/clothes/women/03046263720-e1.jpg" },
  { id: 7, name: "Stylish Tank Top", category: "Women's Fashion", price: "$79.99", image: "/clothes/women/03905781717-e1.jpg" },
  { id: 8, name: "Wide Leg Jeans", category: "Women's Fashion", price: "$159.99", image: "/clothes/women/04730232407-e1.jpg" },
  { id: 9, name: "Satin Midi Skirt", category: "Women's Fashion", price: "$189.99", image: "/clothes/women/05427501814-e1.jpg" },
  { id: 10, name: "Flowing Maxi Skirt", category: "Women's Fashion", price: "$199.99", image: "/clothes/women/08338511717-e2.jpg" },
];

const Shop = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"user-photo" | "complete">("user-photo");
  const { toast } = useToast();

  const handleTryOn = (product: Product) => {
    setSelectedProduct(product);
    setMessages([
      {
        role: "assistant",
        content: `Great choice! Let's try on the ${product.name}. Please upload a full-body photo to see how it looks on you.`,
      },
    ]);
    setUserPhoto(null);
    setStep("user-photo");
    setIsDialogOpen(true);
  };

  const handleUserPhotoUpload = async (file: File, preview: string) => {
    setUserPhoto(preview);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Here's my photo!", image: preview },
    ]);
  };

  const generateVideo = async () => {
    if (!userPhoto || !selectedProduct) return;

    setIsProcessing(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Creating your virtual try-on image... This may take a moment! ✨",
      },
    ]);

    try {
      // Step 1: Generate the try-on image
      const imageResponse = await generateTryOnImage(
        userPhoto,
        selectedProduct.image
      );

      // Preload the image before showing the message
      const imageUrl = getDownloadUrl(imageResponse.image_path, 'image');

      // Wait for image to load
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      // Show the generated image with AI message after it's loaded
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: imageResponse.description || "Great! Here's your try-on image. Now generating an animated video... This will take about 1-2 minutes! 🎬",
          image: imageUrl,
        },
      ]);

      // Step 2: Generate the video from the try-on image
      const videoResponse = await generateTryOnVideo(imageResponse.image_path);

      // Get video URL
      const videoUrl = getDownloadUrl(videoResponse.video_path, 'video');

      // Wait a moment for video to be accessible
      await new Promise(resolve => setTimeout(resolve, 500));

      // Show the final video with AI message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: videoResponse.description || "Here's your virtual try-on video! 🎥✨",
          video: videoUrl,
        },
      ]);
      setStep("complete");

      toast({
        title: "Success!",
        description: "Your virtual try-on video is ready!",
      });
    } catch (error) {
      console.error("Error generating try-on:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate try-on. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const menProducts = products.filter((p) => p.category === "Men's Fashion");
  const womenProducts = products.filter((p) => p.category === "Women's Fashion");

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <span className="text-xl font-bold text-foreground">Virtual Threads</span>
              <div className="flex items-center space-x-4">
                <a href="#men" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Men</a>
                <a href="#women" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Women</a>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-background py-20 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">Try Before You Buy</h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">Virtual try-on with our AI-powered fashion assistant</p>
          </div>
        </section>

        {/* Men's Collection */}
        <section id="men" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Men's Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menProducts.map((product) => (
              <div key={product.id} className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <Button 
                    onClick={() => handleTryOn(product)}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    size="sm"
                  >
                    Try On
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                  <p className="text-muted-foreground text-sm">{product.category}</p>
                  <p className="text-foreground font-bold mt-2">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Women's Collection */}
        <section id="women" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Women's Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {womenProducts.map((product) => (
              <div key={product.id} className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <Button 
                    onClick={() => handleTryOn(product)}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    size="sm"
                  >
                    Try On
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                  <p className="text-muted-foreground text-sm">{product.category}</p>
                  <p className="text-foreground font-bold mt-2">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-muted-foreground">© 2025 Virtual Threads. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Try-On Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-bold text-foreground">Virtual Try-On</h3>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Product Preview */}
            {selectedProduct && (
              <div className="w-1/3 bg-muted p-6 flex flex-col items-center justify-center border-r">
                <img src={selectedProduct.image} className="w-full max-h-64 object-contain mb-4" alt={selectedProduct.name} />
                <h3 className="text-lg font-semibold text-foreground mb-1">{selectedProduct.name}</h3>
                <p className="text-muted-foreground mb-2">{selectedProduct.category}</p>
                <p className="text-foreground font-bold">{selectedProduct.price}</p>
              </div>
            )}
            
            {/* Chat Interface */}
            <div className="w-2/3 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <ChatMessage key={idx} {...msg} />
                ))}
              </div>
              
              {step === "user-photo" && !userPhoto && (
                <div className="p-4 border-t">
                  <ImageUpload
                    onUpload={handleUserPhotoUpload}
                    label="Upload your photo"
                    isLoading={isProcessing}
                  />
                </div>
              )}
              
              {step === "user-photo" && userPhoto && (
                <div className="p-4 border-t flex justify-center">
                  <Button
                    onClick={generateVideo}
                    size="lg"
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
                        Generate Try-On
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Shop;
