import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const liquidButtonVariants = cva(
  [
    "group relative inline-flex items-center justify-center select-none overflow-hidden",
    "rounded-xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69DDF5]/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[#030303]",
    "disabled:pointer-events-none disabled:opacity-40",
    "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]",
    "motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "text-[#F5F5F2]/88 hover:text-white",
        subtle: "text-[#F5F5F2]/75 hover:text-white",
      },
      size: {
        default: "h-[46px] px-[22px] text-[13.5px] font-medium tracking-wide gap-2.5",
        sm: "h-9 px-4 text-xs font-medium tracking-wide gap-2",
        lg: "h-12 px-6 text-sm font-medium tracking-wide gap-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean
  arrow?: boolean
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, arrow = false, children, onMouseMove, onMouseLeave, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const rawId = React.useId()
    // Clean unique filter ID safe for CSS url reference
    const filterId = React.useMemo(
      () => `liquid-filter-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
      [rawId]
    )

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
        if (onMouseMove) onMouseMove(e)
      },
      [onMouseMove]
    )

    const handleMouseLeave = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onMouseLeave) onMouseLeave(e)
      },
      [onMouseLeave]
    )

    return (
      <Comp
        ref={ref}
        className={cn(liquidButtonVariants({ variant, size }), className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Hidden Isolated SVG Filter Definition for subtle liquid refraction */}
        <svg
          className="absolute w-0 h-0 pointer-events-none opacity-0"
          aria-hidden="true"
        >
          <defs>
            <filter
              id={filterId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04 0.04"
                numOctaves="2"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="16"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
            </filter>
          </defs>
        </svg>

        {/* Layer 1: Liquid Refraction & Glass Backdrop */}
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[inherit] bg-white/[0.035] backdrop-blur-[10px] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-white/[0.055]"
          style={{
            backdropFilter: `url(#${filterId}) blur(10px)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(10px)`,
          }}
        />

        {/* Layer 2: Subtle Optical Border & Top Highlight */}
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[inherit] border border-white/[0.12] transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[#69DDF5]/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_20px_rgba(0,0,0,0.18)]"
        />

        {/* Layer 3: Restrained Pointer-Following Light Reflection */}
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[radial-gradient(100px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(105,221,245,0.08),transparent_70%)]"
        />

        {/* Layer 4: Foreground Content (Always crisp, zero distortion, zero blur) */}
        <span className="relative z-10 inline-flex items-center justify-center gap-2.5 pointer-events-none">
          {children}
          {arrow && (
            <ArrowRight
              className="w-3.5 h-3.5 opacity-65 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 text-[#F5F5F2]"
              aria-hidden="true"
            />
          )}
        </span>
      </Comp>
    )
  }
)

LiquidButton.displayName = "LiquidButton"

export default LiquidButton
