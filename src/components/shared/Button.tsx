import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  href?: string;
  asChild?: boolean;
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({
  variant = "primary",
  size = "md",
  href,
  asChild = false,
  className = "",
  ...props
}, ref) => {
  const Component = (href || asChild ? "a" : "button") as React.ElementType;

  const baseClasses = "btn-anim inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-metrics font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  const variantClasses = {
    primary: `
      bg-velocity-blue text-neutral-50 shadow-sm hover:bg-velocity-blue/90 focus:ring-velocity-blue/50
      hover:-translate-y-0.5 hover:shadow-lg hover:shadow-velocity-blue/30
      press-effect
    `,
    outline: `
      border border-neutral-700 bg-neutral-900/30 text-neutral-100 hover:bg-neutral-800/40 hover:border-velocity-blue/50 focus:ring-neutral-700/50
      hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/30
      press-effect
    `,
    secondary: `
      bg-insight-cyan text-neutral-50 shadow-sm hover:bg-insight-cyan/90 focus:ring-insight-cyan/50
      hover:-translate-y-0.5 hover:shadow-lg hover:shadow-insight-cyan/30
      press-effect
    `
  };

  // Min-heights keep every variant within (or above) the 44px touch-target
  // guideline on mobile while staying compact on dense desktop layouts.
  const sizeClasses = {
    sm: "min-h-[2.5rem] px-3 py-2 text-sm",
    md: "min-h-[2.75rem] px-4 py-3 text-sm",
    lg: "min-h-[3.25rem] px-6 py-4 text-base"
  };

  return (
    <Component
      ref={ref}
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {props.children}
    </Component>
  );
});

Button.displayName = "Button";