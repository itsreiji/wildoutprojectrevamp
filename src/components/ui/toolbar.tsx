"use client"

import * as React from "react"
import * as ToolbarPrimitive from "@radix-ui/react-toolbar"
import { cn } from "../../lib/utils"

const Toolbar = React.forwardRef<
    React.ElementRef<typeof ToolbarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <ToolbarPrimitive.Root
        ref={ref}
        className={cn(
            "flex h-10 items-center justify-between rounded-md border bg-background p-1",
            className
        )}
        {...props}
    />
))
Toolbar.displayName = ToolbarPrimitive.Root.displayName

const ToolbarToggleGroup = React.forwardRef<
    React.ElementRef<typeof ToolbarPrimitive.ToggleGroup>,
    React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleGroup>
>(({ className, ...props }, ref) => (
    <ToolbarPrimitive.ToggleGroup
        ref={ref}
        className={cn("flex items-center space-x-1", className)}
        {...props}
    />
))
ToolbarToggleGroup.displayName = ToolbarPrimitive.ToggleGroup.displayName

const ToolbarToggleItem = React.forwardRef<
    React.ElementRef<typeof ToolbarPrimitive.ToggleItem>,
    React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem>
>(({ className, ...props }, ref) => (
    <ToolbarPrimitive.ToggleItem
        ref={ref}
        className={cn(
            "flex cursor-default select-none items-center justify-center rounded-sm px-2.5 py-1.5 text-sm font-medium outline-none hover:bg-muted focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
            className
        )}
        {...props}
    />
))
ToolbarToggleItem.displayName = ToolbarPrimitive.ToggleItem.displayName

const ToolbarSeparator = React.forwardRef<
    React.ElementRef<typeof ToolbarPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <ToolbarPrimitive.Separator
        ref={ref}
        className={cn("mx-[1px] w-[1px] bg-border", className)}
        {...props}
    />
))
ToolbarSeparator.displayName = ToolbarPrimitive.Separator.displayName

const ToolbarLink = React.forwardRef<
    React.ElementRef<typeof ToolbarPrimitive.Link>,
    React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Link>
>(({ className, ...props }, ref) => (
    <ToolbarPrimitive.Link
        ref={ref}
        className={cn(
            "inline-flexitems-center justify-center rounded-sm px-2.5 py-1.5 text-sm font-medium outline-none hover:bg-muted hover:text-muted-foreground focus:bg-accent focus:text-accent-foreground",
            className
        )}
        {...props}
    />
))
ToolbarLink.displayName = ToolbarPrimitive.Link.displayName

const ToolbarButton = React.forwardRef<
    React.ElementRef<typeof ToolbarPrimitive.Button>,
    React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>
>(({ className, ...props }, ref) => (
    <ToolbarPrimitive.Button
        ref={ref}
        className={cn(
            "flex cursor-default select-none items-center justify-center rounded-sm px-2.5 py-1.5 text-sm font-medium outline-none hover:bg-muted focus:bg-accent focus:text-accent-foreground",
            className
        )}
        {...props}
    />
))
ToolbarButton.displayName = ToolbarPrimitive.Button.displayName

export {
    Toolbar,
    ToolbarToggleGroup,
    ToolbarToggleItem,
    ToolbarSeparator,
    ToolbarLink,
    ToolbarButton,
}
