
import { useEffect, useState } from "react";
import "./StudentDashboard.css";

const API = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("attendanceToken");
}

export default function StudentDashboard({ onLogout }) {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      setError("");

      try {
        const token = getToken();

        if (!token) {
          throw new Error("Please log in to continue.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, attendanceResponse] =
          await Promise.all([
            fetch(`${API}/student/me`, { headers }),
            fetch(
              `${API}/student/me/attendance?month=${month}`,
              { headers }
            ),
          ]);

        if (
          profileResponse.status === 401 ||
          profileResponse.status === 403 ||
          attendanceResponse.status === 401 ||
          attendanceResponse.status === 403
        ) {
          throw new Error(
            "Your session is invalid. Please log in again."
          );
        }

        if (!profileResponse.ok || !attendanceResponse.ok) {
          throw new Error(
            "Student data could not be loaded. Check the backend API."
          );
        }

        const profileData = await profileResponse.json();
        const attendanceData = await attendanceResponse.json();

        setStudent(profileData.student);
        setAttendance(attendanceData.attendance || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [month]);

  const present = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absent = attendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const late = attendance.filter(
    (item) => item.status === "Late"
  ).length;

  const total = attendance.length;
  const percentage = total
    ? ((present / total) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="student-loading">
        <div className="student-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-error-page">
        <div className="student-error-card">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
          {onLogout && (
            <button className="secondary-btn" onClick={onLogout}>
              Log Out
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!student) {
    return <p className="student-error">Student profile not found.</p>;
  }

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <div className="student-brand">
          <span className="brand-icon">A</span>
          <div>
            <strong>AttendEase</strong>
            <small>Student Portal</small>
          </div>
        </div>

        <nav className="student-nav">
          <a className="active" href="#overview">▦ Overview</a>
          <a href="#profile">♙ My Profile</a>
          <a href="#history">▤ Attendance History</a>
          <a href="#reports">▥ Monthly Reports</a>
        </nav>

        <div className="sidebar-bottom">
          <p>Student Account</p>
          <button onClick={onLogout}>↪ Log Out</button>
        </div>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div>
            <p className="eyebrow">STUDENT PORTAL</p>
            <h1>My Dashboard</h1>
            <p className="muted">
              View your profile and attendance records.
            </p>
          </div>

          <div className="student-avatar">
            {(student.name || "S").charAt(0).toUpperCase()}
          </div>
        </header>

        <section className="welcome-card" id="overview">
          <div>
            <p className="welcome-label">WELCOME BACK 👋</p>
            <h2>Hello, {student.name}!</h2>
            <p>
              Here's your attendance summary for the selected month.
            </p>
          </div>
          <div className="welcome-decoration">✓</div>
        </section>

        <section className="student-stats">
          <article className="student-stat percentage-stat">
            <span className="stat-symbol">%</span>
            <p>Attendance Percentage</p>
            <h2>{percentage}%</h2>
            <small>For the selected month</small>
          </article>

          <article className="student-stat">
            <span className="stat-symbol green">✓</span>
            <p>Present Classes</p>
            <h2>{present}</h2>
            <small>Marked present</small>
          </article>

          <article className="student-stat">
            <span className="stat-symbol red">×</span>
            <p>Absent Classes</p>
            <h2>{absent}</h2>
            <small>Marked absent</small>
          </article>

          <article className="student-stat">
            <span className="stat-symbol amber">◷</span>
            <p>Late Classes</p>
            <h2>{late}</h2>
            <small>Marked late</small>
          </article>
        </section>

        <section className="student-content-grid">
          <article className="student-panel" id="profile">
            <div className="panel-heading">
              <div>
                <h2>My Information</h2>
                <p>Your registered student details</p>
              </div>
              <span className="profile-badge">Student</span>
            </div>

            <div className="profile-avatar">
              {(student.name || "S").charAt(0).toUpperCase()}
            </div>

            <h3 className="profile-name">{student.name}</h3>
            <p className="profile-roll">
              Roll No: {student.rollNumber}
            </p>

            <div className="profile-details">
              <div>
                <span>Course</span>
                <strong>{student.course || "Not provided"}</strong>
              </div>
              <div>
                <span>Semester</span>
                <strong>{student.semester || "Not provided"}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{student.email || "Not provided"}</strong>
              </div>
            </div>
          </article>

          <article className="student-panel" id="reports">
            <div className="panel-heading">
              <div>
                <h2>Monthly Report</h2>
                <p>Your attendance for a selected month</p>
              </div>
            </div>

            <label className="month-label" htmlFor="attendance-month">
              Select Month
            </label>
            <input
              id="attendance-month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />

            <div className="report-total">
              <span>Total marked classes</span>
              <strong>{total}</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(Number(percentage), 100)}%`,
                }}
              />
            </div>

            <p className="report-note">
              {total === 0
                ? "No attendance records found for this month."
                : `${percentage}% of marked classes attended.`}
            </p>
          </article>
        </section>

        <section className="student-panel history-panel" id="history">
          <div className="panel-heading history-heading">
            <div>
              <h2>Attendance History</h2>
              <p>Your date-wise attendance records</p>
            </div>
            <span className="record-count">{total} records</span>
          </div>

          <div className="attendance-table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="empty-state">
                      No records found for this month.
                    </td>
                  </tr>
                ) : (
                  [...attendance]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((item) => (
                      <tr key={item._id}>
                        <td>
                          {new Date(
                            `${item.date}T00:00:00`
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${(
                              item.status || ""
                            ).toLowerCase()}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="student-footer">
          AttendEase · Student Attendance Portal
        </footer>
      </main>
    </div>
  );
}
