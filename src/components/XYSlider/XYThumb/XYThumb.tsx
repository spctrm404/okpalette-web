// todo: touch situ

import type { Dim2D } from "../index";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { XYTrackContext } from "../XYTrack";
import { mergeProps, useFocus, useHover, useMove, usePress } from "react-aria";

export type XYThumbProps = {
  min?: Dim2D;
  max?: Dim2D;
  step?: Dim2D;
  val: Dim2D;
  onChange?: (newVal: Dim2D) => void;
  constraintVal?: (val: Dim2D) => Dim2D;
  index?: number;
};

export const XYThumb = ({
  min = { x: 0, y: 0 },
  max = { x: 100, y: 100 },
  step = { x: 1, y: 1 },
  val,
  onChange,
  constraintVal,
  index,
}: XYThumbProps) => {
  const { trackSize, thumbSize } = useContext(XYTrackContext);

  const lastValRef = useRef<Dim2D>(val);

  const normPosFromVal: Dim2D = useMemo(
    () => ({
      x: (val.x - min.x) / (max.x - min.x),
      y: (val.y - min.y) / (max.y - min.y),
    }),
    [val.x, val.y, min.x, min.y, max.x, max.y],
  );
  const pxPosFromVal: Dim2D = useMemo(
    () => ({
      x: normPosFromVal.x * trackSize.width,
      y: (1 - normPosFromVal.y) * trackSize.height,
    }),
    [normPosFromVal.x, normPosFromVal.y, trackSize.width, trackSize.height],
  );

  const isMovingRef = useRef(false);
  const pxPosRef = useRef<Dim2D>(pxPosFromVal);
  const [normPos, setnormPos] = useState<Dim2D>(normPosFromVal);

  const clampPxPos = (pxPos: Dim2D): Dim2D => ({
    x: Math.min(trackSize.width, Math.max(0, pxPos.x)),
    y: Math.min(trackSize.height, Math.max(0, pxPos.y)),
  });
  const pxPosToNormPos = (pxPos: Dim2D): Dim2D => ({
    x: pxPos.x / trackSize.width,
    y: 1 - pxPos.y / trackSize.height,
  });

  const clampNormPos = (normPos: Dim2D): Dim2D => ({
    x: Math.min(1, Math.max(0, normPos.x)),
    y: Math.min(1, Math.max(0, normPos.y)),
  });
  const normPosToVal = (normPos: Dim2D): Dim2D => ({
    x: normPos.x * (max.x - min.x) + min.x,
    y: normPos.y * (max.y - min.y) + min.y,
  });
  const qunatizeVal = (val: Dim2D): Dim2D => {
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

  const valToNormPos = (val: Dim2D): Dim2D => ({
    x: (val.x - min.x) / (max.x - min.x),
    y: (val.y - min.y) / (max.y - min.y),
  });

  const moveCommon = (pxPos: Dim2D) => {
    pxPosRef.current = pxPos;

    // pxPos -> normPos
    const normPos = pxPosToNormPos(pxPosRef.current);
    // clamping
    const clampedNormPos = clampNormPos(normPos);

    // normPos -> val
    const newValue = normPosToVal(clampedNormPos);
    // quantizing
    const quantizedNewValue = qunatizeVal(newValue);

    if (constraintVal) {
      const constrainedVal = constraintVal(quantizedNewValue);
      const constrainedNormPos = valToNormPos(constrainedVal);
      if (constrainedVal.x !== quantizedNewValue.x) {
        quantizedNewValue.x = constrainedVal.x;
        clampedNormPos.x = constrainedNormPos.x;
      }
      if (constrainedVal.y !== quantizedNewValue.y) {
        quantizedNewValue.y = constrainedVal.y;
        clampedNormPos.y = constrainedNormPos.y;
      }
    }

    // save last value
    lastValRef.current = quantizedNewValue;
    // update normPos
    setnormPos(clampedNormPos);
    // update prop
    onChange?.(quantizedNewValue);
  };

  const { focusProps } = useFocus({
    onFocus: () => {},
    onBlur: () => {},
    onFocusChange: () => {},
  });
  const { hoverProps, isHovered } = useHover({
    onHoverStart: () => {},
    onHoverEnd: () => {},
    onHoverChange: () => {},
  });
  const { moveProps } = useMove({
    onMoveStart: () => {},
    onMove: (e) => {
      isMovingRef.current = true;

      // update pxPos
      let pxPos = { ...pxPosRef.current };
      if (e.pointerType === "keyboard") pxPos = clampPxPos(pxPos);
      pxPos.x += e.deltaX;
      pxPos.y += e.deltaY;

      moveCommon(pxPos);
      console.log(`${index}: onMove`);
    },
    onMoveEnd: () => {
      // update pxPos
      let pxPosition = { ...pxPosRef.current };
      pxPosition = clampPxPos(pxPosition);

      moveCommon(pxPosition);
      isMovingRef.current = false;
      console.log(`${index}: onMoveEnd`);
    },
  });
  const { pressProps, isPressed } = usePress({
    onPress: () => {
      // console.log(`${index}: onPress`);
    },
    onPressStart: () => {
      // console.log(`${index}: onPressStart`);
    },
    onPressEnd: () => {
      // console.log(`${index}: onPressEnd`);
    },
    onPressChange: () => {
      // console.log(`${index}: onPressChange`);
    },
    onPressUp: () => {
      // console.log(`${index}: onPressUp`);
    },
  });

  const reactAriaProps = mergeProps(
    focusProps,
    hoverProps,
    moveProps,
    pressProps,
  );

  // update position from value
  if (val.x !== lastValRef.current.x || val.y !== lastValRef.current.y) {
    console.log(`${index}: new value come`);
    if (constraintVal) {
      const constrainedVal = constraintVal(val);
      if (constrainedVal.x !== val.x || constrainedVal.y !== val.y) {
        console.log(`${index}: value needs to be constrained`);
        onChange?.(constrainedVal);
      }
    }
    if (
      !isMovingRef.current &&
      (pxPosFromVal.x !== pxPosRef.current.x ||
        pxPosFromVal.y !== pxPosRef.current.y)
    ) {
      console.log(`${index}: val -> pos`);
      pxPosRef.current = pxPosFromVal;
      setnormPos(normPosFromVal);
    }
    lastValRef.current = val;
  }

  useEffect(() => {
    pxPosRef.current = pxPosFromVal;
  }, [trackSize]);

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
          bottom: `calc(${100 * normPos.y}% - ${0.5 * thumbSize.height}px)`,
          background: "black",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `calc(${100 * normPos.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * (1 - normPos.y)}% - ${0.5 * thumbSize.height}px + 24px)`,
        }}
      >
        <div>{`${normPos.x}, ${normPos.y}`}</div>
        <div>{`${pxPosRef.current.x}, ${pxPosRef.current.y}`}</div>
      </div>
    </>
  );
};
