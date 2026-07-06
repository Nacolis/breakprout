import type { ButtonHTMLAttributes } from "react";

type BracketButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function BracketButton({ className = "", type = "button", children, ...props }: BracketButtonProps) {
  return (
    <button
      type={type}
      className={`group relative inline-flex cursor-pointer items-center gap-1.5 bg-transparent px-4 py-2 font-mono text-sm uppercase tracking-wider text-status-active transition-colors hover:bg-status-active/10 disabled:cursor-default disabled:opacity-50 ${className}`}
      {...props}
    >
      <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-status-active" />
      <span className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-status-active" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-status-active" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-status-active" />
      {children}
    </button>
  );
}
