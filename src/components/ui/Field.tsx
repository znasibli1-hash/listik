import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-muted">{children}</label>;
}

export function SelectField({ label, id, children, error, ...rest }: { label?: string; id: string; error?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="min-w-0">
      {label && <Label htmlFor={id}>{label}</Label>}
      <select id={id} aria-invalid={!!error} className={`field h-10 cursor-pointer ${error ? '!border-danger' : ''} appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8`}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5l3 3 3-3' fill='none' stroke='%23748496' stroke-width='1.5'/%3E%3C/svg%3E\")" }}
        {...rest}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function InputField({ label, id, error, hint, className = '', ...rest }: { label?: string; id: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="min-w-0">
      {label && <Label htmlFor={id}>{label}</Label>}
      <input id={id} aria-invalid={!!error} className={`field h-10 ${error ? '!border-danger' : ''} ${className}`} {...rest} />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/** Two–three option pill switch */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-sunken p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${value === o.value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm text-ink">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bg-signal' : 'bg-line'}`}>
        <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </button>
      {label}
    </label>
  );
}
