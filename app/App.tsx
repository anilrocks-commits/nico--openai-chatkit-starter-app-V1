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
    if (process.env.NODE_ENV !== "production") {
      console.log("[App] Lead captured:", lead);
    }

    // Send to WordPress parent page
    if (typeof window !== "undefined" && window.parent) {
      window.parent.postMessage(
        {
          type: "lead_capture",
          payload: lead,
        },
        "*"
      );
      
      if (process.env.NODE_ENV !== "production") {
        console.log("[App] Lead sent to WordPress parent");
      }
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
```

---

## **3. Configure the Tool in OpenAI Agent Builder**

Now go to your OpenAI Agent Builder and add this function:

**Function Name:** `submit_lead_to_hubspot`

**Description:** 
```
Submits collected lead information when the user has provided all required details: intent, name, email, phone, and project location. Call this function once you have confirmed all information with the user.
