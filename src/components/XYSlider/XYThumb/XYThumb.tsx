// todo: constraint func
// todo: touch situ

import type { XY } from "../index";
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
  minValue?: XY;
  maxValue?: XY;
  step?: XY;
  value: XY;
  defaultValue?: XY;
  onChange?: (value: XY) => void;
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

  const memoizedNormPosFromVal = useMemo(() => {
    return {
      x: (value.x - minValue.x) / (maxValue.x - minValue.x),
      y: (value.y - minValue.y) / (maxValue.y - minValue.y),
    };
  }, [value.x, value.y, minValue.x, minValue.y, maxValue.x, maxValue.y]);
  const memoizedPxPosFromVal = useMemo(() => {
    const { x, y } = memoizedNormPosFromVal;
    return {
      x: x * trackSize.width,
      y: y * trackSize.height,
    };
  }, [memoizedNormPosFromVal, trackSize.width, trackSize.height]);

  const updateFlagRef = useRef(true);
  const [normPos, setNormPos] = useState(memoizedNormPosFromVal);
  const pxPosRef = useRef(memoizedPxPosFromVal);

  useEffect(() => {
    if (!updateFlagRef.current) return;

    // console.log("useEffect1");
    setNormPos(memoizedNormPosFromVal);
    updateFlagRef.current = false;
  }, [memoizedNormPosFromVal.x, memoizedNormPosFromVal.y]);
  useEffect(() => {
    // console.log("useEffect2");
    pxPosRef.current = memoizedPxPosFromVal;
  }, [trackSize.width, trackSize.height]);

  const getNormPosFromPxPos = useCallback(
    (pxPos: XY) => {
      return {
        x: pxPos.x / trackSize.width,
        y: pxPos.y / trackSize.height,
      };
    },
    [trackSize.width, trackSize.height],
  );

  const clampPx = useCallback(
    (pos: number, dir: "x" | "y") => {
      return Math.min(
        Math.max(pos, 0),
        dir === "x" ? trackSize.width : trackSize.height,
      );
    },
    [trackSize.width, trackSize.height],
  );
  const clampNorm = useCallback(
    (pos: XY) =>
      Object.fromEntries(
        Object.entries(pos).map(([k, v]) => [k, Math.min(1, Math.max(0, v))]),
      ) as XY,
    [],
  );

  const getValueFromNormPos = useCallback(
    (normPos: XY) => {
      return {
        x: normPos.x * (maxValue.x - minValue.x) + minValue.x,
        y: normPos.y * (maxValue.y - minValue.y) + minValue.y,
      };
    },
    [minValue.x, minValue.y, maxValue.x, maxValue.y],
  );

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
      let { x, y } = pxPosRef.current;
      if (e.pointerType === "keyboard") {
        x = clampPx(x, "x");
        y = clampPx(y, "y");
      }
      x += e.deltaX;
      y += e.deltaY;
      pxPosRef.current = { x, y };

      const normPos = getNormPosFromPxPos(pxPosRef.current);
      const clampedNormPos = clampNorm(normPos);
      setNormPos(clampedNormPos);

      console.log("onMove");

      onChange?.(getValueFromNormPos(clampedNormPos));
    },
    onMoveEnd: (e) => {
      let { x, y } = pxPosRef.current;
      x = clampPx(x, "x");
      y = clampPx(y, "y");
      pxPosRef.current = { x, y };

      const normPos = getNormPosFromPxPos(pxPosRef.current);
      const clampedNormPos = clampNorm(normPos);
      setNormPos(clampedNormPos);

      console.log("onMoveEnd");

      updateFlagRef.current = true;
      onChange?.(getValueFromNormPos(clampedNormPos));
    },
  });
  const { pressProps, isPressed } = usePress({
    onPress: (e) => {},
    onPressStart: (e) => {},
    onPressEnd: (e) => {},
    onPressChange: (e) => {},
    onPressUp: (e) => {
      let { x, y } = pxPosRef.current;
      x = clampPx(x, "x");
      y = clampPx(y, "y");
      pxPosRef.current = { x, y };

      const normPos = getNormPosFromPxPos(pxPosRef.current);
      const clampedNormPos = clampNorm(normPos);
      setNormPos(clampedNormPos);

      console.log("onPressUp");

      updateFlagRef.current = true;
      onChange?.(getValueFromNormPos(clampedNormPos));
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
          left: `calc(${100 * normPos.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPos.y}% - ${0.5 * thumbSize.height}px)`,
          background: "black",
        }}
      />
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPos.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPos.y}% - ${0.5 * thumbSize.height}px)`,
        }}
      >{`${value.x}, ${value.y}`}</p>
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPos.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPos.y}% - ${0.5 * thumbSize.height}px + 16px)`,
        }}
      >{`${normPos.x}, ${normPos.y}`}</p>
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPos.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPos.y}% - ${0.5 * thumbSize.height}px + 32px)`,
        }}
      >{`${pxPosRef.current.x}, ${pxPosRef.current.y}`}</p>
    </>
  );
};
