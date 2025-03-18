
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, KeyRound, Link as LinkIcon, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showShareLink, setShowShareLink] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const autoLogin = params.get("login");
    
    if (autoLogin) {
      setLogin(autoLogin);
      document.getElementById("password")?.focus();
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authLogin(login, password)) {
      navigate("/dashboard");
    }
  };

  const generateShareableLink = (userLogin: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/login?login=${encodeURIComponent(userLogin)}`;
  };

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Link skopiowany",
        description: `Link dla ${name} został skopiowany do schowka.`,
      });
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <Logo size="xl" showText={false} rounded={true} />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Bilard Score Tracker</CardTitle>
          <CardDescription className="text-center">
            Wprowadź dane logowania, aby kontynuować
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login"
                  placeholder="Twój login"
                  className="pl-10"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Twoje hasło"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Zaloguj się
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Zarejestruj się
              </Link>
            </p>
          </div>
          
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setShowShareLink(!showShareLink)}
            >
              <LinkIcon className="h-4 w-4" />
              {showShareLink ? "Ukryj linki logowania" : "Pokaż linki logowania"}
            </Button>
            
            {showShareLink && (
              <div className="mt-4 space-y-3">
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Link dla Kimoz:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => copyToClipboard(generateShareableLink("Kimoz"), "Kimoz")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground break-all">
                    {generateShareableLink("Kimoz")}
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Link dla Tomek:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => copyToClipboard(generateShareableLink("Tomek"), "Tomek")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground break-all">
                    {generateShareableLink("Tomek")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground text-center">
            Demo logowania:<br />
            Gracze: Kimoz/kimoz, Tomek/tomek
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
