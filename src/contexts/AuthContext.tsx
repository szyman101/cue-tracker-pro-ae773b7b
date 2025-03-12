
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { initialUsers } from "../data/initialData";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  login: (login: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if there's a saved user in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (login: string, password: string): boolean => {
    const user = initialUsers.find(
      (u) => u.login.toLowerCase() === login.toLowerCase() && u.password === password
    );

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast({
        title: "Zalogowano pomyślnie",
        description: `Witaj, ${user.nick}!`,
      });
      return true;
    } else {
      toast({
        title: "Błąd logowania",
        description: "Nieprawidłowy login lub hasło",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
    toast({
      title: "Wylogowano",
      description: "Pomyślnie wylogowano z aplikacji",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated,
        isAdmin: currentUser?.role === "admin"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
