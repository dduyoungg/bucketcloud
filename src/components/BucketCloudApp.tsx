"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";
import type { BucketItem, BucketPatch } from "@/lib/types";
import { FloatingBucket } from "@/components/FloatingBucket";
import { EditorPanel } from "@/components/EditorPanel";

const SAMPLE_TITLES = [
  "유럽 여행 가기",
  "마라톤 완주",
  "책 100권 읽기",
  "혼자 콘서트 가기",
  "스쿠버다이빙",
  "제주도 한 달 살기"
];

const STICKERS = ["#fff0a8", "#ffd6e7", "#d9f8c4", "#cde7ff", "#e2d4ff", "#ffd9b7"];
const COLORS = ["#2f2f35", "#ff6b8a", "#4e91ff", "#7c5cff", "#2da77a", "#ff8a00"];

export function BucketCloudApp() {
  const supabase = useMemo(() => createClient(), []);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingPatches = useRef<Record<string, BucketPatch>>({});

  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<BucketItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");

  const selected = items.find((item) => item.id === selectedId) ?? null;

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
    if (!user) {
      setItems([]);
      return;
    }

    fetchItems();
  }, [user]);

  async function fetchItems() {
    if (!user) return;
    setError("");

    const { data, error } = await supabase
      .from("bucket_items")
      .select("*")
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setItems((data ?? []) as BucketItem[]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setItems([]);
  }

  async function createBucket() {
    if (!user) return;
    const title = newTitle.trim();

    if (!title) {
      setError("버킷리스트 제목을 입력해줘.");
      return;
    }

    setError("");

    const index = Math.floor(Math.random() * STICKERS.length);
    const payload = {
      user_id: user.id,
      title,
      status: "active",
      font_family: Math.random() > 0.5 ? "diary" : "round",
      font_size: 30 + Math.floor(Math.random() * 18),
      color: COLORS[index],
      sticker_color: STICKERS[index],
      x: 8 + Math.random() * 65,
      y: 16 + Math.random() * 55,
      rotate: -8 + Math.random() * 16,
      animation_speed: 0.8 + Math.random() * 1.4
    };

    const { data, error } = await supabase
      .from("bucket_items")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setItems((prev) => [data as BucketItem, ...prev]);
    setSelectedId((data as BucketItem).id);
    setNewTitle("");
  }

  async function createSampleBuckets() {
    if (!user) return;
    setError("");

    const rows = SAMPLE_TITLES.map((title, index) => ({
      user_id: user.id,
      title,
      status: "active",
      font_family: index % 2 === 0 ? "diary" : "round",
      font_size: 28 + index * 2,
      color: COLORS[index % COLORS.length],
      sticker_color: STICKERS[index % STICKERS.length],
      x: 8 + ((index * 15) % 68),
      y: 16 + ((index * 13) % 56),
      rotate: -7 + index * 2,
      animation_speed: 0.9 + index * 0.18
    }));

    const { data, error } = await supabase.from("bucket_items").insert(rows).select();

    if (error) {
      setError(error.message);
      return;
    }

    setItems((data ?? []) as BucketItem[]);
  }

  function patchItem(id: string, patch: BucketPatch) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    pendingPatches.current[id] = { ...pendingPatches.current[id], ...patch };

    if (saveTimers.current[id]) {
      clearTimeout(saveTimers.current[id]);
    }

    saveTimers.current[id] = setTimeout(async () => {
      const toSave = pendingPatches.current[id];
      delete pendingPatches.current[id];

      const { error } = await supabase.from("bucket_items").update(toSave).eq("id", id);
      if (error) setError(error.message);
    }, 300);
  }

  async function completeItem(id: string) {
    setError("");
    const completedAt = new Date().toISOString();

    const { error } = await supabase
      .from("bucket_items")
      .update({ status: "completed", completed_at: completedAt })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedId(null);
  }

  async function deleteItem(id: string) {
    setError("");
    const { error } = await supabase.from("bucket_items").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedId(null);
  }

  if (loading) {
    return (
      <main className="full-page center">
        <div className="cloud-loader">BucketCloud 불러오는 중...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="landing">
        <section className="hero-card">
          <div className="brand-badge">BucketCloud</div>
          <h1>내 꿈들이 둥둥 떠다니는 버킷리스트 다이어리</h1>
          <p>
            하고 싶은 일을 스티커처럼 띄우고, 완료한 순간은 후기와 함께 기록해봐.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="primary-button">시작하기</Link>
            <a href="#preview" className="secondary-button">미리보기</a>
          </div>
        </section>

        <section id="preview" className="preview-board">
          {SAMPLE_TITLES.map((title, index) => (
            <div
              key={title}
              className={`preview-sticker ${index % 2 ? "font-round" : "font-diary"}`}
              style={{
                left: `${10 + index * 13}%`,
                top: `${20 + (index % 3) * 20}%`,
                background: STICKERS[index % STICKERS.length],
                color: COLORS[index % COLORS.length],
                transform: `rotate(${-8 + index * 3}deg)`,
                animationDelay: `${index * 0.4}s`
              }}
            >
              {title}
            </div>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link href="/" className="logo">☁️ BucketCloud</Link>
        <nav>
          <Link href="/completed">완료함</Link>
          <button onClick={signOut}>로그아웃</button>
        </nav>
      </header>

      <section className="creator-card">
        <div>
          <p className="eyebrow">오늘의 꿈</p>
          <h1>버킷리스트 하나를 구름 위에 띄워볼까?</h1>
        </div>
        <div className="creator-form">
          <input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") createBucket();
            }}
            placeholder="예: 오로라 보러 가기"
          />
          <button className="primary-button" onClick={createBucket}>+ 추가</button>
        </div>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="board-card">
        <div className="board-toolbar">
          <div>
            <p className="eyebrow">Floating Board</p>
            <h2>진행 중인 버킷리스트</h2>
          </div>
          {items.length === 0 ? (
            <button className="secondary-button" onClick={createSampleBuckets}>
              예시 채우기
            </button>
          ) : null}
        </div>

        <div ref={boardRef} className="floating-board">
          {items.length === 0 ? (
            <div className="empty-state">
              <strong>아직 띄운 꿈이 없어.</strong>
              <span>위 입력창에서 첫 버킷리스트를 추가해봐.</span>
            </div>
          ) : null}

          {items.map((item) => (
            <FloatingBucket
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              boardRef={boardRef}
              onSelect={() => setSelectedId(item.id)}
              onPatch={(patch) => patchItem(item.id, patch)}
            />
          ))}
        </div>
      </section>

      <EditorPanel
        item={selected}
        onClose={() => setSelectedId(null)}
        onPatch={(patch) => selected && patchItem(selected.id, patch)}
        onComplete={() => selected && completeItem(selected.id)}
        onDelete={() => selected && deleteItem(selected.id)}
      />
    </main>
  );
}
