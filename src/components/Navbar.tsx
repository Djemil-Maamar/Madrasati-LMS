import React from 'react';
import {
  School,
  Globe,
  UserCheck,
  AlertTriangle,
  Printer,
  Sparkles,
  Calendar,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import {
  Language,
  UserRole,
  SchoolConfig,
  InternalMessage,
  ClassItem,
  Teacher,
  ThemeMode,
} from '../types';
import { translations } from '../i18n/translations';
import { InternalMessagingNotifications } from './InternalMessagingNotifications';

interface NavbarProps {
  schoolConfig: SchoolConfig;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  conflictCount: number;
  onOpenConflictsModal: () => void;
  onQuickAiExam: () => void;
  messages: InternalMessage[];
  classes: ClassItem[];
  teachers: Teacher[];
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  onSendMessage: (msg: InternalMessage) => void;
  onMarkAsRead: (messageId: string) => void;
  onMarkAllAsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolConfig,
  language,
  onLanguageChange,
  role,
  onRoleChange,
  conflictCount,
  onOpenConflictsModal,
  onQuickAiExam,
  messages,
  classes,
  teachers,
  theme = 'light',
  onThemeChange,
  onSendMessage,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const t = translations[language];

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    if (onThemeChange) {
      onThemeChange(nextTheme);
    }
  };

  const currentSchoolName =
    language === 'ar'
      ? schoolConfig.nameAr
      : language === 'fr'
      ? schoolConfig.nameFr
      : schoolConfig.nameEn;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">
                {currentSchoolName || t.appTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {t.academicYearLabel}: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{schoolConfig.academicYear}</span>
              </p>
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick AI Exam Button */}
            <button
              onClick={onQuickAiExam}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.nav_ai_exam}</span>
            </button>

            {/* Timetable Conflict Warning Badge */}
            {conflictCount > 0 && (
              <button
                onClick={onOpenConflictsModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition animate-pulse cursor-pointer"
                title={t.conflictAlert}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">{t.conflictAlert}</span>
                <span className="px-1.5 py-0.2 bg-red-600 text-white text-[11px] rounded-full font-bold">
                  {conflictCount}
                </span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="relative inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
              <button
                onClick={() => onRoleChange('admin')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  role === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.role_admin}
              </button>
              <button
                onClick={() => onRoleChange('teacher')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  role === 'teacher'
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.role_teacher}
              </button>
              <button
                onClick={() => onRoleChange('parent')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                  role === 'parent'
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.role_parent}
              </button>
            </div>

            {/* Internal Messaging & Notifications Button */}
            <InternalMessagingNotifications
              messages={messages}
              classes={classes}
              teachers={teachers}
              role={role}
              language={language}
              onSendMessage={onSendMessage}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
            />

            {/* Quick Theme Toggle Button (Sun / Moon) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title={theme === 'dark' ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع المظلم'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <button
                onClick={() => onLanguageChange('ar')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  language === 'ar' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => onLanguageChange('fr')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  language === 'fr' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  language === 'en' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title={t.print}
            >
              <Printer className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
