import Link from "next/link";
import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "onPlum" | "soft";
export type ButtonSize = "default" | "large";

/** Figma Button component set (5:123). */
const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-magenta text-white hover:bg-magenta-deep border-2 border-magenta hover:border-magenta-deep",
  secondary: "bg-white text-magenta border-2 border-magenta hover:bg-blush",
  onPlum: "bg-plum text-white border-2 border-blush hover:bg-plum-end",
  soft: "bg-lavender text-ink border-2 border-lavender hover:border-lavender-mid",
};
const SIZE: Record<ButtonSize, string> = {
  default: "px-6 py-3 text-label min-h-12",
  large: "px-8 py-4 text-[20px] leading-[1.2] tracking-[0.2px] min-h-15",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "default", extra = "") {
  return `inline-flex items-center justify-center gap-2.5 rounded-ui font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${extra}`;
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant,
  size,
  icon,
  children,
  className = "",
  ...rest
}: Common & ComponentProps<"button">) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {icon && <Icon name={icon} size={20} />}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  children,
  className = "",
  href,
  external,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  const cls = buttonClass(variant, size, className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {children}
        {icon && <Icon name={icon} size={20} />}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
      {icon && <Icon name={icon} size={20} />}
    </Link>
  );
}
