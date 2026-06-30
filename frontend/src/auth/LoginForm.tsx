import { useState, type FormEvent } from "react";
import { login, ApiError } from "./api";

interface LoginFormProps {
  onAuthenticated: (token: string) => void;
}

export default function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await login(username, password);
      console.log("Connexion réussie:", username, password);
      onAuthenticated(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nom d'utilisateur
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={1}
        />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={1}
        />
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "..." : "Se connecter"}
      </button>
    </form>
  );
}
