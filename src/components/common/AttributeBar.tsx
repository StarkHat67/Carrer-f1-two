import React from 'react';

interface AttributeBarProps {
  label: string;
  value: number;
  max?: number;
  showValue?: boolean;
  compact?: boolean;
  highlight?: boolean;
}

export const AttributeBar: React.FC<AttributeBarProps> = ({
  label,
  value,
  max = 99,
  showValue = true,
  compact = false,
  highlight = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Cores por faixa de rendimento (conforme especificação visual)
  // 80+ excelente (verde/ciano)
  // 70-79 bom (azul/verde-claro)
  // 60-69 médio (amarelo/laranja)
  // abaixo de 60 inicial (cinza/laranja suave)
  let barColor = 'bg-slate-500';
  let textColor = 'text-slate-400';

  if (value >= 80) {
    barColor = 'bg-emerald-400';
    textColor = 'text-emerald-400 font-bold';
  } else if (value >= 70) {
    barColor = 'bg-sky-400';
    textColor = 'text-sky-400 font-semibold';
  } else if (value >= 60) {
    barColor = 'bg-amber-400';
    textColor = 'text-amber-400 font-medium';
  } else {
    barColor = 'bg-slate-400';
    textColor = 'text-slate-400';
  }

  return (
    <div className={`flex flex-col gap-1 w-full ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center justify-between font-medium">
        <span className={`tracking-tight text-xs ${highlight ? 'text-slate-100 font-bold' : 'text-slate-300'}`}>
          {label}
        </span>
        {showValue && (
          <span className={`tabular-nums font-mono text-xs ${textColor}`}>
            {value}
          </span>
        )}
      </div>

      <div className="h-1.5 w-full bg-[#0a0d14] rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
