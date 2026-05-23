import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

export const inter = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
export const grotesk = loadGrotesk("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });

export const colors = {
  bg: "#0B0D10",
  surface: "#14171C",
  surfaceAlt: "#1B1F26",
  border: "#262B33",
  text: "#F5F5F4",
  muted: "#8A93A1",
  primary: "#3B82F6",
  primaryGlow: "#60A5FA",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export const fontUI = inter.fontFamily;
export const fontDisplay = grotesk.fontFamily;
