'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getConfig, updateConfig } from '@/lib/config';
import { formatPrice } from '@/lib/pricing';
import { Settings, DollarSign, Coffee, Droplets, Sparkles, Save, Download, Upload } from 'lucide-react';

export default function AdminPage() {
  const [config, setConfig] = useState(getConfig());
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (section: string, updates: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...updates }
    }));
    setHasChanges(true);
  };

  const handleSaveConfig = () => {
    try {
      updateConfig(config);
      setHasChanges(false);
      alert('Конфигурация сохранена!');
    } catch (error) {
      alert(`Ошибка сохранения: ${error}`);
    }
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          setConfig(importedConfig);
          setHasChanges(true);
        } catch (error) {
          alert('Ошибка чтения файла конфигурации');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-50">
      {/* Заголовок */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-coffee-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-coffee-600" />
              <div>
                <h1 className="text-2xl font-bold text-coffee-800">
                  Админ-панель
                </h1>
                <p className="text-sm text-coffee-600">
                  Управление конфигурацией и настройками
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="warning">Есть изменения</Badge>
              )}
              <Button onClick={handleSaveConfig} disabled={!hasChanges}>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pricing">
              <DollarSign className="w-4 h-4 mr-2" />
              Ценообразование
            </TabsTrigger>
            <TabsTrigger value="carriers">
              <Droplets className="w-4 h-4 mr-2" />
              Носители
            </TabsTrigger>
            <TabsTrigger value="flavors">
              <Coffee className="w-4 h-4 mr-2" />
              Вкусы
            </TabsTrigger>
            <TabsTrigger value="presets">
              <Sparkles className="w-4 h-4 mr-2" />
              Пресеты
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* Ценообразование */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Настройки ценообразования</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Базовая цена
                    </label>
                    <input
                      type="number"
                      value={config.pricing.basePrice}
                      onChange={(e) => handleConfigChange('pricing', { basePrice: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Дополнительный шот
                    </label>
                    <input
                      type="number"
                      value={config.pricing.extraShot}
                      onChange={(e) => handleConfigChange('pricing', { extraShot: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Дополнительный вкус (за 10мл)
                    </label>
                    <input
                      type="number"
                      value={config.pricing.extraFlavorPer10ml}
                      onChange={(e) => handleConfigChange('pricing', { extraFlavorPer10ml: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Наценка за RAF-базу
                    </label>
                    <input
                      type="number"
                      value={config.pricing.rafSurcharge}
                      onChange={(e) => handleConfigChange('pricing', { rafSurcharge: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Взбитые сливки
                    </label>
                    <input
                      type="number"
                      value={config.pricing.whippedSurcharge}
                      onChange={(e) => handleConfigChange('pricing', { whippedSurcharge: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Премиальное растительное молоко
                    </label>
                    <input
                      type="number"
                      value={config.pricing.premiumPlantSurcharge}
                      onChange={(e) => handleConfigChange('pricing', { premiumPlantSurcharge: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      FRAPPE режим
                    </label>
                    <input
                      type="number"
                      value={config.pricing.frappeBlendSurcharge}
                      onChange={(e) => handleConfigChange('pricing', { frappeBlendSurcharge: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Носители */}
          <TabsContent value="carriers">
            <Card>
              <CardHeader>
                <CardTitle>Настройки носителей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config.carriers.map((carrier, index) => (
                    <div key={carrier.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{carrier.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Тип: {carrier.kind} | Можно греть: {carrier.isHeatable ? 'Да' : 'Нет'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Наценка"
                          value={carrier.surcharge || 0}
                          onChange={(e) => {
                            const newCarriers = [...config.carriers];
                            newCarriers[index] = { ...carrier, surcharge: parseInt(e.target.value) || 0 };
                            setConfig(prev => ({ ...prev, carriers: newCarriers }));
                            setHasChanges(true);
                          }}
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                        <span className="text-sm text-muted-foreground">₽</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкусы */}
          <TabsContent value="flavors">
            <Card>
              <CardHeader>
                <CardTitle>Настройки вкусов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {config.flavors.map((flavor, index) => (
                    <div key={flavor.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{flavor.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Категория: {flavor.category}
                      </p>
                      {flavor.allergens && (
                        <div className="mt-2">
                          <Badge variant="warning" className="text-xs">
                            {flavor.allergens.join(', ')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Пресеты */}
          <TabsContent value="presets">
            <Card>
              <CardHeader>
                <CardTitle>Управление пресетами</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config.presets.map((preset) => (
                    <div key={preset.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{preset.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {preset.mode} | {preset.base.type} | {preset.carrier}
                      </p>
                      {preset.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {preset.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Общие настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Максимум сиропов (мл)
                    </label>
                    <input
                      type="number"
                      value={config.settings.maxFlavorMl}
                      onChange={(e) => handleConfigChange('settings', { maxFlavorMl: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Целевой объём (мл)
                    </label>
                    <input
                      type="number"
                      value={config.settings.volumeTarget}
                      onChange={(e) => handleConfigChange('settings', { volumeTarget: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showWarnings"
                      checked={config.settings.showWarnings}
                      onChange={(e) => handleConfigChange('settings', { showWarnings: e.target.checked })}
                    />
                    <label htmlFor="showWarnings" className="text-sm">
                      Показывать предупреждения
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoBalance"
                      checked={config.settings.autoBalance}
                      onChange={(e) => handleConfigChange('settings', { autoBalance: e.target.checked })}
                    />
                    <label htmlFor="autoBalance" className="text-sm">
                      Автоматическая балансировка объёмов
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Импорт/Экспорт</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleExportConfig} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт конфигурации
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportConfig}
                      className="hidden"
                      id="importConfig"
                    />
                    <Button asChild variant="outline" className="w-full">
                      <label htmlFor="importConfig" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Импорт конфигурации
                      </label>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
