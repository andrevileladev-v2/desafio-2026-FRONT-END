import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './shared/components/Layout'
import { FilterProvider } from './shared/context/FilterContext'

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const MapPage = lazy(() => import('./features/map/MapPage').then((m) => ({ default: m.MapPage })))
const SpeciesPage = lazy(() => import('./features/species/SpeciesPage').then((m) => ({ default: m.SpeciesPage })))
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))

function PageLoader() {
  return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <FilterProvider>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/species" element={<SpeciesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </FilterProvider>
    </BrowserRouter>
  )
}
