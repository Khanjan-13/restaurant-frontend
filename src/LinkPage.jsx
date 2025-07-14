import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import React from "react";
import Home from "./pages/Home";
import HorizNavbar from "./components/webComponent/HorizNavbar";
import Orders from "./pages/Orders";
import DashboardOrders from "./components/webComponent/Dashboard/DashboardOrders";
import DashboardMenu from "./components/webComponent/Dashboard/DashboardMenu";
import Navbar from "./components/webComponent/Dashboard/Navbar";
import DashboardHome from "./components/webComponent/Dashboard/DashboardHome";
import DashboardMenuManage from "./components/webComponent/Dashboard/DashboardMenuManage";
import Kot from "./components/webComponent/Home/Kot";
import DashboardTable from "./components/webComponent/Dashboard/DashboardTable";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProtectedRoutes from "./pages/ProtectedRoutes";
import DashboardOrdersView from "./components/webComponent/Dashboard/DashboardOrdersView";
import HomeNavbar from "./components/webComponent/Home/HomeNavbar";
import TableSection from "./components/webComponent/Home/TableSection";
import AddStaff from "./components/webComponent/Dashboard/staff/AddStaff";
import LoginStaff from "./components/webComponent/Dashboard/staff/LoginStaff";
import MenuStaff from "./components/webComponent/Dashboard/staff/MenuStaff";
import TableStaff from "./components/webComponent/Dashboard/staff/TableStaff";
const Format = () => {
  return (
    <div>
      <HorizNavbar />
      <Outlet />
    </div>
  );
};

const DashboardFormat = () => {
  return (
    <div className="pt-12 flex flex-1 flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
};
const router = createBrowserRouter([
  {
    path: "/",
    element: <Format />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/kot",
        element: (
          <ProtectedRoutes>
            <Kot />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/orders",
        element: (
          <ProtectedRoutes>
            <Orders />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoutes>
            <DashboardFormat />
          </ProtectedRoutes>
        ),
        children: [
          {
            path: "/dashboard",
            element: (
              <ProtectedRoutes>
                <DashboardHome />
              </ProtectedRoutes>
            ),
          },
          {
            path: "/dashboard/orders",
            element: (
              <ProtectedRoutes>
                <DashboardOrders />
              </ProtectedRoutes>
            ),
          },
          {
            path: "/dashboard/tables",
            element: (
              <ProtectedRoutes>
                <DashboardTable />
              </ProtectedRoutes>
            ),
          },
          {
            path: "/dashboard/menu",
            element: (
              <ProtectedRoutes>
                <DashboardMenu />
              </ProtectedRoutes>
            ),
          },
          {
            path: "/dashboard/menu-manage",
            element: (
              <ProtectedRoutes>
                <DashboardMenuManage />
              </ProtectedRoutes>
            ),
          },
          {
            path: "/dashboard/view-orders/:id",
            element: (
              <ProtectedRoutes>
                <DashboardOrdersView />
              </ProtectedRoutes>
            ),
          },
          {
            path: "/dashboard/staff",
            element: (
              <ProtectedRoutes>
                <AddStaff />
              </ProtectedRoutes>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/dashboard/staff-login",
    element: <LoginStaff />,
  },
  {
    path: "/staff/menu",
    element: <MenuStaff />,
  },
  {
    path: "/staff/table",
    element: <TableStaff />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  // {
  //   path: "*",
  //   element: <Errpage />,
  // },
]);
function LinkPage() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default LinkPage;
