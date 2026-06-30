import { useState } from "react";
import AuthForm from "./auth/AuthForm";
import Lobby from "./lobby/Lobby";
import GameScreen from "./game/GameScreen";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);

  function handleAuthenticated(newToken: string, newUsername: string) {
    setToken(newToken);
    setUsername(newUsername);
  }

  if (!token || !username) {
    return <AuthForm onAuthenticated={handleAuthenticated} />;
  }

  if (gameId !== null) {
    return (
      <GameScreen
        gameId={gameId}
        token={token}
        username={username}
        onBack={() => setGameId(null)}
      />
    );
  }

  return (
    <Lobby
      token={token}
      onLogout={() => {
        setToken(null);
        setUsername(null);
      }}
      onOpenGame={setGameId}
    />
  );
}
