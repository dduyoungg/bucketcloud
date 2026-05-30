"use client";

import type { BucketItem, BucketPatch } from "@/lib/types";
import { FONT_OPTIONS, STICKER_COLORS } from "@/lib/types";

type Props = {
  item: BucketItem | null;
  onClose: () => void;
  onPatch: (patch: BucketPatch) => void;
  onComplete: () => void;
  onDelete: () => void;
};

export function EditorPanel({ item, onClose, onPatch, onComplete, onDelete }: Props) {
  if (!item) return null;

  return (
    <aside className="editor-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Edit Sticker</p>
          <h2>버킷리스트 꾸미기</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="닫기">
          ×
        </button>
      </div>

      <label>
        제목
        <input
          value={item.title}
          onChange={(event) => onPatch({ title: event.target.value })}
        />
      </label>

      <label>
        폰트
        <select
          value={item.font_family}
          onChange={(event) => onPatch({ font_family: event.target.value })}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        글씨 크기 {item.font_size}px
        <input
          type="range"
          min="18"
          max="82"
          value={item.font_size}
          onChange={(event) => onPatch({ font_size: Number(event.target.value) })}
        />
      </label>

      <div className="two-cols">
        <label>
          글씨색
          <input
            type="color"
            value={item.color}
            onChange={(event) => onPatch({ color: event.target.value })}
          />
        </label>

        <label>
          회전 {Math.round(item.rotate)}°
          <input
            type="range"
            min="-18"
            max="18"
            value={item.rotate}
            onChange={(event) => onPatch({ rotate: Number(event.target.value) })}
          />
        </label>
      </div>

      <label>
        둥둥 속도
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={item.animation_speed}
          onChange={(event) => onPatch({ animation_speed: Number(event.target.value) })}
        />
      </label>

      <div className="color-row">
        {STICKER_COLORS.map((color) => (
          <button
            key={color}
            className={item.sticker_color === color ? "swatch active" : "swatch"}
            style={{ background: color }}
            onClick={() => onPatch({ sticker_color: color })}
            aria-label={`${color} 선택`}
          />
        ))}
      </div>

      <div className="panel-actions">
        <button className="complete-button" onClick={onComplete}>완료함으로 보내기</button>
        <button className="danger-button" onClick={onDelete}>삭제</button>
      </div>
    </aside>
  );
}
