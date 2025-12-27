"use client";

import { useMemo } from "react";
import { useWidgetData } from "@/hooks/useStockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Widget } from "@/types/widget";
import { getNestedValue } from "@/utils/formatters";

interface ChartWidgetProps {
  widget: Widget;
  onConfigure?: () => void;
  onRemove?: () => void;
}

export default function ChartWidget({ widget, onConfigure, onRemove }: ChartWidgetProps) {
  const { data, loading, error } = useWidgetData(widget);

  const chartData = useMemo(() => {
    if (!data) return [];
    
    if (widget.fieldMappings && widget.fieldMappings.length > 0) {
      if (Array.isArray(data)) {
        return data.map((item: any, index: number) => {
          const closeField = widget.fieldMappings!.find(f => 
            f.fieldPath.toLowerCase().includes('close') || 
            f.fieldPath.toLowerCase().includes('price')
          );
          const dateField = widget.fieldMappings!.find(f => 
            f.fieldPath.toLowerCase().includes('date') || 
            f.fieldPath.toLowerCase().includes('time')
          );
          
          return {
            date: dateField ? getNestedValue(item, dateField.fieldPath) : `Item ${index}`,
            close: closeField ? parseFloat(getNestedValue(item, closeField.fieldPath) || "0") : 0,
          };
        }).slice(0, 50);
      }
      
      const closeValue = widget.fieldMappings.find(f => 
        f.fieldPath.toLowerCase().includes('close') || 
        f.fieldPath.toLowerCase().includes('price')
      );
      if (closeValue) {
        const value = getNestedValue(data, closeValue.fieldPath);
        return [{
          date: "Current",
          close: parseFloat(value || "0"),
        }];
      }
    }
    
    if (typeof data === "object") {
      const entries = Object.entries(data);
      if (entries.length === 0) return [];

      return entries
        .slice(0, 50)
        .map(([date, values]: [string, any]) => {
          if (!values || typeof values !== "object") return null;
          
          return {
            date: date.length > 10 ? date.substring(0, 10) : date,
            open: parseFloat(values["1. open"] || values.open || "0"),
            high: parseFloat(values["2. high"] || values.high || "0"),
            low: parseFloat(values["3. low"] || values.low || "0"),
            close: parseFloat(values["4. close"] || values.close || values.price || "0"),
            volume: parseFloat(values["5. volume"] || values.volume || "0"),
          };
        })
        .filter(Boolean)
        .reverse();
    }
    
    return [];
  }, [data, widget.fieldMappings]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const chartType = widget.chartType || "line";

  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-semibold text-sm">{widget.title}</h3>
          {widget.description && (
            <p className="text-xs text-gray-500">{widget.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="text-gray-500 hover:text-blue-600 text-xs px-2 py-1"
              title="Configure"
            >
              ⚙️
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-gray-500 hover:text-red-600 text-xs px-2 py-1"
              title="Remove"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            {chartType === "line" && (
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
              />
            )}
            {chartType === "candle" && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="high" 
                  stroke="#22c55e" 
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="2 2"
                />
                <Line 
                  type="monotone" 
                  dataKey="low" 
                  stroke="#ef4444" 
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="2 2"
                />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
