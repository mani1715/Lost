import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-soft hover:shadow-soft-md transition-shadow", className)}
=======
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc
    {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("flex flex-col space-y-2 p-6", className)}
=======
    className={cn("flex flex-col space-y-1.5 p-6", className)}
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("text-xl font-semibold leading-tight tracking-tight text-foreground", className)}
=======
    className={cn("font-semibold leading-none tracking-tight", className)}
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
=======
    className={cn("text-sm text-muted-foreground", className)}
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
