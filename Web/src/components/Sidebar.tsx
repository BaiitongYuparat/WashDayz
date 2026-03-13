import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-[250px] h-screen bg-blue-100 shadow-md p-5">

      <label className="text-blue-900 text-3xl font-bold">
        WashDayZ
      </label>

      <ul className="list-none p-0 mt-6 space-y-3">

        <li>
          <NavLink
            to="/user"
            className={({ isActive }) =>
              `block py-2 transition ${
                isActive
                  ? "text-blue-400 font-bold text-2xl"
                  : "text-gray-500 text-lg hover:text-blue-400"
              }`
            }
          >
            User
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/rider"
            className={({ isActive }) =>
              `block py-2 transition ${
                isActive
                  ? "text-blue-400 font-bold text-2xl"
                  : "text-gray-500 text-lg hover:text-blue-400"
              }`
            }
          >
            Rider
          </NavLink>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;