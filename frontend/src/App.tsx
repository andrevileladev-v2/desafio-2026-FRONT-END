import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './shared/components/Layout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { MapPage } from './features/map/MapPage'
import { SpeciesPage } from './features/species/SpeciesPage'
import { AnalyticsPage } from './features/analytics/AnalyticsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/species" element={<SpeciesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
