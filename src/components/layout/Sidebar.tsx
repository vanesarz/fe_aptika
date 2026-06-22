"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/api";

// ── Key harus sama persis dengan nama folder di src/app/
const TEAMS = [
  { name: "Integrasi Interoperabilitas", key: "integrasiinteroperabilitas" },
  { name: "Pengelolaan Aplikasi",        key: "pengelolaanaplikasi" },
  { name: "Rekayasa Aplikasi",           key: "rekayasaaplikasi" },
  { name: "Sidebar Jabar",               key: "sidebarjabar" },
  { name: "Smart Jabar",                 key: "smartjabar" },
  { name: "Sada Jabar",                   key: "sadajabar" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          if (uObj?.role === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Ambil segment pertama URL: /rekayasaaplikasi/dashboard → "rekayasaaplikasi"
  const activeTeam = pathname.split("/")[1] || "rekayasaaplikasi";

  const handleTeamClick = (key: string) => {
    setIsOpen(false);
    router.push(`/${key}/dashboard`);
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .sidebar-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          width: 235px;
          height: 100vh;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(175deg, #0f2540 0%, #1a3a6e 50%, #1d4ed8 100%);
          overflow-y: auto;
          overflow-x: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 22px 18px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        
        .sidebar-logo-name { font-size: 14px; font-weight: 800; color: white; letter-spacing: 1px; line-height: 1.2; }
        .sidebar-logo-sub  { font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px; letter-spacing: 0.3px; }
        
        .sidebar-section   { padding: 14px 14px 4px; }
        
        .sidebar-section-label {
          font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35);
          letter-spacing: 1.2px; text-transform: uppercase;
          padding: 0 6px; margin-bottom: 6px;
        }
        
        .sidebar-item {
          display: flex; align-items: center; width: 100%;
          padding: 9px 12px; border-radius: 8px; border: none;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          color: rgba(255,255,255,0.75); background: transparent;
          text-align: left; transition: all 0.15s ease;
          margin-bottom: 1px; gap: 10px;
        }
        
        .sidebar-item:hover { background: rgba(255,255,255,0.08); color: white; }
        
        .sidebar-item.active {
          background: rgba(255,255,255,0.15); color: white;
          font-weight: 600; border-left: 2px solid #38bdf8;
        }
        
        .sidebar-item-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.3); flex-shrink: 0;
        }
        
        .sidebar-item.active .sidebar-item-dot {
          background: #38bdf8;
          box-shadow: 0 0 6px rgba(56,189,248,0.8);
        }
        
        .sidebar-spacer { flex: 1; }
        
        .sidebar-footer {
          padding: 8px 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        
        .sidebar-logout {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 9px 12px; border-radius: 8px; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
          font-weight: 400; color: rgba(255,255,255,0.5); background: transparent;
          text-align: left; transition: all 0.15s ease;
        }
        
        .sidebar-logout:hover { background: rgba(255,100,100,0.12); color: #fca5a5; }

        /* Hamburger Toggle Button */
        .sidebar-mobile-toggle {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1001;
          background: #0f2540;
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(15,37,64,0.15);
          transition: all 0.2s ease;
        }
        
        .sidebar-mobile-toggle:hover {
          background: #1a3a6e;
        }
        
        .sidebar-mobile-backdrop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15,23,42,0.4);
          backdrop-filter: blur(4px);
          z-index: 998;
        }

        @media (max-width: 768px) {
          .sidebar-mobile-toggle {
            display: flex;
          }
          
          .sidebar-mobile-backdrop {
            display: block;
          }
          
          .sidebar-wrap {
            position: fixed;
            left: 0;
            top: 0;
            z-index: 999;
            transform: translateX(-100%);
            box-shadow: 4px 0 25px rgba(0,0,0,0.15);
          }
          
          .sidebar-wrap.open {
            transform: translateX(0);
          }
          
          main {
            padding-top: 72px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>

      {/* Toggle Button for Mobile */}
      <button 
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Overlay Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="sidebar-mobile-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`sidebar-wrap ${isOpen ? "open" : ""}`}>

        {/* LOGO */}
        <div className="sidebar-logo">
          <div>
            <div className="sidebar-logo-name">Aptika Tools</div>
            <div className="sidebar-logo-sub">Rekap Data Aptika</div>
          </div>
        </div>

        {/* TEAMS */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">Service</div>
          {TEAMS.map((team) => (
            <button
              key={team.key}
              className={`sidebar-item ${activeTeam === team.key ? "active" : ""}`}
              onClick={() => handleTeamClick(team.key)}
            >
              {team.name}
            </button>
          ))}
        </div>

        {/* ADMIN PANEL */}
        {isAdmin && (
          <div className="sidebar-section" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "10px", paddingTop: "10px" }}>
            <div className="sidebar-section-label">Admin Panel</div>
            <button
              className={`sidebar-item ${activeTeam === "admin" ? "active" : ""}`}
              onClick={() => {
                setIsOpen(false);
                router.push("/admin/users");
              }}
            >
              Manajemen User
            </button>
          </div>
        )}

        <div className="sidebar-spacer" />

        {/* LOGOUT */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

      </div>
    </>
  );
}