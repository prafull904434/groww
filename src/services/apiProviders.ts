

export type ApiProvider = "alphavantage" | "finnhub" | "indianapi" | "custom";

export interface ApiCredentials {
    provider: ApiProvider;
    apiKey?: string;
    baseUrl?: string;
}

export const API_PROVIDERS = {
    alphavantage: {
        name: "Alpha Vantage",
        baseUrl: "https://www.alphavantage.co/query",
        requiresKey: true,
        rateLimit: {
            requestsPerMinute: 5,
            requestsPerDay: 500,
        },
        documentation: "https://www.alphavantage.co/documentation/",
    },
    finnhub: {
        name: "Finnhub",
        baseUrl: "https://finnhub.io/api/v1",
        requiresKey: true,
        rateLimit: {
            requestsPerMinute: 60,
            requestsPerDay: Infinity,
        },
        documentation: "https://finnhub.io/docs/api",
    },
    indianapi: {
        name: "Indian Stock API",
        baseUrl: "https://api.indianstocks.in/v1",
        requiresKey: false,
        rateLimit: {
            requestsPerMinute: 30,
            requestsPerDay: 1000,
        },
        documentation: "https://docs.indianstocks.in/",
    },
    custom: {
        name: "Custom API",
        baseUrl: "",
        requiresKey: false,
        rateLimit: {
            requestsPerMinute: Infinity,
            requestsPerDay: Infinity,
        },
        documentation: "",
    },
};

export function getApiKey(provider: ApiProvider): string | undefined {
    switch (provider) {
        case "alphavantage":
            return process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;
        case "finnhub":
            return process.env.NEXT_PUBLIC_FINNHUB_KEY;
        case "indianapi":
        case "custom":
        default:
            return undefined;
    }
}


export function buildApiUrl(
    provider: ApiProvider,
    endpoint: string,
    params: Record<string, any> = {}
): string {
    const config = API_PROVIDERS[provider];
    const apiKey = getApiKey(provider);

    if (provider === "custom") {
        return endpoint;
    }

    const url = new URL(`${config.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);

    if (config.requiresKey && apiKey) {
        if (provider === "alphavantage") {
            url.searchParams.append("apikey", apiKey);
        } else if (provider === "finnhub") {
            url.searchParams.append("token", apiKey);
        }
    }

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });

    return url.toString();
}

export function checkRateLimit(provider: ApiProvider): {
    allowed: boolean;
    message?: string;
} {
    const config = API_PROVIDERS[provider];

    return {
        allowed: true,
        message: `Rate limit: ${config.rateLimit.requestsPerMinute}/min, ${config.rateLimit.requestsPerDay}/day`,
    };
}


export const endpoints = {
    alphavantage: {
        quote: (symbol: string) => buildApiUrl("alphavantage", "", {
            function: "GLOBAL_QUOTE",
            symbol,
        }),
        timeSeries: (symbol: string, interval: "daily" | "weekly" | "monthly") => {
            const fn = interval === "weekly" ? "TIME_SERIES_WEEKLY"
                : interval === "monthly" ? "TIME_SERIES_MONTHLY"
                    : "TIME_SERIES_DAILY";
            return buildApiUrl("alphavantage", "", {
                function: fn,
                symbol,
            });
        },
    },
    finnhub: {
        quote: (symbol: string) => buildApiUrl("finnhub", "/quote", { symbol }),
        candles: (symbol: string, resolution: string, from: number, to: number) =>
            buildApiUrl("finnhub", "/stock/candle", { symbol, resolution, from, to }),
    },
    indianapi: {
        quote: (symbol: string) => buildApiUrl("indianapi", `/quote/${symbol}`),
        topGainers: () => buildApiUrl("indianapi", "/market/gainers"),
    },
};
