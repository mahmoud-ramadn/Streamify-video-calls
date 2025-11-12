import { lazy } from "react";
import { Routes } from "react-router";
import { Route } from "react-router";
const HomePage = lazy(() => import("./pages/Home"));
const CallPage = lazy(() => import("./pages/CallPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
import { Toaster } from "react-hot-toast";
import { Navigate } from "react-router";
import useAuthUser from "./hooks/useAuthUser";
import PageLoader from "./components/PageLoader";
import Layout from "./components/Layout";
import { useThemeStore } from "./store/useThemeStore";
export default function App() {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  console.log(theme);

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="h-screen " data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
}
