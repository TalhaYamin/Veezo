import { Link } from 'react-router-dom';

type LogoProps = {
  variant?: 'header' | 'footer';
  className?: string;
};

export default function Logo({ variant = 'header', className = '' }: LogoProps) {
  const isHeader = variant === 'header';

  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="VEEZO — Refine your style"
    >
      <span
        className={
          isHeader
            ? 'rounded-xl bg-[#f3f0ea] px-3 py-2 shadow-sm shadow-black/20 ring-1 ring-white/10'
            : 'rounded-xl bg-[#f3f0ea] px-4 py-3 ring-1 ring-white/10'
        }
      >
        <img
          src="/veezo-logo.png"
          alt="VEEZO — Refine your style"
          className={
            isHeader
              ? 'h-9 w-auto object-contain sm:h-10'
              : 'h-12 w-auto object-contain'
          }
        />
      </span>
    </Link>
  );
}
