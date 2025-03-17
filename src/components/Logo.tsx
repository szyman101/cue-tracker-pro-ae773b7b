
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large" | "xl";
  showText?: boolean;
  rounded?: boolean;
}

const Logo = ({ className, size = "medium", showText = true, rounded = false }: LogoProps) => {
  // Zwiększamy rozmiary dla wszystkich wariantów logo
  const sizes = {
    small: "h-12 w-12", // Zwiększono z h-8 w-8
    medium: "h-16 w-16", // Zwiększono z h-12 w-12
    large: "h-24 w-24", // Zwiększono z h-16 w-16
    xl: "h-60 w-60", // Zwiększono z h-48 w-48 do 60x60 pixels
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src="/lovable-uploads/0e728591-73b1-4b77-922d-298326332f43.png" 
        alt="Cue Tracker Logo" 
        className={cn(
          sizes[size], 
          "object-contain", 
          rounded && "rounded-2xl"
        )} 
      />
      {showText && (
        <span className="font-bold text-2xl hidden sm:block">Cue Tracker</span> // Zwiększono rozmiar tekstu z text-xl
      )}
    </div>
  );
};

export default Logo;
