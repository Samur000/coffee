'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBuilderStore } from '@/lib/store';
import { getPresets } from '@/lib/config';
import { cn } from '@/lib/utils';
import { Coffee, Thermometer, Droplets } from 'lucide-react';

export function PresetsCarousel() {
  const { loadPreset } = useBuilderStore();
  const presets = getPresets();

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'HOT':
        return <Thermometer className="w-4 h-4 text-red-500" />;
      case 'ICED':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'FRAPPE':
        return <Coffee className="w-4 h-4 text-green-500" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'HOT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ICED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FRAPPE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Популярные рецепты</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex-shrink-0 w-64"
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => loadPreset(preset)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{preset.name}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', getModeColor(preset.mode))}
                    >
                      {getModeIcon(preset.mode)}
                      <span className="ml-1">{preset.mode}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Основа:</span>
                      <span>
                        {preset.base.type === 'COFFEE' 
                          ? `${preset.base.shots} шот${preset.base.shots > 1 ? 'а' : ''}`
                          : preset.base.type
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Носитель:</span>
                      <span className="capitalize">
                        {preset.carrier.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                    {preset.flavors.length > 0 && (
                      <div className="flex justify-between">
                        <span>Вкусы:</span>
                        <span>
                          {preset.flavors.map(f => f.id).join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Сладость:</span>
                      <span>{preset.sweetnessLevel}/5</span>
                    </div>
                    {preset.notes && (
                      <div className="text-xs text-muted-foreground italic">
                        {preset.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
