
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

const Logo = ({ className, size = "medium", showText = true }: LogoProps) => {
  // Zwiększamy rozmiary dla wszystkich wariantów logo
  const sizes = {
    small: "h-12 w-12", // Zwiększono z h-8 w-8
    medium: "h-16 w-16", // Zwiększono z h-12 w-12
    large: "h-24 w-24", // Zwiększono z h-16 w-16
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src="/lovable-uploads/ca7ed6ce-0489-4b0d-9492-511daf16c1e1.png" 
        alt="Cue Tracker Logo" 
        className={cn(sizes[size], "object-contain")} 
      />
      {showText && (
        <span className="font-bold text-2xl hidden sm:block">Cue Tracker</span> // Zwiększono rozmiar tekstu z text-xl
      )}
    </div>
  );
};

export default Logo;
