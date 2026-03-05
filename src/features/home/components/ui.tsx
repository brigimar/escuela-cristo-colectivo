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
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl h-12 px-5",
        "bg-neutral-900 text-neutral-50 font-medium",
        "transition-all duration-300 hover:bg-neutral-800",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
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
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl h-12 px-5",
        "bg-white text-neutral-900 border border-neutral-200 font-medium",
        "transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
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
      {eyebrow ? <p className="text-sm font-medium tracking-wide text-neutral-500">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      {desc ? <p className="mt-3 text-base md:text-lg text-neutral-700">{desc}</p> : null}
    </div>
  );
}

export function Surface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}
