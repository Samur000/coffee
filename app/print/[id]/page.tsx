'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBuilderStore } from '@/lib/store';
import { formatPrice, formatVolume } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Printer, Download, Share2 } from 'lucide-react';

export default function PrintPage() {
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    // В реальном приложении здесь был бы запрос к API
    // Пока используем данные из store
    const state = useBuilderStore.getState();
    setRecipe({
      id: recipeId,
      name: 'Кастомный напиток',
      timestamp: new Date(),
      state,
    });
  }, [recipeId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log('Downloading recipe...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Рецепт напитка',
        text: `Рецепт: ${recipe?.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Загрузка рецепта...</h1>
          <p className="text-muted-foreground">Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  const { state } = recipe;

  return (
    <div className="min-h-screen bg-white">
      {/* Заголовок для экрана */}
      <header className="no-print bg-white border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Чек бариста</h1>
          <div className="flex space-x-2">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Печать
            </Button>
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Скачать
            </Button>
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </div>
      </header>

      {/* Контент для печати */}
      <main className="container mx-auto p-4 print:p-0">
        <div className="max-w-md mx-auto bg-white print:max-w-none">
          {/* Заголовок чека */}
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold text-coffee-800">
              Конструктор напитков
            </h1>
            <p className="text-sm text-muted-foreground">
              Рецепт #{recipe.id}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(recipe.timestamp)}
            </p>
          </div>

          {/* Информация о напитке */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{recipe.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Режим */}
              <div className="flex justify-between">
                <span>Режим:</span>
                <Badge variant="outline">{state.mode}</Badge>
              </div>

              {/* Основа */}
              <div className="flex justify-between">
                <span>Основа:</span>
                <span>
                  {state.base.type === 'COFFEE' 
                    ? `${state.base.shots} шот${state.base.shots > 1 ? 'а' : ''}`
                    : state.base.type
                  }
                </span>
              </div>

              {/* Носитель */}
              <div className="flex justify-between">
                <span>Носитель:</span>
                <span className="capitalize">
                  {state.carrier.replace('_', ' ').toLowerCase()}
                </span>
              </div>

              {/* Вкусы */}
              {state.flavors.length > 0 && (
                <div>
                  <span className="block mb-1">Вкусы:</span>
                  {state.flavors.map((flavor: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm ml-2">
                      <span>{flavor.id}</span>
                      <span>{formatVolume(flavor.ml)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Сладость */}
              <div className="flex justify-between">
                <span>Сладость:</span>
                <span>{state.sweetnessLevel}/5</span>
              </div>

              {/* Лёд (для ICED) */}
              {state.mode === 'ICED' && state.iceLevel > 0 && (
                <div className="flex justify-between">
                  <span>Лёд:</span>
                  <span>{state.iceLevel === 1 ? 'Мало' : 'Много'}</span>
                </div>
              )}

              {/* Пена (для HOT) */}
              {state.mode === 'HOT' && state.foamLevel > 0 && (
                <div className="flex justify-between">
                  <span>Пена:</span>
                  <span>{state.foamLevel === 1 ? 'Мало' : 'Много'}</span>
                </div>
              )}

              {/* Дополнительные финиши */}
              {state.finishes.length > 0 && (
                <div>
                  <span className="block mb-1">Дополнительно:</span>
                  <div className="text-sm ml-2">
                    {state.finishes.join(', ')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Объёмы */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Объёмы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Основа:</span>
                  <span>{formatVolume(state.volumes.baseMl)}</span>
                </div>
                {state.volumes.flavorsMl > 0 && (
                  <div className="flex justify-between">
                    <span>Вкусы:</span>
                    <span>{formatVolume(state.volumes.flavorsMl)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Носитель:</span>
                  <span>{formatVolume(state.volumes.carrierMl)}</span>
                </div>
                {state.volumes.foamMl > 0 && (
                  <div className="flex justify-between">
                    <span>Пена:</span>
                    <span>{formatVolume(state.volumes.foamMl)}</span>
                  </div>
                )}
                {state.volumes.iceMl > 0 && (
                  <div className="flex justify-between">
                    <span>Лёд:</span>
                    <span>{formatVolume(state.volumes.iceMl)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Итого:</span>
                  <span>{formatVolume(state.volumes.totalMl)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Цена */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Цена</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-coffee-800">
                  {formatPrice(state.price)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR код для сканирования */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">QR код</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR код</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Сканируйте для получения полной информации
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Предупреждения */}
          {state.warnings.length > 0 && (
            <Card className="mb-4 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-800">Предупреждения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {state.warnings.map((warning: string, index: number) => (
                    <div key={index} className="text-sm text-yellow-700">
                      • {warning}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Футер чека */}
          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p>Спасибо за заказ!</p>
            <p>Приятного аппетита ☕</p>
            <p className="mt-2">
              Сгенерировано: {formatDate(new Date())}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
