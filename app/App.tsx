"use client";

import { useCallback } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme } = useColorScheme();

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

const handleResponseEnd = useCallback((conversation: any) => {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[ChatKitPanel] response end", conversation);
  }

  const messages = conversation?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return;

  // Find last assistant message
  const lastAssistant = [...messages].reverse().find((m: any) => m?.role === "assistant");
  const content = typeof lastAssistant?.content === "string" ? lastAssistant.content : "";
  if (!content) return;

  const marker = "LEAD_READY:";
  const idx = content.indexOf(marker);
  if (idx === -1) return;

  const jsonText = content.slice(idx + marker.length).trim();
  if (!jsonText) return;

  let lead: any;
  try {
    lead = JSON.parse(jsonText);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ChatKitPanel] LEAD_READY JSON parse failed", e);
    }
    return;
  }

  // basic validation
  const required = ["intent", "name", "email", "phone", "project_location"];
  if (!required.every((k) => typeof lead?.[k] === "string" && lead[k].trim().length > 0)) return;

  // prevent duplicate sends
  const dedupeKey = `lead_sent_${lead.email}_${lead.phone}_${lead.intent}`;
  if (typeof window !== "undefined") {
    if (sessionStorage.getItem(dedupeKey) === "1") return;
    sessionStorage.setItem(dedupeKey, "1");
  }

  // send to WordPress parent page
  if (typeof window !== "undefined" && window.parent) {
    window.parent.postMessage(
      {
        type: "lead_capture",
        payload: {
          ...lead,
          transcript: messages,
        },
      },
      "*"
    );
  }
}, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-end bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-5xl">
        <ChatKitPanel
          theme={scheme}
          onWidgetAction={handleWidgetAction}
          onResponseEnd={handleResponseEnd}
          onThemeRequest={setScheme}
        />
      </div>
    </main>
  );
}
