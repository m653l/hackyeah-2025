import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zus-green/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-zus-green to-zus-green/90 text-white hover:from-zus-green/90 hover:to-zus-green hover:shadow-lg hover:shadow-zus-green/25 rounded-lg",
        primary: "bg-gradient-to-r from-zus-green to-zus-green/90 text-white hover:from-zus-green/90 hover:to-zus-green hover:shadow-lg hover:shadow-zus-green/25 rounded-lg",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/25 rounded-lg",
        outline:
          "border-2 border-zus-green bg-transparent text-zus-green hover:bg-zus-green hover:text-white hover:shadow-lg hover:shadow-zus-green/25 rounded-lg transition-all duration-200",
        secondary:
          "bg-gradient-to-r from-zus-gray-100 to-zus-gray-200 text-zus-gray-900 hover:from-zus-gray-200 hover:to-zus-gray-300 hover:shadow-md rounded-lg",
        ghost: "hover:bg-zus-gray-100/80 hover:text-zus-gray-900 rounded-lg backdrop-blur-sm",
        link: "text-zus-green underline-offset-4 hover:underline hover:text-zus-green/80",
      },
      size: {
        default: "h-11 px-6 py-3 rounded-lg",
        sm: "h-9 px-4 py-2 rounded-md text-xs",
        medium: "h-11 px-6 py-3 rounded-lg",
        lg: "h-12 px-8 py-3 rounded-lg text-base",
        large: "h-12 px-8 py-3 rounded-lg text-base",
        icon: "h-11 w-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }