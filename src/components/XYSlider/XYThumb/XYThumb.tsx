// todo: constraint func
// todo: touch situ

import type { Dim2D } from "../index";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { XYTrackContext } from "../XYTrack";
import { mergeProps, useFocus, useHover, useMove, usePress } from "react-aria";

export type XYThumbProps = {
  minValue?: Dim2D;
  maxValue?: Dim2D;
  step?: Dim2D;
  value: Dim2D;
  onChange?: (newValue: Dim2D) => void;
  constraint?: (newValue: Dim2D) => Dim2D;
  index?: number;
};

export const XYThumb = ({
  minValue = { x: 0, y: 0 },
  maxValue = { x: 100, y: 100 },
  step = { x: 1, y: 1 },
  value,
  onChange,
  constraint,
  index,
}: XYThumbProps) => {
  const { trackSize, thumbSize } = useContext(XYTrackContext);

  const lastValueRef = useRef<Dim2D>(value);

  const normPositionFromValue: Dim2D = useMemo(
    () => ({
      x: (value.x - minValue.x) / (maxValue.x - minValue.x),
      y: (value.y - minValue.y) / (maxValue.y - minValue.y),
    }),
    [value.x, value.y, minValue.x, minValue.y, maxValue.x, maxValue.y],
  );
  const pxPositionFromValue: Dim2D = useMemo(
    () => ({
      x: normPositionFromValue.x * trackSize.width,
      y: (1 - normPositionFromValue.y) * trackSize.height,
    }),
    [
      normPositionFromValue.x,
      normPositionFromValue.y,
      trackSize.width,
      trackSize.height,
    ],
  );

  const pxPositionRef = useRef<Dim2D>(pxPositionFromValue);
  const [normPosition, setNormPosition] = useState<Dim2D>(
    normPositionFromValue,
  );

  const clampPxPos = (pxPos: Dim2D): Dim2D => ({
    x: Math.min(trackSize.width, Math.max(0, pxPos.x)),
    y: Math.min(trackSize.height, Math.max(0, pxPos.y)),
  });
  const clampNormPosition = (normPos: Dim2D): Dim2D => ({
    x: Math.min(1, Math.max(0, normPos.x)),
    y: Math.min(1, Math.max(0, normPos.y)),
  });

  const pxPositionToNormPosition = (pxPos: Dim2D): Dim2D => ({
    x: pxPos.x / trackSize.width,
    y: 1 - pxPos.y / trackSize.height,
  });
  const normPositionToPxPosition = (normPos: Dim2D): Dim2D => ({
    x: normPos.x * trackSize.width,
    y: (1 - normPos.y) * trackSize.height,
  });
  const normPositionToValue = (normPos: Dim2D): Dim2D => ({
    x: normPos.x * (maxValue.x - minValue.x) + minValue.x,
    y: normPos.y * (maxValue.y - minValue.y) + minValue.y,
  });

  const quantizeValue = (val: Dim2D): Dim2D => {
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

  const moveCommon = (pxPosition: Dim2D) => {
    pxPositionRef.current = pxPosition;

    // pxPos -> normPos
    const normPosition = pxPositionToNormPosition(pxPositionRef.current);
    let clampedNormPosition = clampNormPosition(normPosition);
    if (constraint) {
      clampedNormPosition = constraint(clampedNormPosition);
      pxPositionRef.current = normPositionToPxPosition(clampedNormPosition);
    }
    setNormPosition(clampedNormPosition);

    // normPos -> val
    const newValue = normPositionToValue(clampedNormPosition);
    const quantizedNewValue = quantizeValue(newValue);
    lastValueRef.current = quantizedNewValue;

    console.log(`${index}_onMove`);
    onChange?.(lastValueRef.current);
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
      // update pxPos
      let pxPosition = { ...pxPositionRef.current };
      if (e.pointerType === "keyboard") pxPosition = clampPxPos(pxPosition);
      pxPosition.x += e.deltaX;
      pxPosition.y += e.deltaY;

      moveCommon(pxPosition);
    },
    onMoveEnd: () => {
      // update pxPos
      let pxPosition = { ...pxPositionRef.current };
      pxPosition = clampPxPos(pxPosition);

      moveCommon(pxPosition);
    },
  });
  const { pressProps, isPressed } = usePress({
    onPress: () => {
      // console.log(`${index}_onPress`);
    },
    onPressStart: () => {
      // console.log(`${index}_onPressStart`);
    },
    onPressEnd: () => {
      // console.log(`${index}_onPressEnd`);
    },
    onPressChange: () => {
      // console.log(`${index}_onPressChange`);
    },
    onPressUp: () => {
      // console.log(`${index}_onPressUp`);
    },
  });

  const reactAriaProps = mergeProps(
    focusProps,
    hoverProps,
    moveProps,
    pressProps,
  );

  if (
    value.x !== lastValueRef.current.x ||
    value.y !== lastValueRef.current.y
  ) {
    console.log(`${index}_val->pos`);
    lastValueRef.current = value;
    // pxPositionRef.current = pxPositionFromValue;
    // setNormPosition(normPositionFromValue);
    pxPositionRef.current = pxPositionFromValue;
    const normPosition = pxPositionToNormPosition(pxPositionRef.current);
    let clampedNormPosition = clampNormPosition(normPosition);
    if (constraint) {
      clampedNormPosition = constraint(clampedNormPosition);
      pxPositionRef.current = normPositionToPxPosition(clampedNormPosition);
    }
    setNormPosition(clampedNormPosition);

    const newValue = normPositionToValue(clampedNormPosition);
    const quantizedNewValue = quantizeValue(newValue);
    if (
      quantizedNewValue.x !== lastValueRef.current.x ||
      quantizedNewValue.y !== lastValueRef.current.y
    ) {
      onChange?.(quantizedNewValue);
    }
  }

  useEffect(() => {
    pxPositionRef.current = pxPositionFromValue;
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
          left: `calc(${100 * normPosition.x}% - ${0.5 * thumbSize.width}px)`,
          bottom: `calc(${100 * normPosition.y}% - ${0.5 * thumbSize.height}px)`,
          background: "black",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `calc(${100 * normPosition.x}% - ${0.5 * thumbSize.width}px)`,
          top: `calc(${100 * (1 - normPosition.y)}% - ${0.5 * thumbSize.height}px + 24px)`,
        }}
      >
        <div>{`${normPosition.x}, ${normPosition.y}`}</div>
        <div>{`${pxPositionRef.current.x}, ${pxPositionRef.current.y}`}</div>
      </div>
    </>
  );
};
