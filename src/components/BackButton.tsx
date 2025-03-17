
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleGoBack}
      className="fixed bottom-6 left-6 rounded-full shadow-md z-10"
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="sr-only">Wróć</span>
    </Button>
  );
};

export default BackButton;
