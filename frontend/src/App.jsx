import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import JobPage from "./pages/JobPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import ChatPage from "./pages/ChatPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Recruiter Pages
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateJobPage from "./pages/CreateJobPage";
import EditJobPage from "./pages/EditJobPage";
import ManageJobsPage from "./pages/ManageJobsPage";
import ManageApplicationsPage from "./pages/ManageApplicationsPage";
import JobApplicantsPage from "./pages/JobApplicantsPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminJobsPage from "./pages/AdminJobsPage";
import AdminConversationsPage from "./pages/AdminConversationsPage";
import AdminAuditLogsPage from "./pages/AdminAuditLogsPage";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoutes";
import RoleRoute from "./components/RoleRoutes";
import CompanyGuard from "./components/CompanyGuard";
import ProfileGuard from "./components/ProfileGuard";
import PersistLogin from "./components/PersistLogin";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import OnboardingPage from "./pages/OnboardingPage";

// Company Pages
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import ManageCompanyPage from "./pages/ManageCompanyPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
      <PersistLogin>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Global Protected Dispatcher Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Global Protected Shared Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Onboarding Route (job_seeker only, no ProfileGuard to avoid redirect loop) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["job_seeker"]}>
                  <OnboardingPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Job Seeker Protected Routes (gated by ProfileGuard for mandatory onboarding) */}
          <Route
            path="/dashboard/job-seeker"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["job_seeker"]}>
                  <ProfileGuard>
                    <JobSeekerDashboard />
                  </ProfileGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["job_seeker"]}>
                  <ProfileGuard>
                    <JobPage />
                  </ProfileGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <ProfileGuard>
                  <JobDetailsPage />
                </ProfileGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["job_seeker"]}>
                  <ProfileGuard>
                    <ApplicationsPage />
                  </ProfileGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["job_seeker"]}>
                  <ProfileGuard>
                    <ResumeAnalyzerPage />
                  </ProfileGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume/analyzer"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["job_seeker"]}>
                  <ProfileGuard>
                    <ResumeAnalyzerPage />
                  </ProfileGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Company Registration (public within recruiter - no CompanyGuard) */}
          <Route
            path="/recruiter/company/register"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyRegisterPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Recruiter Protected Routes (gated by CompanyGuard) */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyGuard>
                    <RecruiterDashboard />
                  </CompanyGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/company"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyGuard>
                    <ManageCompanyPage />
                  </CompanyGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyGuard>
                    <ManageJobsPage />
                  </CompanyGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/new"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyGuard>
                    <CreateJobPage />
                  </CompanyGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:id/edit"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyGuard>
                    <EditJobPage />
                  </CompanyGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/applications"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyGuard>
                    <ManageApplicationsPage />
                  </CompanyGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:id/applications"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyGuard>
                    <JobApplicantsPage />
                  </CompanyGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/applications/:applicationId"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["recruiter"]}>
                  <CompanyGuard>
                    <CandidateProfilePage />
                  </CompanyGuard>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminUsersPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminJobsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/conversations"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminConversationsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminAuditLogsPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PersistLogin>
    </BrowserRouter>
  );
}

export default App;