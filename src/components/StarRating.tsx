import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (score: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({ rating, onRate, size = 20, readonly = false }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            "transition-colors",
            i <= rating ? "fill-star-filled text-star-filled" : "text-star-empty",
            !readonly && "cursor-pointer hover:text-star-filled"
          )}
          onClick={() => !readonly && onRate?.(i)}
        />
      ))}
    </div>
  );
}
