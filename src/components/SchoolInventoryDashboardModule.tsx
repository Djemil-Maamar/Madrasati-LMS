import React from 'react';
import {
  Package,
  Wrench,
  BookOpen,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Layers,
  Sparkles,
  MapPin,
  User,
} from 'lucide-react';
import { InventoryItem, Language } from '../types';

interface SchoolInventoryDashboardModuleProps {
  inventory: InventoryItem[];
  language: Language;
  onNavigateToInventory?: () => void;
  onQuickMaintenance?: (item: InventoryItem) => void;
}

export const SchoolInventoryDashboardModule: React.FC<SchoolInventoryDashboardModuleProps> = ({
  inventory,
  language,
  onNavigateToInventory,
  onQuickMaintenance,
}) => {
  const isArabic = language === 'ar';

  // Metrics
  const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = inventory.reduce(
    (acc, item) => acc + (item.unitValueDZD || 0) * item.quantity,
    0
  );

  const maintenanceAlerts = inventory.filter(
    (item) => item.condition === 'needs_maintenance' || item.condition === 'under_repair'
  );

  const activeAssignedCount = inventory.filter(
    (item) => item.assignmentStatus !== 'in_storage'
  ).length;

  const libraryBooksCount = inventory
    .filter((item) => item.category === 'library_book')
    .reduce((acc, item) => acc + item.quantity, 0);

  const libraryBorrowedCount = inventory
    .filter((item) => item.category === 'library_book')
    .reduce((acc, item) => acc + (item.quantity - item.availableQuantity), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-all">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isArabic ? 'جرد التجهيزات والوسائل التعليمية والمكتبة' : 'Inventaire & Équipements Scolaires'}
              </h3>
              {maintenanceAlerts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold border border-rose-200 dark:border-rose-800 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {maintenanceAlerts.length} {isArabic ? 'صيانة مطلوبة' : 'à réviser'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isArabic
                ? 'متابعة الأجهزة الرقمية، كتب ومراجع المكتبة، وتجهيزات القاعات المدرسية وحالة صيانتها'
                : 'Gestion du matériel didactique, fonds documentaire et suivi de maintenance'}
            </p>
          </div>
        </div>

        {onNavigateToInventory && (
          <button
            onClick={onNavigateToInventory}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span>{isArabic ? 'إدارة الجرد الكامل' : 'Consulter l’inventaire'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        )}
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Assets & Value */}
        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{isArabic ? 'إجمالي المقتنيات' : 'Total Équipements'}</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalItems} <span className="text-xs font-normal text-slate-500">{isArabic ? 'قطعة' : 'unités'}</span>
          </div>
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {isArabic ? 'القيمة التقديرية:' : 'Valeur:'} {totalValue.toLocaleString('fr-FR')} {isArabic ? 'د.ج' : 'DZD'}
          </div>
        </div>

        {/* Assigned / In Use */}
        <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3.5 rounded-xl border border-blue-200/70 dark:border-blue-800">
          <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center justify-between">
            <span>{isArabic ? 'مخصصة وقيد الاستخدام' : 'En exploitation'}</span>
            <Monitor className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-950 dark:text-blue-100 mt-1">
            {activeAssignedCount} <span className="text-xs font-normal text-blue-600">{isArabic ? 'وسيلة' : 'actifs'}</span>
          </div>
          <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 mt-0.5">
            {isArabic ? 'موزعة على القاعات والمخابر والأساتذة' : 'Affectés aux classes & labos'}
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className={`p-3.5 rounded-xl border ${
          maintenanceAlerts.length > 0
            ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
        }`}>
          <div className="text-[11px] font-bold flex items-center justify-between">
            <span>{isArabic ? 'تنبيهات الصيانة' : 'Maintenance'}</span>
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black mt-1">
            {maintenanceAlerts.length} <span className="text-xs font-normal">{isArabic ? 'حالة فحص' : 'alertes'}</span>
          </div>
          <div className="text-[10px] font-semibold mt-0.5">
            {maintenanceAlerts.length > 0
              ? isArabic ? 'تتطلب تدخلاً تقنياً عاجلاً' : 'Intervention requise'
              : isArabic ? 'جميع الأجهزة سليمة وتعمل' : 'Tout est fonctionnel'}
          </div>
        </div>

        {/* Library Books Stats */}
        <div className="bg-purple-50/70 dark:bg-purple-950/40 p-3.5 rounded-xl border border-purple-200/70 dark:border-purple-800">
          <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center justify-between">
            <span>{isArabic ? 'رصيد المكتبة المدرسية' : 'Fonds Bibliothèque'}</span>
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-950 dark:text-purple-100 mt-1">
            {libraryBooksCount} <span className="text-xs font-normal text-purple-600">{isArabic ? 'كتاب ومجلد' : 'livres'}</span>
          </div>
          <div className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 mt-0.5">
            {libraryBorrowedCount} {isArabic ? 'نسخة معارة حالياً للمطالعة' : 'prêts en cours'}
          </div>
        </div>

      </div>

      {/* Two Column Layout: Urgent Maintenance List + Recent Asset Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Urgent Maintenance / Follow-up list */}
        <div className="bg-slate-50/80 dark:bg-slate-850/60 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              {isArabic ? 'الأجهزة التي تتطلب متابعة وصيانة' : 'Matériel nécessitant une révision'}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {maintenanceAlerts.length} {isArabic ? 'أجهزة' : 'éléments'}
            </span>
          </div>

          {maintenanceAlerts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>{isArabic ? 'كافة التجهيزات بحالة بيداغوجية ممتازة' : 'Tous les équipements sont en bon état'}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {maintenanceAlerts.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {isArabic ? item.nameAr : item.nameFr}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {item.condition === 'needs_maintenance'
                          ? isArabic ? 'يحتاج صيانة' : 'Maintenance requise'
                          : isArabic ? 'قيد الإصلاح' : 'En réparation'}
                      </span>
                      <span>•</span>
                      <span className="truncate">{item.assignedToLocation || 'المخزن'}</span>
                    </div>
                  </div>

                  {onQuickMaintenance && (
                    <button
                      onClick={() => onQuickMaintenance(item)}
                      className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[10px] font-bold border border-amber-200 dark:border-amber-800 shrink-0 cursor-pointer transition"
                    >
                      {isArabic ? 'متابعة' : 'Détails'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Equipment & Classroom Deployment Overview */}
        <div className="bg-slate-50/80 dark:bg-slate-850/60 rounded-xl p-4 border border-slate-200/70 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-indigo-600" />
              {isArabic ? 'آخر التخصيصات والإعارات الميدانية' : 'Dernières affectations'}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {isArabic ? 'نشط' : 'Actif'}
            </span>
          </div>

          <div className="space-y-2">
            {inventory
              .filter((i) => i.assignmentStatus !== 'in_storage')
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {isArabic ? item.nameAr : item.nameFr}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{item.assignedToLocation}</span>
                      </span>
                      {item.assignedToName && (
                        <>
                          <span>•</span>
                          <span className="truncate text-indigo-700 dark:text-indigo-300 font-medium">
                            {item.assignedToName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold shrink-0">
                    {item.quantity} {isArabic ? 'وحدة' : 'u.'}
                  </span>
                </div>
              ))}
          </div>
        </div>

      </div>

    </div>
  );
};
