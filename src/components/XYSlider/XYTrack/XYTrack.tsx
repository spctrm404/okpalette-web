import type { Size2D } from "../index";
import { XYTrackContext, XYThumb } from "../index";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import st from "./_XYTrack.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

export type XYTrackProps = {
  thumbSize: Size2D;
  children: ReactElement<typeof XYThumb> | ReactElement<typeof XYThumb>[];
};

export const XYTrack = ({ thumbSize, children }: XYTrackProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackSize, setTrackSize] = useState<Size2D>({ width: 0, height: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateTrackSize = () => {
      const { width, height } = track.getBoundingClientRect();
      setTrackSize({ width, height });
    };

    const resizeObserver = new ResizeObserver(updateTrackSize);
    resizeObserver.observe(track);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const memoizedContextValue = useMemo(
    () => ({
      trackSize,
      thumbSize,
    }),
    [trackSize.width, trackSize.height, thumbSize.width, thumbSize.height],
  );

  return (
    <XYTrackContext.Provider value={memoizedContextValue}>
      <div className={cx("xy-track")} ref={trackRef}>
        {children}
      </div>
    </XYTrackContext.Provider>
  );
};
