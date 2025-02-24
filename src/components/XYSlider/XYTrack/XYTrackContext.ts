import type { Size2D } from "../index";
import { createContext } from "react";

export type XYTrackContextType = {
  trackSize: Size2D;
  thumbSize: Size2D;
};

export const XYTrackContext = createContext<XYTrackContextType>({
  trackSize: { width: 0, height: 0 },
  thumbSize: { width: 0, height: 0 },
});
