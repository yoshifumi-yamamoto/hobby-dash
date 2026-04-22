import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface LayoutShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function LayoutShell({ title, description, children }: LayoutShellProps) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brandBlock">
          <div className="brandLine">
            <Link className="wordmarkLink" href="/">
              <img
                alt="YAMA LAB"
                className="wordmark"
                height="30"
                src="/yama-lab-logo.svg"
                width="188"
              />
            </Link>
          </div>
          <p className="brandSub">FEELCYCLE を中心に、継続と振り返りのための個人ダッシュボード。</p>
        </div>
        <nav className="nav navDesktop">
          <Link href="/">Overview</Link>
          <Link href="/records">Records</Link>
        </nav>
        <details className="mobileMenu">
          <summary className="mobileMenuButton" aria-label="Open menu">
            <span />
            <span />
            <span />
          </summary>
          <nav className="mobileMenuPanel">
            <Link href="/">Overview</Link>
            <Link href="/records">Records</Link>
          </nav>
        </details>
      </header>

      <main className="main">
        <div className="ambient ambientOne" />
        <div className="ambient ambientTwo" />
        <div className="hero">
          <div>
            <p className="eyebrow">Personal Rhythm</p>
            <h1>{title}</h1>
          </div>
          <p className="heroText">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
