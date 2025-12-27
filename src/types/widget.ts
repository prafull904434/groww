export type WidgetType = "chart" | "table" | "card";
export type ChartType = "line" | "candle";
export type CardType = "watchlist" | "gainers" | "performance" | "financial";
export type DataFormat = "currency" | "percentage" | "number" | "date";

export interface FieldMapping {
  displayName: string;
  fieldPath: string;
  format?: DataFormat;
}

export interface ApiConfig {
  endpoint: string;
  apiKey?: string;
  params?: Record<string, any>;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  layout: { x: number; y: number; w: number; h: number };
  
  chartType?: ChartType;
  symbol?: string;
  interval?: "daily" | "weekly" | "monthly";
  
  cardType?: CardType;
  
  apiConfig?: ApiConfig;
  
  fieldMappings?: FieldMapping[];
  
  refreshInterval?: number;
  
  dataSource?: string;
}
