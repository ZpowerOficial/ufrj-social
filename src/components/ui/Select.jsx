import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

const SelectContext = React.createContext({});

const Select = ({ value, defaultValue, onValueChange, children, disabled = false }) => {
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue) => {
    if (disabled) return;
    
    if (value === undefined) {
      setSelectedValue(newValue);
    }
    
    if (onValueChange) {
      onValueChange(newValue);
    }
    
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ 
      selectedValue, 
      open, 
      setOpen, 
      onValueChange: handleValueChange,
      disabled 
    }}>
      {children}
    </SelectContext.Provider>
  );
};

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
  const { selectedValue } = React.useContext(SelectContext);
  
  return (
    <span
      ref={ref}
      className={cn("block truncate", className)}
      {...props}
    >
      {selectedValue || placeholder || "Selecione..."}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectTrigger = React.forwardRef(({ className, children, placeholder, ...props }, ref) => {
  const { selectedValue, open, setOpen, disabled } = React.useContext(SelectContext);
  
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      aria-expanded={open}
      {...props}
    >
      <span className="flex items-center gap-2 truncate">
        {selectedValue ? children : placeholder || "Selecione..."}
      </span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(({ className, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
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
        if (typeof ref === "function") ref(node);
        selectRef.current = node;
      }}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
        className
      )}
      {...props}
    />
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { selectedValue, onValueChange } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      )}
      <span className="truncate">{children}</span>
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }; 