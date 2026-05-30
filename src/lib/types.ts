export type BucketStatus = "active" | "completed";

export type BucketItem = {
  id: string;
  user_id: string;
  title: string;
  status: BucketStatus;
  memo: string | null;
  font_family: string;
  font_size: number;
  color: string;
  sticker_color: string;
  x: number;
  y: number;
  rotate: number;
  animation_speed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BucketPatch = Partial<
  Pick<
    BucketItem,
    | "title"
    | "status"
    | "memo"
    | "font_family"
    | "font_size"
    | "color"
    | "sticker_color"
    | "x"
    | "y"
    | "rotate"
    | "animation_speed"
    | "completed_at"
  >
>;

export const FONT_OPTIONS = [
  { label: "통통 기본", value: "sans" },
  { label: "다이어리", value: "diary" },
  { label: "동글동글", value: "round" },
  { label: "세리프", value: "serif" },
  { label: "모노", value: "mono" }
];

export const fontClassName: Record<string, string> = {
  sans: "font-sans",
  diary: "font-diary",
  round: "font-round",
  serif: "font-serif",
  mono: "font-mono"
};

export const STICKER_COLORS = [
  "#fff0a8",
  "#ffd6e7",
  "#d9f8c4",
  "#cde7ff",
  "#e2d4ff",
  "#ffd9b7",
  "#ffffff"
];
