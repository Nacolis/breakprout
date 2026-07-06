import { useEffect, useRef, useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import { SERVER_ORIGIN } from "../apiClient";
import {
  getMe,
  updateUsername,
  uploadAvatar,
  listFriends,
  addFriend,
  removeFriend,
  ApiError,
  type UserProfile,
  type Friend,
} from "./api";
import FriendCard from "./FriendCard";

interface ProfileModalProps {
  token: string;
  onClose: () => void;
  onUpdated: (username: string) => void;
}

export default function ProfileModal({ token, onClose, onUpdated }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [username, setUsername] = useState("");
  const [friendUsername, setFriendUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMe(token)
      .then((u) => {
        setProfile(u);
        setUsername(u.username);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Une erreur est survenue."));
    listFriends(token)
      .then(setFriends)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Une erreur est survenue."));
  }, [token]);

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingUsername(true);
    try {
      const updated = await updateUsername(token, username);
      setProfile(updated);
      onUpdated(updated.username);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setSavingUsername(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(token, file);
      setProfile(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddFriend(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAddingFriend(true);
    try {
      await addFriend(token, friendUsername);
      setFriendUsername("");
      setFriends(await listFriends(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setAddingFriend(false);
    }
  }

  async function handleRemoveFriend(friendId: number) {
    setError(null);
    try {
      await removeFriend(token, friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <Modal title="Profil" onClose={onClose}>
      {!profile ? (
        <p className="m-0 text-sm text-status-finished">Chargement...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {error && <p className="m-0 text-sm text-error">{error}</p>}

          <div className="flex items-center gap-4">
            <span className="relative inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2">
              {profile.avatar_path ? (
                <img
                  src={`${SERVER_ORIGIN}${profile.avatar_path}`}
                  alt={profile.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold">
                  {profile.username.slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="cursor-pointer rounded-md border border-edge bg-transparent px-3 py-1.5 text-sm text-ink disabled:cursor-default disabled:opacity-60"
              >
                {uploadingAvatar ? "Envoi..." : "Changer la photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <form className="flex flex-col gap-2" onSubmit={handleUsernameSubmit}>
            <label className="flex flex-col gap-1.5 text-sm">
              Pseudo
              <input
                className="rounded-md border border-edge bg-surface p-2 text-base text-ink"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={1}
              />
            </label>
            <button
              type="submit"
              disabled={savingUsername || username === profile.username}
              className="cursor-pointer self-start rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-default disabled:opacity-60"
            >
              {savingUsername ? "..." : "Enregistrer"}
            </button>
          </form>

          <div>
            <h3 className="mb-3 text-base font-bold">Amis</h3>
            <form className="mb-3 flex gap-2" onSubmit={handleAddFriend}>
              <input
                className="min-w-0 flex-1 rounded-md border border-edge bg-surface p-2 text-base text-ink"
                placeholder="Pseudo à ajouter"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                required
                minLength={1}
              />
              <button
                type="submit"
                disabled={addingFriend}
                className="cursor-pointer rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-default disabled:opacity-60"
              >
                Ajouter
              </button>
            </form>
            {friends.length === 0 ? (
              <p className="m-0 text-sm text-status-finished">Aucun ami pour le moment.</p>
            ) : (
              <ul className="m-0 flex max-h-56 list-none flex-col gap-2 overflow-y-auto p-0">
                {friends.map((f) => (
                  <FriendCard key={f.id} friend={f} onRemove={() => handleRemoveFriend(f.id)} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
