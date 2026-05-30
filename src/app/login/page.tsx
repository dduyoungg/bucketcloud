"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signInWithGoogle() {
    setMessage("");
    const redirectTo = `${location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });

    if (error) setMessage(error.message);
  }

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("비밀번호는 최소 6자 이상으로 입력해줘.");
      return;
    }

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${location.origin}/auth/callback`
            }
          });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("가입 확인 메일을 보냈어. 메일 인증 후 로그인해줘.");
      return;
    }

    location.href = "/";
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="back-link">← 돌아가기</Link>
        <div className="brand-badge">BucketCloud</div>
        <h1>{mode === "login" ? "다시 꿈 띄우기" : "새 구름 만들기"}</h1>
        <p className="muted">화이트 다이어리 위에 나만의 버킷리스트를 띄워봐.</p>

        <button className="google-button" onClick={signInWithGoogle}>
          Google로 시작하기
        </button>

        <div className="divider"><span>또는 이메일로</span></div>

        <form className="auth-form" onSubmit={handleEmailAuth}>
          <label>
            이메일
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            비밀번호
            <input
              type="password"
              required
              minLength={6}
              placeholder="6자 이상"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button className="primary-button" type="submit">
            {mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        <button
          className="text-button"
          onClick={() => {
            setMessage("");
            setMode(mode === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? "처음이라면 회원가입" : "이미 계정이 있다면 로그인"}
        </button>

        {message ? <p className="notice">{message}</p> : null}
      </section>
    </main>
  );
}
