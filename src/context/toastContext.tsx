// src/context/toastContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X as CloseIcon } from "@/components/icons/X";

type ToastType = "success" | "error";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  success: () => {},
  error: () => {},
});

let counter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: ToastType) => {
    const id = ++counter;
    setToasts((t) => [...t, { id, message, type }]);
    // auto-dismiss
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg: string) => push(msg, "success"), [push]);
  const error = useCallback((msg: string) => push(msg, "error"), [push]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}

      {createPortal(
        <div className="fixed top-5 right-5 space-y-2 z-50">
          {toasts.map(({ id, message, type }) => (
            <div
              key={id}
              className={`flex items-center p-3 rounded-lg shadow-lg ${
                type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              <span className="flex-1">{message}</span>
              <button onClick={() => setToasts((t) => t.filter((x) => x.id !== id))}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
