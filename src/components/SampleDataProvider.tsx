"use client";

import { useWidgetData } from "@/hooks/useStockData";
import { Widget } from "@/types/widget";

interface SampleDataProviderProps {
  widget: Widget;
  children: (data: any) => React.ReactNode;
}

export default function SampleDataProvider({ widget, children }: SampleDataProviderProps) {
  const { data } = useWidgetData(widget);
  return <>{children(data)}</>;
}

