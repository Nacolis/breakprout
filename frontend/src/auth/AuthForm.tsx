import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Mode = "login" | "register";

interface AuthFormProps {
  onAuthenticated: (token: string) => void;
}

export default function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [info, setInfo] = useState<string | null>(null);

  return (
    <div className="auth-card">
      <h1>Breakprout</h1>
      <div className="auth-tabs">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => {
            setMode("login");
            setInfo(null);
          }}
        >
          Connexion
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => {
            setMode("register");
            setInfo(null);
          }}
        >
          Inscription
        </button>
      </div>

      {info && <p className="auth-info">{info}</p>}

      {mode === "login" ? (
        <LoginForm onAuthenticated={onAuthenticated} />
      ) : (
        <RegisterForm
          onRegistered={() => {
            setInfo("Compte créé, tu peux te connecter.");
            setMode("login");
          }}
        />
      )}
    </div>
  );
}
