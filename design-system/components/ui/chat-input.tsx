"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { Button } from "@/design-system/components/ui/button";
import { Paperclip, Image, Wand2, Smile, Send } from "lucide-react";

interface ChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: (message: string) => void;
  onAttachFile?: () => void;
  onAttachImage?: () => void;
  onAiAssist?: () => void;
  onEmoji?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  value = "",
  onChange,
  onSend,
  onAttachFile,
  onAttachImage,
  onAiAssist,
  onEmoji,
  placeholder = "Write a message",
  disabled = false,
  className,
}: ChatInputProps) {
  const [internalValue, setInternalValue] = React.useState(value);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const currentValue = onChange ? value : internalValue;
  const setValue = onChange || setInternalValue;

  const handleSend = () => {
    if (currentValue.trim() && onSend) {
      onSend(currentValue.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [currentValue]);

  return (
    <div className={cn("border-border bg-card border-t p-4", className)}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="border-border bg-background focus-within:ring-ring flex h-11 min-w-0 flex-1 items-center rounded-full border pr-1 pl-3 focus-within:ring-2 sm:pr-2 sm:pl-4">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={placeholder}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-sm outline-none",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              onClick={onAttachFile}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground xs:flex relative hidden h-11 w-11"
              onClick={onAttachImage}
              disabled={disabled}
            >
              <Image className="h-4 w-4" />
              <span className="sr-only">Attach image</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative hidden h-9 w-9 sm:flex sm:h-11 sm:w-11"
              onClick={onAiAssist}
              disabled={disabled}
            >
              <Wand2 className="h-4 w-4" />
              <span className="sr-only">AI assist</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-11 w-11"
              onClick={onEmoji}
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled}
          className="h-11 shrink-0 gap-2 px-3 sm:px-4"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export type { ChatInputProps };
