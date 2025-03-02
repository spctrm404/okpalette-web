import { XYTrack, XYThumb, Dim2D } from "@/components/XYSlider";
import { GamutGl } from "@/components/GamutGL";
import { useState } from "react";
import st from "./_GamutSlider.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

const XYSliderTest = () => {
  const [l, setL] = useState(0.8);
  const [h, setH] = useState(0.2);
  const [c, setC] = useState(0.2);
  const [hBegin, setHBegin] = useState(0.2);
  const [hEnd, setHEnd] = useState(0.2);

  const onChangeHBegin = ({ x, y }: Dim2D) => {
    let newH = (y + hEnd) / 2.0;
    newH += y < hEnd ? 0 : 180;
    newH = newH % 360.0;
    setHBegin(y);
    setH(newH);
  };
  const onChangeHEnd = ({ x, y }: Dim2D) => {
    let newH = (hBegin + y) / 2.0;
    newH += hBegin < y ? 0 : 180;
    newH = newH % 360.0;
    setHEnd(y);
    setH(newH);
  };
  const onChangeH = ({ x, y }: Dim2D) => {
    const delta = x - h;
    setH(x);
    setHBegin((prev) => {
      let newValue = prev + delta;
      if (newValue < 0) newValue += 360;
      return newValue % 360.0;
    });
    setHEnd((prev) => {
      let newValue = prev + delta;
      if (newValue < 0) newValue += 360;
      return newValue % 360.0;
    });
  };

  return (
    <>
      <div className={cx("layout")}>
        <div className={cx("gamut-slider")}>
          <XYTrack
            thumbSize={{ width: 20, height: 20 }}
            style={{ position: "relative", zIndex: 2 }}
          >
            <XYThumb
              val={{ x: 0, y: hBegin }}
              min={{ x: 0, y: 0 }}
              max={{ x: 1, y: 360 }}
              step={{ x: 0.1, y: 0.1 }}
              onChange={onChangeHBegin}
              constraintVal={({ x, y }) => ({ x: 0, y: y })}
            />
            <XYThumb
              val={{ x: 1, y: hEnd }}
              min={{ x: 0, y: 0 }}
              max={{ x: 1, y: 360 }}
              step={{ x: 0.1, y: 0.1 }}
              onChange={onChangeHEnd}
              constraintVal={({ x, y }) => ({ x: 1, y: y })}
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
            hMapping={{
              mappedTo: "x",
              flipped: "none",
              from: hBegin,
              to: hEnd,
            }}
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
                onChangeH({ x, y });
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
      <div>
        <p>l:{l}</p>
        <p>c:{c}</p>
        <p>hB:{hBegin}</p>
        <p>h:{h}</p>
        <p>hE:{hEnd}</p>
      </div>
    </>
  );
};
export default XYSliderTest;
