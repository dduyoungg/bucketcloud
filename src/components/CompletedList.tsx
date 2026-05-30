"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";
import type { BucketItem, BucketPatch } from "@/lib/types";
import { fontClassName } from "@/lib/types";

export function CompletedList() {
  const supabase = useMemo(() => createClient(), []);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingPatches = useRef<Record<string, BucketPatch>>({});

  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setUser(data.session?.user ?? null);
      setLoading(false);
    }

    boot();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    fetchCompleted();
  }, [user]);

  async function fetchCompleted() {
    setError("");

    const { data, error } = await supabase
      .from("bucket_items")
      .select("*")
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setItems((data ?? []) as BucketItem[]);
  }

  function patchItem(id: string, patch: BucketPatch) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    pendingPatches.current[id] = { ...pendingPatches.current[id], ...patch };

    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);

    saveTimers.current[id] = setTimeout(async () => {
      const toSave = pendingPatches.current[id];
      delete pendingPatches.current[id];

      const { error } = await supabase.from("bucket_items").update(toSave).eq("id", id);
      if (error) setError(error.message);
    }, 300);
  }

  async function restoreItem(id: string) {
    const { error } = await supabase
      .from("bucket_items")
      .update({ status: "active", completed_at: null })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("bucket_items").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (loading) {
    return (
      <main className="full-page center">
        <div className="cloud-loader">완료함 불러오는 중...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="full-page center">
        <section className="auth-card">
          <h1>로그인이 필요해</h1>
          <p className="muted">완료한 버킷리스트는 계정별로 저장돼.</p>
          <Link href="/login" className="primary-button">로그인하기</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link href="/" className="logo">☁️ BucketCloud</Link>
        <nav>
          <Link href="/">메인</Link>
        </nav>
      </header>

      <section className="completed-hero">
        <p className="eyebrow">Done Archive</p>
        <h1>내가 진짜 해낸 것들</h1>
        <p>완료한 버킷리스트에 짧은 후기 메모를 남겨봐.</p>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="completed-grid">
        {items.length === 0 ? (
          <div className="empty-state card-empty">
            <strong>아직 완료한 버킷리스트가 없어.</strong>
            <span>메인에서 하나를 완료하면 여기에 기록돼.</span>
          </div>
        ) : null}

        {items.map((item) => (
          <article key={item.id} className="done-card">
            <div
              className={`done-title ${fontClassName[item.font_family] ?? "font-sans"}`}
              style={{
                color: item.color,
                background: item.sticker_color,
                fontSize: `${Math.min(item.font_size, 42)}px`
              }}
            >
              ✅ {item.title}
            </div>

            <p className="done-date">
              완료일: {item.completed_at ? new Date(item.completed_at).toLocaleDateString("ko-KR") : "기록 없음"}
            </p>

            <label>
              후기 메모
              <textarea
                value={item.memo ?? ""}
                placeholder="예: 생각보다 더 좋았다. 다음엔 친구랑 또 가고 싶다."
                onChange={(event) => patchItem(item.id, { memo: event.target.value })}
              />
            </label>

            <div className="card-actions">
              <button className="secondary-button" onClick={() => restoreItem(item.id)}>
                다시 메인으로
              </button>
              <button className="danger-button" onClick={() => deleteItem(item.id)}>
                삭제
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
