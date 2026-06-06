import { Page } from "../App"

interface Props {
  navigate: (page: Page) => void
}

export default function About({ navigate }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "80px auto", padding: "0 24px" }}>
      <h1>About</h1>
      <p>Breakprout is a board game built with FastAPI, PostgreSQL, and React.</p>
      <p>This page demonstrates client-side navigation — no page reload, no URL change yet.</p>

      <button onClick={() => navigate("home")}>← Back</button>
    </div>
  )
}
