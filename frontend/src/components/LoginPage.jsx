import { useState } from "react";

export default function LoginPage({ onSubmit, onRegister, loading, error, notice, clearError }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    if (isRegister) {
      const created = await onRegister(event, name, email, password);
      if (created) {
        setMode("login");
        setName("");
        setPassword("");
      }
      return;
    }
    onSubmit(event, email, password);
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">B</div>
        <p className="eyebrow">BOOKLEAF PUBLISHING</p>
        <h1>{isRegister ? "Create your account." : "Welcome back."}</h1>
        <p className="muted">
          {isRegister
            ? "Register as an author to manage your publishing journey."
            : "Sign in to manage your publishing journey."}
        </p>

        {notice && <p className="alert success">{notice}</p>}

        <form className="form-stack" onSubmit={handleSubmit}>
          {isRegister && (
            <label>Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
              />
            </label>
          )}
          <label>Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              required
            />
          </label>
          {error && <p className="alert error">{error}<button type="button" onClick={clearError}>Dismiss</button></p>}
          <button className="button primary full" disabled={loading}>
            {loading ? (isRegister ? "Creating account…" : "Signing in…") : (isRegister ? "Create account" : "Sign in")}
          </button>
        </form>

        <p className="login-footnote">
          {isRegister ? "Already have an account? " : "New to BookLeaf? "}
          <button
            type="button"
            className="auth-toggle"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
              clearError();
            }}
          >
            {isRegister ? "Sign in" : "Create an author account"}
          </button>
        </p>
        <p className="login-footnote">Secure access for authors and support administrators.</p>
      </section>
    </main>
  );
}
