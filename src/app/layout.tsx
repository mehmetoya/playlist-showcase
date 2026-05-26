import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Playlist Showcase",
  description: "Editorial Spotify playlist showcase powered by AI",
  openGraph: {
    title: "Playlist Showcase",
    description: "Your music, curated beautifully.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="grain antialiased">{children}</body>
    </html>
  );
}
