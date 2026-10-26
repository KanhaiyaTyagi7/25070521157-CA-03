
import { useMemo, useState } from "react";
import "./App.css";

const initialStudents = [];

function App() {
  const [students, setStudents] = useState(initialStudents);
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    course: "B.Tech",
    semester: "3",
    email: "",
  });

  const [notice, setNotice] = useState("");

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        `${student.name} ${student.rollNo}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [students, search]
  );

  const present = students.filter(
    (s) => s.attendance[date] === "Present"
  ).length;

  const absent = students.filter(
    (s) => s.attendance[date] === "Absent"
  ).length;

  const late = students.filter(
    (s) => s.attendance[date] === "Late"
  ).length;

  const marked = present + absent + late;
  const rate = students.length
    ? Math.round((present / students.length) * 100)
    : 0;

  function addStudent(e) {
    e.preventDefault();

    if (
      students.some(
        (s) =>
          s.rollNo.toLowerCase() === form.rollNo.trim().toLowerCase()
      )
    ) {
      setNotice("This roll number already exists.");
      return;
    }

    const student = {
      id: Date.now(),
      ...form,
      name: form.name.trim(),
      rollNo: form.rollNo.trim(),
      attendance: {},
    };

    setStudents((prev) => [...prev, student]);
    setForm({
      name: "",
      rollNo: "",
      course: "B.Tech",
      semester: "3",
      email: "",
    });
    setNotice("Student added successfully.");
  }

  function markAttendance(id, status) {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
              ...student,
              attendance: {
                ...student.attendance,
                [date]: status,
              },
            }
          : student
      )
    );
  }

  function deleteStudent(id) {
    if (!window.confirm("Delete this student?")) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setNotice("Student deleted.");
  }

  function exportCSV() {
    const rows = [
      ["Name", "Roll Number", "Course", "Semester", "Date", "Status"],
      ...filteredStudents.map((s) => [
        s.name,
        s.rollNo,
        s.course,
        s.semester,
        date,
        s.attendance[date] || "Not marked",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const navItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Students", icon: "♙" },
    { name: "Attendance", icon: "✓" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <div className="brand-logo">A</div>
          <div>
            <div className="brand-name">AttendEase</div>
            <div className="brand-caption">RECORD MANAGER</div>
          </div>
        </a>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-link ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {activePage === item.name && (
                <span className="nav-arrow">›</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <strong>Need some help?</strong>
            <p>Manage your class with ease.</p>
          </div>

          <div className="profile">
            <div className="avatar">KT</div>
            <div className="profile-info">
              <strong>Admin</strong>
              <span>Attendance Manager</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / {activePage}</div>
            <div className="welcome">
              Welcome back, Admin <span>✦</span>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="today-badge">
              <span className="calendar-icon">▦</span>
              <span>{new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}</span>
            </div>
            <div className="avatar top-avatar">KT</div>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <div className="eyebrow">OVERVIEW</div>
            <h1>{activePage}</h1>
            <p>
              {activePage === "Students"
                ? "Manage your student directory in one place."
                : activePage === "Attendance"
                ? "Track daily attendance and update student status."
                : "Manage your students and daily attendance."}
            </p>
          </div>

          <div className="date-control">
            <label htmlFor="attendance-date">Attendance date</label>
            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </section>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}

        {activePage === "Dashboard" && (
          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span>Total students</span>
                <span className="stat-icon purple">♙</span>
              </div>
              <div className="stat-value">{students.length}</div>
              <div className="stat-foot">Registered students</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Present</span>
                <span className="stat-icon green">✓</span>
              </div>
              <div className="stat-value">{present}</div>
              <div className="stat-foot">Present on selected date</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Absent</span>
                <span className="stat-icon red">×</span>
              </div>
              <div className="stat-value">{absent}</div>
              <div className="stat-foot">Absent on selected date</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Attendance rate</span>
                <span className="stat-icon blue">↗</span>
              </div>
              <div className="stat-value">{rate}%</div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${rate}%` }}
                />
              </div>
              <div className="stat-foot">Based on present students</div>
            </article>
          </section>
        )}

        {activePage !== "Attendance" && (
          <section className="panel student-panel">
            <div className="panel-heading">
              <div>
                <h2>Add a student</h2>
                <p>Register a student in your class.</p>
              </div>
              <span className="panel-heading-icon">＋</span>
            </div>

            <form onSubmit={addStudent} className="student-form">
              <div className="field">
                <label htmlFor="student-name">Full name *</label>
                <input
                  id="student-name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="roll-number">Roll number *</label>
                <input
                  id="roll-number"
                  required
                  placeholder="e.g. SIT0001"
                  value={form.rollNo}
                  onChange={(e) =>
                    setForm({ ...form, rollNo: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="course">Course</label>
                <select
                  id="course"
                  value={form.course}
                  onChange={(e) =>
                    setForm({ ...form, course: e.target.value })
                  }
                >
                  <option>B.Tech</option>
                  <option>BBA</option>
                  <option>BCA</option>
                  <option>MBA</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  value={form.semester}
                  onChange={(e) =>
                    setForm({ ...form, semester: e.target.value })
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      Semester {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field email-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div className="form-action">
                <button className="primary-button" type="submit">
                  <span>＋</span> Add student
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="panel records-panel">
          <div className="records-heading">
            <div>
              <h2>
                {activePage === "Students"
                  ? "Student directory"
                  : "Attendance records"}
              </h2>
              <p>
                {activePage === "Students"
                  ? "View and manage all registered students."
                  : "Mark attendance for the selected date."}
              </p>
            </div>

            <button
              className="secondary-button export-button"
              onClick={exportCSV}
            >
              <span>↓</span> Export CSV
            </button>
          </div>

          <div className="table-toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                aria-label="Search students"
                placeholder="Search name or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="record-count">
              <span className="count-dot" />
              {filteredStudents.length} students
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>ROLL NUMBER</th>
                  <th>COURSE</th>
                  <th>STATUS</th>
                  {activePage !== "Students" && <th>ACTIONS</th>}
                  <th> </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => {
                  const status = student.attendance[date] || "Not marked";

                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">
                            {student.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="student-meta">
                            <strong>{student.name}</strong>
                            <span>{student.email || "No email provided"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="roll-number">
                          {student.rollNo}
                        </span>
                      </td>
                      <td>
                        <div>{student.course}</div>
                        <span className="subtext">
                          Semester {student.semester}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          <span className="status-dot" />
                          {status}
                        </span>
                      </td>
                      {activePage !== "Students" && (
                        <td>
                          <div className="attendance-actions">
                            <button
                              className={`mark-button mark-present ${
                                status === "Present" ? "selected" : ""
                              }`}
                              onClick={() =>
                                markAttendance(student.id, "Present")
                              }
                            >
                              Present
                            </button>
                            <button
                              className={`mark-button mark-absent ${
                                status === "Absent" ? "selected" : ""
                              }`}
                              onClick={() =>
                                markAttendance(student.id, "Absent")
                              }
                            >
                              Absent
                            </button>
                            <button
                              className={`mark-button mark-late ${
                                status === "Late" ? "selected" : ""
                              }`}
                              onClick={() =>
                                markAttendance(student.id, "Late")
                              }
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      )}
                      <td>
                        <button
                          className="delete-button"
                          title={`Delete ${student.name}`}
                          onClick={() => deleteStudent(student.id)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={activePage === "Students" ? 5 : 6}
                      className="empty-state"
                    >
                      <div className="empty-icon">♙</div>
                      <strong>No students found</strong>
                      <p>
                        Add a student using the form above to get started.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              {marked} of {students.length} students marked for this date
            </span>
            <span>AttendEase · Attendance Manager</span>
          </div>
        </section>

        <footer className="page-footer">
          <span>© {new Date().getFullYear()} AttendEase</span>
          <span>Made for smarter attendance management</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
