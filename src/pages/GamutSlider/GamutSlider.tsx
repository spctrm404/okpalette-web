import { quantize } from "@/utils";
import { isInGamut, findMaxChroma } from "@/oklab";
import { GamutGl } from "@/components/GamutGL";
import { XYTrack, XYThumb } from "@/components/XYSlider";
import { useState } from "react";
import st from "./_GamutSlider.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

const XYSliderTest = () => {
  const [l, setL] = useState(0.8);
  const [c, setC] = useState(0.2);
  const [isHRanged, setHRanged] = useState(true);
  const [hBegin, setHBegin] = useState(0);
  const [hEnd, setHEnd] = useState(30);

  const lerpHue = (hBegin: number, hEnd: number, t: number) => {
    const delta = hBegin < hEnd ? hEnd - hBegin : hEnd + 360 - hBegin;
    let newH = hBegin + delta * t;
    newH = quantize(newH, 0.1);
    newH = newH % 360.0;
    return newH;
  };
  const [h, setH] = useState(lerpHue(hBegin, hEnd, 0.5));

  const onChangeHBegin = (newHBegin: number) => {
    const newH = lerpHue(newHBegin, hEnd, 0.5);
    setHBegin(newHBegin);
    setH(newH);
  };
  const onChangeHEnd = (newHEnd: number) => {
    const newH = lerpHue(hBegin, newHEnd, 0.5);
    setHEnd(newHEnd);
    setH(newH);
  };
  const onChangeH = (newH: number) => {
    const delta = newH - h;
    setH(newH);
    const setState = (prev: number) => {
      let newValue = prev + delta;
      if (newValue < 0) newValue += 360;
      newValue = quantize(newValue, 0.1);
      return newValue % 360.0;
    };
    setHBegin(setState);
    setHEnd(setState);
  };

  const svgLCSectionLine = () => {
    if (hBegin <= hEnd)
      return (
        <line
          x1={0}
          y1={100 * (1 - hBegin / 360.0)}
          x2={100}
          y2={100 * (1 - hEnd / 360.0)}
          stroke="black"
          strokeWidth={`${1 / 16.0}rem`}
          strokeDasharray={"4,4"}
          vector-effect="non-scaling-stroke"
        />
      );
    return (
      <>
        <line
          x1={0}
          y1={100 * (1 - hBegin / 360.0)}
          x2={100}
          y2={100 * (1 - (hEnd + 360) / 360.0)}
          stroke="black"
          strokeWidth={`${1 / 16.0}rem`}
          strokeDasharray={"4,4"}
          vector-effect="non-scaling-stroke"
        />
        <line
          x1={0}
          y1={100 * (1 - (hBegin - 360) / 360.0)}
          x2={100}
          y2={100 * (1 - hEnd / 360.0)}
          stroke="black"
          strokeWidth={`${1 / 16.0}rem`}
          strokeDasharray={"4,4"}
          vector-effect="non-scaling-stroke"
        />
      </>
    );
  };
  const svgLHSectionLine = () => {
    return (
      <line
        x1={0}
        y1={100 * (1 - c / 0.4)}
        x2={100}
        y2={100 * (1 - c / 0.4)}
        stroke="black"
        strokeWidth={`${1 / 16.0}rem`}
        strokeDasharray={"4,4"}
        vector-effect="non-scaling-stroke"
      />
    );
  };
  const svgHCSectionLine = () => {
    return (
      <line
        x1={100 * l}
        y1={0}
        x2={100 * l}
        y2={100}
        stroke="black"
        strokeWidth={`${1 / 16.0}rem`}
        strokeDasharray={"4,4"}
        vector-effect="non-scaling-stroke"
      />
    );
  };

  return (
    <>
      <div className={cx("layout")}>
        <div className={cx("gamut-slider")}>
          <GamutGl
            className={cx("gamut-gl")}
            lMapping={{ mappedTo: "x", flipped: "none", from: 0, to: 1 }}
            cMapping={{ mappedTo: "none", flipped: "none", from: c, to: c }}
            hMapping={{ mappedTo: "y", flipped: "none", from: 0, to: 360 }}
            style={{
              position: "absolute",
              zIndex: 1,
              inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
            }}
          />
          <svg
            viewBox="0 0 100 100"
            style={{
              display: "block",
              position: "absolute",
              zIndex: 2,
              inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
            }}
          >
            {svgLCSectionLine()}
          </svg>
          <div
            className={cx("section-label")}
            style={{ position: "relative", userSelect: "none", zIndex: 3 }}
          >
            LH
          </div>
          <XYTrack
            thumbSize={{ width: 20, height: 20 }}
            style={{ position: "relative", zIndex: 4 }}
          >
            <XYThumb
              val={{ x: 0, y: hBegin }}
              min={{ x: 0, y: 0 }}
              max={{ x: 1, y: 360 }}
              step={{ x: 0.1, y: 0.1 }}
              onChange={({ x, y }) => {
                onChangeHBegin(y);
              }}
              constraintVal={({ x, y }) => ({ x: 0, y: y })}
            />
            <XYThumb
              val={{ x: 1, y: hEnd }}
              min={{ x: 0, y: 0 }}
              max={{ x: 1, y: 360 }}
              step={{ x: 0.1, y: 0.1 }}
              onChange={({ x, y }) => {
                onChangeHEnd(y);
              }}
              constraintVal={({ x, y }) => ({ x: 1, y: y })}
            />
          </XYTrack>
        </div>
        <div className={cx("control")}>
          <div>
            <p>range</p>
            <input
              type="checkbox"
              onChange={(e) => {
                console.log(e.currentTarget.checked);
              }}
            />
          </div>
          <p>
            {isInGamut([l, c, lerpHue(hBegin, hEnd, l)]) ? "true" : "false"}
          </p>
          <p>l:{l}</p>
          <p>c:{c}</p>
          <p>hB:{hBegin}</p>
          <p>h:{h}</p>
          <p>hE:{hEnd}</p>
        </div>
        <div className={cx("gamut-slider")}>
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
            style={{
              position: "absolute",
              zIndex: 1,
              inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
            }}
          />
          <svg
            viewBox="0 0 100 100"
            style={{
              display: "block",
              position: "absolute",
              zIndex: 2,
              inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
            }}
          >
            {svgLHSectionLine()}
            {svgHCSectionLine()}
          </svg>
          <div
            className={cx("section-label")}
            style={{ position: "relative", userSelect: "none", zIndex: 3 }}
          >
            LC
          </div>
          <XYTrack
            thumbSize={{ width: 20, height: 20 }}
            style={{ position: "relative", zIndex: 4 }}
          >
            <XYThumb
              debug={true}
              val={{ x: l, y: c }}
              min={{ x: 0, y: 0 }}
              max={{ x: 1, y: 0.4 }}
              step={{ x: 0.001, y: 0.001 }}
              onChange={({ x, y }) => {
                setL(x);
                setC(y);
              }}
              constraintVal={({ x, y }) => {
                if (isInGamut([x, y, lerpHue(hBegin, hEnd, x)]))
                  return { x, y };
                const maxChroma = findMaxChroma(x, lerpHue(hBegin, hEnd, x));
                const quantizedMaxChroma = quantize(maxChroma, 0.001);
                return { x, y: quantizedMaxChroma };
              }}
            />
          </XYTrack>
        </div>
        <div className={cx("gamut-slider")}>
          <GamutGl
            className={cx("gamut-gl")}
            lMapping={{ mappedTo: "none", flipped: "none", from: l, to: l }}
            cMapping={{ mappedTo: "y", flipped: "none", from: 0, to: 0.4 }}
            hMapping={{ mappedTo: "x", flipped: "none", from: 0, to: 360 }}
            style={{
              position: "absolute",
              zIndex: 1,
              inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
            }}
          />
          <svg
            viewBox="0 0 100 100"
            style={{
              display: "block",
              position: "absolute",
              zIndex: 2,
              inset: `${(0.5 * 20) / 16.0}rem ${(0.5 * 20) / 16.0}rem`,
            }}
          >
            {svgLHSectionLine()}
          </svg>
          <div
            className={cx("section-label")}
            style={{ position: "relative", userSelect: "none", zIndex: 3 }}
          >
            HC
          </div>
          <XYTrack
            thumbSize={{ width: 20, height: 20 }}
            style={{ position: "relative", zIndex: 4 }}
          >
            <XYThumb
              idx={0}
              val={{ x: h, y: c }}
              min={{ x: 0, y: 0 }}
              max={{ x: 360, y: 0.4 }}
              step={{ x: 0.1, y: 0.001 }}
              onChange={({ x, y }) => {
                onChangeH(x);
                setC(y);
              }}
            />
          </XYTrack>
        </div>
      </div>
    </>
  );
};
export default XYSliderTest;
