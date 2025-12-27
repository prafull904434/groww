"use client";

import { useState } from "react";
import { Widget, WidgetType, FieldMapping } from "@/types/widget";
import { v4 as uuid } from "uuid";
import { exploreFields, FieldInfo } from "@/utils/apiExplorer";
import axios from "axios";

interface AddWidgetModalProps {
  onAdd: (widget: Widget) => void;
  onClose: () => void;
}

export default function AddWidgetModal({ onAdd, onClose }: AddWidgetModalProps) {
  const [widgetName, setWidgetName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [displayMode, setDisplayMode] = useState<WidgetType>("card");
  const [searchFields, setSearchFields] = useState("");
  const [showArraysOnly, setShowArraysOnly] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [availableFields, setAvailableFields] = useState<FieldInfo[]>([]);
  const [selectedFields, setSelectedFields] = useState<FieldMapping[]>([]);

  const handleTestApi = async () => {
    if (!apiUrl.trim()) return;

    setTesting(true);
    setTestSuccess(false);
    setTestError(null);
    setSelectedFields([]);

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;
      setApiData(data);

      const fields = exploreFields(data);
      setAvailableFields(fields);
      setTestSuccess(true);
    } catch (error: any) {
      setTestError(error.message || "Failed to fetch data from API");
      setApiData(null);
      setAvailableFields([]);
      setTestSuccess(false);
    } finally {
      setTesting(false);
    }
  };

  const handleAddField = (field: FieldInfo) => {
    const displayName = field.path.split(".").pop() || field.path;
    if (!selectedFields.find(f => f.fieldPath === field.path)) {
      setSelectedFields(prev => [
        ...prev,
        { displayName, fieldPath: field.path },
      ]);
    }
  };

  const handleRemoveField = (index: number) => {
    setSelectedFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (!widgetName.trim() || !apiUrl.trim()) return;
    if (!testSuccess || selectedFields.length === 0) return;

    const newWidget: Widget = {
      id: uuid(),
      type: displayMode,
      title: widgetName,
      apiConfig: {
        endpoint: apiUrl,
      },
      refreshInterval: Number(refreshInterval) || 30,
      fieldMappings: selectedFields,
      layout: {
        x: 0,
        y: Infinity, 
        w: displayMode === "chart" ? 6 : displayMode === "table" ? 8 : 4,
        h: 4,
      },
    };

    console.log("Widget Added:", newWidget);
    onAdd(newWidget);
    onClose();
  };

  const filteredFields = availableFields.filter(field => {
    if (searchFields.trim()) {
      if (!field.path.toLowerCase().includes(searchFields.toLowerCase()))
        return false;
    }
    if (showArraysOnly && displayMode === "table") {
      return field.type.includes("array");
    }
    return true;
  });

  const getFieldTypeColor = (type: string) => {
    if (type.includes("array")) return "text-blue-400";
    if (type === "string") return "text-green-400";
    if (type === "number") return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full p-8 my-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Widget</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Widget Name</label>
            <input
              type="text"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="e.g., Any currency Price Tracker"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">API URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="e.g., https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=AAPL&interval=5min&apikey=YOUR_API_KEY"
              />
              <button
                onClick={handleTestApi}
                disabled={testing || !apiUrl.trim()}
                className="px-5 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Test
                  </>
                )}
              </button>
            </div>

            {testSuccess && (
              <div className="mt-3 px-4 py-3 bg-teal-900/30 border border-teal-500/50 rounded-lg text-teal-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>API connection successful!</span>
                <span className="font-semibold">{availableFields.length} top-level field{availableFields.length !== 1 ? 's' : ''} found.</span>
              </div>
            )}

            {testError && (
              <div className="mt-3 px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{testError}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Refresh Interval (seconds)</label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              min="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">Select Fields to Display</label>
            <div className="mb-3">
              <label className="block text-xs font-medium mb-2 text-gray-400">Display Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDisplayMode("card")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${displayMode === "card"
                    ? "bg-teal-600 text-white shadow-lg"
                    : "bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600"
                    }`}
                >
                  Card
                </button>
                <button
                  onClick={() => setDisplayMode("table")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${displayMode === "table"
                    ? "bg-teal-600 text-white shadow-lg"
                    : "bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600"
                    }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setDisplayMode("chart")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${displayMode === "chart"
                    ? "bg-teal-600 text-white shadow-lg"
                    : "bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600"
                    }`}
                >
                  Chart
                </button>
              </div>
            </div>

            <input
              type="text"
              value={searchFields}
              onChange={(e) => setSearchFields(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-3 transition-all"
              placeholder="Search for fields..."
            />

            {displayMode === "table" && (
              <label className="flex items-center gap-2 text-sm text-gray-300 mb-4 bg-slate-700/30 px-3 py-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={showArraysOnly}
                  onChange={(e) => setShowArraysOnly(e.target.checked)}
                  className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
                />
                Show arrays only (for table view)
              </label>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Available Fields</h4>
                <div className="bg-gray-900 border border-gray-700 rounded-md max-h-64 overflow-y-auto p-2">
                  {filteredFields.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      {testSuccess ? "No fields found" : "Test API to see available fields"}
                    </p>
                  ) : (
                    filteredFields.map((field, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-800 rounded cursor-pointer mb-1 border-b border-gray-800 last:border-0"
                        onClick={() => handleAddField(field)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-mono truncate">{field.path}</div>
                            <div className={`text-xs ${getFieldTypeColor(field.type)}`}>
                              {field.type} | {field.sampleValue.length > 30 ? field.sampleValue.substring(0, 30) + "..." : field.sampleValue}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddField(field);
                            }}
                            className="ml-2 text-green-500 hover:text-green-400 text-lg font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Fields</h4>
                <div className="bg-gray-900 border border-gray-700 rounded-md max-h-64 overflow-y-auto p-2">
                  {selectedFields.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No fields selected</p>
                  ) : (
                    selectedFields.map((field, index) => (
                      <div
                        key={index}
                        className="p-2 bg-gray-800 rounded mb-2 flex justify-between items-center"
                      >
                        <span className="text-white text-sm font-mono">{field.fieldPath}</span>
                        <button
                          onClick={() => handleRemoveField(index)}
                          className="text-red-400 hover:text-red-300 text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!testSuccess || selectedFields.length === 0}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Add Widget
          </button>
        </div>
      </div>
    </div>
  );
}
