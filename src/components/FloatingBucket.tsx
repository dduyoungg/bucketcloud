"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import type { BucketItem, BucketPatch } from "@/lib/types";
import { fontClassName } from "@/lib/types";

type Props = {
  item: BucketItem;
  selected: boolean;
  boardRef: RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onPatch: (patch: BucketPatch) => void;
};

export function FloatingBucket({ item, selected, boardRef, onSelect, onPatch }: Props) {
  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) {
    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const x = ((info.point.x - rect.left) / rect.width) * 100;
    const y = ((info.point.y - rect.top) / rect.height) * 100;

    onPatch({
      x: Math.min(88, Math.max(2, x)),
      y: Math.min(82, Math.max(4, y))
    });
  }

  return (
    <motion.div
      className={`floating-bucket ${selected ? "is-selected" : ""}`}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        rotate: item.rotate
      }}
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onPointerDown={onSelect}
      whileTap={{ scale: 0.96 }}
    >
      <div
        className={`bucket-word ${fontClassName[item.font_family] ?? "font-sans"}`}
        style={{
          color: item.color,
          background: item.sticker_color,
          fontSize: `${item.font_size}px`,
          animationDuration: `${4.8 / Math.max(item.animation_speed, 0.4)}s`
        }}
      >
        {item.title}
      </div>
    </motion.div>
  );
}
