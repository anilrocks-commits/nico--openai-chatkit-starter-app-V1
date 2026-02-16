"use client";

import { useCallback } from "react";
import { ChatKitPanel, type FactAction, type LeadData } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme } = useColorScheme();

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[App] widget action", action);
    }
  }, []);

  const handleLeadCapture = useCallback((lead: LeadData) => {
  console.log("=== LEAD CAPTURE IN APP ===");
  console.log("Lead:", lead);

  if (typeof window !== "undefined" && window.parent) {
    const message = {
      type: "lead_capture",
      payload: lead,
    };
    
    console.log("Sending postMessage:", message);
    window.parent.postMessage(message, "*");
    console.log("postMessage sent!");
  }
}, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-end bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-5xl">
        <ChatKitPanel
          theme={scheme}
          onWidgetAction={handleWidgetAction}
          onLeadCapture={handleLeadCapture}
          onThemeRequest={setScheme}
        />
      </div>
    </main>
  );
}
