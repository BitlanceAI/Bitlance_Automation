import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  default: "bg-[#26CECE] text-black hover:bg-[#35DFDF]",
  outline: "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#26CECE]/50",
  secondary: "bg-white/10 text-white hover:bg-white/20",
  ghost: "hover:bg-white/5 text-white",
};

const sizeVariants = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-8",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26CECE] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant] || buttonVariants.default,
          sizeVariants[size] || sizeVariants.default,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
