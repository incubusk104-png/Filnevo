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

  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md font-metrics font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    primary: `
      bg-velocity-blue text-neutral-50 hover:bg-velocity-blue/90 focus:ring-velocity-blue/50
      press-effect
    `,
    outline: `
      border border-neutral-700 bg-neutral-900/30 text-neutral-100 hover:bg-neutral-800/30 hover:border-neutral-600 focus:ring-neutral-700/50
      press-effect
    `,
    secondary: `
      bg-insight-cyan text-neutral-50 hover:bg-insight-cyan/90 focus:ring-insight-cyan/50
      press-effect
    `
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-4 text-base"
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