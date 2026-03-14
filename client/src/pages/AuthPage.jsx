import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { setCredentials } from "../store/slices/authSlice.js";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  .nf-root {
    background: #0d0d0d;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }
  .nf-glow {
    position: fixed;
    top: -120px; right: -120px;
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }
  .nf-card {
    width: 100%;
    max-width: 390px;
    background: #161616;
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 18px;
    padding: 2rem 1.75rem;
    position: relative;
    z-index: 1;
    box-sizing: border-box;
  }
  .nf-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 1.75rem;
  }
  .nf-mark {
    width: 30px; height: 30px;
    background: #d4af37;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .nf-mark svg { width: 14px; height: 14px; }
  .nf-brand-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.1em;
  }
  .nf-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 300;
    color: #ffffff;
    line-height: 1.2;
    margin: 0 0 4px;
  }
  .nf-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.38);
    font-weight: 300;
    margin: 0 0 1.5rem;
  }
  .nf-tabs {
    display: flex;
    background: #1f1f1f;
    border-radius: 9px;
    padding: 3px;
    gap: 3px;
    margin-bottom: 1.5rem;
  }
  .nf-tab {
    flex: 1;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.38);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    padding: 9px 0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.18s ease;
    letter-spacing: 0.02em;
    -webkit-tap-highlight-color: transparent;
  }
  .nf-tab.on {
    background: #d4af37;
    color: #0d0d0d;
    font-weight: 600;
  }
  .nf-field { margin-bottom: 0.9rem; }
  .nf-label {
    display: block;
    font-size: 10px;
    font-weight: 500;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .nf-input {
    width: 100%;
    background: #1f1f1f;
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 9px;
    padding: 12px 13px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 300;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.18s;
    -webkit-appearance: none;
  }
  .nf-input::placeholder { color: rgba(255,255,255,0.18); }
  .nf-input:focus { border-color: rgba(212,175,55,0.6); }
  .nf-btn {
    width: 100%;
    margin-top: 1.25rem;
    background: #d4af37;
    border: none;
    border-radius: 9px;
    padding: 14px;
    color: #0d0d0d;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.18s, transform 0.12s;
    -webkit-tap-highlight-color: transparent;
  }
  .nf-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .nf-btn:active { transform: translateY(0); }
  .nf-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
  .nf-sep {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 1.25rem 0;
  }
  .nf-sep-line { flex: 1; height: 0.5px; background: rgba(255,255,255,0.07); }
  .nf-sep-txt { font-size: 11px; color: rgba(255,255,255,0.2); letter-spacing: 0.08em; white-space: nowrap; }
  .nf-socials { display: flex; gap: 8px; }
  .nf-social {
    flex: 1;
    background: #1f1f1f;
    border: 0.5px solid rgba(255,255,255,0.08);
    border-radius: 9px;
    padding: 11px 8px;
    color: rgba(255,255,255,0.45);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: border-color 0.18s, color 0.18s;
    -webkit-tap-highlight-color: transparent;
  }
  .nf-social:hover { border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.7); }
  .nf-foot {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 12px;
    color: rgba(255,255,255,0.22);
  }
  .nf-foot-link {
    color: #d4af37;
    background: none; border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  @media (max-width: 400px) {
    .nf-card { padding: 1.5rem 1.25rem; border-radius: 14px; }
    .nf-heading { font-size: 24px; }
  }
`;

const GoogleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLogin = mode === "login";

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      dispatch(setCredentials(data));
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="nf-root">
        <div className="nf-glow" />
        <div className="nf-card">

          <div className="nf-brand">
            <div className="nf-mark">
              <svg viewBox="0 0 14 14" fill="none">
                <path d="M7 1L9 5.5H13L9.5 8L11 13L7 10L3 13L4.5 8L1 5.5H5L7 1Z" fill="#0d0d0d" />
              </svg>
            </div>
            <span className="nf-brand-name">NOORFIT</span>
          </div>

          <h1 className="nf-heading">
            {isLogin ? "Welcome back." : "Join NoorFit."}
          </h1>
          <p className="nf-sub">
            {isLogin ? "Sign in to continue shopping" : "Create your account today"}
          </p>

          <div className="nf-tabs">
            <button
              type="button"
              className={`nf-tab${isLogin ? " on" : ""}`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`nf-tab${!isLogin ? " on" : ""}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {!isLogin && (
            <div className="nf-field">
              <label className="nf-label">Full Name</label>
              <input
                className="nf-input"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div className="nf-field">
            <label className="nf-label">Email</label>
            <input
              className="nf-input"
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="nf-field">
            <label className="nf-label">Password</label>
            <input
              className="nf-input"
              type="password"
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="button"
            className="nf-btn"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
          </button>

          <div className="nf-sep">
            <div className="nf-sep-line" />
            <span className="nf-sep-txt">or continue with</span>
            <div className="nf-sep-line" />
          </div>

          <div className="nf-socials">
            <button type="button" className="nf-social">
              <GoogleIcon /> Google
            </button>
            <button type="button" className="nf-social">
              <GitHubIcon /> GitHub
            </button>
          </div>

          <p className="nf-foot">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="nf-foot-link"
              onClick={() => setMode(isLogin ? "register" : "login")}
            >
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>

        </div>
      </div>
    </>
  );
}