import { createHashRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./AppShell";
import { Dashboard } from "../pages/Dashboard";
import { Projects } from "../pages/Projects";
import { Studio, Lab, Knowledge, Progress } from "../pages/Placeholders";
import { System } from "../pages/System";

// Hash routing keeps every page reachable offline from the single cached index.html.
const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/projects", element: <Projects /> },
      { path: "/studio", element: <Studio /> },
      { path: "/lab", element: <Lab /> },
      { path: "/knowledge", element: <Knowledge /> },
      { path: "/progress", element: <Progress /> },
      { path: "/system", element: <System /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
