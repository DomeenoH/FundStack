import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
};

export const Tooltip = ({ children, content }: TooltipProps) => (
  <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side="top"
        sideOffset={4}
        className={cn(
          'rounded-md px-3 py-1.5 text-sm leading-none shadow-md',
          'bg-gray-800 text-white',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {content}
        <TooltipPrimitive.Arrow className="fill-gray-800" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
);
