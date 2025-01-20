import { Routes, Route } from "react-router-dom";

import { TopNav } from "@/components/TopNav";
import { Home } from "@/pages/Home";
import { Test } from "@/pages/Test";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TopNav />}>
        <Route index element={<Home />} />
        <Route path="/test" element={<Test />} />
      </Route>
    </Routes>
  );
};

export default App;
