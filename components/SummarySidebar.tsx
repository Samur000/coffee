'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveCupPreview } from './LiveCupPreview';
import { useBuilderStore, useBuilderPrice, useBuilderWarnings } from '@/lib/store';
import { getPriceBreakdownItems, formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { Coffee, Download, Save, RotateCcw } from 'lucide-react';

export function SummarySidebar() {
  const price = useBuilderPrice();
  const warnings = useBuilderWarnings();
  const { getPriceBreakdown, reset, loadPreset } = useBuilderStore();
  
  const priceBreakdown = getPriceBreakdown();
  const breakdownItems = getPriceBreakdownItems(priceBreakdown);

  const handleExportRecipe = () => {
    // TODO: Implement export to print page
    console.log('Exporting recipe...');
  };

  const handleSavePreset = () => {
    // TODO: Implement save preset
    console.log('Saving preset...');
  };

  return (
    <div className="space-y-6">
      {/* Живой превью стакана */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="w-5 h-5" />
            <span>Превью напитка</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LiveCupPreview />
        </CardContent>
      </Card>

      {/* Предупреждения */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Предупреждения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div key={index} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                  {warning}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Детализация цены */}
      <Card>
        <CardHeader>
          <CardTitle>Детализация цены</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {breakdownItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className={cn(
                  item.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {item.isPositive ? '+' : ''}{formatPrice(item.value)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Итого:</span>
              <span className="text-lg">{formatPrice(price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Аллергены и диетические ограничения */}
      <Card>
        <CardHeader>
          <CardTitle>Аллергены</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="warning">Молоко</Badge>
            <Badge variant="info">Лактоза</Badge>
            {/* TODO: Dynamic allergen detection */}
          </div>
        </CardContent>
      </Card>

      {/* Действия */}
      <Card>
        <CardHeader>
          <CardTitle>Действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleExportRecipe}
            className="w-full"
            variant="default"
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт в чек
          </Button>
          
          <Button 
            onClick={handleSavePreset}
            className="w-full"
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить как пресет
          </Button>
          
          <Button 
            onClick={reset}
            className="w-full"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
        </CardContent>
      </Card>

      {/* Рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle>Рекомендации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Ореховые вкусы хорошо сочетаются с овсяным молоком</p>
            <p>• Цитрусовые вкусы идеальны с тоником</p>
            <p>• Шоколадные вкусы отлично подходят к коровьему молоку</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
