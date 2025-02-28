import { Dim2D } from "@/components/XYSlider";
import { XYTrack, XYThumb } from "@/components/XYSlider";
import { useState } from "react";

const XYSliderTest = () => {
  const [value, setValue] = useState([
    { x: 25, y: 25 },
    { x: 50, y: 50 },
    { x: 75, y: 75 },
  ]);
  const constraints = [
    (val: Dim2D): Dim2D => ({ x: val.x, y: val.x }),
    (val: Dim2D): Dim2D => ({
      x: Math.min(75, Math.max(val.x, 25)),
      y: Math.min(75, Math.max(val.y, 25)),
    }),
    (val: Dim2D): Dim2D => ({ x: val.x, y: val.x }),
  ];

  const onChangeHandler = (index: number, newVal: Dim2D) => {
    setValue((prev) => {
      const next = [...prev];
      next[index] = newVal;
      return next;
    });
  };
  const onChangeHandlerSingle = (
    index: number,
    newVal: number,
    axis: "x" | "y",
  ) => {
    setValue((prev) => {
      const next = [...prev];
      next[index] =
        axis === "x"
          ? { x: newVal, y: prev[index].y }
          : { x: prev[index].x, y: newVal };
      return next;
    });
  };
  return (
    <>
      <XYTrack thumbSize={{ width: 20, height: 20 }}>
        {value.map((v, i) => (
          <XYThumb
            key={`xyThumb_${i}`}
            idx={i}
            val={v}
            step={{ x: 10, y: 10 }}
            onChange={(newVal) => {
              onChangeHandler(i, newVal);
            }}
            constraintVal={constraints[i]}
          />
        ))}
      </XYTrack>
      {value.map((v, i) => (
        <>
          <p key={`value_${i}`}>{`${v.x}, ${v.y}`}</p>
          <input
            key={`range_${i}_x`}
            type="range"
            value={v.x}
            onChange={(e) => {
              onChangeHandlerSingle(i, Number(e.currentTarget.value), "x");
            }}
          />
          <input
            key={`range_${i}_y`}
            type="range"
            value={v.y}
            onChange={(e) => {
              onChangeHandlerSingle(i, Number(e.currentTarget.value), "y");
            }}
          />
        </>
      ))}
    </>
  );
};
export default XYSliderTest;
