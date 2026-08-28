import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export const metadata: Metadata = {
  title: "App Router Practice",
  description: "Next.js App Router and Materials UI Practice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>

        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />

            <header className="site-header">
              <nav className="navbar">

                <Link className="logo" href="/">
                  My Next App
                </Link>

                <div className="nav-links">
                  <Link href="/">Home</Link>
                  <Link href="/about">About</Link>
                  <Link href="/contact">Contact</Link>
                  <Link href="/chat">Chat</Link>

                  <Link href="/login">Login</Link>
                  <Link href="/signup">Sign Up</Link>
                </div>

              </nav>
            </header>

            <main className="site-main">
              {children}
            </main>

          </ThemeProvider>
        </AppRouterCacheProvider>

      </body>
    </html>
  );
}