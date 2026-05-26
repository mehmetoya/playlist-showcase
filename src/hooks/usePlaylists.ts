"use client";

import { useState, useEffect, useCallback } from "react";
import type { Playlist, FilterState, SortKey } from "@/types";
import { stableSort } from "@/lib/utils";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/playlists");
      if (res.status === 401) {
        window.location.href = "/";
        return;
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setPlaylists(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return { playlists, loading, error, refetch: fetchPlaylists };
}

export function useFilteredPlaylists(playlists: Playlist[], filter: FilterState) {
  return stableSort(
    playlists.filter((p) => {
      const q = filter.search.toLowerCase();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.owner.name.toLowerCase().includes(q)
      );
    }),
    (a, b) => {
      switch (filter.sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "tracks":
          return b.trackCount - a.trackCount;
        case "followers":
          return b.followers - a.followers;
        default:
          return 0;
      }
    }
  );
}
