import { useState } from "react";
import AuthForm from "./auth/AuthForm";

export default function App() {
  const [token, setToken] = useState<string | null>(null);

  if (token) {
    return (
      <div className="auth-card">
        <h1>Connecté</h1>
        <p>Token JWT reçu.</p>
        <button type="button" onClick={() => setToken(null)}>
          Se déconnecter
        </button>
      </div>
    );
  }

  return <AuthForm onAuthenticated={setToken} />;
}
