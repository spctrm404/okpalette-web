import type { Size2D } from "../index";
import { XYTrackContext, XYThumb } from "../index";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import st from "./_XYTrack.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

export type XYTrackProps = {
  thumbSize: Size2D;
  children: ReactElement<typeof XYThumb> | ReactElement<typeof XYThumb>[];
  className?: string;
  style?: React.CSSProperties;
  debug?: boolean;
};

export const XYTrack = ({ thumbSize, children, ...props }: XYTrackProps) => {
  const [trackSize, setTrackSize] = useState<Size2D>({ width: 0, height: 0 });
  const resizeObserverRef = useRef<ResizeObserver>();
  const trackRefCallback = useCallback(
    (node: HTMLDivElement) => {
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
      resizeObserverRef.current = resizeObserver;
    },
    [props.debug],
  );

  const memoizedContextValue = useMemo(
    () => ({
      trackSize,
      thumbSize,
    }),
    [trackSize, thumbSize],
  );

  useEffect(() => {
    return () => {
      if (props.debug) console.log(`@XYTrack: cleanup();`);
      const resizeObserver = resizeObserverRef.current;
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);
  return (
    <XYTrackContext.Provider value={memoizedContextValue}>
      <div
        className={props.className}
        style={{
          position: "relative",
          minWidth: `calc(6.25rem + ${thumbSize.width / 16.0}rem)`,
          minHeight: `calc(6.25rem + ${thumbSize.height / 16.0}rem)`,
          ...props.style,
        }}
      >
        <div
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
    </XYTrackContext.Provider>
  );
};
