import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onUpload: (file: File, preview: string) => void;
  isLoading?: boolean;
  label: string;
}

export const ImageUpload = ({ onUpload, isLoading, label }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onUpload(file, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
        disabled={isLoading}
      />
      
      {!preview ? (
        <label htmlFor="image-upload">
          <div className={cn(
            "border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer transition-all",
            "hover:border-primary hover:bg-gradient-glow",
            isLoading && "opacity-50 cursor-not-allowed"
          )}>
            <div className="flex flex-col items-center justify-center gap-3">
              {isLoading ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground text-center">
                {isLoading ? "Uploading..." : label}
              </p>
            </div>
          </div>
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-elegant">
          <img src={preview} alt="Preview" className="w-full h-auto" />
          <Button
            onClick={clearPreview}
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 rounded-full shadow-glow"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
