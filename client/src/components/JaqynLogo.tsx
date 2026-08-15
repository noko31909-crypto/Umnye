import { cn } from "@/lib/utils";

/** Official Jaqyn mark: two overlapping circles (large + small) */
export default function JaqynLogo({
  className,
  size = 28,
  title = "Jaqyn AI",
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Large circle left */}
      <circle cx="38" cy="52" r="32" />
      {/* Small circle right, slightly overlapping */}
      <circle cx="72" cy="58" r="20" />
    </svg>
  );
}
