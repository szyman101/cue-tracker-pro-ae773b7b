
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { initialUsers } from "../data/initialData";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface AuthContextType {
  currentUser: User | null;
  login: (login: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  registerUser: (userData: Omit<User, "id">) => boolean;
  allUsers: User[];
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
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem("users");
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // Check if there's a saved user in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Make sure the user still exists in our data
      if (users.some(u => u.id === user.id)) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        // Clear local storage if user doesn't exist anymore
        localStorage.removeItem("currentUser");
      }
    }
  }, [users]);

  const login = (login: string, password: string): boolean => {
    const user = users.find(
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

  const registerUser = (userData: Omit<User, "id">): boolean => {
    // Check if user with this login already exists
    if (users.some(user => user.login.toLowerCase() === userData.login.toLowerCase())) {
      toast({
        title: "Błąd rejestracji",
        description: "Użytkownik o podanym loginie już istnieje",
        variant: "destructive",
      });
      return false;
    }

    // Create new user with ID
    const newUser: User = {
      ...userData,
      id: uuidv4()
    };

    // Add to users array
    setUsers(prev => [...prev, newUser]);

    toast({
      title: "Konto utworzone",
      description: `Konto dla użytkownika ${newUser.nick} zostało utworzone. Możesz się teraz zalogować.`,
    });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated,
        isAdmin: currentUser?.role === "admin",
        registerUser,
        allUsers: users
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
