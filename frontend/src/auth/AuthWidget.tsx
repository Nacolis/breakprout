import { useState } from "react";
import AuthForm from "./AuthForm";
import BracketButton from "../ui/BracketButton";

interface AuthWidgetProps {
  token: string | null;
  username: string | null;
  onAuthenticated: (token: string, username: string) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export default function AuthWidget({
  token,
  username,
  onAuthenticated,
  onLogout,
  onOpenProfile,
}: AuthWidgetProps) {
  const [open, setOpen] = useState(false);

  if (token && username) {
    return (
      <div className="flex items-center gap-3">
        <BracketButton onClick={onOpenProfile}>{username}</BracketButton>
        <BracketButton onClick={onLogout}>Se déconnecter</BracketButton>
      </div>
    );
  }

  return (
    <div className="relative">
      <BracketButton onClick={() => setOpen((o) => !o)}>Se connecter</BracketButton>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2">
          <AuthForm
            onAuthenticated={(t, u) => {
              onAuthenticated(t, u);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
