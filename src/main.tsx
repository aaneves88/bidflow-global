import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { isNativeMobile } from "@/lib/platform";

// Native-only bootstrap: configure status bar + splash on Android/iOS.
// Safe no-op on web (dynamic import + isNativeMobile guard).
if (isNativeMobile()) {
  (async () => {
    try {
      const [{ StatusBar, Style }, { SplashScreen }] = await Promise.all([
        import("@capacitor/status-bar"),
        import("@capacitor/splash-screen"),
      ]);
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#0F172A" });
      await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[native] bootstrap skipped", err);
    }
  })();
}

createRoot(document.getElementById("root")!).render(<App />);
