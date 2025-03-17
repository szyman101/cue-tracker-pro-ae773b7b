
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const UserControls: React.FC = () => {
  return (
    <div className="flex gap-4">
      <Button asChild>
        <Link to="/new-match">Nowy Mecz</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to="/new-season">Nowy Sezon</Link>
      </Button>
    </div>
  );
};

export default UserControls;
