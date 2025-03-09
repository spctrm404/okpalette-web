import type { Size2D } from "../index";
import { XYThumbSizeContext, XYTrackSizeContext, XYThumb } from "../index";
import React, { ReactElement, useCallback, useMemo, useState } from "react";
import classNames from "classnames";

export type XYTrackProps = {
  thumbSize: Size2D;
  children: ReactElement<typeof XYThumb> | ReactElement<typeof XYThumb>[];
  className?: string;
  style?: React.CSSProperties;
  debug?: boolean;
};

export const XYTrack = ({ thumbSize, children, ...props }: XYTrackProps) => {
  const [trackSize, setTrackSize] = useState<Size2D>({ width: 0, height: 0 });

  const trackRefCallback = useCallback((node: HTMLDivElement) => {
    if (!node) return;

    const updateTrackSize = () => {
      const { width, height } = node.getBoundingClientRect();
      setTrackSize((prev) => {
        if (props.debug) {
          console.log(`@XYTrack: updateTrackSize();`);
          console.log("prev: ", prev);
          console.log("new: ", { width, height });
        }
        return prev.width === width && prev.height === height
          ? prev
          : { width, height };
      });
    };
    updateTrackSize();

    const resizeObserver = new ResizeObserver(updateTrackSize);
    resizeObserver.observe(node);

    return () => {
      if (props.debug) console.log(`@XYTrack: cleanup`);
      resizeObserver.disconnect();
    };
  }, []);

  const memoizedThumbSize = useMemo(() => {
    if (props.debug) {
      console.log(`@XYTrack: memoizedThumbSize`);
      console.log("thumbSize: ", thumbSize);
    }
    return thumbSize;
  }, [thumbSize.width, thumbSize.height]);

  return (
    <XYThumbSizeContext.Provider value={{ thumbSize: memoizedThumbSize }}>
      <XYTrackSizeContext.Provider value={{ trackSize }}>
        <div
          className={classNames("xy-track-container", props.className)}
          style={{
            position: "relative",
            minWidth: `calc(6.25rem + ${thumbSize.width / 16.0}rem)`,
            minHeight: `calc(6.25rem + ${thumbSize.height / 16.0}rem)`,
            ...props.style,
          }}
        >
          <div
            className={classNames("xy-track")}
            ref={trackRefCallback}
            style={{
              position: "absolute",
              inset: `${(0.5 * thumbSize.width) / 16}rem ${(0.5 * thumbSize.height) / 16}rem`,
              touchAction: "none",
            }}
          >
            {children}
          </div>
        </div>
      </XYTrackSizeContext.Provider>
    </XYThumbSizeContext.Provider>
  );
};
