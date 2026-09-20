import React from 'react';

export interface TeamColorBadgeProps {
  primaryColor?: string;
  secondaryColor?: string;
  primary?: string;
  secondary?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Marcador visual das cores primária e secundária da equipe (Req. 10)
 * Garante identificação visual esportiva sem necessidade de logos ou imagens externas.
 */
export const TeamColorBadge: React.FC<TeamColorBadgeProps> = ({
  primaryColor,
  secondaryColor,
  primary,
  secondary,
  size = 'md',
  className = '',
}) => {
  const pColor = primaryColor || primary || '#334155';
  const sColor = secondaryColor || secondary || '#94a3b8';

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded overflow-hidden shadow-sm shrink-0 border border-slate-700/60 ${sizeClasses[size]} ${className}`}
      title={`Cores: ${pColor} / ${sColor}`}
    >
      {/* Metade primária */}
      <div
        className="w-1/2 h-full"
        style={{ backgroundColor: pColor }}
      />
      {/* Metade secundária */}
      <div
        className="w-1/2 h-full"
        style={{ backgroundColor: sColor }}
      />
    </div>
  );
};

export interface TeamColorStripeProps {
  primaryColor?: string;
  secondaryColor?: string;
  primary?: string;
  secondary?: string;
  height?: string;
  className?: string;
}

export const TeamColorStripe: React.FC<TeamColorStripeProps> = ({
  primaryColor,
  secondaryColor,
  primary,
  secondary,
  height = 'h-1.5',
  className = '',
}) => {
  const pColor = primaryColor || primary || '#334155';
  const sColor = secondaryColor || secondary || '#94a3b8';

  return (
    <div className={`flex ${height} w-full overflow-hidden ${className}`}>
      <div className="flex-1" style={{ backgroundColor: pColor }} />
      <div className="w-1/3" style={{ backgroundColor: sColor }} />
    </div>
  );
};
