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
  const { track, thumbSize } = useContext(XYTrackContext);
  const trackSize = useMemo(() => {
    if (!track) return { width: 0, height: 0 };
    return {
      width: track.getBoundingClientRect().width,
      height: track.getBoundingClientRect().height,
    };
  }, [track]);

  const valueToPosition = useMemo(() => {
    return {
      x: ((value.x - minValue.x) / (maxValue.x - minValue.x)) * trackSize.width,
      y:
        ((value.y - minValue.y) / (maxValue.y - minValue.y)) * trackSize.height,
    };
  }, [
    trackSize.width,
    trackSize.height,
    value.x,
    value.y,
    minValue.x,
    minValue.y,
    maxValue.x,
    maxValue.y,
  ]);

  const [events, setEvents] = useState<String[]>([]);
  const [color, setColor] = useState("black");

  const [position, setPosition] = useState(valueToPosition);
  const positionRef = useRef(position);

  const positionToValue = useMemo(() => {
    return {
      x:
        (positionRef.current.x / trackSize.width) * (maxValue.x - minValue.x) +
        minValue.x,
      y:
        (positionRef.current.y / trackSize.height) * (maxValue.y - minValue.y) +
        minValue.y,
    };
  }, [
    positionRef.current.x,
    positionRef.current.y,
    trackSize.width,
    trackSize.height,
    minValue.x,
    minValue.y,
    maxValue.x,
    maxValue.y,
  ]);

  useEffect(() => {
    setPosition(valueToPosition);
  }, [valueToPosition]);

  const clamp = (pos: number, dir: "X" | "Y") => {
    // const trackBoundingClientRect = trackRef?.current?.getBoundingClientRect();
    // if (!trackBoundingClientRect) return pos;
    return Math.min(
      Math.max(pos, 0),
      dir === "X" ? trackSize.width : trackSize.height,
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
    onMoveStart(e) {
      setColor("red");
      setEvents((events) => [
        `move start with pointerType = ${e.pointerType}`,
        ...events,
      ]);
    },
    onMove(e) {
      setPosition(({ x, y }) => {
        // Normally, we want to allow the user to continue
        // dragging outside the box such that they need to
        // drag back over the ball again before it moves.
        // This is handled below by clamping during render.
        // If using the keyboard, however, we need to clamp
        // here so that dragging outside the container and
        // then using the arrow keys works as expected.
        if (e.pointerType === "keyboard") {
          x = clamp(x, "X");
          y = clamp(y, "Y");
        }

        x += e.deltaX;
        y += e.deltaY;
        return { x, y };
      });

      // onChange
      onChange?.(positionToValue);

      setEvents((events) => [
        `move with pointerType = ${e.pointerType}, deltaX = ${e.deltaX}, deltaY = ${e.deltaY}`,
        ...events,
      ]);
    },
    onMoveEnd(e) {
      setPosition(({ x, y }) => {
        // Clamp position on mouse up
        x = clamp(x, "X");
        y = clamp(y, "Y");
        return { x, y };
      });
      setColor("black");

      // onChange
      onChange?.(positionToValue);

      setEvents((events) => [
        `move end with pointerType = ${e.pointerType}`,
        ...events,
      ]);
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
          left: clamp(position.x, "X") - 0.5 * thumbSize.width,
          top: clamp(position.y, "Y") - 0.5 * thumbSize.height,
          background: color,
        }}
      />
      {/* <ul
        style={{
          maxHeight: "200px",
          overflow: "auto",
        }}
      >
        {events.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul> */}
    </>
  );
};
