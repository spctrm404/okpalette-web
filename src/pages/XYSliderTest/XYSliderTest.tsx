import { useState } from "react";
import { XYTrack, XYThumb } from "@/components/XYSlider";

const XYSliderTest = () => {
  const [value, setValue] = useState([
    { x: 0, y: 0 },
    { x: 20, y: 20 },
    { x: 40, y: 40 },
    { x: 60, y: 60 },
    { x: 80, y: 80 },
  ]);

  const handleChange = (index: number, newValue: { x: number; y: number }) => {
    setValue((prev) => {
      const next = [...prev];
      next[index] = newValue;
      return next;
    });
  };
  return (
    <XYTrack thumbWidth={30} thumbHeight={30}>
      {value.map((v, i) => (
        <XYThumb
          key={`xyThumb_${i}`}
          value={v}
          onChange={(newValue) => {
            handleChange(i, newValue);
          }}
        />
      ))}
    </XYTrack>
  );
};
export default XYSliderTest;
