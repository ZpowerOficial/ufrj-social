import React, { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

const PopoverContext = React.createContext({});

const Popover = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const { open, setOpen } = React.useContext(PopoverContext);

  return (
    <button
      ref={ref}
      className={cn("inline-flex items-center justify-center", className)}
      onClick={() => setOpen(!open)}
      {...props}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef(({ className, sideOffset = 4, align = "center", side = "bottom", ...props }, ref) => {
  const { open, setOpen } = React.useContext(PopoverContext);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={(node) => {
        // Use ambas as refs
        if (typeof ref === "function") ref(node);
        popoverRef.current = node;
      }}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in",
        side === "bottom" && "data-[side=bottom]:slide-in-from-top-2",
        side === "top" && "data-[side=top]:slide-in-from-bottom-2",
        side === "left" && "data-[side=left]:slide-in-from-right-2",
        side === "right" && "data-[side=right]:slide-in-from-left-2",
        align === "start" && "data-[align=start]:start-0",
        align === "center" && "data-[align=center]:left-1/2 data-[align=center]:-translate-x-1/2",
        align === "end" && "data-[align=end]:end-0",
        className
      )}
      style={{
        position: "absolute",
        [side]: "100%",
        marginTop: side === "bottom" ? sideOffset : 0,
        marginBottom: side === "top" ? sideOffset : 0,
        marginLeft: side === "right" ? sideOffset : 0,
        marginRight: side === "left" ? sideOffset : 0,
      }}
      {...props}
    />
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent }; 