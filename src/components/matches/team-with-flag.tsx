import { NationalFlag } from "@/components/matches/national-flag";
import { cn } from "@/lib/utils/cn";

const FLAG_SIZE = {
  sm: 28,
  md: 36,
  lg: 44,
} as const;

export function TeamWithFlag({
  name,
  code,
  highlight,
  size = "md",
  className,
}: {
  name: string;
  code?: string;
  highlight?: boolean;
  size?: keyof typeof FLAG_SIZE;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        highlight && "text-[#F4C542]",
        className
      )}
    >
      <NationalFlag
        team={name}
        code={code}
        size={FLAG_SIZE[size]}
        highlight={highlight}
      />
      <span className="font-medium tracking-tight">{name}</span>
    </span>
  );
}