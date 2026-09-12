'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

export type ScoreMode = 'gte' | 'lte';

interface StarFilterProps {
  /** 当前选中的星数（0~5，0 表示不过滤） */
  stars: number;
  /** 比较方向：gte = 评分 ≥，lte = 评分 ≤ */
  mode: ScoreMode;
  onStarsChange: (stars: number) => void;
  onModeChange: (mode: ScoreMode) => void;
}

/**
 * 交互型星星筛选控件：
 * - 5 颗可点击星星控制查询分数（1 星 = 2 分，5 星 = 10 分），默认全灰 = 查询全部（≥0 分）；
 * - 点击已选中的星星可取消选择；悬停有预览效果；
 * - 星星旁的 ≥/≤ 控制器切换查询方向。
 */
export function StarFilter({ stars, mode, onStarsChange, onModeChange }: StarFilterProps) {
  const [hoverStars, setHoverStars] = useState(0);
  const displayStars = hoverStars > 0 ? hoverStars : stars;
  const hasFilter = stars > 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-sm font-medium text-slate-400">评分筛选</span>

      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHoverStars(0)}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const isLit = i <= displayStars;
          const isHoverPreview = hoverStars > 0 && i <= hoverStars;
          return (
            <button
              key={i}
              type="button"
              aria-label={stars === i ? `取消筛选 ${i * 2} 分` : `筛选评分${mode === 'gte' ? '不低于' : '不高于'} ${i * 2} 分`}
              onClick={() => onStarsChange(stars === i ? 0 : i)}
              onMouseEnter={() => setHoverStars(i)}
              className={`rounded-md p-0.5 transition-all duration-200 hover:scale-125 active:scale-95 ${
                isHoverPreview && !isLit ? 'opacity-70' : ''
              }`}
            >
              <Star
                className={`h-7 w-7 transition-colors duration-200 ${
                  isLit
                    ? 'text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-600 fill-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ≥ / ≤ 方向控制器 */}
      <button
        type="button"
        title={mode === 'gte' ? '当前：评分 ≥ 所选分数，点击切换为 ≤' : '当前：评分 ≤ 所选分数，点击切换为 ≥'}
        onClick={() => onModeChange(mode === 'gte' ? 'lte' : 'gte')}
        className={`inline-flex h-8 min-w-10 items-center justify-center rounded-lg border px-2 font-mono text-base font-bold transition-all duration-200 ${
          hasFilter
            ? 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 hover:scale-105'
            : 'border-white/10 bg-slate-800/50 text-slate-500 hover:border-white/20'
        }`}
      >
        {mode === 'gte' ? '≥' : '≤'}
      </button>

      <span
        className={`text-xs transition-colors ${
          hasFilter ? 'text-amber-300/90 font-medium' : 'text-slate-500'
        }`}
      >
        {hasFilter ? `评分 ${mode === 'gte' ? '≥' : '≤'} ${stars * 2} 分` : '全部评分'}
      </span>
    </div>
  );
}
