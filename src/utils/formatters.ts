import { DataFormat } from "@/types/widget";

export function formatValue(value: any, format?: DataFormat): string {
  if (value === null || value === undefined) return "—";

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseFloat(value));

    case "percentage":
      const num = parseFloat(value);
      return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;

    case "number":
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(parseFloat(value));

    case "date":
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return String(value);
      }

    default:
      return String(value);
  }
}

export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    if (key.includes("[")) {
      const [arrayKey, index] = key.split("[");
      const idx = parseInt(index.replace("]", ""));
      return current?.[arrayKey]?.[idx];
    }
    return current?.[key];
  }, obj);
}

