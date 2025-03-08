import type { Size2D } from "../index";
import { createContext } from "react";

export type XYThumbSizeContextType = {
  thumbSize: Size2D;
};

export const XYThumbSizeContext = createContext<XYThumbSizeContextType>({
  thumbSize: { width: 0, height: 0 },
});
