import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
const base = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,transform] duration-150 active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';
const sizes = { sm: 'h-9 px-3.5 text-sm', md: 'h-11 px-5 text-[15px]' };
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-leaf',
  secondary: 'border border-line bg-surface text-ink hover:border-leaf hover:text-leaf',
  ghost: 'text-muted hover:text-ink hover:bg-sunken',
};

interface Common { variant?: Variant; size?: keyof typeof sizes; icon?: ReactNode; children?: ReactNode }

export function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>{icon}{children}</button>;
}

export function LinkButton({ variant = 'primary', size = 'md', icon, children, className = '', ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>{icon}{children}</a>;
}
