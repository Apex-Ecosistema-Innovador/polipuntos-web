'use client';

import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/format';

interface QueryState<T> {
  tag: string;
  data: T | null;
  error: string | null;
}

export function useQuery<T>(fetcher: () => Promise<T>, deps: DependencyList) {
  const fetcherRef = useRef(fetcher);
  const [state, setState] = useState<QueryState<T>>({ tag: '', data: null, error: null });
  const [version, setVersion] = useState(0);
  const tag = `${JSON.stringify(deps)}:${version}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let active = true;
    fetcherRef
      .current()
      .then((data) => active && setState({ tag, data, error: null }))
      .catch(
        (caught) =>
          active && setState((current) => ({ tag, data: current.data, error: errorMessage(caught) })),
      );
    return () => {
      active = false;
    };
  }, [tag]);

  const reload = useCallback(async () => setVersion((current) => current + 1), []);

  return { data: state.data, error: state.error, loading: state.tag !== tag, reload };
}
