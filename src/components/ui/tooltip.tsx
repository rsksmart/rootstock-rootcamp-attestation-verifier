import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { HelpCircle } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[300] max-w-xs rounded-lg border border-amber-500/25 bg-zinc-900 px-3 py-2 text-xs leading-relaxed text-zinc-100 shadow-lg shadow-black/40",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/** Small (i) button; pass `content` as the tooltip body. */
function InfoTip({
  content,
  label = "More info",
  className,
}: {
  content: string;
  label?: string;
  className?: string;
}): JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-600 text-zinc-400 transition-colors hover:border-amber-500/45 hover:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
            className,
          )}
          aria-label={label}
        >
          <HelpCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
}

/** Dotted underline on `children`; shows `content` on hover/focus. */
function TermTip({
  content,
  children,
  className,
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "cursor-help border-b border-dotted border-zinc-500/70 text-inherit underline-offset-2",
            className,
          )}
          tabIndex={0}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  InfoTip,
  TermTip,
};
