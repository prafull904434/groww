import { useEffect, useState, useCallback } from "react";
import { fetchStock, fetchQuote, fetchTopGainers, fetchMarketData, fetchCustomApi } from "@/services/stockApi";
import { Widget } from "@/types/widget";

interface UseWidgetDataResult {
  data: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWidgetData(widget: Widget): UseWidgetDataResult {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!widget) return;

    setLoading(true);
    setError(null);

    try {
      let result: any;

      if (widget.apiConfig?.endpoint) {
        result = await fetchCustomApi(
          widget.apiConfig.endpoint,
          widget.apiConfig.params || {}
        );
      }
      else if (widget.type === "chart" && widget.symbol && widget.interval) {
        result = await fetchStock(widget.symbol, widget.interval);
      } else if (widget.type === "card") {
        if (widget.cardType === "gainers") {
          result = await fetchTopGainers();
        } else if (widget.cardType === "watchlist" && widget.dataSource) {
          const symbols = widget.dataSource.split(",").map(s => s.trim());
          result = await fetchMarketData(symbols);
        } else if (widget.symbol) {
          result = await fetchQuote(widget.symbol);
        }
      } else if (widget.type === "table" && widget.symbol && widget.interval) {
        result = await fetchStock(widget.symbol, widget.interval);
      }

      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [widget]);

  useEffect(() => {
    fetchData();

    if (widget.refreshInterval && widget.refreshInterval > 0) {
      const interval = setInterval(fetchData, widget.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, widget.refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}

export function useStockData(symbol: string, interval: "daily" | "weekly" | "monthly") {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetchStock(symbol, interval)
      .then(d => setData(d || {}))
      .catch(() => setData({}));
  }, [symbol, interval]);

  return data;
}
