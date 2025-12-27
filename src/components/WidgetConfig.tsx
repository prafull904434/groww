"use client";

import React, { useState, useEffect } from "react";
import { Widget, FieldMapping, ApiConfig } from "@/types/widget";
import { getNestedValue } from "@/utils/formatters";

interface WidgetConfigProps {
  widget: Widget;
  onSave: (widget: Widget) => void;
  onClose: () => void;
  sampleData?: any;
}

export default function WidgetConfig({ widget, onSave, onClose, sampleData }: WidgetConfigProps) {
  const [title, setTitle] = useState(widget.title || "");
  const [description, setDescription] = useState(widget.description || "");
  const [apiEndpoint, setApiEndpoint] = useState(widget.apiConfig?.endpoint || "");
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(widget.fieldMappings || []);
  const [selectedPath, setSelectedPath] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (sampleData && fieldMappings.length === 0 && (!widget.fieldMappings || widget.fieldMappings.length === 0)) {
      const autoMappings = generateFieldMappings(sampleData);
      if (autoMappings.length > 0) {
        setFieldMappings(autoMappings);
      }
    }
  }, [sampleData]);

  const generateFieldMappings = (data: any): FieldMapping[] => {
    const mappings: FieldMapping[] = [];
    
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      Object.keys(firstItem).forEach(key => {
        mappings.push({
          displayName: key.charAt(0).toUpperCase() + key.slice(1),
          fieldPath: key,
        });
      });
    } else if (typeof data === "object" && data !== null) {
      Object.keys(data).forEach(key => {
        if (typeof data[key] !== "object" || Array.isArray(data[key])) {
          mappings.push({
            displayName: key.charAt(0).toUpperCase() + key.slice(1),
            fieldPath: key,
          });
        }
      });
    }
    
    return mappings;
  };

  const handleAddField = () => {
    if (selectedPath && displayName) {
      setFieldMappings([...fieldMappings, { displayName, fieldPath: selectedPath }]);
      setSelectedPath("");
      setDisplayName("");
    }
  };

  const handleRemoveField = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedWidget: Widget = {
      ...widget,
      title,
      description,
      apiConfig: apiEndpoint ? { endpoint: apiEndpoint } : widget.apiConfig,
      fieldMappings: fieldMappings.length > 0 ? fieldMappings : undefined,
    };
    onSave(updatedWidget);
  };

  const renderJsonExplorer = (obj: any, path: string = "", level: number = 0): React.ReactElement[] => {
    if (level > 3) return [];
    
    const elements: React.ReactElement[] = [];
    
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          elements.push(
            <div key={currentPath} className={`ml-${level * 4}`}>
              <div 
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => setSelectedPath(currentPath)}
              >
                {key}
              </div>
              {renderJsonExplorer(value, currentPath, level + 1)}
            </div>
          );
        } else {
          elements.push(
            <div 
              key={currentPath}
              className={`ml-${level * 4} text-sm cursor-pointer hover:bg-gray-100 p-1 rounded ${
                selectedPath === currentPath ? "bg-blue-100" : ""
              }`}
              onClick={() => {
                setSelectedPath(currentPath);
                if (!displayName) setDisplayName(key);
              }}
            >
              <span className="font-semibold">{key}:</span>{" "}
              <span className="text-gray-600">
                {Array.isArray(value) ? `[Array(${value.length})]` : String(value)}
              </span>
            </div>
          );
        }
      });
    }
    
    return elements;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Configure Widget</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Widget Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="(optional) Widget Description "
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">API Endpoint (optional)</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://api.example.com/data"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Field Mappings</label>
              
              {sampleData && (
                <div className="mb-4 p-4 bg-gray-50 rounded-md max-h-64 overflow-y-auto">
                  <div className="text-sm font-semibold mb-2">Available Fields:</div>
                  {renderJsonExplorer(sampleData)}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={selectedPath}
                  onChange={(e) => setSelectedPath(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  placeholder="Field path (e.g., symbol, price, change)"
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  placeholder="Display name"
                />
                <button
                  onClick={handleAddField}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {fieldMappings.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-semibold">{mapping.displayName}</span>
                      <span className="text-gray-500 text-sm ml-2">({mapping.fieldPath})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

