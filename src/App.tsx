import CurveEditor from "./component/CurveEditor";
import GamutGl from "./component/GamutGL/GammutGl";

import "./App.css";

function App() {
  const getGammaCurveValue = ({ gamma = 2.2, x = 0 }) => {
    return Math.pow(x, gamma);
  };

  const svgGammaCurve = ({
    gamma = 2.2,
    resolution = 100,
    width = 100,
    height = 100,
  }) => {
    const points = Array.from({ length: resolution + 1 }, (_, idx) => {
      const x = idx / resolution;
      const y = getGammaCurveValue({ gamma, x });
      return { x, y };
    });
    const dInit = "";
    const d = points.reduce((d, aPoint, idx) => {
      return idx === 0
        ? `M ${aPoint.x * width},${(1 - aPoint.y) * height}`
        : `${d} L ${aPoint.x * width},${(1 - aPoint.y) * height}`;
    }, dInit);
    return (
      <svg width={width} height={height} style={{ border: "1px solid black" }}>
        <path d={d} fill="none" stroke="blue" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <>
      {svgGammaCurve({})}
      <CurveEditor />
      <GamutGl
        lMapping={{ mappedTo: "x", flipped: false }}
        cMapping={{ mappedTo: "y", flipped: true }}
        hMapping={{ mappedTo: "x", flipped: false }}
        hues={{ from: 0, to: 1 }}
        gamut="displayP3"
      />
    </>
  );
}

export default App;
