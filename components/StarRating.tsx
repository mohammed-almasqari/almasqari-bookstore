import { StarIcon } from "./icons";

const SIZES = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" } as const;

export default function StarRating({
  value,
  size = "sm",
  className = "",
}: {
  value: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} className={`${SIZES[size]} ${i <= rounded ? "text-shield" : "text-sand-200"}`} />
      ))}
    </span>
  );
}
