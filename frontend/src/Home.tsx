import { useEffect, useRef, useState } from "react";
import AuthWidget from "./auth/AuthWidget";
import Board from "./game/Board";
import RulesModal from "./game/RulesModal";
import { buildStartingBoard } from "./game/demoBoard";
import PlayModal from "./lobby/PlayModal";
import HistoryModal from "./lobby/HistoryModal";
import ThemeToggle from "./ui/ThemeToggle";
import BackgroundBlobs from "./ui/BackgroundBlobs";
import Toast from "./ui/Toast";
import BracketButton from "./ui/BracketButton";
import PrivacyPolicyModal from "./legal/PrivacyPolicyModal";
import TermsOfServiceModal from "./legal/TermsOfServiceModal";
import ProfileModal from "./profile/ProfileModal";
import { listFriends, type Friend } from "./profile/api";
import ChatWidget from "./social/ChatWidget";
import { useGlobalSocket } from "./social/useGlobalSocket";

type Popup = "play" | "history" | "rules" | "privacy" | "terms" | "profile" | null;

const FRIENDS_POLL_INTERVAL_MS = 15000;

interface HomeProps {
  token: string | null;
  username: string | null;
  onAuthenticated: (token: string, username: string) => void;
  onLogout: () => void;
  onOpenGame: (gameId: number) => void;
  onUsernameChange: (username: string) => void;
}

const DEMO_BOARD = buildStartingBoard(8);

export default function Home({
  token,
  username,
  onAuthenticated,
  onLogout,
  onOpenGame,
  onUsernameChange,
}: HomeProps) {
  const [popup, setPopup] = useState<Popup>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const knownFriendIds = useRef<Set<number> | null>(null);
  const { onlineStatus, messages, sendMessage, error: chatError, syncOnlineStatus } = useGlobalSocket(token);

  useEffect(() => {
    knownFriendIds.current = null;
    if (!token) return;

    async function poll() {
      try {
        const friends = await listFriends(token!);
        setFriends(friends);
        syncOnlineStatus(Object.fromEntries(friends.map((f) => [f.id, f.online])));
        const ids = new Set(friends.map((f) => f.id));
        if (knownFriendIds.current) {
          for (const friend of friends) {
            if (!knownFriendIds.current.has(friend.id)) {
              const toastId = Date.now() + friend.id;
              setToasts((prev) => [...prev, { id: toastId, message: `${friend.username} t'a ajouté en ami !` }]);
              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toastId));
              }, 5000);
            }
          }
        }
        knownFriendIds.current = ids;
      } catch {
        // Silently ignore polling errors; will retry on the next tick.
      }
    }

    poll();
    const interval = setInterval(poll, FRIENDS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden p-6 sm:p-10">
      <BackgroundBlobs />
      <header className="relative z-20 flex items-start justify-between">
        <h1 className="m-0 text-2xl font-bold">Breakprout</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthWidget
            token={token}
            username={username}
            onAuthenticated={onAuthenticated}
            onLogout={onLogout}
            onOpenProfile={() => setPopup("profile")}
          />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center py-8">
        <div
          className="relative w-[min(560px,90vw)]"
          style={{ perspective: "1400px" }}
        >
          <div
            className="rounded-xl shadow-[0_50px_90px_-25px_rgba(0,0,0,0.75)]"
            style={{ transform: "rotateX(55deg)", transformStyle: "preserve-3d" }}
          >
            <Board boardState={DEMO_BOARD} selectedCell={null} legalCells={[]} onCellClick={() => {}} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setPopup("play")}
              className="cursor-pointer rounded-full bg-brand px-10 py-5 text-xl font-bold text-white shadow-overlay"
            >
              Jouer
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex items-end justify-between">
        <BracketButton onClick={() => setPopup("history")}>Historique</BracketButton>
        <BracketButton onClick={() => setPopup("rules")}>Règles</BracketButton>
      </footer>

      <footer className="relative z-10 mt-4 flex items-center justify-center gap-4 text-xs text-status-finished">
        <button
          type="button"
          onClick={() => setPopup("privacy")}
          className="cursor-pointer bg-transparent underline-offset-2 hover:underline"
        >
          Politique de confidentialité
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => setPopup("terms")}
          className="cursor-pointer bg-transparent underline-offset-2 hover:underline"
        >
          Conditions d'utilisation
        </button>
      </footer>

      {popup === "play" && (
        <PlayModal token={token} onClose={() => setPopup(null)} onOpenGame={onOpenGame} />
      )}
      {popup === "history" && (
        <HistoryModal token={token} onClose={() => setPopup(null)} onOpenGame={onOpenGame} />
      )}
      {popup === "rules" && <RulesModal onClose={() => setPopup(null)} />}
      {popup === "privacy" && <PrivacyPolicyModal onClose={() => setPopup(null)} />}
      {popup === "terms" && <TermsOfServiceModal onClose={() => setPopup(null)} />}
      {popup === "profile" && token && (
        <ProfileModal token={token} onClose={() => setPopup(null)} onUpdated={onUsernameChange} />
      )}

      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} />
        ))}
      </div>

      {token && (
        <ChatWidget
          friends={friends}
          onlineStatus={onlineStatus}
          messages={messages}
          onSend={sendMessage}
          error={chatError}
        />
      )}
    </div>
  );
}
