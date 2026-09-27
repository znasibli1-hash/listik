export function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="#/" className={`inline-flex items-center gap-1 text-[19px] font-semibold tracking-[-0.03em] text-ink ${className}`}>
      Листик<span aria-hidden className="text-[17px]">🌿</span>
    </a>
  );
}
