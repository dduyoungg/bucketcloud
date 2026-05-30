"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA 등록 실패는 앱 사용을 막지 않음.
      });
    }
  }, []);

  return null;
}
