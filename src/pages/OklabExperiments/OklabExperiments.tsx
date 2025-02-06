import { useCallback, useEffect, useRef, useState } from "react";
import st from "./_OklabExperiments.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

const OklabExperiments = () => {
  const [rgb, setRgb] = useState([0, 0, 0]);
  const [oklch, setOklch] = useState([0, 0, 0]);

  return (
    <>
      <input
        type="number"
        min={0}
        max={1}
        step={0.001}
        value={rgb[0]}
        onChange={() => {}}
      />
      <input
        type="number"
        min={0}
        max={1}
        step={0.001}
        value={rgb[1]}
        onChange={() => {}}
      />
      <input
        type="number"
        min={0}
        max={1}
        step={0.001}
        value={rgb[2]}
        onChange={() => {}}
      />
      <div></div>
    </>
  );
};

export default OklabExperiments;
