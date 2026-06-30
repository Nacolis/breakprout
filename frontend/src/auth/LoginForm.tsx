import { useState, type FormEvent } from "react";
import { login, ApiError } from "./api";

interface LoginFormProps {
  onAuthenticated: (token: string, username: string) => void;
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
      onAuthenticated(token, username);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1.5 text-sm">
        Nom d'utilisateur
        <input
          className="rounded-md border border-edge bg-surface p-2 text-base text-ink"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={1}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Mot de passe
        <input
          className="rounded-md border border-edge bg-surface p-2 text-base text-ink"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={1}
        />
      </label>

      {error && <p className="m-0 text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 cursor-pointer rounded-md bg-brand p-2.5 font-semibold text-white disabled:cursor-default disabled:opacity-60"
      >
        {loading ? "..." : "Se connecter"}
      </button>
    </form>
  );
}
