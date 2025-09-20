'use client';

import React, { useEffect } from 'react';
import { BuilderStepper } from '@/components/BuilderStepper';
import { SummarySidebar } from '@/components/SummarySidebar';
import { PresetsCarousel } from '@/components/PresetsCarousel';
import { useBuilderStore } from '@/lib/store';

export default function HomePage() {
  const { updateCalculations } = useBuilderStore();

  // Обновляем расчёты при загрузке
  useEffect(() => {
    updateCalculations();
  }, [updateCalculations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-cream-50">
      {/* Заголовок */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-coffee-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-coffee-800">
                Конструктор напитков 250 мл
              </h1>
              <p className="text-sm text-coffee-600">
                Создайте идеальный напиток с живым превью и расчётом объёмов
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Онлайн</span>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Конструктор */}
          <div className="lg:col-span-2 space-y-6">
            {/* Пресеты */}
            <PresetsCarousel />
            
            {/* Конструктор */}
            <BuilderStepper />
          </div>

          {/* Правая колонка - Сайдбар */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SummarySidebar />
            </div>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-coffee-200 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              © 2024 Конструктор напитков. Все права защищены.
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin" className="hover:text-coffee-600 transition-colors">
                Админ-панель
              </a>
              <a href="/help" className="hover:text-coffee-600 transition-colors">
                Помощь
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
