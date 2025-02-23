import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { XYTrackContext } from "../XYTrack";
import { mergeProps, useFocus, useHover, useMove, usePress } from "react-aria";

export type XYThumbProps = {
  minValue?: { x: number; y: number };
  maxValue?: { x: number; y: number };
  step?: { x: number; y: number };
  value: { x: number; y: number };
  defaultValue?: { x: number; y: number };
  onChange?: (value: { x: number; y: number }) => void;
};

export const XYThumb = ({
  minValue = { x: 0, y: 0 },
  maxValue = { x: 100, y: 100 },
  step = { x: 1, y: 1 },
  value,
  defaultValue = { x: 0, y: 0 },
  onChange,
}: XYThumbProps) => {
  const { trackSize, thumbSize } = useContext(XYTrackContext);

  const valueToNormPosition = useMemo(() => {
    return {
      x: (value.x - minValue.x) / (maxValue.x - minValue.x),
      y: (value.y - minValue.y) / (maxValue.y - minValue.y),
    };
  }, [value.x, value.y, minValue.x, minValue.y, maxValue.x, maxValue.y]);
  const valueToPixelPosition = useMemo(() => {
    const { x, y } = valueToNormPosition;
    return {
      // x: ((value.x - minValue.x) / (maxValue.x - minValue.x)) * trackSize.width,
      // y:
      //   ((value.y - minValue.y) / (maxValue.y - minValue.y)) * trackSize.height,
      x: x * trackSize.width,
      y: y * trackSize.height,
    };
  }, [valueToNormPosition, trackSize.width, trackSize.height]);

  const updateFlagRef = useRef(true);
  const [normPosition, setNormPosition] = useState(valueToNormPosition);
  const pixelPositionRef = useRef(valueToPixelPosition);

  useEffect(() => {
    if (!updateFlagRef.current) return;

    console.log("useEffect1");
    console.log("valueToNormPosition", valueToNormPosition);
    console.log("valueToPixelPosition", valueToPixelPosition);
    console.log("trackSize", trackSize);
    setNormPosition(valueToNormPosition);
    pixelPositionRef.current = valueToPixelPosition;
    updateFlagRef.current = false;
  }, [valueToNormPosition]);

  useEffect(() => {
    console.log("useEffect2");
    console.log("valueToPixelPosition", valueToPixelPosition);
    console.log("trackSize", trackSize);
    pixelPositionRef.current = valueToPixelPosition;
  }, [trackSize]);

  const pixelPositionToNormPosition = useMemo(() => {
    return {
      x: pixelPositionRef.current.x / trackSize.width,
      y: pixelPositionRef.current.y / trackSize.height,
    };
  }, [pixelPositionRef.current.x, pixelPositionRef.current.y, trackSize]);
  const pixelPositionToValue = useMemo(() => {
    const { x, y } = pixelPositionToNormPosition;
    return {
      // x:
      //   (pixelPositionRef.current.x / trackSize.width) *
      //     (maxValue.x - minValue.x) +
      //   minValue.x,
      // y:
      //   (pixelPositionRef.current.y / trackSize.height) *
      //     (maxValue.y - minValue.y) +
      //   minValue.y,
      x: x * (maxValue.x - minValue.x) + minValue.x,
      y: y * (maxValue.y - minValue.y) + minValue.y,
    };
  }, [
    pixelPositionToNormPosition,
    minValue.x,
    minValue.y,
    maxValue.x,
    maxValue.y,
  ]);

  const clamp = (pos: number, dir: "x" | "y") => {
    return Math.min(
      Math.max(pos, 0),
      dir === "x" ? trackSize.width : trackSize.height,
    );
  };

  const { focusProps } = useFocus({
    onFocus: (e) => {},
    onBlur: (e) => {},
    onFocusChange: (e) => {},
  });
  const { hoverProps, isHovered } = useHover({
    onHoverStart: (e) => {},
    onHoverEnd: (e) => {},
    onHoverChange: (e) => {},
  });
  const { moveProps } = useMove({
    onMoveStart: (e) => {},
    onMove: (e) => {
      updateFlagRef.current = false;
      let { x, y } = pixelPositionRef.current;
      if (e.pointerType === "keyboard") {
        x = clamp(x, "x");
        y = clamp(y, "y");
      }
      x += e.deltaX;
      y += e.deltaY;
      pixelPositionRef.current = { x, y };
      setNormPosition(pixelPositionToNormPosition);

      console.log("onMove");
      console.log(pixelPositionRef.current);
      console.log(pixelPositionToNormPosition);

      onChange?.(pixelPositionToValue);
    },
    onMoveEnd: (e) => {
      let { x, y } = pixelPositionRef.current;
      x = clamp(x, "x");
      y = clamp(y, "y");
      pixelPositionRef.current = { x, y };
      setNormPosition(pixelPositionToNormPosition);

      console.log("onMoveEnd");
      console.log(pixelPositionRef.current);
      console.log(pixelPositionToNormPosition);

      updateFlagRef.current = true;
      onChange?.(pixelPositionToValue);
    },
  });
  const { pressProps, isPressed } = usePress({
    onPress: (e) => {},
    onPressStart: (e) => {
      updateFlagRef.current = false;
    },
    onPressEnd: (e) => {},
    onPressChange: (e) => {},
    onPressUp: (e) => {
      let { x, y } = pixelPositionRef.current;
      x = clamp(x, "x");
      y = clamp(y, "y");
      pixelPositionRef.current = { x, y };
      setNormPosition(pixelPositionToNormPosition);

      console.log("onPressUp");
      console.log(pixelPositionRef.current);
      console.log(pixelPositionToNormPosition);

      updateFlagRef.current = true;
      onChange?.(pixelPositionToValue);
    },
  });

  const reactAriaProps = mergeProps(
    focusProps,
    hoverProps,
    moveProps,
    pressProps,
  );

  return (
    <>
      <div
        {...reactAriaProps}
        tabIndex={0}
        style={{
          width: thumbSize.width,
          height: thumbSize.height,
          borderRadius: "100%",
          position: "absolute",
          left: `calc(${100 * normPosition.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPosition.y}% - ${0.5 * thumbSize.height}px)`,
          background: "black",
        }}
      />
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPosition.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPosition.y}% - ${0.5 * thumbSize.height}px)`,
        }}
      >{`${value.x}, ${value.y}`}</p>
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPosition.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPosition.y}% - ${0.5 * thumbSize.height}px + 16px)`,
        }}
      >{`${normPosition.x}, ${normPosition.y}`}</p>
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPosition.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPosition.y}% - ${0.5 * thumbSize.height}px + 32px)`,
        }}
      >{`${pixelPositionRef.current.x}, ${pixelPositionRef.current.y}`}</p>
    </>
  );
};
