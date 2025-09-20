'use client';

import React from 'react';
import { useBuilderVolumes, useBuilderMode } from '@/lib/store';
import { volumesToPercentages } from '@/lib/formulas';
import { cn } from '@/lib/utils';

interface LiveCupPreviewProps {
  className?: string;
}

export function LiveCupPreview({ className }: LiveCupPreviewProps) {
  const volumes = useBuilderVolumes();
  const mode = useBuilderMode();
  const percentages = volumesToPercentages(volumes);

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="relative w-32 h-40">
        {/* Стакан */}
        <svg
          viewBox="0 0 128 160"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Контур стакана */}
          <path
            d="M20 20 L20 140 Q20 150 30 150 L98 150 Q108 150 108 140 L108 20 Q108 10 98 10 L30 10 Q20 10 20 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-coffee-300"
          />
          
          {/* Лёд (для ICED режима) */}
          {mode === 'ICED' && volumes.iceMl > 0 && (
            <g className="ice-layer">
              {Array.from({ length: Math.floor(volumes.iceMl / 10) }, (_, i) => (
                <rect
                  key={i}
                  x={25 + (i % 4) * 20}
                  y={140 - (i % 3) * 15 - 20}
                  width="15"
                  height="12"
                  fill="url(#iceGradient)"
                  opacity="0.7"
                  rx="2"
                />
              ))}
            </g>
          )}
          
          {/* Пена/взбитые сливки */}
          {volumes.foamMl > 0 && (
            <rect
              x="22"
              y={20 + (100 - percentages.foam)}
              width="84"
              height={percentages.foam * 1.2}
              fill="url(#foamGradient)"
              rx="4"
            />
          )}
          
          {/* Носитель (молоко/вода/сок) */}
          <rect
            x="22"
            y={20 + (100 - percentages.foam - percentages.carrier)}
            width="84"
            height={percentages.carrier * 1.2}
            fill="url(#carrierGradient)"
            rx="2"
          />
          
          {/* Сиропы/вкусы */}
          {volumes.flavorsMl > 0 && (
            <rect
              x="22"
              y={20 + (100 - percentages.foam - percentages.carrier - percentages.flavors)}
              width="84"
              height={percentages.flavors * 1.2}
              fill="url(#flavorGradient)"
              rx="2"
            />
          )}
          
          {/* Основа (кофе/матча/какао) */}
          <rect
            x="22"
            y={20 + (100 - percentages.foam - percentages.carrier - percentages.flavors - percentages.base)}
            width="84"
            height={percentages.base * 1.2}
            fill="url(#baseGradient)"
            rx="2"
          />
          
          {/* Градиенты */}
          <defs>
            <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>
            
            <linearGradient id="flavorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D2691E" />
              <stop offset="100%" stopColor="#CD853F" />
            </linearGradient>
            
            <linearGradient id="carrierGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5F5DC" />
              <stop offset="100%" stopColor="#FFF8DC" />
            </linearGradient>
            
            <linearGradient id="foamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFACD" />
              <stop offset="100%" stopColor="#FFFFE0" />
            </linearGradient>
            
            <linearGradient id="iceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E6F3FF" />
              <stop offset="100%" stopColor="#B3D9FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Легенда объёмов */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Основа:</span>
          <span>{volumes.baseMl} мл</span>
        </div>
        {volumes.flavorsMl > 0 && (
          <div className="flex justify-between">
            <span>Вкусы:</span>
            <span>{volumes.flavorsMl} мл</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Носитель:</span>
          <span>{volumes.carrierMl} мл</span>
        </div>
        {volumes.foamMl > 0 && (
          <div className="flex justify-between">
            <span>Пена:</span>
            <span>{volumes.foamMl} мл</span>
          </div>
        )}
        {volumes.iceMl > 0 && (
          <div className="flex justify-between">
            <span>Лёд:</span>
            <span>{volumes.iceMl} мл</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t pt-1">
          <span>Итого:</span>
          <span>{volumes.totalMl} мл</span>
        </div>
      </div>
    </div>
  );
}
