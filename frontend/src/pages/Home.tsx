import { useEffect, useState } from "react"
import { Page } from "../App"

interface Props {
  navigate: (page: Page) => void
}

export default function Home({ navigate }: Props) {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "down">("checking")

  // Example of talking to the FastAPI backend
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.ok ? setApiStatus("ok") : setApiStatus("down"))
      .catch(() => setApiStatus("down"))
  }, [])

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "80px auto", padding: "0 24px" }}>
      <h1>Breakprout</h1>
      <p>A board game. Work in progress.</p>

      <p>
        Backend:{" "}
        <span style={{ color: apiStatus === "ok" ? "green" : apiStatus === "down" ? "red" : "gray" }}>
          {apiStatus === "checking" ? "checking…" : apiStatus === "ok" ? "online" : "offline"}
        </span>
      </p>

      <button onClick={() => navigate("about")}>About</button>
    </div>
  )
}
