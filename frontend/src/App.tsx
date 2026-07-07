import { useState } from "react";
import Home from "./Home";
import GameScreen from "./game/GameScreen";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);

  function handleAuthenticated(newToken: string, newUsername: string) {
    setToken(newToken);
    setUsername(newUsername);
  }

  if (gameId !== null && token && username) {
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
    <Home
      token={token}
      username={username}
      onAuthenticated={handleAuthenticated}
      onLogout={() => {
        setToken(null);
        setUsername(null);
      }}
      onOpenGame={setGameId}
      onUsernameChange={setUsername}
    />
  );
}
