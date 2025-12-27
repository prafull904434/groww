"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Responsive } from "react-grid-layout";
import type { Layout } from "react-grid-layout";

import { addWidget, updateLayout, updateWidget, removeWidget, setWidgets } from "@/store/widgetsSlice";
import ChartWidget from "@/components/widgets/ChartWidget";
import TableWidget from "@/components/widgets/TableWidget";
import CardWidget from "@/components/widgets/CardWidget";
import AddWidgetModal from "@/components/AddWidgetModal";
import WidgetConfig from "@/components/WidgetConfig";
import SampleDataProvider from "@/components/SampleDataProvider";
import { useTheme } from "@/contexts/ThemeContext";
import { Widget } from "@/types/widget";
import { RootState } from "@/store/store";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

type Layouts = {
  [key: string]: LayoutItem[];
};

export default function Dashboard() {
  const widgets = useSelector((state: RootState) => state.widgets);
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const [showAddModal, setShowAddModal] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState<Widget | null>(null);
  const [width, setWidth] = useState(1200);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const layouts: Layouts = {
    lg: widgets.map((w): LayoutItem => ({
      i: String(w.id),
      x: w.layout.x,
      y: w.layout.y,
      w: w.layout.w,
      h: w.layout.h,
    })),
    md: widgets.map((w): LayoutItem => ({
      i: String(w.id),
      x: w.layout.x,
      y: w.layout.y,
      w: Math.min(w.layout.w, 8),
      h: w.layout.h,
    })),
    sm: widgets.map((w): LayoutItem => ({
      i: String(w.id),
      x: w.layout.x,
      y: w.layout.y,
      w: Math.min(w.layout.w, 4),
      h: w.layout.h,
    })),
  };

  const handleLayoutChange = (layout: Layout) => {
    dispatch(updateLayout(layout as LayoutItem[]));
  };

  const handleAddWidget = (widget: Widget) => {
    dispatch(addWidget(widget));
  };

  const handleUpdateWidget = (widget: Widget) => {
    dispatch(updateWidget(widget));
    setConfiguringWidget(null);
  };

  const handleRemoveWidget = (id: string) => {
    dispatch(removeWidget(id));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(widgets, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finboard-dashboard-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedWidgets = JSON.parse(event.target?.result as string);
            dispatch(setWidgets(importedWidgets));
          } catch (error) {
            alert("Failed to import dashboard configuration");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-gray-50"}`}>
      <div className={`gradient-bg shadow-lg sticky top-0 z-40 backdrop-blur-sm bg-opacity-95`}>
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl backdrop-blur-sm">
              
              </div> */}
              <div>
                <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
                <p className="text-sm text-white/80">
                  Connect to APIs and build your custom dashboard
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {isMounted && widgets.length > 0 && (
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium mr-2">
                  {widgets.length} widget{widgets.length !== 1 ? 's' : ''} &bull; <span className="text-green-300">●</span> Real-time
                </div>
              )}
              <button
                onClick={toggleTheme}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-200 border border-white/20"
                title="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-all duration-200 border border-white/20"
              >
                Export
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-all duration-200 border border-white/20"
              >
                Import
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-white/90 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                + Add Widget
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {!isMounted ? (
          <div className="text-center py-20">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-5xl shadow-2xl">
                📊
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 dark:text-white">Loading...</h2>
          </div>
        ) : widgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-5xl shadow-2xl">
                📊
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 dark:text-white">Build Your Finance Dashboard</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
             Connect any finance API and build widgets to track the data that matters to you
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Monitor stocks and crypto with fully customizable, real-time widgets
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              + Add Widget
            </button>
          </div>
        ) : (
          <Responsive
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            width={width}
            onLayoutChange={handleLayoutChange}
          >
            {widgets.map((w) => (
              <div
                key={w.id}
                className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden`}
              >
                {w.type === "chart" && (
                  <ChartWidget
                    widget={w}
                    onConfigure={() => setConfiguringWidget(w)}
                    onRemove={() => handleRemoveWidget(w.id)}
                  />
                )}
                {w.type === "table" && (
                  <TableWidget
                    widget={w}
                    onConfigure={() => setConfiguringWidget(w)}
                    onRemove={() => handleRemoveWidget(w.id)}
                  />
                )}
                {w.type === "card" && (
                  <CardWidget
                    widget={w}
                    onConfigure={() => setConfiguringWidget(w)}
                    onRemove={() => handleRemoveWidget(w.id)}
                  />
                )}
              </div>
            ))}
          </Responsive>
        )}
      </div>

      {showAddModal && (
        <AddWidgetModal
          onAdd={handleAddWidget}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {configuringWidget && (
        <SampleDataProvider widget={configuringWidget}>
          {(sampleData) => (
            <WidgetConfig
              widget={configuringWidget}
              onSave={handleUpdateWidget}
              onClose={() => setConfiguringWidget(null)}
              sampleData={sampleData}
            />
          )}
        </SampleDataProvider>
      )}
    </div>
  );
}
