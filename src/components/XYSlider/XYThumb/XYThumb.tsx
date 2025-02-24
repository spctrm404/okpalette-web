// todo: constraint func
// todo: touch situ

import type { Dim2D } from "../index";
import { useContext, useEffect, useRef, useState } from "react";
import { XYTrackContext } from "../XYTrack";
import { mergeProps, useFocus, useHover, useMove, usePress } from "react-aria";

export type XYThumbProps = {
  minValue?: Dim2D;
  maxValue?: Dim2D;
  step?: Dim2D;
  value: Dim2D;
  constraint?: (newValue: Dim2D) => Dim2D;
  onChange?: (newValue: Dim2D) => void;
  index?: number;
};

export const XYThumb = ({
  minValue = { x: 0, y: 0 },
  maxValue = { x: 100, y: 100 },
  step = { x: 1, y: 1 },
  value,
  constraint,
  onChange,
  index,
}: XYThumbProps) => {
  const { trackSize, thumbSize } = useContext(XYTrackContext);

  const normPosFromVal: Dim2D = {
    x: (value.x - minValue.x) / (maxValue.x - minValue.x),
    // y:
    //   (value ? value.y : defaultValue.y - minValue.y) /
    //   (maxValue.y - minValue.y),
    y: 1 - (value.y - minValue.y) / (maxValue.y - minValue.y),
  };
  const pxPosFromVal: Dim2D = {
    x: normPosFromVal.x * trackSize.width,
    y: normPosFromVal.y * trackSize.height,
  };

  const updateFlagRef = useRef(true);
  const [normPos, setNormPos] = useState<Dim2D>(normPosFromVal);
  const pxPosRef = useRef<Dim2D>(pxPosFromVal);

  useEffect(() => {
    if (!updateFlagRef.current) return;

    console.log(`${index}_useEffect1`);
    console.log("value", value);
    console.log("normPosFromVal", normPosFromVal);
    console.log("pxPosFromVal", pxPosFromVal);

    setNormPos(normPosFromVal);
    pxPosRef.current = pxPosFromVal;
  }, [value.x, value.y]);
  useEffect(() => {
    console.log(`${index}_useEffect2`);
    console.log("trackSize", trackSize);
    console.log("pxPosFromVal", pxPosFromVal);

    pxPosRef.current = pxPosFromVal;
  }, [trackSize.width, trackSize.height]);

  const clampPxPos = (pxPos: Dim2D): Dim2D => ({
    x: Math.min(trackSize.width, Math.max(0, pxPos.x)),
    y: Math.min(trackSize.height, Math.max(0, pxPos.y)),
  });
  const clampNormPos = (normPos: Dim2D): Dim2D => ({
    x: Math.min(1, Math.max(0, normPos.x)),
    y: Math.min(1, Math.max(0, normPos.y)),
  });

  const pxPosToNormPos = (pxPos: Dim2D): Dim2D => ({
    x: pxPos.x / trackSize.width,
    y: pxPos.y / trackSize.height,
  });
  const normPosToVal = (normPos: Dim2D): Dim2D => ({
    x: normPos.x * (maxValue.x - minValue.x) + minValue.x,
    // y: normPos.y * (maxValue.y - minValue.y) + minValue.y,
    y: (1 - normPos.y) * (maxValue.y - minValue.y) + minValue.y,
  });

  const quantizeVal = (val: Dim2D): Dim2D => {
    const roundToNearestMultiple = (
      base: number,
      multipleOf: number,
    ): number => {
      const decimalPlaces = (multipleOf.toString().split(".")[1] || "").length;
      const result = Math.round(base / multipleOf) * multipleOf;
      const factor = Math.pow(10, decimalPlaces);
      return Math.round(result * factor) / factor;
    };

    return {
      x: roundToNearestMultiple(val.x, step.x),
      y: roundToNearestMultiple(val.y, step.y),
    };
  };

  const applyConstraint = () => {};
  const normPosToPxPos = (normPos: Dim2D): Dim2D => ({
    x: normPos.x * trackSize.width,
    y: normPos.y * trackSize.height,
  });

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
      let pxPos = { ...pxPosRef.current };
      if (e.pointerType === "keyboard") pxPos = clampPxPos(pxPos);
      pxPos.x += e.deltaX;
      pxPos.y += e.deltaY;
      pxPosRef.current = pxPos;

      const normPos = pxPosToNormPos(pxPosRef.current);
      const clampedNormPos = clampNormPos(normPos);
      setNormPos(clampedNormPos);

      console.log(`${index}_onMove`);

      const newValue = normPosToVal(clampedNormPos);
      const quantizedNewValue = quantizeVal(newValue);
      onChange?.(quantizedNewValue);
    },
    onMoveEnd: (e) => {
      let pxPos = { ...pxPosRef.current };
      pxPos = clampPxPos(pxPos);
      pxPosRef.current = pxPos;

      const normPos = pxPosToNormPos(pxPosRef.current);
      let clampedNormPos = clampNormPos(normPos);
      if (constraint) {
        clampedNormPos = constraint(clampedNormPos);
        clampedNormPos.y = 1 - clampedNormPos.y;
        pxPosRef.current = normPosToPxPos(clampedNormPos);
      }
      setNormPos(clampedNormPos);

      console.log(`${index}_onMoveEnd`);

      updateFlagRef.current = true;
      const newValue = normPosToVal(clampedNormPos);
      const quantizedNewValue = quantizeVal(newValue);
      onChange?.(quantizedNewValue);
    },
  });
  const { pressProps, isPressed } = usePress({
    onPress: (e) => {},
    onPressStart: (e) => {},
    onPressEnd: (e) => {},
    onPressChange: (e) => {},
    onPressUp: (e) => {},
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
      >
        {index}
      </p>
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPos.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPos.y}% - ${0.5 * thumbSize.height}px + 16px)`,
        }}
      >{`${value.x}, ${value.y}`}</p>
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPos.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPos.y}% - ${0.5 * thumbSize.height}px + 32px)`,
        }}
      >{`${normPos.x}, ${normPos.y}`}</p>
      <p
        style={{
          position: "absolute",
          left: `calc(${100 * normPos.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * normPos.y}% - ${0.5 * thumbSize.height}px + 48px)`,
        }}
      >{`${pxPosRef.current.x}, ${pxPosRef.current.y}`}</p>
    </>
  );
};
