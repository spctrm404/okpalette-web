import { Routes, Route } from "react-router-dom";

import { TopNav } from "@/components/TopNav";
import { Home } from "@/pages/Home";
import { GreyExperiments } from "@/pages/GreyExperiments";
import { OklabExperiments } from "@/pages/OklabExperiments";
import { XYSliderTest } from "@/pages/XYSliderTest";
import { GamutSlider } from "@/pages/GamutSlider";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TopNav />}>
        <Route index element={<Home />} />
        <Route path="/grey-experiments" element={<GreyExperiments />} />
        <Route path="/oklab-experiments" element={<OklabExperiments />} />
        <Route path="/xyslider-test" element={<XYSliderTest />} />
        <Route path="/gamut-slider" element={<GamutSlider />} />
      </Route>
    </Routes>
  );
};

export default App;
