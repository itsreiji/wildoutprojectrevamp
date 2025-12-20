import * as React from "react"
import { cn } from "@/lib/utils"

const SplitContext = React.createContext<{
  direction: "horizontal" | "vertical"
  onLayout: (() => void) | undefined
}>({
  direction: "horizontal",
  onLayout: undefined,
})

interface SplitProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical"
  onLayout?: () => void
  children: React.ReactNode
}

const SplitProvider = React.forwardRef<HTMLDivElement, SplitProviderProps>(
  ({ direction = "horizontal", onLayout, className, children, ...props }, ref) => {
    return (
      <SplitContext.Provider value={{ direction, onLayout }}>
        <div
          ref={ref}
          className={cn(
            "flex overflow-hidden relative",
            direction === "horizontal" ? "flex-row" : "flex-col",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </SplitContext.Provider>
    )
  }
)
SplitProvider.displayName = "SplitProvider"

interface SplitPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number | string
  minSize?: number
  maxSize?: number
  collapsible?: boolean
  onResize?: (size: number) => void
}

const SplitPanel = React.forwardRef<HTMLDivElement, SplitPanelProps>(
  ({ className, collapsible: _collapsible = false, minSize = 0, maxSize, defaultSize, onResize: _onResize, ...props }, ref) => {
    const { direction, onLayout } = React.useContext(SplitContext)
    const [size] = React.useState<number | string>(defaultSize || 0)

    React.useEffect(() => {
      if (onLayout) {
        onLayout()
      }
    }, [size, onLayout])

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className="flex-1 min-w-0 min-h-0 overflow-hidden"
          style={{
            [direction === "horizontal" ? "width" : "height"]: typeof size === 'number' ? `${size}px` : size,
            ...(typeof size === 'number' && {
              minWidth: direction === "horizontal" ? `${minSize}px` : undefined,
              minHeight: direction === "vertical" ? `${minSize}px` : undefined,
              maxWidth: direction === "horizontal" && maxSize ? `${maxSize}px` : undefined,
              maxHeight: direction === "vertical" && maxSize ? `${maxSize}px` : undefined,
            }),
          }}
        >
          {props.children}
        </div>
      </div>
    )
  }
)
SplitPanel.displayName = "SplitPanel"

interface SplitHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean
}

const SplitHandle = React.forwardRef<HTMLDivElement, SplitHandleProps>(
  ({ className, withHandle = true, ...props }, ref) => {
    const { direction } = React.useContext(SplitContext)

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center bg-border hover:bg-border/80 transition-colors",
          direction === "horizontal" ? "h-full w-2 cursor-col-resize" : "h-2 w-full cursor-row-resize",
          className
        )}
        {...props}
      >
        {withHandle && (
          <div
            className={cn(
              "absolute rounded-full bg-foreground/50",
              direction === "horizontal" ? "w-1 h-8" : "h-1 w-8"
            )}
          />
        )}
      </div>
    )
  }
)
SplitHandle.displayName = "SplitHandle"

export { SplitProvider, SplitPanel, SplitHandle }