import type { Size2D } from "../index";
import { XYTrackContext, XYThumb } from "../index";
import { ReactElement, useCallback, useMemo, useRef, useState } from "react";
import st from "./_XYTrack.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

export type XYTrackProps = {
  thumbSize: Size2D;
  children: ReactElement<typeof XYThumb> | ReactElement<typeof XYThumb>[];
};

export const XYTrack = ({ thumbSize, children }: XYTrackProps) => {
  const [trackSize, setTrackSize] = useState<Size2D>({ width: 0, height: 0 });
  const resizeObserver = useRef<ResizeObserver>();
  const trackRefCallback = useCallback((node: HTMLDivElement) => {
    if (!node) return;

    const updateTrackSize = () => {
      const { width, height } = node.getBoundingClientRect();
      setTrackSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    };
    updateTrackSize();

    if (!resizeObserver.current) {
      resizeObserver.current = new ResizeObserver(updateTrackSize);
      resizeObserver.current.observe(node);
    }

    return () => {
      resizeObserver.current?.disconnect();
    };
  }, []);

  const memoizedContextValue = useMemo(
    () => ({
      trackSize,
      thumbSize,
    }),
    [trackSize, thumbSize],
  );

  return (
    <XYTrackContext.Provider value={memoizedContextValue}>
      <div
        className={cx("xy-container")}
        style={{
          position: "relative",
        }}
      >
        <div
          className={cx("xy-track")}
          ref={trackRefCallback}
          style={{
            position: "absolute",
            inset: `${0.5 * thumbSize.width}px ${0.5 * thumbSize.height}px`,
          }}
        >
          {children}
        </div>
      </div>
    </XYTrackContext.Provider>
  );
};
