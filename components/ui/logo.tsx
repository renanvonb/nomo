import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
    variant?: "full" | "symbol"
    size?: number
    className?: string
}

/**
 * Logo component using the high-fidelity PNG symbol.
 * Note: The PNG is dark, so it will be inverted using CSS filters 
 * when displayed on dark backgrounds like the Sidebar.
 */
export function Logo({ variant = "full", size = 32, className }: LogoProps) {
    const fontSize = size * 0.85

    return (
        <div className={cn("flex items-center gap-3 select-none", className)}>
            {/* Nomo Symbol (PNG) */}
            <div
                className="relative overflow-hidden"
                style={{ width: size, height: size }}
            >
                <Image
                    src="/brand/logo-symbol.png"
                    alt="Nomo Label"
                    width={size}
                    height={size}
                    className={cn(
                        "object-contain transition-all duration-300",
                        // If the text is white (likely in sidebar), we invert the PNG
                        className?.includes("text-white") && "invert brightness-200"
                    )}
                    priority
                />
            </div>

            {/* Nomo Text */}
            {variant === "full" && (
                <span
                    className="font-sans font-bold tracking-tighter transition-all duration-300"
                    style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: 1,
                        marginTop: '2px'
                    }}
                >
                    nomo
                </span>
            )}
        </div>
    )
}
