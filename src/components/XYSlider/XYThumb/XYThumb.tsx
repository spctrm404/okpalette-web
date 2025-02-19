import { useContext } from "react";
import { XYTrackContext } from "../XYTrack";

const XYThumb = () => {
  const trackRef = useContext(XYTrackContext);

  return (
    <div>Track ref: {trackRef?.current ? "Available" : "Not available"}</div>
  );
};

export default XYThumb;
