'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface SwipeableReminderCardProps {
  id: string;
  onDismiss?: (id: string) => void;
  children: React.ReactNode;
}

export const SwipeableReminderCard: React.FC<SwipeableReminderCardProps> = ({
  id,
  onDismiss,
  children,
}) => {
  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const SWIPE_THRESHOLD = 75;

  // Background reveal opacity & scale based on drag distance
  const deleteOpacityLeft = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const deleteScaleLeft = useTransform(x, [0, SWIPE_THRESHOLD], [0.8, 1]);

  const deleteOpacityRight = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const deleteScaleRight = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.8]);

  const handleDismiss = (dir: 'left' | 'right') => {
    if (!onDismiss) return;
    setExitDirection(dir);
    setTimeout(() => {
      onDismiss(id);
      setExitDirection(null);
      setIsPastThreshold(false);
      x.set(0);
    }, 180);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        x: exitDirection === 'left' ? -400 : exitDirection === 'right' ? 400 : 0,
      }}
      exit={{
        opacity: 0,
        x: exitDirection === 'left' ? -400 : exitDirection === 'right' ? 400 : 0,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="relative overflow-hidden rounded-[10px]"
    >
      {/* Background Reveal Layer */}
      <div
        className={`absolute inset-0 rounded-[10px] flex items-center justify-between px-6 transition-colors duration-150 ${
          isPastThreshold ? 'bg-rose-600' : 'bg-rose-500 dark:bg-rose-900/90'
        }`}
      >
        {/* Left Action (Swiping Right) */}
        <motion.div
          style={{ opacity: deleteOpacityLeft, scale: deleteScaleLeft }}
          className="flex items-center justify-center text-white"
        >
          <Trash2 className="w-5 h-5" />
        </motion.div>

        {/* Right Action (Swiping Left) */}
        <motion.div
          style={{ opacity: deleteOpacityRight, scale: deleteScaleRight }}
          className="flex items-center justify-center text-white ml-auto"
        >
          <Trash2 className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Draggable Foreground Card */}
      <motion.div
        drag={onDismiss ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        style={{ x }}
        onDrag={(_, info) => {
          const past = Math.abs(info.offset.x) > SWIPE_THRESHOLD;
          if (past !== isPastThreshold) {
            setIsPastThreshold(past);
          }
        }}
        onDragEnd={(_, info) => {
          if (!onDismiss) return;
          const isSwipeDismiss =
            Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > 350;

          if (isSwipeDismiss) {
            const dir = info.offset.x < 0 || info.velocity.x < -250 ? 'left' : 'right';
            handleDismiss(dir);
          } else {
            setIsPastThreshold(false);
          }
        }}
        className="relative z-10 bg-white dark:bg-slate-800/95 rounded-[10px] cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
