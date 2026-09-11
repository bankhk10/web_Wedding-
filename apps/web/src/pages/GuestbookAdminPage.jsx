import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "/api/guestbook-admin.php";
const PAGE_SIZE = 20;

function formatDate(value) {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function GuestbookAdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [pendingTotal, setPendingTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPending = async (nextOffset = 0, shouldReset = false) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}?status=pending&limit=${PAGE_SIZE}&offset=${nextOffset}`,
        { credentials: "same-origin" },
      );

      if (response.status === 401) {
        setIsAuthenticated(false);
        setPending([]);
        setPendingTotal(0);
        return;
      }

      const payload = await response.json();

      if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
        throw new Error(payload.message || "load failed");
      }

      setIsAuthenticated(true);
      const items = payload.data ?? [];
      setPending((current) => (shouldReset ? items : [...current, ...items]));
      setPendingTotal(Number(payload.count ?? items.length ?? 0));
      setOffset(nextOffset);
      setHasMore(items.length === PAGE_SIZE);
    } catch {
      setErrorMessage("ไม่สามารถดึงคำอวยพรที่รออนุมัติได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending(0, true);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
        credentials: "same-origin",
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "login failed");
      }

      setPassword("");
      setIsAuthenticated(true);
      await loadPending(0, true);
    } catch (error) {
      setLoginError(error.message || "รหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
        credentials: "same-origin",
      });
    } catch {
      // Ignore logout errors and clear local state anyway.
    } finally {
      setPassword("");
      setPending([]);
      setPendingTotal(0);
      setIsAuthenticated(false);
      setErrorMessage("");
      setLoginError("");
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    if (processingIds.includes(id)) return;

    setProcessingIds((current) => [...current, id]);
    setErrorMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
        credentials: "same-origin",
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "update failed");
      }

      setPending((current) => current.filter((item) => item.id !== id));
      setPendingTotal((current) => Math.max(0, current - 1));
    } catch {
      setErrorMessage("ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setProcessingIds((current) => current.filter((value) => value !== id));
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#FFF9FA] px-5 py-12 text-[#3A1F24] md:px-6 md:py-20">
        <div className="mx-auto max-w-md rounded-[2rem] border border-[#F7D8E2] bg-white/80 p-6 shadow-[0_16px_50px_rgba(142,27,27,0.06)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="text-sm font-light text-[#8E1B1B] hover:underline">
              กลับหน้าหลัก
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-3xl" aria-hidden="true">💌</p>
            <h1 className="mt-3 text-2xl font-medium tracking-[0.08em] text-[#8E1B1B]">
              จัดการคำอวยพร
            </h1>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div className="space-y-2 text-left">
              <label htmlFor="guestbook-admin-password" className="text-sm font-medium text-[#3A1F24]">
                รหัสผ่าน
              </label>
              <input
                id="guestbook-admin-password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full rounded-full border border-[#F3C7D5] bg-[#FFF9FA] px-4 py-2.5 font-light text-[#3A1F24] outline-none transition-colors placeholder:text-[#B8909A] focus:border-[#E91E63] focus:ring-2 focus:ring-[#FCE4EC]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-[#C62828] px-5 py-3 text-sm font-medium tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(198,40,40,0.2)] transition-colors hover:bg-[#8E1B1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          {loginError && (
            <p className="mt-4 text-center text-sm font-light text-[#8E1B1B]" role="alert">
              {loginError}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9FA] px-5 py-12 text-[#3A1F24] md:px-6 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="text-sm font-light text-[#8E1B1B] hover:underline">
            กลับหน้าหลัก
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full border border-[#E91E63] bg-white px-4 py-2 text-sm font-medium text-[#C62828] transition-colors hover:bg-[#FCE4EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2"
          >
            ออกจากระบบ
          </button>
        </div>

        <header className="mt-8 text-center">
          <h1 className="text-3xl font-medium tracking-[0.08em] text-[#8E1B1B] md:text-4xl">
            จัดการคำอวยพร
          </h1>
          <p className="mt-3 text-base font-light text-[#7A5A61]">
            คำอวยพรที่รออนุมัติ: {pendingTotal} รายการ
          </p>
        </header>

        {loading && pending.length === 0 && (
          <p className="mt-10 text-center font-light text-[#7A5A61]">กำลังโหลดคำอวยพร...</p>
        )}

        {errorMessage && (
          <p className="mt-6 text-center text-sm font-light text-[#8E1B1B]">{errorMessage}</p>
        )}

        {!loading && pending.length === 0 && (
          <div className="mt-10 rounded-[1.5rem] border border-dashed border-[#F3C7D5] bg-white/70 p-8 text-center text-[#7A5A61]">
            ไม่มีคำอวยพรที่รออนุมัติ
          </div>
        )}

        {pending.length > 0 && (
          <div className="mt-8 space-y-4">
            {pending.map((message) => {
              const isProcessing = processingIds.includes(message.id);

              return (
                <article
                  key={message.id}
                  className="rounded-[1.5rem] border border-[#F3C7D5] bg-white/80 p-5 shadow-[0_8px_20px_rgba(142,27,27,0.05)]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <h2 className="text-lg font-medium text-[#8E1B1B]">{message.name}</h2>
                    <time className="text-xs font-light text-[#B8909A]" dateTime={message.created_at}>
                      {formatDate(message.created_at)}
                    </time>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap break-words font-light leading-relaxed text-[#3A1F24]">
                    {message.message}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(message.id, "approved")}
                      className="inline-flex items-center justify-center rounded-full bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white shadow-[0_6px_18px_rgba(46,125,50,0.16)] transition-colors hover:bg-[#1B5E20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? "กำลังดำเนินการ..." : "✓ อนุมัติ"}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(message.id, "hidden")}
                      className="inline-flex items-center justify-center rounded-full bg-[#7A5A61] px-4 py-2 text-sm font-medium text-white shadow-[0_6px_18px_rgba(122,90,97,0.18)] transition-colors hover:bg-[#5B3B45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A5A61] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      ซ่อน
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {hasMore && pending.length > 0 && (
          <button
            type="button"
            disabled={loading}
            onClick={() => loadPending(offset + PAGE_SIZE, false)}
            className="mx-auto mt-10 flex rounded-full bg-[#C62828] px-7 py-2.5 text-sm text-white shadow-[0_10px_24px_rgba(198,40,40,0.2)] transition-colors hover:bg-[#8E1B1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
          </button>
        )}
      </div>
    </main>
  );
}
