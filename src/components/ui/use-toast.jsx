import React from "react";
import { cn } from "../../lib/utils";

const ToastContext = React.createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback(({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Expõe o contexto globalmente
  React.useEffect(() => {
    window.__toastContext = { addToast, removeToast };
    return () => {
      delete window.__toastContext;
    };
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function Toast({ id, title, description, variant = "default" }) {
  const { removeToast } = useToast();

  const variantStyles = {
    default: "bg-background border",
    destructive: "bg-destructive text-destructive-foreground",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-lg",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          {title && <h4 className="font-semibold">{title}</h4>}
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
        <button
          onClick={() => removeToast(id)}
          className="ml-4 text-sm opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function Toaster() {
  return (
    <ToastProvider>
      <div />
    </ToastProvider>
  );
}

// Função toast para ser usada diretamente
export function toast({ title, description, variant = "default" }) {
  const event = new CustomEvent('toast', {
    detail: { title, description, variant }
  });
  window.dispatchEvent(event);
}

// Adiciona um listener global para o evento toast
if (typeof window !== 'undefined') {
  window.addEventListener('toast', (event) => {
    const { addToast } = window.__toastContext || {};
    if (addToast) {
      addToast(event.detail);
    }
  });
} 