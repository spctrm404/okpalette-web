// todo: arrow key problem

import { clamp, quantize } from "@utils/numberUtils";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  mergeProps,
  MoveMoveEvent,
  PressEvent,
  useFocus,
  useHover,
  useMove,
  usePress,
} from "react-aria";
import st from "./_XYSlider.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

type XY = {
  x: number;
  y: number;
};

type XYSlliderProps = {
  value?: XY;
  minValue?: XY;
  maxValue?: XY;
  step?: XY;
  onChangeEnd?: (newNumbers: XY) => void;
  onChange?: (newNumbers: XY) => void;
  isDisabled?: boolean;
  className?: string;
};

const XYSlider = ({
  minValue = { x: 0, y: 0 },
  maxValue = { x: 100, y: 100 },
  step = { x: 1, y: 1 },
  value = { x: 50, y: 50 },
  onChangeEnd = () => {},
  onChange = () => {},
  isDisabled = false,
  className = "",
  ...props
}: XYSlliderProps) => {
  const currentPosition = useRef<XY>({ x: 0, y: 0 });
  const normalPosition = useRef<XY>(currentPosition.current);
  const [position, setPosition] = useState<XY>(currentPosition.current);

  const doSync = useRef(true);

  const [isDragging, setDragging] = useState(false);
  const [isFocused, setFocused] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  const getPositionFromValue = useCallback((): XY => {
    if (!track.current || !thumb.current) return { x: 0, y: 0 };
    const getNormalizedValue = () => {
      return (Object.keys(value) as (keyof XY)[]).reduce((acc, key) => {
        acc[key] =
          key === "y"
            ? 1 - (value[key] - minValue[key]) / (maxValue[key] - minValue[key])
            : (value[key] - minValue[key]) / (maxValue[key] - minValue[key]);
        return acc;
      }, {} as XY);
    };
    const trackRect = track.current.getBoundingClientRect();
    const thumbRect = thumb.current.getBoundingClientRect();
    return {
      x: getNormalizedValue().x * trackRect.width - 0.5 * thumbRect.width,
      y: getNormalizedValue().y * trackRect.height - 0.5 * thumbRect.height,
    };
  }, [value, minValue, maxValue]);

  useLayoutEffect(() => {
    if (doSync.current) {
      currentPosition.current = getPositionFromValue();
      setNormalPosition();
      setPosition(currentPosition.current);
    }
  }, [getPositionFromValue]);

  const clampPosition = useCallback((position: XY): XY => {
    if (!track.current || !thumb.current) return { x: 0, y: 0 };
    const trackRect = track.current.getBoundingClientRect();
    const thumbRect = thumb.current.getBoundingClientRect();
    return {
      x: clamp(
        position.x,
        -0.5 * thumbRect.width,
        trackRect.width - 0.5 * thumbRect.width,
      ),
      y: clamp(
        position.y,
        -0.5 * thumbRect.height,
        trackRect.height - 0.5 * thumbRect.height,
      ),
    };
  }, []);

  const getNormalizedPosition = useCallback((): XY => {
    if (!track.current || !thumb.current) return { x: 0, y: 0 };
    const trackRect = track.current.getBoundingClientRect();
    const thumbRect = thumb.current.getBoundingClientRect();
    const clampedPosition = clampPosition(position);
    return {
      x: (clampedPosition.x + 0.5 * thumbRect.width) / trackRect.width,
      y: (clampedPosition.y + 0.5 * thumbRect.height) / trackRect.height,
    };
  }, [clampPosition, position]);

  const setNormalPosition = useCallback(() => {
    if (!track.current || !thumb.current) return { x: 0, y: 0 };
    const trackRect = track.current.getBoundingClientRect();
    const thumbRect = thumb.current.getBoundingClientRect();
    normalPosition.current = {
      x: (currentPosition.current.x + 0.5 * thumbRect.width) / trackRect.width,
      y:
        (currentPosition.current.y + 0.5 * thumbRect.height) / trackRect.height,
    };
  }, []);

  const getPositionFromNormalPosition = useCallback((): XY => {
    if (!track.current || !thumb.current) return { x: 0, y: 0 };
    const trackRect = track.current.getBoundingClientRect();
    const thumbRect = thumb.current.getBoundingClientRect();
    return {
      x: normalPosition.current.x * trackRect.width - 0.5 * thumbRect.width,
      y: normalPosition.current.y * trackRect.height - 0.5 * thumbRect.height,
    };
  }, []);

  const getValueFromCurrentPosition = useCallback(() => {
    return (Object.keys(normalPosition.current) as (keyof XY)[]).reduce(
      (acc, key) => {
        acc[key] =
          key === "y"
            ? (1 - normalPosition.current[key]) *
                (maxValue[key] - minValue[key]) +
              minValue[key]
            : normalPosition.current[key] * (maxValue[key] - minValue[key]) +
              minValue[key];
        return acc;
      },
      {} as XY,
    );
  }, [maxValue, minValue]);

  const clampValue = useCallback(
    (value: XY) => {
      return (Object.keys(value) as (keyof XY)[]).reduce((acc, key) => {
        acc[key] = clamp(value[key], minValue[key], maxValue[key]);
        return acc;
      }, {} as XY);
    },
    [minValue, maxValue],
  );
  const quantizeValue = useCallback(
    (value: XY) => {
      return (Object.keys(value) as (keyof XY)[]).reduce((acc, key) => {
        acc[key] = quantize(value[key], step[key]);
        return acc;
      }, {} as XY);
    },
    [step],
  );

  const onChangeEndHandler = useCallback(() => {
    const newValue = getValueFromCurrentPosition();
    const quantizedValue = quantizeValue(newValue);
    onChangeEnd(quantizedValue);
  }, [getValueFromCurrentPosition, quantizeValue, onChangeEnd]);
  const onChangeHandler = useCallback(() => {
    const newValue = getValueFromCurrentPosition();
    const clampedValue = clampValue(newValue);
    const quantizedValue = quantizeValue(clampedValue);
    onChange(quantizedValue);
  }, [getValueFromCurrentPosition, clampValue, quantizeValue, onChange]);

  const onPressStart = useCallback(
    (e: PressEvent) => {
      if (!thumb.current) return;
      doSync.current = false;
      thumb.current.focus();
      setFocused(true);
      setDragging(true);
      const thumbRect = thumb.current.getBoundingClientRect();
      currentPosition.current = {
        x: e.x - 0.5 * thumbRect.width,
        y: e.y - 0.5 * thumbRect.height,
      };
      setNormalPosition();
      setPosition(currentPosition.current);
      onChangeHandler();
    },
    [onChangeHandler],
  );
  const onPressUp = useCallback(() => {
    doSync.current = true;
    const clampedPosition = clampPosition(currentPosition.current);
    currentPosition.current = clampedPosition;
    setNormalPosition();
    setPosition(currentPosition.current);
    setDragging(false);
    onChangeEndHandler();
  }, [clampPosition, onChangeEndHandler]);
  const onMove = useCallback(
    (e: MoveMoveEvent) => {
      doSync.current = false;
      if (e.pointerType === "keyboard") {
        const clampedPosition = clampPosition(currentPosition.current);
        currentPosition.current = clampedPosition;
        setNormalPosition();
      }
      currentPosition.current.x += e.deltaX;
      currentPosition.current.y += e.deltaY;
      setNormalPosition();
      setPosition(currentPosition.current);
      onChangeHandler();
    },
    [clampPosition, onChangeHandler],
  );
  const onMoveEnd = useCallback(() => {
    doSync.current = true;
    const clampedPosition = clampPosition(currentPosition.current);
    currentPosition.current = clampedPosition;
    setNormalPosition();
    setPosition(currentPosition.current);
    setDragging(false);
    onChangeEndHandler();
  }, [clampPosition, onChangeEndHandler]);

  const { hoverProps: thumbHoverProps, isHovered: thumbIsHovered } = useHover({
    onHoverStart: () => {},
    onHoverEnd: () => {},
    onHoverChange: () => {},
  });
  const { focusProps: thumbFocusProps } = useFocus({
    onFocus: () => {
      if (!isDisabled) setFocused(true);
    },
    onBlur: () => {
      setFocused(false);
    },
    onFocusChange: () => {},
  });
  const { pressProps: thumbPressProps, isPressed: thumbIsPressed } = usePress({
    onPress: () => {},
    onPressStart: () => {
      if (!isDisabled) setDragging(true);
    },
    onPressEnd: () => {},
    onPressChange: () => {},
    onPressUp: () => {},
  });
  const { moveProps: thumbMoveProp } = useMove({
    onMoveStart: () => {},
    onMove: (e) => {
      if (!isDisabled) onMove(e);
    },
    onMoveEnd: () => {
      if (!isDisabled) onMoveEnd();
    },
  });
  const thumbInteractionProps = mergeProps(
    thumbHoverProps,
    thumbFocusProps,
    thumbPressProps,
    thumbMoveProp,
  );

  const { hoverProps: trackHoverProps, isHovered: trackIsHovered } = useHover({
    onHoverStart: () => {},
    onHoverEnd: () => {},
    onHoverChange: () => {},
  });
  const { pressProps: trackPressProps, isPressed: trackIsPressed } = usePress({
    onPress: () => {},
    onPressStart: (e) => {
      if (!isDisabled) onPressStart(e);
    },
    onPressEnd: () => {},
    onPressChange: () => {},
    onPressUp: () => {
      onPressUp();
    },
  });
  const { moveProps: trackMoveProps } = useMove({
    onMoveStart: () => {},
    onMove: (e) => {
      if (!isDisabled) onMove(e);
    },
    onMoveEnd: () => {
      if (!isDisabled) onMoveEnd();
    },
  });
  const trackInteractionProps = mergeProps(
    trackHoverProps,
    trackPressProps,
    trackMoveProps,
  );

  useEffect(() => {
    if (!root.current) return;
    const onResizeHandler = (entries: ResizeObserverEntry[]) => {
      entries.forEach((anEntry) => {
        if (anEntry.target === root.current) {
          currentPosition.current = getPositionFromNormalPosition();
          setPosition(currentPosition.current);
        }
      });
    };
    const resizeObserver = new ResizeObserver(onResizeHandler);
    resizeObserver.observe(root.current);
    return () => {
      if (!root.current) return;
      resizeObserver.unobserve(root.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={cx("xyslider", "xyslider__root", className)}
      {...(isDisabled && { "data-disabled": "true" })}
      style={
        {
          "--normalized-val-x": getNormalizedPosition().x,
          "--normalized-val-y": getNormalizedPosition().y,
        } as React.CSSProperties
      }
      {...props}
      ref={root}
    >
      <div
        className={cx("xyslider__track", "xyslider-track")}
        {...trackInteractionProps}
        {...(!isDisabled && trackIsHovered && { "data-hovered": "true" })}
        {...(isDisabled && { "data-disabled": "true" })}
        style={{
          position: "relative",
          touchAction: "none",
        }}
        ref={track}
      >
        <div className={cx("xyslider__track__shape", "xyslider-track-shape")} />
        <div
          className={cx(
            "xyslider__track__guide",
            "xyslider__track__guide--part-top",
            "xyslider__track__guide--part-vertical",
            "xyslider-track-guide-top",
          )}
        />
        <div
          className={cx(
            "xyslider__track__guide",
            "xyslider__track__guide--part-right",
            "xyslider__track__guide--part-horizontal",
            "xyslider-track-guide-right",
          )}
        />
        <div
          className={cx(
            "xyslider__track__guide",
            "xyslider__track__guide--part-bottom",
            "xyslider__track__guide--part-vertical",
            "xyslider-track-guide-bottom",
          )}
        />
        <div
          className={cx(
            "xyslider__track__guide",
            "xyslider__track__guide--part-left",
            "xyslider__track__guide--part-horizontal",
            "xyslider-track-guide-left",
          )}
        />
        <div
          className={cx("xyslider__thumb", "xyslider-thumb")}
          {...thumbInteractionProps}
          {...(!isDisabled && thumbIsHovered && { "data-hovered": "true" })}
          {...(!isDisabled && isDragging && { "data-dragging": "true" })}
          {...(!isDisabled && isFocused && { "data-focused": "true" })}
          {...(isDisabled && { "data-disabled": "true" })}
          tabIndex={0}
          style={{
            position: "absolute",
            touchAction: "none",
          }}
          ref={thumb}
        >
          <div
            className={cx("xyslider__thumb__state", "xyslider-thumb-state")}
          />
          <div className={cx("xyslider__thumb__shape", "xyslider-thumb-shape")}>
            <div
              className={cx(
                "xyslider__thumb__shape__component",
                "xyslider__thumb__shape__component--part-top",
                "xyslider-thumb-shape-top",
              )}
            />
            <div
              className={cx(
                "xyslider__thumb__shape__component",
                "xyslider__thumb__shape__component--part-right",
                "xyslider-thumb-shape-right",
              )}
            />
            <div
              className={cx(
                "xyslider__thumb__shape__component",
                "xyslider__thumb__shape__component--part-bottom",
                "xyslider-thumb-shape-bottom",
              )}
            />
            <div
              className={cx(
                "xyslider__thumb__shape__component",
                "xyslider__thumb__shape__component--part-left",
                "xyslider-thumb-shape-left",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default XYSlider;
