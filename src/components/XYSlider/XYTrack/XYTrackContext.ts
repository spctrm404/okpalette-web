import { createContext, RefObject } from "react";

const XYTrackContext = createContext<RefObject<HTMLDivElement> | null>(null);

export default XYTrackContext;
