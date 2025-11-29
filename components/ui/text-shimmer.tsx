import { cn } from "@/lib/utils";

interface TextShimmerProps {
    children: React.ReactNode;
    className?: string;
    shimmerWidth?: number;
}

export function TextShimmer({
    children,
    className,
    shimmerWidth = 100,
}: TextShimmerProps) {
    return (
        <span
            className={cn(
                "mx-auto max-w-md text-neutral-600/50 dark:text-neutral-400/50 ",

                // Shimmer effect
                "animate-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#939393,45%,#1e293b,55%,#939393)] bg-[length:250%_100%] dark:bg-[linear-gradient(110deg,#A3A3A3,45%,#FFFFFF,55%,#A3A3A3)]",
                className
            )}
            style={{
                "--shimmer-width": `${shimmerWidth}px`,
            } as React.CSSProperties}
        >
            {children}
        </span>
    );
}
