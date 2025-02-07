import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps {
  onClick: () => void;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  title?: string;
  variant?: "primary" | "secondary";
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  icon: Icon,
  className = "",
  disabled = false,
  title,
  variant = "primary",
  children,
}) => {
  const baseClass = "action-button";
  const variantClass = variant === "primary" ? "primary" : "secondary";

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={disabled}
      title={title}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export default Button;
