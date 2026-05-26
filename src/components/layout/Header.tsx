"use client";

import { LogOut, User } from "lucide-react";

interface HeaderProps {
  user: { name: string; imageUrl: string | null } | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b border-spotify-border px-6 md:px-10 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <SpotifyLogo className="w-6 h-6 text-spotify-green" />
        <div>
          <h1 className="font-display text-2xl tracking-widest leading-none text-white">
            PLAYLIST<span className="text-spotify-green">.</span>
          </h1>
          <p className="text-[0.5rem] font-code tracking-[3px] uppercase text-spotify-muted -mt-0.5">
            Showcase
          </p>
        </div>
      </div>

      {/* User */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-code text-white/70 leading-none">{user.name}</p>
            <p className="text-[0.55rem] font-code text-spotify-muted mt-0.5 tracking-wider">Connected</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-spotify-surface border border-spotify-border overflow-hidden flex items-center justify-center">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-spotify-muted" />
            )}
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-[0.6rem] font-code tracking-wider uppercase text-spotify-muted hover:text-white transition-colors px-2 py-1 border border-transparent hover:border-spotify-border"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
