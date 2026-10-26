
import { useState } from "react";
import "./Login.css";

const API = "http://localhost:5001/api/auth";

export default function Login({ onLogin }) {
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch(
        `${API}/${registering ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (registering) {
        setRegistering(false);
        setPassword("");
        setError("Account created! Please sign in.");
      } else {
        onLogin(data);
      }
    } catch (err) {
      setError(err.message || "Cannot connect to backend.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">A</div>
          <div>
            <strong>AttendEase</strong>
            <span>Attendance Manager</span>
          </div>
        </div>

        <div className="auth-intro">
          <span className="auth-tag">ADMIN WORKSPACE</span>
          <h1>{registering ? "Create your account" : "Welcome back."}</h1>
          <p>
            {registering
              ? "Register your administrator account to get started."
              : "Sign in to manage students and track attendance."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {registering && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete={registering ? "new-password" : "current-password"}
            />
          </label>

          {error && <div className="auth-error" role="status">{error}</div>}

          <button className="auth-submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : registering
                ? "Create account →"
                : "Sign in →"}
          </button>
        </form>

        <div className="auth-switch">
          {registering ? "Already have an account?" : "New administrator?"}
          <button
            type="button"
            onClick={() => {
              setRegistering(!registering);
              setError("");
            }}
          >
            {registering ? "Sign in" : "Create account"}
          </button>
        </div>

        <div className="auth-bottom">
          <span className="secure-dot" />
          Attendance management workspace
        </div>
      </section>

      <aside className="auth-side">
        <div className="side-decoration decoration-one" />
        <div className="side-decoration decoration-two" />

        <div className="side-content">
          <div className="side-pill">STUDENT MANAGEMENT, SIMPLIFIED</div>
          <h2>Every student.<br />Every class.<br /><span>Every record.</span></h2>
          <p>
            Manage your classroom attendance, organize student records
            and stay on top of daily attendance — all in one place.
          </p>

          <div className="side-preview">
            <div className="preview-heading">
              <span>Today's attendance</span>
              <span className="preview-live">● LIVE VIEW</span>
            </div>
            <div className="preview-number">92.4%</div>
            <div className="preview-track"><div /></div>
            <div className="preview-footer">
              <span>✓ Present</span>
              <span>○ Attendance overview</span>
            </div>
          </div>
        </div>

        <div className="side-footer">
          AttendEase <span>·</span> Built for better attendance tracking
        </div>
      </aside>
    </main>
  );
}
