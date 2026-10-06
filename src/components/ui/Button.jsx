import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * One button for the whole product: brand variants, a fixed size scale and a
 * focus ring that is always drawn for keyboard users.
 */
export const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:ring-2 focus-visible:ring-vcet-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-vcet-blue text-white shadow-sm hover:bg-vcet-blue-deep",
        secondary:
          "border border-vcet-gray-border bg-white text-vcet-dark hover:border-vcet-blue hover:text-vcet-blue",
        ghost: "text-vcet-dark hover:bg-vcet-gray-light",
        danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
