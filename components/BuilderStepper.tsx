'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBuilderStore, useBuilderMode } from '@/lib/store';
import { getCarrierOptions, getFlavorOptions, findCarrierById, findFlavorById } from '@/lib/config';
import { cn } from '@/lib/utils';

export function BuilderStepper() {
  const mode = useBuilderMode();
  const {
    base,
    carrier,
    flavors,
    sweetnessLevel,
    strengthLevel,
    iceLevel,
    foamLevel,
    finishes,
    setMode,
    setBase,
    setCarrier,
    addFlavor,
    removeFlavor,
    setFlavorMl,
    setSweetnessLevel,
    setStrengthLevel,
    setIceLevel,
    setFoamLevel,
    toggleFinish,
  } = useBuilderStore();

  const carrierOptions = getCarrierOptions();
  const flavorOptions = getFlavorOptions();

  return (
    <div className="space-y-6">
      {/* Шаг 1: Температура/Режим */}
      <Card>
        <CardHeader>
          <CardTitle>1. Температура и режим</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="HOT">Горячий</TabsTrigger>
              <TabsTrigger value="ICED">Холодный</TabsTrigger>
              <TabsTrigger value="FRAPPE">Фраппе</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Шаг 2: Основа */}
      <Card>
        <CardHeader>
          <CardTitle>2. Основа напитка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Кофе */}
          <div>
            <h4 className="font-medium mb-2">Кофе</h4>
            <div className="flex space-x-2">
              {[0, 1, 2].map((shots) => (
                <button
                  key={shots}
                  onClick={() => setBase({ type: 'COFFEE', shots: shots as 0 | 1 | 2 })}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-colors',
                    base.type === 'COFFEE' && base.shots === shots
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted'
                  )}
                >
                  {shots === 0 ? 'Без кофе' : `${shots} шот${shots > 1 ? 'а' : ''}`}
                </button>
              ))}
            </div>
          </div>

          {/* Безкофейные основы */}
          <div>
            <h4 className="font-medium mb-2">Без кофе</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'MATCHA', name: 'Матча' },
                { type: 'COCOA', name: 'Какао' },
                { type: 'CHAI', name: 'Чай-чай' },
                { type: 'FRUIT', name: 'Фруктовая' },
                { type: 'TONIC', name: 'Тоник' },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => setBase({ type: option.type as any })}
                  className={cn(
                    'px-3 py-2 rounded-lg border transition-colors text-sm',
                    base.type === option.type
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted'
                  )}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Шаг 3: Носитель */}
      <Card>
        <CardHeader>
          <CardTitle>3. Носитель</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {carrierOptions.map((option) => {
              const isSelected = carrier === option.id;
              const isDisabled = mode === 'HOT' && !option.isHeatable;
              
              return (
                <button
                  key={option.id}
                  onClick={() => !isDisabled && setCarrier(option.id)}
                  disabled={isDisabled}
                  className={cn(
                    'p-3 rounded-lg border transition-colors text-left',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isDisabled
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-background hover:bg-muted'
                  )}
                >
                  <div className="font-medium">{option.name}</div>
                  {option.surcharge && (
                    <div className="text-xs opacity-75">+{option.surcharge}₽</div>
                  )}
                  {isDisabled && (
                    <div className="text-xs">Недоступно в горячем режиме</div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Шаг 4: Вкусы */}
      <Card>
        <CardHeader>
          <CardTitle>4. Вкусы и сладость</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Уровень сладости */}
          <div>
            <h4 className="font-medium mb-2">Уровень сладости</h4>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setSweetnessLevel(level as any)}
                  className={cn(
                    'w-10 h-10 rounded-full border transition-colors flex items-center justify-center',
                    sweetnessLevel === level
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор вкусов */}
          <div>
            <h4 className="font-medium mb-2">Вкусы</h4>
            <div className="grid grid-cols-3 gap-2">
              {flavorOptions.map((option) => {
                const flavor = flavors.find(f => f.id === option.id);
                const isSelected = !!flavor;
                
                return (
                  <div key={option.id} className="space-y-1">
                    <button
                      onClick={() => isSelected ? removeFlavor(option.id) : addFlavor(option.id)}
                      className={cn(
                        'w-full p-2 rounded-lg border transition-colors text-sm',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted'
                      )}
                    >
                      {option.name}
                    </button>
                    {isSelected && (
                      <div className="flex items-center space-x-1">
                        <input
                          type="range"
                          min="5"
                          max="30"
                          step="5"
                          value={flavor.ml}
                          onChange={(e) => setFlavorMl(option.id, parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-xs w-8">{flavor.ml}мл</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Шаг 5: Финиш */}
      <Card>
        <CardHeader>
          <CardTitle>5. Финиш и дополнения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Лёд (только для ICED) */}
          {mode === 'ICED' && (
            <div>
              <h4 className="font-medium mb-2">Количество льда</h4>
              <div className="flex space-x-2">
                {[0, 1, 2].map((level) => (
                  <button
                    key={level}
                    onClick={() => setIceLevel(level as any)}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      iceLevel === level
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    )}
                  >
                    {level === 0 ? 'Без льда' : level === 1 ? 'Мало' : 'Много'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Пена (только для HOT) */}
          {mode === 'HOT' && (
            <div>
              <h4 className="font-medium mb-2">Пена</h4>
              <div className="flex space-x-2">
                {[0, 1, 2].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFoamLevel(level as any)}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      foamLevel === level
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    )}
                  >
                    {level === 0 ? 'Без пены' : level === 1 ? 'Мало' : 'Много'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Дополнительные финиши */}
          <div>
            <h4 className="font-medium mb-2">Дополнительно</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'WHIPPED', name: 'Взбитые сливки' },
                { id: 'CINNAMON_DUST', name: 'Корица' },
                { id: 'COCOA_DUST', name: 'Какао' },
                { id: 'CHOCOLATE_SHAVINGS', name: 'Шоколадная стружка' },
                { id: 'MARSHMALLOW', name: 'Маршмэллоу' },
              ].map((finish) => {
                const isSelected = finishes.includes(finish.id as any);
                return (
                  <button
                    key={finish.id}
                    onClick={() => toggleFinish(finish.id as any)}
                    className={cn(
                      'px-3 py-1 rounded-full border transition-colors text-sm',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    )}
                  >
                    {finish.name}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
