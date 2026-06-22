"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/api";



function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1 1.7 0 3.1 1.4 3.1 3.1v2z" />
    </svg>
  );
}

function DecorCircle({ cx, cy, r, opacity }: { cx: number; cy: number; r: number; opacity: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="white" fillOpacity={opacity} />;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      // Mendukung format token umum dari Laravel Sanctum (access_token atau token)
      const token = data.token || data.access_token || data?.data?.token || data?.data?.access_token || "dummy-token-aptika";
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user || data?.data?.user || { name: "User APTIKA Tools" }));
      router.push("/rekayasaaplikasi/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; display: flex; }

        /* LEFT */
        .panel-left {
          flex: 1; position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: center;
          padding: 64px 56px;
          background: linear-gradient(145deg, #0f2540 0%, #1a3a6e 45%, #1d4ed8 100%);
        }
        .left-decor { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .left-accent {
          position: absolute; right: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(to bottom, transparent, #38bdf8, transparent);
          opacity: 0.5;
        }
        .left-content { position: relative; z-index: 2; max-width: 420px; }
        .left-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 52px; }
        .left-logo-name { font-size: 20px; font-weight: 800; color: white; letter-spacing: 1px; }
        .left-logo-sub { font-size: 10.5px; color: rgba(255,255,255,0.6); margin-top: 3px; }

        /* Tagline — hapus "Sistem Informasi" */
        .left-tagline {
          font-size: 40px; font-weight: 800; color: white;
          line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 18px;
        }
        .left-tagline .accent { color: #38bdf8; }

        .left-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.75; margin-bottom: 40px; }

        .left-stats { display: flex; gap: 16px; flex-wrap: wrap; }
        .stat-card {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px; padding: 14px 20px; backdrop-filter: blur(8px);
          flex: 1; min-width: 110px;
        }
        .stat-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .stat-val { font-size: 15px; font-weight: 700; color: white; }
        .stat-val .dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: #38bdf8; margin-right: 6px; vertical-align: middle;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.75); } }

        /* RIGHT */
        .panel-right {
          width: 460px; flex-shrink: 0; background: #fff;
          display: flex; flex-direction: column; justify-content: center;
          padding: 64px 52px; position: relative; min-height: 100vh;
        }
        .panel-right::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #0f2540, #1d4ed8, #38bdf8);
        }
        @keyframes fadeRight { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        .form-inner { animation: fadeRight 0.5s cubic-bezier(0.22,1,0.36,1) both; }

        .form-eyebrow { font-size: 11px; font-weight: 700; color: #0891b2; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .form-title { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; margin-bottom: 8px; }
        .form-sub { font-size: 13.5px; color: #94a3b8; margin-bottom: 40px; line-height: 1.5; }

        .input-group { margin-bottom: 22px; }
        .input-label { display: block; font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.9px; text-transform: uppercase; margin-bottom: 8px; }
        .input-wrap {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 0 16px; height: 50px; background: #f8fafc;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .input-wrap:focus-within { border-color: #1d4ed8; background: white; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        .input-icon { color: #cbd5e1; flex-shrink: 0; display: flex; align-items: center; transition: color 0.2s; }
        .input-wrap:focus-within .input-icon { color: #1d4ed8; }
        .input-wrap input { flex: 1; border: none; outline: none; font-size: 14px; color: #0f172a; background: transparent; font-family: 'Plus Jakarta Sans', sans-serif; }
        .input-wrap input::placeholder { color: #cbd5e1; font-size: 13.5px; }

        .toggle-pass { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; font-size: 11px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; transition: color 0.2s; white-space: nowrap; }
        .toggle-pass:hover { color: #1d4ed8; }

        .error-msg { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px; padding: 11px 16px; font-size: 12.5px; color: #dc2626; text-align: center; margin-bottom: 18px; }

        .btn-login {
          width: 100%; height: 52px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #0f2540 0%, #1d4ed8 60%, #0891b2 100%);
          color: white; font-size: 15px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          transition: all 0.2s; margin-top: 6px; margin-bottom: 36px;
        }
        .btn-login:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 12px 28px rgba(29,78,216,0.32); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.65s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .form-footer { border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center; }
        .footer-org { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
        .footer-badge { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #1d4ed8; font-size: 10.5px; font-weight: 700; padding: 5px 16px; border-radius: 999px; letter-spacing: 1px; text-transform: uppercase; border: 1px solid #bfdbfe; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; animation: pulse 2s ease-in-out infinite; }

        @media (max-width: 900px) {
          .page { flex-direction: column; }
          .panel-left { padding: 40px 32px; min-height: auto; }
          .left-tagline { font-size: 28px; }
          .panel-right { width: 100%; padding: 40px 28px; min-height: auto; }
        }
      `}</style>

      <div className="page">
        {/* ── LEFT ── */}
        <div className="panel-left">
          <svg className="left-decor" viewBox="0 0 700 900" preserveAspectRatio="xMidYMid slice">
            <DecorCircle cx={580} cy={120} r={220} opacity={0.05} />
            <DecorCircle cx={600} cy={160} r={140} opacity={0.06} />
            <DecorCircle cx={80}  cy={800} r={200} opacity={0.05} />
            <DecorCircle cx={60}  cy={820} r={100} opacity={0.06} />
            <DecorCircle cx={350} cy={460} r={300} opacity={0.03} />
          </svg>
          <div className="left-accent" />

          <div className="left-content">
            <div className="left-logo">
              <div>
                <div className="left-logo-name">APTIKA Tools</div>
                <div className="left-logo-sub">Rekap Data Aptika</div>
              </div>
            </div>

            {/* Tagline tanpa "Sistem Informasi" */}
            <div className="left-tagline">
              <span className="accent">Aptika Tools</span><br />
              Jawa Barat
            </div>

            <p className="left-desc">
              Platform pengelolaan dan rekap data Aplikasi Informatika
              Dinas Komunikasi dan Informatika Provinsi Jawa Barat.
              Data akurat, terpadu, dan mudah diakses.
            </p>

            <div className="left-stats">
              <div className="stat-card">
                <div className="stat-label">Instansi</div>
                <div className="stat-val">Diskominfo Jabar</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Bidang</div>
                <div className="stat-val">Aptika</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="panel-right">
          <div className="form-inner">
            <div className="form-eyebrow">Selamat Datang</div>
            <div className="form-title">Masuk ke APTIKA Tools</div>
            <div className="form-sub">Masukkan kredensial Anda untuk mengakses sistem.</div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrap">
                  <span className="input-icon"><UserIcon /></span>
                  <input
                    type="email"
                    placeholder="email@aptika.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon"><LockIcon /></span>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                    {showPass ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {error && <div className="error-msg">{error}</div>} 

              <button type="submit" disabled={loading} className="btn-login">
                <div className="btn-inner">
                  {loading && <div className="spinner" />}
                  {loading ? "Memproses..." : "Masuk"}
                </div>
              </button>
            </form>

            <div className="form-footer">
              <div className="footer-org">Diskominfo Provinsi Jawa Barat</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}