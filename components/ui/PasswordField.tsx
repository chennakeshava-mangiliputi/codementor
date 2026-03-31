"use client";

import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  wrapperClassName?: string;
}

export default function PasswordField({
  className,
  wrapperClassName,
  disabled,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", wrapperClassName)}>
      <input
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={cn(className, "pr-12")}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition hover:text-black disabled:cursor-not-allowed disabled:text-gray-400"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
