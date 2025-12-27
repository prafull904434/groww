import { ReactNode } from "react";
import { useDispatch } from "react-redux";
import { removeWidget } from "@/store/widgetsSlice";

interface Props {
  id: string;
  title: string;
  children: ReactNode;
}

export default function Widget({ id, title, children }: Props) {
  const dispatch = useDispatch();

  return (
    <div className="bg-white p-4 shadow rounded">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <button onClick={() => dispatch(removeWidget(id))}>✕</button>
      </div>
      {children}
    </div>
  );
}
