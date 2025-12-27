"use client";

import { useState, useMemo } from "react";
import { useWidgetData } from "@/hooks/useStockData";
import { Widget, DataFormat } from "@/types/widget";
import { getNestedValue, formatValue } from "@/utils/formatters";
import { getFieldValue as apiGetFieldValue } from "@/utils/apiExplorer";

interface TableWidgetProps {
  widget: Widget;
  onConfigure?: () => void;
  onRemove?: () => void;
}

export default function TableWidget({ widget, onConfigure, onRemove }: TableWidgetProps) {
  const { data, loading, error } = useWidgetData(widget);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const tableData = useMemo(() => {
    if (!data) return [];

    let entries: Array<[string, any]> = [];
    
    if (Array.isArray(data)) {
      entries = data.map((item, index) => [`${index}`, item]);
    } else if (typeof data === "object") {
      entries = Object.entries(data);
    }

    if (searchTerm) {
      entries = entries.filter(([key, value]) => {
        const searchLower = searchTerm.toLowerCase();
        const keyMatch = key.toLowerCase().includes(searchLower);
        const valueMatch = JSON.stringify(value).toLowerCase().includes(searchLower);
        return keyMatch || valueMatch;
      });
    }

    return entries;
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return tableData.slice(start, start + itemsPerPage);
  }, [tableData, page]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const getFieldValue = (item: any, fieldPath: string): any => {
    if (!item) return null;
    
    if (widget.fieldMappings && widget.fieldMappings.length > 0) {
      const fieldParts = fieldPath.split(".");
      const lastPart = fieldParts[fieldParts.length - 1];
      
      let value = getNestedValue(item, fieldPath);
      
      if (value === undefined || value === null) {
        value = getNestedValue(item, lastPart);
      }
      
      if ((value === undefined || value === null) && typeof item === "object") {
        value = item[lastPart] || item[fieldPath];
      }
      
      return value;
    }
    
    if (typeof item === "object" && item !== null) {
      return item[fieldPath] || item;
    }
    return item;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading table data...</p>
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

  if (tableData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const columns: Array<{ displayName: string; fieldPath: string; format?: DataFormat }> = widget.fieldMappings && widget.fieldMappings.length > 0
    ? widget.fieldMappings
    : (paginatedData[0] ? Object.keys(paginatedData[0][1] || {}).map(key => ({
        displayName: key,
        fieldPath: key,
      })) : []);

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

      <div className="mb-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full px-2 py-1 text-sm border rounded"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-2 py-1 text-left font-semibold text-xs">
                  {col.displayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(([key, item], rowIndex) => (
              <tr key={key} className="border-b hover:bg-gray-50">
                {columns.map((col, colIndex) => {
                    const value = getFieldValue(item, col.fieldPath);
                  return (
                    <td key={colIndex} className="px-2 py-1 text-xs">
                      {formatValue(value, col.format || undefined)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-2 text-xs">
          <span>
            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, tableData.length)} of {tableData.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
