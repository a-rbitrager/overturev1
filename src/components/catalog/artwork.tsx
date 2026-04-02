import { cn } from "@/lib/utils";

const gradients = [
  "from-[#0ea5a4] via-[#0f172a] to-[#ff8e3d]",
  "from-[#f45b69] via-[#101828] to-[#22c55e]",
  "from-[#38bdf8] via-[#1e293b] to-[#f59e0b]",
  "from-[#f97316] via-[#111827] to-[#2dd4bf]",
  "from-[#fde68a] via-[#111827] to-[#fb7185]",
  "from-[#8b5cf6] via-[#0f172a] to-[#fb7185]",
];

function pickGradient(seed: string) {
  const value = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return gradients[value % gradients.length];
}

export function Artwork({
  seed,
  title,
  className,
}: {
  seed: string;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] bg-gradient-to-br p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
        pickGradient(seed),
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_32%)]" />
      <div className="absolute -right-8 top-6 h-20 w-20 rounded-full border border-white/16 bg-white/6" />
      <div className="absolute bottom-4 left-4 text-2xl font-semibold tracking-tight">
        {title
          .split(" ")
          .slice(0, 2)
          .map((word) => word[0])
          .join("")}
      </div>
    </div>
  );
}
