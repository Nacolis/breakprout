import { useEffect, useState } from "react";
import Home from "./Home";
import GameScreen from "./game/GameScreen";
import { buildCookieAuthToken } from "./jwt";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);

  function handleAuthenticated(newToken: string, newUsername: string) {
    setToken(newToken);
    setUsername(newUsername);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthUsername = params.get("username");
    const oauthId = params.get("id");
    if (oauthUsername && oauthId) {
      handleAuthenticated(buildCookieAuthToken(Number(oauthId)), oauthUsername);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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
