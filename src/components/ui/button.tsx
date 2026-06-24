import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-ink hover:-translate-y-0.5 hover:bg-gold/90 hover:shadow-[0_4px_20px_rgba(244,197,66,0.35)]",
        outline:
          "border border-gold/30 bg-transparent text-gold hover:-translate-y-0.5 hover:bg-gold/10 hover:shadow-[0_0_16px_rgba(244,197,66,0.12)]",
        ghost:
          "text-muted hover:scale-[1.02] hover:text-foreground hover:bg-white/5",
        secondary:
          "bg-surface text-foreground hover:-translate-y-0.5 hover:bg-surface/80 hover:shadow-md hover:shadow-black/20",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";