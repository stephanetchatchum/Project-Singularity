import { NavLink, Outlet } from "react-router-dom";
import {
  Gauge,
  Library,
  Headphones,
  FlaskConical,
  Sigma,
  LineChart,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { MiniPlayer } from "../components/MiniPlayer";
import { useOnline } from "../components/useOnline";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { to: "/", label: "Mission", icon: Gauge },
  { to: "/projects", label: "Projects", icon: Library },
  { to: "/studio", label: "Studio", icon: Headphones },
  { to: "/lab", label: "Lab", icon: FlaskConical },
  { to: "/knowledge", label: "Knowledge", icon: Sigma },
  { to: "/progress", label: "Progress", icon: LineChart },
];

/** Persistent frame: nav rail, page area, and the always-present mini-player. */
export function AppShell() {
  const online = useOnline();
  return (
    <div className="shell lab-backdrop">
      <nav className="rail" aria-label="Main">
        <div className="rail-mark" aria-hidden="true">
          <span>∂</span>
        </div>
        <ul>
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} end={to === "/"} className="rail-link">
                <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="rail-foot">
          <NavLink to="/system" className="rail-link">
            <Cpu size={20} strokeWidth={1.6} aria-hidden="true" />
            <span>System</span>
          </NavLink>
          <span className={`net-dot ${online ? "on" : "off"}`} role="status">
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </nav>
      <main className="page" id="main">
        <Outlet />
      </main>
      <MiniPlayer />
    </div>
  );
}
