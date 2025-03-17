
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { initialUsers } from "../data/initialData";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  secondUser: User | null;
  login: (login: string, password: string, isSecondUser?: boolean) => boolean;
  logout: (isSecondUser?: boolean) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTwoPlayerMode: boolean;
  switchTwoPlayerMode: (enabled: boolean) => void;
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
  const [secondUser, setSecondUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isTwoPlayerMode, setIsTwoPlayerMode] = useState<boolean>(false);

  // Check if there are saved users in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Make sure the user still exists in our data
      if (initialUsers.some(u => u.id === user.id)) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        // Clear local storage if user doesn't exist anymore
        localStorage.removeItem("currentUser");
      }
    }

    const savedSecondUser = localStorage.getItem("secondUser");
    if (savedSecondUser) {
      const user = JSON.parse(savedSecondUser);
      // Make sure the user still exists in our data
      if (initialUsers.some(u => u.id === user.id)) {
        setSecondUser(user);
        setIsTwoPlayerMode(true);
      } else {
        // Clear local storage if user doesn't exist anymore
        localStorage.removeItem("secondUser");
      }
    }
  }, []);

  const login = (login: string, password: string, isSecondUser = false): boolean => {
    const user = initialUsers.find(
      (u) => u.login.toLowerCase() === login.toLowerCase() && u.password === password
    );

    if (user) {
      // Check if this user is already logged in as the current user or second user
      if (!isSecondUser && secondUser && user.id === secondUser.id) {
        toast({
          title: "Błąd logowania",
          description: "Ten użytkownik jest już zalogowany jako drugi gracz",
          variant: "destructive",
        });
        return false;
      } else if (isSecondUser && currentUser && user.id === currentUser.id) {
        toast({
          title: "Błąd logowania",
          description: "Ten użytkownik jest już zalogowany jako główny gracz",
          variant: "destructive",
        });
        return false;
      }

      if (!isSecondUser) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("currentUser", JSON.stringify(user));
        toast({
          title: "Zalogowano pomyślnie",
          description: `Witaj, ${user.nick}!`,
        });
      } else {
        setSecondUser(user);
        setIsTwoPlayerMode(true);
        localStorage.setItem("secondUser", JSON.stringify(user));
        toast({
          title: "Drugi gracz zalogowany",
          description: `${user.nick} dołączył do gry!`,
        });
      }
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

  const logout = (isSecondUser = false) => {
    if (!isSecondUser) {
      // Jeśli wylogowujemy głównego użytkownika
      if (secondUser) {
        // Jeśli jest drugi użytkownik, to on staje się głównym
        setCurrentUser(secondUser);
        setSecondUser(null);
        localStorage.removeItem("secondUser");
        localStorage.setItem("currentUser", JSON.stringify(secondUser));
        setIsTwoPlayerMode(false);
        toast({
          title: "Zmiana gracza",
          description: `${secondUser.nick} jest teraz głównym graczem`,
        });
      } else {
        // Jeśli nie ma drugiego użytkownika, po prostu wylogowujemy
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("currentUser");
        toast({
          title: "Wylogowano",
          description: "Pomyślnie wylogowano z aplikacji",
        });
      }
    } else {
      // Wylogowanie drugiego użytkownika
      setSecondUser(null);
      setIsTwoPlayerMode(false);
      localStorage.removeItem("secondUser");
      toast({
        title: "Drugi gracz wylogowany",
        description: "Drugi gracz został wylogowany",
      });
    }
  };

  const switchTwoPlayerMode = (enabled: boolean) => {
    if (!enabled) {
      // Wyłączanie trybu dwóch graczy
      setSecondUser(null);
      setIsTwoPlayerMode(false);
      localStorage.removeItem("secondUser");
      toast({
        title: "Tryb jednego gracza",
        description: "Przełączono na tryb jednego gracza",
      });
    } else if (!secondUser) {
      // Włączanie trybu dwóch graczy, ale brak drugiego gracza
      toast({
        title: "Zaloguj drugiego gracza",
        description: "Aby korzystać z trybu dwóch graczy, zaloguj drugiego gracza",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        secondUser,
        login,
        logout,
        isAuthenticated,
        isAdmin: currentUser?.role === "admin",
        isTwoPlayerMode,
        switchTwoPlayerMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
