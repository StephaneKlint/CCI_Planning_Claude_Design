/**
 * Button — primary, ghost, mint, danger variants.
 * Sizes: xs, sm, md (default).
 */
"use client";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "ghost" | "mint" | "danger" | "default";
export type ButtonSize = "xs" | "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "default",
  size = "md",
  icon,
  iconRight,
  loading = false,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    loading ? styles["btn--loading"] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
}

export default Button;
