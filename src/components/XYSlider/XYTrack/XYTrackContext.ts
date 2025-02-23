import { createContext, useContext } from "react";

export type SquareSize = {
  width: number;
  height: number;
};

export type XYTrackContextType = {
  trackSize: SquareSize;
  thumbSize: SquareSize;
};

export const XYTrackContext = createContext<XYTrackContextType>({
  trackSize: { width: 0, height: 0 },
  thumbSize: { width: 0, height: 0 },
});

export const useXYTrackContext = (): XYTrackContextType => {
  const context = useContext(XYTrackContext);
  if (!context)
    throw new Error(
      "useXYTrackContext must be used within a XYTrackContextProvider",
    );

  return context;
};
