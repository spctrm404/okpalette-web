import { ReactElement, useRef } from "react";
import XYTrackContext from "./XYTrackContext";
import XYThumb from "../XYThumb/XYThumb";

const XYTrack = ({
  children,
}: {
  children: ReactElement<typeof XYThumb> | ReactElement<typeof XYThumb>[];
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <XYTrackContext.Provider value={trackRef}>
      <div ref={trackRef}>{children}</div>
    </XYTrackContext.Provider>
  );
};

export default XYTrack;
