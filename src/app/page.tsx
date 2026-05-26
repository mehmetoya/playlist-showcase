import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSession();
  if (session.accessToken && session.user) redirect("/dashboard");

  const errorMessages: Record<string, string> = {
    state_mismatch: "Security check failed. Please try again.",
    auth_failed: "Authentication failed. Please try again.",
    access_denied: "Spotify access was denied.",
    missing_params: "Invalid callback. Please try again.",
  };

  const errorMsg = searchParams.error ? errorMessages[searchParams.error] ?? "An error occurred." : null;

  return (
    <main className="min-h-screen bg-spotify-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-spotify-green opacity-[0.04] blur-[120px] pointer-events-none" />

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#1db954 1px, transparent 1px), linear-gradient(90deg, #1db954 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center max-w-xl">
        {/* Spotify icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-spotify-green-dim border border-spotify-green/30 flex items-center justify-center">
            <SpotifyIcon className="w-8 h-8 text-spotify-green" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-[5rem] leading-[0.9] tracking-widest text-white mb-4">
          PLAYLIST<br />
          <span className="text-spotify-green" style={{ textShadow: "0 0 60px rgba(29,185,84,0.4)" }}>
            SHOWCASE
          </span>
        </h1>

        <p className="font-body italic text-spotify-muted text-lg mb-10 leading-relaxed">
          Your music, curated beautifully.<br />
          Analyzed poetically by AI.
        </p>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono tracking-wide">
            {errorMsg}
          </div>
        )}

        {/* CTA */}
        <Link
          href="/api/auth/login"
          className="inline-flex items-center gap-3 bg-spotify-green text-black font-code text-sm tracking-widest uppercase px-8 py-4 hover:bg-spotify-green/90 transition-all duration-200 hover:shadow-[0_0_40px_rgba(29,185,84,0.4)]"
        >
          <SpotifyIcon className="w-5 h-5" />
          Connect with Spotify
        </Link>

        <p className="mt-6 text-xs text-spotify-muted/60 font-code tracking-wider">
          We only read your playlists. Nothing is modified.
        </p>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-left">
          {[
            { icon: "◈", title: "Your Playlists", desc: "Fetched live from Spotify" },
            { icon: "✦", title: "AI Analysis", desc: "AI writes editorial reviews" },
            { icon: "◎", title: "Sort & Filter", desc: "Grid or list, your way" },
          ].map((f) => (
            <div key={f.title} className="border border-spotify-border p-4">
              <div className="text-spotify-green text-xl mb-2">{f.icon}</div>
              <div className="font-code text-xs tracking-widest uppercase text-white/70 mb-1">{f.title}</div>
              <div className="font-body italic text-spotify-muted text-xs">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
