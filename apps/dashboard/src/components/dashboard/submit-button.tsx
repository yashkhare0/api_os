"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = ButtonProps & {
  pendingText?: string;
  leadingIcon?: ReactNode;
  pendingOverride?: boolean;
};

export function SubmitButton({
  children,
  disabled,
  leadingIcon,
  pendingOverride,
  pendingText,
  type = "submit",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isPending = pendingOverride ?? pending;

  return (
    <Button type={type} disabled={disabled || isPending} aria-disabled={disabled || isPending} {...props}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : leadingIcon}
      {isPending ? (pendingText ?? children) : children}
    </Button>
  );
}
