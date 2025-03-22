import React from "react";
import { cn } from "../../lib/utils";

// Função para gerar cor com base no texto (nome do usuário)
const getColorFromText = (text) => {
  if (!text) return "bg-primary";
  
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500"
  ];
  
  // Usa a soma dos códigos de caractere como hash simples
  const hash = Array.from(text.toLowerCase()).reduce(
    (acc, char) => acc + char.charCodeAt(0), 0
  );
  
  return colors[hash % colors.length];
};

// Função para obter iniciais de um nome
const getInitials = (name) => {
  if (!name) return "?";
  
  // Para email, pega só o primeiro caractere
  if (name.includes('@')) return name.charAt(0).toUpperCase();
  
  // Para nomes, pega as iniciais (até 2 caracteres)
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => {
  // Determinar o conteúdo do fallback
  const content = React.Children.count(children) > 0 
    ? children 
    : props.name 
      ? getInitials(props.name)
      : "?";
  
  // Determinar a cor de fundo
  const bgColor = props.name 
    ? getColorFromText(props.name) 
    : "bg-muted";
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full text-sm font-medium text-white",
        bgColor,
        className
      )}
      {...props}
    >
      {content}
    </div>
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };