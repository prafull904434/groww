"use client";

import { useMemo } from "react";
import { useWidgetData } from "@/hooks/useStockData";
import { Widget } from "@/types/widget";
import { getNestedValue, formatValue } from "@/utils/formatters";


interface CardWidgetProps {
  widget: Widget;
  onConfigure?: () => void; 
  onRemove?: () => void;
}


export default function CardWidget({ widget, onConfigure, onRemove }: CardWidgetProps) {
  const { data, loading, error } = useWidgetData(widget);

  const displayData = useMemo(() => {
    if (!data) return null;

    if (widget.apiConfig?.endpoint) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.slice(0, 10);
    }

    if (typeof data === "object") {
      if (widget.cardType === "watchlist" || widget.cardType === "gainers") {
        return Array.isArray(data) ? data : [data];
      }
      return data;
    }

    return null;
  }, [data, widget.cardType, widget.apiConfig]);

  if(loading){
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading data...</p>
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

  if (!displayData) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const renderCardContent = () => {
    if (widget.fieldMappings && widget.fieldMappings.length > 0) {
      if (Array.isArray(displayData)) {
        return (
          <div className="space-y-2">
            {displayData.map((item: any, index: number) => (
              <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600">
                {widget.fieldMappings!.map((mapping, mapIndex) => {
                  const value = getNestedValue(item, mapping.fieldPath);
                  return (
                    <div key={mapIndex} className="flex justify-between text-sm mb-1 last:mb-0">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{mapping.displayName}:</span>
                      <span className="text-gray-900 dark:text-white">{formatValue(value, mapping.format)}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {widget.fieldMappings.map((mapping, index) => {
            const value = getNestedValue(displayData, mapping.fieldPath);
            return (
              <div key={index} className="flex justify-between text-sm">
                <span className="font-semibold">{mapping.displayName}:</span>
                <span>{formatValue(value, mapping.format)}</span>
              </div>
            );
          })}
        </div>
      );
    }

    if (Array.isArray(displayData)) {
      return (
        <div className="space-y-2">
          {displayData.map((item: any, index: number) => (
            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600">
              {item.symbol && (
                <div className="font-semibold text-sm mb-1">{item.symbol}</div>
              )}
              {item.price !== undefined && (
                <div className="text-xs">Price: {formatValue(item.price, "currency")}</div>
              )}
              {item.change !== undefined && (
                <div className={`text-xs ${parseFloat(String(item.change)) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  Change: {formatValue(item.change, "currency")} ({formatValue(item.changePercent, "percentage")})
                </div>
              )}
              {item.close && (
                <div className="text-xs">Close: {formatValue(item.close, "currency")}</div>
              )}
              {item.high && (
                <div className="text-xs">High: {formatValue(item.high, "currency")}</div>
              )}
              {item.low && (
                <div className="text-xs">Low: {formatValue(item.low, "currency")}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {displayData["05. price"] && (
          <div className="text-2xl font-bold">
            {formatValue(displayData["05. price"], "currency")}
          </div>
        )}
        {displayData["09. change"] && (
          <div className={`text-sm ${parseFloat(displayData["09. change"]) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatValue(displayData["09. change"], "currency")} ({displayData["10. change percent"]})
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 text-xs mt-4">
          {displayData["03. high"] && (
            <div>
              <span className="text-gray-500">High:</span> {formatValue(displayData["03. high"], "currency")}
            </div>
          )}
          {displayData["04. low"] && (
            <div>
              <span className="text-gray-500">Low:</span> {formatValue(displayData["04. low"], "currency")}
            </div>
          )}
          {displayData["02. open"] && (
            <div>
              <span className="text-gray-500">Open:</span> {formatValue(displayData["02. open"], "currency")}
            </div>
          )}
          {displayData["08. previous close"] && (
            <div>
              <span className="text-gray-500">Prev Close:</span> {formatValue(displayData["08. previous close"], "currency")}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-3">
      <div className="flex justify-between items-center mb-3">
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

      <div className="flex-1 overflow-auto">
        {renderCardContent()}
      </div>
    </div>
  );
}
