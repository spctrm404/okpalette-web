import { Link, Outlet } from "react-router-dom";

const TopNav = () => {
  return (
    <div>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ marginRight: "10px" }}>
          Home
        </Link>
        <Link to="/grey-experiments" style={{ marginRight: "10px" }}>
          Grey Experiments
        </Link>
        <Link to="/oklab-experiments" style={{ marginRight: "10px" }}>
          oklab Experiments
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default TopNav;
