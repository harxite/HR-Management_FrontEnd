import EmployeeList from "./pages/MainPage";
import EmployeeDetail from "./pages/EmployeeDetailPage";
import EmployeeUpdate from "./pages/EmployeeUpdatePage";
import Permission from "./pages/pages/PermissionPage";
import EmployeePermissions from "./pages/PermissionListPage";
import SignIn from "./pages/authentication/sign-in";
import DefaultDashboardLayout from "./layouts/DefaultDashboardLayout";
import { ProfilePictureProvider } from "./components/ProfilePictureContext";
import { Routes, Route, Router } from "react-router-dom";
import "./styles/theme.scss";
import AdvanceList from "./pages/pages/AdvanceList";
import Advance from "./pages/pages/AdvancePage";
import Expense from "./pages/pages/ExpensePage";
import ExpenseList from "./pages/ExpenseList";
import { AuthProvider } from "./components/TokenContext";

import ForgetPassword from "./pages/authentication/forget-password";

export default function App() {
  return (
    <>
      <main>
        <AuthProvider >
        <ProfilePictureProvider>
          <Routes>

            <Route path="/" element={<SignIn />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />

            <Route
              path="/emp"
              element={
                <DefaultDashboardLayout>
                  {" "}
                  {<EmployeeList />}
                </DefaultDashboardLayout>
              }
            />
            <Route
              path="/emp-detail"
              element={
                <DefaultDashboardLayout>
                  {" "}
                  {<EmployeeDetail />}
                </DefaultDashboardLayout>
              }
            />
            <Route
              path="/emp-update"
              element={
                <DefaultDashboardLayout>
                  {" "}
                  {<EmployeeUpdate />}
                </DefaultDashboardLayout>
              }
            />
            <Route
              path="/emp-permission"
              element={
                <DefaultDashboardLayout>
                  {" "}
                  {<Permission />}
                </DefaultDashboardLayout>
              }
            />
            <Route
              path="/emp-permission-list"
              element={
                <DefaultDashboardLayout>
                  {" "}
                  {<EmployeePermissions />}
                </DefaultDashboardLayout>
              }
            />
            <Route
              path="/emp-advance"
              element={
                <DefaultDashboardLayout> {<Advance />}</DefaultDashboardLayout>
              }
            />
            <Route
              path="/emp-advance-list"
              element={
                <DefaultDashboardLayout>
                  {" "}
                  {<AdvanceList />}
                </DefaultDashboardLayout>
              }
            />
            <Route
              path="/emp-expense"
              element={
                <DefaultDashboardLayout> {<Expense />}</DefaultDashboardLayout>
              }
            />
            <Route
              path="/emp-expense-list"
              element={
                <DefaultDashboardLayout>
                  {" "}
                  {<ExpenseList />}
                </DefaultDashboardLayout>
              }
            />
            
          </Routes>

        </ProfilePictureProvider>
        </AuthProvider >
        
      </main>
    </>
  );
}
