# BucketCloud

화이트 다이어리 느낌의 버킷리스트 PWA 웹앱 starter입니다.

## 포함 기능

- Google 로그인
- 이메일 회원가입/로그인
- 버킷리스트 추가/삭제/완료
- 완료 전 항목은 메인 화면에서 WordArt처럼 둥둥 표시
- 클릭 후 제목/폰트/크기/색상/스티커색 실시간 수정
- 드래그 위치 저장
- 완료함에서 후기 메모 작성
- PWA 홈 화면 설치용 manifest/service worker
- Cloud Run 배포용 Dockerfile

## 1. 설치

```bash
npm install
```

## 2. 환경변수

`.env.example`을 `.env.local`로 복사하고 Supabase 값을 넣으세요.

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Supabase DB 생성

Supabase SQL Editor에서 `supabase/schema.sql` 내용을 실행하세요.

## 4. Supabase Auth 설정

Authentication > Providers에서 다음을 켜세요.

- Email
- Google

Google OAuth Redirect URL에는 아래를 추가하세요.

```txt
http://localhost:3000/auth/callback
https://배포주소/auth/callback
```

Supabase Authentication > URL Configuration에도 Site URL과 Redirect URLs를 맞춰 넣으세요.

## 5. 로컬 실행

```bash
npm run dev
```

## 6. Cloud Run 배포 예시

```bash
gcloud run deploy bucketcloud \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY",NEXT_PUBLIC_SITE_URL="https://YOUR_CLOUD_RUN_URL"
```

## 다음에 추가하기 좋은 기능

- 친구추가
- 공개/비공개 버킷리스트
- 친구 댓글/응원
- 사진 후기
- 카테고리/태그
