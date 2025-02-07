import type { Vec3 } from "@/oklab/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { srgbToOklch, oklchToSrgb } from "@/oklab/converts";
import st from "./_OklabExperiments.module.scss";
import classNames from "classnames/bind";
import midpoint from "culori/src/easing/midpoint";

const cx = classNames.bind(st);

const OklabExperiments = () => {
  const [srgb, setSrgb] = useState([0, 0, 0]);
  const [oklch, setOklch] = useState([0, 0, 0]);

  const onChangeSrgb = useCallback(
    (val: number, idx: number) => {
      const newSrgb = [...srgb];
      newSrgb[idx] = val;
      const newOklch = srgbToOklch(newSrgb as Vec3);
      setSrgb(newSrgb);
      setOklch(newOklch);
    },
    [srgb],
  );
  const onChangeOklch = useCallback(
    (val: number, idx: number) => {
      const newOklch = [...oklch];
      newOklch[idx] = val;
      const newSrgb = oklchToSrgb(newOklch as Vec3);
      setOklch(newOklch);
      setSrgb(newSrgb);
    },
    [oklch],
  );

  return (
    <>
      <div className={cx("color-picker", "color-picker-srgb")}>
        <input
          type="number"
          min={0}
          max={1}
          step={0.001}
          value={srgb[0]}
          onChange={(e) => {
            onChangeSrgb(parseFloat(e.target.value), 0);
          }}
        />
        <input
          type="number"
          min={0}
          max={1}
          step={0.001}
          value={srgb[1]}
          onChange={(e) => {
            onChangeSrgb(parseFloat(e.target.value), 1);
          }}
        />
        <input
          type="number"
          min={0}
          max={1}
          step={0.001}
          value={srgb[2]}
          onChange={(e) => {
            onChangeSrgb(parseFloat(e.target.value), 2);
          }}
        />
        <div
          className={cx("swatch")}
          style={{
            backgroundColor: `color(srgb ${Math.min(Math.max(srgb[0], 0), 1)} ${Math.min(Math.max(srgb[1], 0), 1)} ${Math.min(Math.max(srgb[2], 0), 1)})`,
          }}
        ></div>
      </div>
      <div className={cx("color-picker", "color-picker-oklch")}>
        <input
          type="number"
          min={0}
          max={1}
          step={0.001}
          value={oklch[0]}
          onChange={(e) => {
            onChangeOklch(parseFloat(e.target.value), 0);
          }}
        />
        <input
          type="number"
          min={0}
          max={1}
          step={0.001}
          value={oklch[1]}
          onChange={(e) => {
            onChangeOklch(parseFloat(e.target.value), 1);
          }}
        />
        <input
          type="number"
          min={0}
          max={360}
          step={1}
          value={oklch[2]}
          onChange={(e) => {
            onChangeOklch(parseFloat(e.target.value), 2);
          }}
        />
        <div
          className={cx("swatch")}
          style={{
            backgroundColor: `oklch(${oklch[0]} ${oklch[1]} ${oklch[2]}deg)`,
          }}
        ></div>
      </div>
    </>
  );
};

export default OklabExperiments;
