import { useState, type FormEvent } from "react";
import { register, ApiError } from "./api";

interface RegisterFormProps {
  onRegistered: () => void;
}

export default function RegisterForm({ onRegistered }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(username, password);
      console.log("Inscription réussie:", username, password);
      onRegistered();
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
        {loading ? "..." : "Créer le compte"}
      </button>
    </form>
  );
}
