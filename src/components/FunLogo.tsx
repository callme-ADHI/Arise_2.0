import { cn } from "@/lib/utils";

interface FunLogoProps {
    className?: string;
    showText?: boolean;
    variant?: "default" | "red";
}

const FunLogo = ({ className, showText = true, variant = "default" }: FunLogoProps) => {
    const isRed = variant === "red";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative w-8 h-8 flex items-center justify-center">
                {/* Background Glow */}
                <div className={cn(
                    "absolute inset-0 blur-md rounded-full",
                    isRed ? "bg-red-600/40" : "bg-gradient-to-tr from-amber-500/40 via-purple-500/40 to-cyan-500/40"
                )} />

                {/* The 'A' Shape - Stylized Triangle/Rocket */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 relative z-10 drop-shadow-md"
                >
                    <path
                        d="M12 2L3 19H21L12 2Z"
                        className={cn("fill-zinc-900", isRed ? "stroke-red-600" : "stroke-cyan-400")}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 2L12 16M7 14L17 14" // Internal A lines
                        className={isRed ? "stroke-red-500" : "stroke-purple-500"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="12" cy="8" r="1.5" className={isRed ? "fill-red-400" : "fill-amber-400"} />
                </svg>
            </div>

            {showText && (
                <span className={cn(
                    "text-xl font-black tracking-tighter",
                    isRed ? "text-red-600" : "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400"
                )}>
                    ARISE
                </span>
            )}
        </div>
    );
};

export default FunLogo;
