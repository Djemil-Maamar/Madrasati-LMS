import React, { useState } from 'react';
import {
  Settings,
  Save,
  Check,
  School,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Layers,
  Sun,
  Moon,
  Laptop,
  Palette,
} from 'lucide-react';
import { SchoolConfig, Language, EducationCycle, ThemeMode } from '../types';
import { translations } from '../i18n/translations';

interface SettingsViewProps {
  schoolConfig: SchoolConfig;
  language: Language;
  theme?: ThemeMode;
  onSaveConfig: (newConfig: SchoolConfig) => void;
  onThemeChange?: (theme: ThemeMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  schoolConfig,
  language,
  theme = 'light',
  onSaveConfig,
  onThemeChange,
}) => {
  const t = translations[language];

  const [formData, setFormData] = useState<SchoolConfig>({ ...schoolConfig });
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('madrasati_theme') as ThemeMode) || theme;
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSelectTheme = (mode: ThemeMode) => {
    setCurrentTheme(mode);
    localStorage.setItem('madrasati_theme', mode);
    if (onThemeChange) {
      onThemeChange(mode);
    } else {
      // Direct DOM update fallback
      const root = document.documentElement;
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    localStorage.setItem('madrasati_theme', currentTheme);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const toggleCycle = (cycle: EducationCycle) => {
    const current = formData.activeCycles || [];
    const exists = current.includes(cycle);
    const updated = exists ? current.filter((c) => c !== cycle) : [...current, cycle];
    setFormData({ ...formData, activeCycles: updated });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-100">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t.settings_title}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ar'
              ? 'تخصيص هوية وبيانات المؤسسة التربوية، والتحكم في مظهر الواجهة والوضع الليلي (Dark/Light Mode).'
              : 'Configuration de l\'identité de l\'établissement et des préférences d\'apparence (Dark/Light).'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{t.success}</span>
            </span>
          )}
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t.save}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Dark/Light Mode Appearance Preference Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'ar' ? 'مظهر الواجهة والوضع الليلي (Dark / Light Mode)' : 'Thème & Apparence (Dark/Light)'}
              </span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {language === 'ar' ? 'يتم الحفظ تلقائياً في المتصفح (localStorage)' : 'Enregistré dans localStorage'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'اختر النمط البصري المناسب لعينيك وظروف العمل. يتم تطبيق التغيير فورياً على كافة واجهات النظام.'
              : 'Choisissez le mode d’affichage adapté à votre environnement.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Light Mode Option */}
            <div
              onClick={() => handleSelectTheme('light')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                currentTheme === 'light'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-slate-800 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                {currentTheme === 'light' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {language === 'ar' ? 'الوضع الفاتح (Light Mode)' : 'Mode Clair (Light)'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'ألوان ناصعة ومثالية للإضاءة النهارية وطباعة التقارير.'
                    : 'Idéal pour le travail en journée et les impressions.'}
                </p>
              </div>
            </div>

            {/* Dark Mode Option */}
            <div
              onClick={() => handleSelectTheme('dark')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                currentTheme === 'dark'
                  ? 'border-emerald-500 bg-slate-800 dark:bg-slate-800 shadow-xs text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-900 text-indigo-300 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                {currentTheme === 'dark' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">
                  {language === 'ar' ? 'الوضع المظلم (Dark Mode)' : 'Mode Sombre (Dark)'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {language === 'ar'
                    ? 'تصميم داكن عالي التباين، مريح للعين أثناء العمل الليلي والمطول.'
                    : 'Repose les yeux lors du travail nocturne ou prolongé.'}
                </p>
              </div>
            </div>

            {/* System Auto Option */}
            <div
              onClick={() => handleSelectTheme('system')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                currentTheme === 'system'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-slate-800 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                {currentTheme === 'system' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تلقائي وفق النظام (Auto / Système)' : 'Automatique (Système)'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'يتزامن تلقائياً مع تفضيلات نظام التشغيل في جهازك.'
                    : 'S’adapte automatiquement au réglage de votre appareil.'}
                </p>
              </div>
            </div>

          </div>
        </div>
        
        {/* School Name in all 3 languages (Administrator config as requested) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ar' ? 'اسم المؤسسة وهوية العرض' : 'Configuration de l’Établissement'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.schoolNameAr}</label>
              <input
                type="text"
                required
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.schoolNameFr}</label>
              <input
                type="text"
                value={formData.nameFr}
                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.schoolNameEn}</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Administration details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>{language === 'ar' ? 'بيانات الإدارة والاتصال' : 'Direction & Coordonnées'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.directorName}</label>
              <input
                type="text"
                value={formData.directorName}
                onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.academicYearLabel}</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-emerald-800 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.currency}</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.phoneNumber}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.emailAddress}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.schoolAddress}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Education Cycles Active */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>{language === 'ar' ? 'الأطوار التعليمية المعتمدة بالمؤسسة' : 'Cycles d’Enseignement Actifs'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activeCycles.includes('primary')}
                onChange={() => toggleCycle('primary')}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.cycle_primary} (1AP - 5AP)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activeCycles.includes('middle')}
                onChange={() => toggleCycle('middle')}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.cycle_middle} (1AM - 4AM BEM)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activeCycles.includes('secondary')}
                onChange={() => toggleCycle('secondary')}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.cycle_secondary} (1AS - 3AS BAC)</span>
            </label>
          </div>
        </div>

      </form>

    </div>
  );
};

