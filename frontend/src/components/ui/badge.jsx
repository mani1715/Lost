import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
<<<<<<< HEAD
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
=======
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc
  {
    variants: {
      variant: {
        default:
<<<<<<< HEAD
          "border-transparent bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90",
        secondary:
          "border-transparent bg-accent text-accent-foreground shadow-soft hover:bg-accent/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline: "text-foreground border-border bg-card",
=======
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
