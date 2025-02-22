import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { XYTrackContext } from "./XYTrackContext";
import { XYThumb } from "../XYThumb";
import st from "./_XYTrack.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

export type XYTrackProps = {
  thumbWidth: number;
  thumbHeight: number;
  children: ReactElement<typeof XYThumb> | ReactElement<typeof XYThumb>[];
};

export const XYTrack = ({
  thumbWidth,
  thumbHeight,
  children,
}: XYTrackProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<HTMLDivElement | null>(trackRef.current);

  useEffect(() => {
    if (trackRef) {
      console.log("update trackRef", trackRef.current);
      setTrack(trackRef.current);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      track,
      thumbSize: { width: thumbWidth, height: thumbHeight },
    }),
    [track, thumbWidth, thumbHeight],
  );

  return (
    <XYTrackContext.Provider value={contextValue}>
      <div className={cx("xy-track")} ref={trackRef}>
        {children}
      </div>
    </XYTrackContext.Provider>
  );
};
