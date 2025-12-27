import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Widget } from "@/types/widget";

const loadState = (): Widget[] => {
  if (typeof window === "undefined") return [];
  try {
    const serializedState = localStorage.getItem("finboard-widgets");
    if (serializedState === null) return [];
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Something went wrong while reading data from local storage:", err);
    return [];
  }
};

const initialState: Widget[] = loadState();

const slice = createSlice({
  name: "widgets",
  initialState,
  reducers: {
    addWidget: (s, a: PayloadAction<Widget>) => {
      s.push(a.payload);
      saveState(s);
    },
    updateWidget: (s, a: PayloadAction<Widget>) => {
      const i = s.findIndex(w => w.id === a.payload.id);
      if (i !== -1) {
        s[i] = a.payload;
        saveState(s);
      }
    },
    removeWidget: (s, a: PayloadAction<string>) => {
      const filtered = s.filter(w => w.id !== a.payload);
      saveState(filtered);
      return filtered;
    },
    updateLayout: (s, a: PayloadAction<Array<{ i: string; x: number; y: number; w: number; h: number }>>) => {
      a.payload.forEach(l => {
        const w = s.find(w => w.id === l.i);
        if (w) w.layout = { x: l.x, y: l.y, w: l.w, h: l.h };
      });
      saveState(s);
    },
    setWidgets: (s, a: PayloadAction<Widget[]>) => {
      saveState(a.payload);
      return a.payload;
    }
  }
});

const saveState = (state: Widget[]) => {
  if (typeof window === "undefined") return;
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("finboard-widgets", serializedState);
  } catch (err) {
    console.error("Something went wrong while reading data from local storage:", err);
  }
};

export const {
  addWidget,
  updateWidget,
  removeWidget,
  updateLayout,
  setWidgets
} = slice.actions;

export default slice.reducer;
