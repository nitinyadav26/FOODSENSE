"use client";

import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export const Button = ({
  className,
  children,
  variant = "primary",
  fullWidth,
  ...rest
}: ButtonProps) => {
  const styles = {
    primary: "bg-emerald-400 text-slate-950 hover:bg-emerald-300",
    secondary: "bg-slate-800 text-white hover:bg-slate-700",
    ghost: "bg-transparent text-white border border-white/30 hover:border-white/60",
  }[variant];

  return (
    <button
      className={clsx(
        "rounded-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles,
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
