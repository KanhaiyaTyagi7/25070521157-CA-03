
import { useState } from "react";
import Login from "./Login.jsx";
import App from "./App.jsx";
import StudentDashboard from "./StudentDashboard.jsx";

export default function Root() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("attendanceToken");
    const user = localStorage.getItem("attendanceUser");

    if (!token || !user) {
      return null;
    }

    try {
      return {
        token,
        user: JSON.parse(user),
      };
    } catch {
      localStorage.removeItem("attendanceToken");
      localStorage.removeItem("attendanceUser");
      return null;
    }
  });

  function handleLogin(data) {
    localStorage.setItem("attendanceToken", data.token);
    localStorage.setItem("attendanceUser", JSON.stringify(data.user));

    setSession({
      token: data.token,
      user: data.user,
    });
  }

  function handleLogout() {
    localStorage.removeItem("attendanceToken");
    localStorage.removeItem("attendanceUser");
    setSession(null);
  }

  // Login page: no active session
  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  // Student login: show student's own dashboard
  if (session.user?.role === "student") {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  // Admin login: show attendance management dashboard
  return (
    <App
      user={session.user}
      onLogout={handleLogout}
    />
  );
}
