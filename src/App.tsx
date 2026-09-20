import { BrowserRouter, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "./layouts/dashboard-layout"
import Page from "./pages/dashboard/page"
import StoriesPage from "./pages/stories/page"
import CharactersPage from "./pages/characters/page"
import PlacesPage from "./pages/places/page"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Page />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/places" element={<PlacesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
