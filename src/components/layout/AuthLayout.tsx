import { Outlet } from "react-router-dom";
import { Layers } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-steel rounded-xl flex items-center justify-center mb-4 shadow-sm text-white">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">Dayflow</h1>
          <p className="text-text-muted mt-2">Every workday, perfectly aligned.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
