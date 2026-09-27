import type { ComponentType } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useHashRoute } from '@/hooks/useHashRoute';
import { HomePage } from '@/pages/HomePage';
import { ResearchPage } from '@/pages/ResearchPage';
import { DataPage } from '@/pages/DataPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MapPage } from '@/pages/MapPage';
import { MethodologyPage } from '@/pages/MethodologyPage';
import { ResultsPage } from '@/pages/ResultsPage';
import type { RouteId } from '@/types';

const PAGES: Record<RouteId, ComponentType> = {
  home: HomePage, research: ResearchPage, data: DataPage, dashboard: DashboardPage,
  map: MapPage, methodology: MethodologyPage, results: ResultsPage,
};

export default function App() {
  const route = useHashRoute();
  const Page = PAGES[route];
  return (
    <div className="flex min-h-full flex-col">
      <Navbar route={route} />
      <main key={route} className="mx-auto w-full max-w-7xl flex-1 animate-rise px-5 sm:px-8">
        <Page />
      </main>
      <Footer />
    </div>
  );
}
