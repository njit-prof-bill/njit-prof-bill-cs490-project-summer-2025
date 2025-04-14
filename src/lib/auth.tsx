"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import app from "@/lib/firebaseConfig";

interface AuthContextType {
    user: any; // Replace `any` with your user type if you have a specific user model
    isAuthenticated: boolean;
    logIn: ({ email, password }: { email: string; password: string }) => Promise<void>;
    signUp: ({ email, password }: { email: string; password: string }) => Promise<void>;
    logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthenticated(!!currentUser);
        });

        return () => unsubscribe();
    }, [auth]);

    const logIn = async ({ email, password }: { email: string; password: string }) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async ({ email, password }: { email: string; password: string }) => {
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const logOut = async () => {
        await signOut(auth);
    };

    // Replace the existing return statement with this
    const authValue: AuthContextType = {
        user,
        isAuthenticated,
        logIn,
        signUp,
        logOut
    };

    return (
        <AuthContext.Provider value= { authValue } >
        { children }
        </AuthContext.Provider>
  );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}