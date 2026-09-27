import { useEffect, useState } from 'react';
import type { RouteId } from '@/types';

export const ROUTES: RouteId[] = ['home', 'research', 'data', 'dashboard', 'map', 'methodology', 'results'];

const parse = (): RouteId => {
  const id = window.location.hash.replace(/^#\/?/, '').split(/[?#]/)[0] as RouteId;
  return ROUTES.includes(id) ? id : 'home';
};

/** Hash-based routing: works on any static host and inside the artifact viewer. */
export function useHashRoute(): RouteId {
  const [route, setRoute] = useState<RouteId>(parse);
  useEffect(() => {
    const onChange = () => { setRoute(parse()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const hrefFor = (id: RouteId) => `#/${id === 'home' ? '' : id}`;
