import { createContext, useContext } from "react";

export type XYTrackContextType = {
  track: HTMLDivElement | null;
  thumbSize: { width: number; height: number };
};

export const XYTrackContext = createContext<XYTrackContextType>({
  track: null,
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
