import type { Size2D } from "../index";
import { createContext } from "react";

export type XYTrackSizeContextType = {
  trackSize: Size2D;
};

export const XYTrackSizeContext = createContext<XYTrackSizeContextType>({
  trackSize: { width: 0, height: 0 },
});
