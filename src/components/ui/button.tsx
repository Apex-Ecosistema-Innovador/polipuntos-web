import { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import styles from './button.module.scss';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'purple';

interface BaseProps {
  variant?: Variant;
  fullWidthOnMobile?: boolean;
  loading?: boolean;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  fullWidthOnMobile = false,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.button, styles[variant], fullWidthOnMobile && styles.fullMobile, className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends BaseProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLink({
  href,
  variant = 'primary',
  fullWidthOnMobile = false,
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(styles.button, styles[variant], fullWidthOnMobile && styles.fullMobile, className)}
    >
      {children}
    </Link>
  );
}
