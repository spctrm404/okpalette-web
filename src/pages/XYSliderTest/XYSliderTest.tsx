import { Dim2D } from "@/components/XYSlider";
import { XYTrack, XYThumb } from "@/components/XYSlider";
import { useState } from "react";

const XYSliderTest = () => {
  const [value, setValue] = useState([
    { x: 25, y: 25 },
    // { x: 50, y: 50 },
    // { x: 75, y: 75 },
  ]);

  const constraints = [
    (pos: Dim2D): Dim2D => {
      let { x, y } = { ...pos };
      y = x;
      return { x, y };
    },
  ];

  const handleChange = (index: number, newValue: Dim2D) => {
    setValue((prev) => {
      const next = [...prev];
      next[index] = newValue;
      return next;
    });
  };
  const handleSingleChange = (
    index: number,
    newSingleValue: number,
    axis: "x" | "y",
  ) => {
    setValue((prev) => {
      const next = [...prev];
      next[index] =
        axis === "x"
          ? { x: newSingleValue, y: prev[index].y }
          : { x: prev[index].x, y: newSingleValue };
      return next;
    });
  };
  return (
    <>
      <XYTrack thumbSize={{ width: 20, height: 20 }}>
        {value.map((v, i) => (
          <XYThumb
            key={`xyThumb_${i}`}
            index={i}
            value={v}
            step={{ x: 10, y: 10 }}
            onChange={(newValue) => {
              handleChange(i, newValue);
            }}
            constraint={constraints[i]}
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
              handleSingleChange(i, Number(e.currentTarget.value), "x");
            }}
          />
          <input
            key={`range_${i}_y`}
            type="range"
            value={v.y}
            onChange={(e) => {
              handleSingleChange(i, Number(e.currentTarget.value), "y");
            }}
          />
        </>
      ))}
    </>
  );
};
export default XYSliderTest;
