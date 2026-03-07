import Link from "next/link";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("material-symbols-rounded align-middle leading-none", className)} aria-hidden="true">
      {name}
    </span>
  );
}

export function PrimaryButton({
  href,
  children,
  icon,
  className,
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl h-11 px-4 text-sm sm:h-12 sm:px-5 sm:text-base",
        "bg-[linear-gradient(180deg,#e6c24a_0%,#d5ad2f_100%)] text-[#1f1b16] font-semibold",
        "border border-[#b8921f]/45 shadow-[0_10px_26px_rgba(162,124,20,0.24)]",
        "transition-all duration-300 hover:-translate-y-0.5 hover:brightness-[1.03] hover:shadow-[0_14px_34px_rgba(162,124,20,0.3)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f6a11]",
        className
      )}
    >
      {icon ? <Icon name={icon} className="text-[20px]" /> : null}
      <span>{children}</span>
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  icon,
  className,
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl h-11 px-4 text-sm sm:h-12 sm:px-5 sm:text-base",
        "bg-[#fffdf8] text-[#2d2418] border border-[#d8c6a0] font-medium",
        "shadow-[0_8px_20px_rgba(70,50,18,0.08)]",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c5ae7d] hover:bg-[#fffaf0]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f6a11]",
        className
      )}
    >
      {icon ? <Icon name={icon} className="text-[20px]" /> : null}
      <span>{children}</span>
    </Link>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#8e6e2f]">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-[#1f1b16]">{title}</h2>
      {desc ? <p className="mt-3 text-base md:text-lg text-[#5a4c34]">{desc}</p> : null}
    </div>
  );
}

export function Surface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#dac9a8] bg-[#fffdf8] shadow-[0_10px_28px_rgba(67,48,18,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
