import { XYTrack, XYThumb } from "@/components/XYSlider";
import { GamutGl } from "@/components/GamutGL";
import { useState } from "react";
import st from "./_GamutSlider.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

const XYSliderTest = () => {
  const [l, setL] = useState(0.8);
  const [c, setC] = useState(0.2);
  const [h, setH] = useState(0.2);
  return (
    <div className={cx("layout")}>
      <div className={cx("gamut-slider")}>
        <XYTrack
          thumbSize={{ width: 20, height: 20 }}
          style={{ position: "relative", zIndex: 2 }}
        >
          <XYThumb
            val={{ x: l, y: h }}
            min={{ x: 0, y: 0 }}
            max={{ x: 1, y: 360 }}
            step={{ x: 0.001, y: 0.1 }}
          />
        </XYTrack>
        <GamutGl
          className={cx("gamut-gl")}
          lMapping={{ mappedTo: "x", flipped: "none", from: 0, to: 1 }}
          cMapping={{ mappedTo: "none", flipped: "none", from: c, to: c }}
          hMapping={{ mappedTo: "y", flipped: "none", from: 0, to: 360 }}
          gamut="displayP3"
          style={{
            zIndex: 1,
            position: "absolute",
            inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
          }}
        />
      </div>
      <div className={cx("gamut-slider")}>
        <XYTrack
          thumbSize={{ width: 20, height: 20 }}
          style={{ position: "relative", zIndex: 2 }}
        >
          <XYThumb
            val={{ x: l, y: c }}
            min={{ x: 0, y: 0 }}
            max={{ x: 1, y: 0.4 }}
            step={{ x: 0.001, y: 0.001 }}
          />
        </XYTrack>
        <GamutGl
          className={cx("gamut-gl")}
          lMapping={{ mappedTo: "x", flipped: "none", from: 0, to: 1 }}
          cMapping={{ mappedTo: "y", flipped: "none", from: 0, to: 0.4 }}
          hMapping={{ mappedTo: "none", flipped: "none", from: h, to: h }}
          gamut="displayP3"
          style={{
            zIndex: 1,
            position: "absolute",
            inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
          }}
        />
      </div>
      <div className={cx("gamut-slider")}>
        <XYTrack
          thumbSize={{ width: 20, height: 20 }}
          style={{ position: "relative", zIndex: 2 }}
        >
          <XYThumb
            val={{ x: l, y: c }}
            min={{ x: 0, y: 0 }}
            max={{ x: 1, y: 0.4 }}
            step={{ x: 0.001, y: 0.001 }}
            onChange={({ x, y }) => {
              setL(x);
              setC(y);
            }}
          />
        </XYTrack>
        <GamutGl
          className={cx("gamut-gl")}
          lMapping={{ mappedTo: "x", flipped: "none", from: 0, to: 1 }}
          cMapping={{ mappedTo: "y", flipped: "none", from: 0, to: 0.4 }}
          hMapping={{ mappedTo: "none", flipped: "none", from: h, to: h }}
          gamut="displayP3"
          style={{
            zIndex: 1,
            position: "absolute",
            inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
          }}
        />
      </div>
      <div className={cx("gamut-slider")}>
        <XYTrack
          thumbSize={{ width: 20, height: 20 }}
          style={{ position: "relative", zIndex: 2 }}
        >
          <XYThumb
            val={{ x: h, y: c }}
            min={{ x: 0, y: 0 }}
            max={{ x: 360, y: 0.4 }}
            step={{ x: 0.1, y: 0.001 }}
            onChange={({ x, y }) => {
              setH(x);
              setC(y);
            }}
          />
        </XYTrack>
        <GamutGl
          className={cx("gamut-gl")}
          lMapping={{ mappedTo: "none", flipped: "none", from: l, to: l }}
          cMapping={{ mappedTo: "y", flipped: "none", from: 0, to: 0.4 }}
          hMapping={{ mappedTo: "x", flipped: "none", from: 0, to: 360 }}
          gamut="displayP3"
          style={{
            zIndex: 1,
            position: "absolute",
            inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
          }}
        />
      </div>
    </div>
  );
};
export default XYSliderTest;
