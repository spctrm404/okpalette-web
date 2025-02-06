import { Routes, Route } from "react-router-dom";

import { TopNav } from "@/components/TopNav";
import { Home } from "@/pages/Home";
import { GreyExperiments } from "@/pages/GreyExperiments";
import { OklabExperiments } from "@/pages/OklabExperiments";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TopNav />}>
        <Route index element={<Home />} />
        <Route path="/grey-experiments" element={<GreyExperiments />} />
        <Route path="/oklab-experiments" element={<OklabExperiments />} />
      </Route>
    </Routes>
  );
};

export default App;
