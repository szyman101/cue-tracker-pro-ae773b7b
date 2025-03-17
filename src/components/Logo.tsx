
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

const Logo = ({ className, size = "medium", showText = true }: LogoProps) => {
  const sizes = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/lovable-uploads/ca7ed6ce-0489-4b0d-9492-511daf16c1e1.png" 
        alt="Cue Tracker Logo" 
        className={cn(sizes[size], "object-contain")} 
      />
      {showText && (
        <span className="font-bold text-xl hidden sm:block">Cue Tracker</span>
      )}
    </div>
  );
};

export default Logo;
