import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY; 
if (!API_KEY) throw new Error("Missing environment variable: NEXT_PUBLIC_ALPHA_VANTAGE_KEY");


const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60_000; 

function getCacheKey(endpoint: string, params: Record<string, any>) {
  return `${endpoint}:${JSON.stringify(params)}`;
}

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}


function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}


export async function fetchStock(symbol: string, interval: "daily" | "weekly" | "monthly") {
  const fn =
    interval === "weekly"
      ? "TIME_SERIES_WEEKLY"
      : interval === "monthly"
      ? "TIME_SERIES_MONTHLY"
      : "TIME_SERIES_DAILY";

  const params = { function: fn, symbol, apikey: API_KEY };
  const cacheKey = getCacheKey("stock", params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get("https://www.alphavantage.co/query", { params });

    if (!data || Object.keys(data).length === 0) return null;
    if (data["Note"] || data["Error Message"]) {
      console.warn("API note/error:", data["Note"] || data["Error Message"]);
      return null;
    }

    const timeSeriesKey = Object.keys(data).find(key => key.includes("Time Series"));
    if (!timeSeriesKey) return null;

    const result = data[timeSeriesKey];
    setCachedData(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error("fetchStock error:", err.message);
    return null;
  }
}

export async function fetchQuote(symbol: string) {
  const params = { function: "GLOBAL_QUOTE", symbol, apikey: API_KEY };
  const cacheKey = getCacheKey("quote", params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get("https://www.alphavantage.co/query", { params });
    if (!data || Object.keys(data).length === 0) return null;
    if (data["Note"] || data["Error Message"]) {
      console.warn("API note/error:", data["Note"] || data["Error Message"]);
      return null;
    }

    const result = data["Global Quote"];
    setCachedData(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error("fetchQuote error:", err.message);
    return null;
  }
}

export async function fetchMarketData(symbols: string[]) {
  const results: any[] = [];
  for (const symbol of symbols) {
    const quote = await fetchQuote(symbol);
    if (quote) {
      results.push({
        symbol: quote["01. symbol"],
        price: parseFloat(quote["05. price"] || "0"),
        change: parseFloat(quote["09. change"] || "0"),
        changePercent: parseFloat((quote["10. change percent"] || "0%").replace("%", "")),
        volume: quote["06. volume"] || "0",
        high: parseFloat(quote["03. high"] || "0"),
        low: parseFloat(quote["04. low"] || "0"),
        open: parseFloat(quote["02. open"] || "0"),
        previousClose: parseFloat(quote["08. previous close"] || "0"),
      });
    }
    await delay(12_000); 
  }
  return results;
}

export async function fetchTopGainers() {
  const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"];
  const marketData = await fetchMarketData(symbols);
  return marketData
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 10);
}

export async function fetchCustomApi(endpoint: string, params: Record<string, any> = {}) {
  const cacheKey = getCacheKey(endpoint, params);
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(endpoint, { params });
    setCachedData(cacheKey, data);
    return data;
  } catch (err: any) {
    console.error("fetchCustomApi error:", err.message);
    return null;
  }
}
