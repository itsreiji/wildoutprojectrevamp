import React from "react";
import { cn } from "../ui/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface DashboardRightPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

/**
 * DashboardRightPanel
 * 
 * A reusable component for the right column of a two-panel dashboard layout.
 * Typically used for details, forms, or auxiliary information.
 * Supports being hidden on smaller screens or when no item is selected.
 */
export const DashboardRightPanel = ({
  children,
  className,
  title = "Details",
  isOpen = true,
  onClose,
  emptyMessage = "Select an item to view details",
  emptyIcon,
}: DashboardRightPanelProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "w-full xl:w-96 xl:shrink-0 min-w-0 animate-in slide-in-from-right duration-300",
        className
      )}
    >
      <Card className="h-full border border-gray-200 shadow-sm bg-white sticky top-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-gray-900 tracking-tight uppercase italic">
            {title}
          </CardTitle>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-250px)] px-6 py-6">
            {children ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center space-y-4">
                {emptyIcon || <div className="text-4xl">👈</div>}
                <p className="text-sm font-medium">
                  {emptyMessage}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

DashboardRightPanel.displayName = "DashboardRightPanel";
