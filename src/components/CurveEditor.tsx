import { useState } from 'react';
import { useMove } from 'react-aria';

function CurveEditor() {
  const CONTAINER_SIZE = 200;
  const BALL_SIZE = 30;

  let [events, setEvents] = useState<string[]>([]);
  let [color, setColor] = useState('black');
  let [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  let clamp = (pos: number) =>
    Math.min(Math.max(pos, 0), CONTAINER_SIZE - BALL_SIZE);
  let { moveProps } = useMove({
    onMoveStart(e) {
      setColor('red');
      setEvents((events) => [
        `move start with pointerType = ${e.pointerType}`,
        ...events,
      ]);
    },
    onMove(e) {
      setPosition(({ x, y }) => {
        if (e.pointerType === 'keyboard') {
          x = clamp(x);
          y = clamp(y);
        }

        x += e.deltaX;
        y += e.deltaY;
        return { x, y };
      });

      setEvents((events) => [
        `move with pointerType = ${e.pointerType}, deltaX = ${e.deltaX}, deltaY = ${e.deltaY}`,
        ...events,
      ]);
    },
    onMoveEnd(e) {
      setPosition(({ x, y }) => {
        // Clamp position on mouse up
        x = clamp(x);
        y = clamp(y);
        return { x, y };
      });
      setColor('black');
      setEvents((events) => [
        `move end with pointerType = ${e.pointerType}`,
        ...events,
      ]);
    },
  });

  return (
    <>
      <div
        style={{
          width: CONTAINER_SIZE,
          height: CONTAINER_SIZE,
          background: 'white',
          border: '1px solid black',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        <div
          {...moveProps}
          tabIndex={0}
          style={{
            width: BALL_SIZE,
            height: BALL_SIZE,
            borderRadius: '100%',
            position: 'absolute',
            left: clamp(position.x),
            top: clamp(position.y),
            background: color,
          }}
        />
      </div>
      <ul
        style={{
          maxHeight: '200px',
          overflow: 'auto',
        }}
      >
        {events.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </>
  );
}

export default CurveEditor;
