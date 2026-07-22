import { useState, useEffect } from "react";
import { login, register, logout, getProfile, User } from "./services/auth";
import "./App.css";

type View = "login" | "register" | "dashboard";

export default function App() {
  const [view, setView] = useState<View>("login");
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ao carregar a página, tenta recuperar a sessão se já houver token salvo
  useEffect(() => {
    const token = localStorage.getItem("gbit_access_token");
    if (token) {
      getProfile()
        .then((u) => {
          setUser(u);
          setView("dashboard");
        })
        .catch(() => logout());
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const u =
        view === "login"
          ? await login(form.email, form.password)
          : await register(form.name, form.email, form.password);
      setUser(u);
      setView("dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    setUser(null);
    setView("login");
  }

  if (view === "dashboard" && user) {
    return (
      <div className="app-shell">
        <div className="card">
          <h1>Bem-vindo, {user.name} 👋</h1>
          <p className="muted">{user.email}</p>
          <p className="muted">
            Gerado com <b>gbit-react</b> — troque este arquivo em{" "}
            <code>src/App.tsx</code>
          </p>
          <button onClick={handleLogout}>Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <form className="card" onSubmit={handleSubmit}>
        <h1>{view === "login" ? "Entrar" : "Criar conta"}</h1>

        {view === "register" && (
          <input
            type="text"
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Carregando..." : view === "login" ? "Entrar" : "Criar conta"}
        </button>

        <p className="switch">
          {view === "login" ? (
            <>
              Não tem conta?{" "}
              <a onClick={() => setView("register")}>Criar agora</a>
            </>
          ) : (
            <>
              Já tem conta? <a onClick={() => setView("login")}>Entrar</a>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
