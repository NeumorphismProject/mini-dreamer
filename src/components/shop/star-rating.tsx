'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  /** 评分（0~10 分），缺失、非数字或超出范围时展示 5 颗灰星 */
  score?: number;
  /** 是否展示数字评分文本 */
  showScore?: boolean;
  /** 星星尺寸类名 */
  className?: string;
}

/**
 * 展示型星星评分（只读）：
 * 2 分 = 1 颗星，1 分 = 半颗星，10 分 = 5 颗星；
 * 0 分 / 缺失 / 异常值均为 5 颗灰星（0 颗点亮）。
 */
export function StarRating({
  score,
  showScore = false,
  className = 'h-3.5 w-3.5',
}: StarRatingProps) {
  const isValid =
    typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 10;
  const lit = isValid ? (score as number) / 2 : 0;

  const formatScore = (value: number) =>
    Number.isInteger(value) ? `${value}分` : `${value.toFixed(1)}分`;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5" aria-label={isValid ? `评分 ${formatScore(score as number)}` : '暂无评分'}>
        {[0, 1, 2, 3, 4].map((i) => {
          if (lit >= i + 1) {
            // 满星
            return (
              <Star
                key={i}
                className={`${className} text-amber-400 fill-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.45)]`}
              />
            );
          }
          if (lit > i) {
            // 半星：灰色底星 + 左半边裁切的亮星
            return (
              <span key={i} className="relative inline-flex">
                <Star className={`${className} text-slate-600 fill-slate-600`} />
                <span className="absolute left-0 top-0 h-full w-1/2 overflow-hidden">
                  <Star
                    className={`${className} flex-shrink-0 text-amber-400 fill-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.45)]`}
                  />
                </span>
              </span>
            );
          }
          // 灰星
          return <Star key={i} className={`${className} text-slate-600 fill-slate-600`} />;
        })}
      </div>
      {showScore && isValid && (
        <span className="text-xs font-semibold text-amber-400/90">
          {formatScore(score as number)}
        </span>
      )}
    </div>
  );
}
