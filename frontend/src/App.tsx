import { useState } from "react"
import Home from "./pages/Home"
import About from "./pages/About"

export type Page = "home" | "about"

export default function App() {
  const [page, setPage] = useState<Page>("home")

  return (
    <div>
      {page === "home" && <Home navigate={setPage} />}
      {page === "about" && <About navigate={setPage} />}
    </div>
  )
}
