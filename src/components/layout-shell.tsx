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
            <p className="brandTag">Feel Your Stats</p>
            <Link className="brand" href="/">
              hobby-dash
            </Link>
          </div>
          <p className="brandSub">FEELCYCLE を中心に、継続と振り返りのための個人ダッシュボード。</p>
        </div>
        <nav className="nav">
          <Link href="/">Overview</Link>
          <Link href="/records">Records</Link>
        </nav>
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
