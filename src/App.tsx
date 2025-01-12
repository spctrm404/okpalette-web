import CurveEditor from "./component/CurveEditor";
import GamutGl from "./component/GamutGL/GammutGl";

import "./App.css";
import { useState } from "react";

function App() {
  const [l, setL] = useState(0.8);
  const [c, setC] = useState(0.2);
  const [hFrom, setHFrom] = useState(120);
  const [hTo, setHTo] = useState(240);
  return (
    <>
      <div>
        <input
          type="range"
          name="l"
          min={0}
          max={1}
          step={0.001}
          onChange={(e) => {
            setL(e.currentTarget.valueAsNumber);
          }}
        />
        <input
          type="range"
          name="c"
          min={0}
          max={0.4}
          step={0.001}
          onChange={(e) => {
            setC(e.currentTarget.valueAsNumber);
          }}
        />
        <input
          type="range"
          name="hFrom"
          min={0}
          max={360}
          step={1}
          onChange={(e) => {
            setHFrom(e.currentTarget.valueAsNumber);
          }}
        />
        <input
          type="range"
          name="hTo"
          min={0}
          max={360}
          step={1}
          onChange={(e) => {
            setHTo(e.currentTarget.valueAsNumber);
          }}
        />
      </div>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(300px, 1fr))",
          gridTemplateRows: "repeat(2, minmax(150px, 200px))",
        }}
      >
        <GamutGl
          lMapping={{ mappedTo: "x", flipped: false, from: 0, to: 1 }}
          cMapping={{ mappedTo: "y", flipped: false, from: 0, to: 0.4 }}
          hMapping={{ mappedTo: "x", flipped: false, from: hFrom, to: hTo }}
          gamut="displayP3"
        />
        <GamutGl
          lMapping={{ mappedTo: "none", flipped: false, from: l, to: 1 }}
          cMapping={{ mappedTo: "y", flipped: false, from: 0, to: 0.4 }}
          hMapping={{ mappedTo: "x", flipped: false, from: 0, to: 360 }}
          gamut="displayP3"
        />
        <GamutGl
          lMapping={{ mappedTo: "x", flipped: false, from: 0, to: 1 }}
          cMapping={{ mappedTo: "y", flipped: false, from: 0, to: 0.4 }}
          hMapping={{ mappedTo: "x", flipped: false, from: 120, to: 240 }}
          gamut="displayP3"
        />
        <GamutGl
          lMapping={{ mappedTo: "y", flipped: false, from: 0, to: 1 }}
          cMapping={{ mappedTo: "none", flipped: false, from: c, to: 0 }}
          hMapping={{ mappedTo: "x", flipped: false, from: 0, to: 360 }}
          gamut="displayP3"
        />
      </div>
    </>
  );
}

export default App;
