import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Mode = "login" | "register";

interface AuthFormProps {
  onAuthenticated: (token: string, username: string) => void;
}

export default function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [info, setInfo] = useState<string | null>(null);

  return (
    <div className="w-80 rounded-xl bg-card p-8 shadow-card">
      <h1 className="mb-6 text-center text-2xl font-bold">Breakprout</h1>
      <div className="mb-6 flex overflow-hidden rounded-lg border border-edge">
        <button
          type="button"
          className={`flex-1 cursor-pointer p-2 text-ink ${mode === "login" ? "bg-brand" : "bg-transparent"}`}
          onClick={() => {
            setMode("login");
            setInfo(null);
          }}
        >
          Connexion
        </button>
        <button
          type="button"
          className={`flex-1 cursor-pointer p-2 text-ink ${mode === "register" ? "bg-brand" : "bg-transparent"}`}
          onClick={() => {
            setMode("register");
            setInfo(null);
          }}
        >
          Inscription
        </button>
      </div>

      {info && <p className="m-0 text-sm text-status-active">{info}</p>}

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
