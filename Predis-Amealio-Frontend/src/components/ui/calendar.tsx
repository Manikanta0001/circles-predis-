import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-3",
        month: "space-y-2 w-full",
        caption: "flex justify-between items-center pb-2 relative",
        caption_label: "text-sm font-bold text-gray-900",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 bg-white p-0 border border-gray-200 hover:bg-gray-50 transition-colors"
        ),
        nav_button_previous: "absolute -left-0.5",
        nav_button_next: "absolute -right-0.5",
        table: "w-full border-collapse",
            head_row: "grid grid-cols-7 gap-1 mb-2",
        head_cell:
          "text-muted-foreground rounded-md w-7 h-7 font-semibold text-[0.65rem] flex items-center justify-center text-gray-700",
            row: "grid grid-cols-7 gap-1 mb-1",
        cell: "h-7 w-7 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 font-medium rounded-md transition-colors aria-selected:opacity-100 text-xs"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 font-semibold",
        day_today: "bg-blue-100 text-blue-700 font-semibold",
        day_outside:
          "day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-40 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => 
          orientation === 'left' ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
