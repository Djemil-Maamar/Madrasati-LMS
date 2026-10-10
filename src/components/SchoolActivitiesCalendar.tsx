import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Compass,
  Trophy,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Search,
  Check,
  Tag,
  Printer,
} from 'lucide-react';
import {
  SchoolActivity,
  ActivityCategory,
  ActivityStatus,
  ClassItem,
  Teacher,
  Language,
  SchoolConfig,
} from '../types';

interface SchoolActivitiesCalendarProps {
  activities: SchoolActivity[];
  classes: ClassItem[];
  teachers: Teacher[];
  schoolConfig: SchoolConfig;
  language: Language;
  onAddActivity: (act: SchoolActivity) => void;
  onUpdateActivity?: (act: SchoolActivity) => void;
}

export const SchoolActivitiesCalendar: React.FC<SchoolActivitiesCalendarProps> = ({
  activities,
  classes,
  teachers,
  schoolConfig,
  language,
  onAddActivity,
}) => {
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';

  // Calendar Date State (defaults to October 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [selectedDay, setSelectedDay] = useState<number | null>(22); // Day in month
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<SchoolActivity | null>(null);

  // Form State for Adding Activity
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<ActivityCategory>('trip');
  const [formDate, setFormDate] = useState('2026-10-25');
  const [formTime, setFormTime] = useState('08:30');
  const [formLocation, setFormLocation] = useState('');
  const [formClassIds, setFormClassIds] = useState<string[]>([]);
  const [formCost, setFormCost] = useState<number>(500);
  const [formBudget, setFormBudget] = useState<number>(25000);
  const [formSupervisorId, setFormSupervisorId] = useState<string>(teachers[0]?.id || '');
  const [formMaxParticipants, setFormMaxParticipants] = useState<number>(45);
  const [formStatus, setFormStatus] = useState<ActivityStatus>('scheduled');
  const [formNotes, setFormNotes] = useState('');

  // Month Names
  const monthNamesAr = [
    'جانفي (يناير)',
    'فيفري (فبراير)',
    'مارس',
    'أفريل (أبريل)',
    'ماي (مايو)',
    'جوان (يونيو)',
    'جويلية (يوليو)',
    'أوت (أغسطس)',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  const monthNamesFr = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const daysOfWeekAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysOfWeekFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Category Configuration Helper
  const getCategoryMeta = (cat: ActivityCategory) => {
    switch (cat) {
      case 'trip':
        return {
          label: isArabic ? 'رحلة ميدانية' : isFrench ? 'Sortie scolaire' : 'Field Trip',
          icon: Compass,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          badgeColor: '#10b981',
        };
      case 'sports':
        return {
          label: isArabic ? 'بطولة رياضية' : isFrench ? 'Compétition sportive' : 'Sports Event',
          icon: Trophy,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          badgeColor: '#f59e0b',
        };
      case 'science':
        return {
          label: isArabic ? 'نشاط علمي' : isFrench ? 'Activité scientifique' : 'Science Fair',
          icon: Sparkles,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          badgeColor: '#6366f1',
        };
      case 'culture':
      case 'workshop':
      case 'competition':
      default:
        return {
          label: isArabic ? 'ثقافة وورشات' : isFrench ? 'Culture & Ateliers' : 'Workshop',
          icon: Tag,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
          badgeColor: '#a855f7',
        };
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'registration_open':
        return {
          label: isArabic ? 'التسجيل مفتوح' : isFrench ? 'Inscriptions ouvertes' : 'Registration Open',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'scheduled':
        return {
          label: isArabic ? 'مجدول ومؤكد' : isFrench ? 'Planifié' : 'Scheduled',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'completed':
        return {
          label: isArabic ? 'تم بنجاح' : isFrench ? 'Terminé' : 'Completed',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'cancelled':
        return {
          label: isArabic ? 'مؤجل / ملغى' : isFrench ? 'Annulé' : 'Cancelled',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
        };
    }
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (categoryFilter !== 'all' && act.category !== categoryFilter) return false;
      if (classFilter !== 'all' && !act.participatingClassIds.includes(classFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesLoc = act.location.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesDesc) return false;
      }
      return true;
    });
  }, [activities, categoryFilter, classFilter, searchQuery]);

  // Calendar Matrix Computation for the active month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const matrix: Array<{
      dayNumber: number;
      dateString: string;
      activitiesForDay: SchoolActivity[];
      isCurrentMonth: boolean;
    }> = [];

    // Preceding empty/overflow days
    for (let i = 0; i < firstDayOfMonth; i++) {
      matrix.push({
        dayNumber: 0,
        dateString: '',
        activitiesForDay: [],
        isCurrentMonth: false,
      });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      const acts = activities.filter((a) => a.date === dateString);

      matrix.push({
        dayNumber: d,
        dateString,
        activitiesForDay: acts,
        isCurrentMonth: true,
      });
    }

    return matrix;
  }, [currentYear, currentMonth, activities]);

  // Activities happening on selectedDay
  const selectedDayActivities = useMemo(() => {
    if (!selectedDay) return [];
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
      selectedDay
    ).padStart(2, '0')}`;
    return activities.filter((a) => a.date === dateString);
  }, [activities, currentYear, currentMonth, selectedDay]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  // Toggle Class in Form
  const toggleClassSelection = (cid: string) => {
    setFormClassIds((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid]
    );
  };

  // Handle Add Activity Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate || formClassIds.length === 0) return;

    const supervisor = teachers.find((t) => t.id === formSupervisorId);

    const newAct: SchoolActivity = {
      id: `act-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      date: formDate,
      time: formTime || '08:30',
      location: formLocation.trim() || 'المؤسسة',
      participatingClassIds: formClassIds,
      costPerStudent: Number(formCost) || 0,
      totalBudget: Number(formBudget) || 0,
      supervisorTeacherId: formSupervisorId,
      supervisorName: supervisor ? supervisor.name : 'الإدارة العامة',
      maxParticipants: Number(formMaxParticipants) || 45,
      currentParticipantsCount: 0,
      status: formStatus,
      contactNotes: formNotes.trim(),
    };

    onAddActivity(newAct);

    // Reset Form
    setFormTitle('');
    setFormDescription('');
    setFormLocation('');
    setFormClassIds([]);
    setFormNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-6 p-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {isArabic
                  ? 'إدارة الأنشطة والرحلات المدرسية (التقويم التفاعلي)'
                  : isFrench
                  ? 'Gestion des Activités & Sorties Scolaires (Calendrier Interactif)'
                  : 'School Activities & Field Trips Interactive Calendar'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activities.length} {isArabic ? 'فعالية مبرمجة' : 'activités'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic
                ? 'برمجة ومتابعة الرحلات الاستكشافية، البطولات الرياضية، والمعارض العلمية، وضبط تواريخها والأقسام المشاركة والتكلفة'
                : 'Planification des sorties pédagogiques, classes participantes, budgets et suivi dans le calendrier interactif.'}
            </p>
          </div>
        </div>

        {/* Action Button: Add Activity */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start lg:self-center shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'إضافة نشاط / رحلة جديدة' : 'Nouvelle Activité / Sortie'}</span>
        </button>
      </div>

      {/* Filter Ribbon & Category Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 text-xs">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-bold">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {isArabic ? 'جميع الأنشطة' : 'Tout'} ({activities.length})
          </button>

          <button
            onClick={() => setCategoryFilter('trip')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'trip'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isArabic ? 'رحلات استكشافية' : 'Sorties'}</span>
          </button>

          <button
            onClick={() => setCategoryFilter('sports')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'sports'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{isArabic ? 'بطولات رياضية' : 'Sport'}</span>
          </button>

          <button
            onClick={() => setCategoryFilter('science')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'science'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'معارض علمية' : 'Sciences'}</span>
          </button>
        </div>

        {/* Class Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="all">{isArabic ? 'جميع الأقسام' : 'Toutes les classes'}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'بحث في الأنشطة...' : 'Recherche...'}
              className="ps-8 pe-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 w-36 sm:w-44 shadow-2xs"
            />
          </div>
        </div>

      </div>

      {/* Main Interactive Grid: Calendar (Left/Center) + Day/Event Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Calendar Month Matrix (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
          
          {/* Calendar Month Header Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                {isArabic ? monthNamesAr[currentMonth] : monthNamesFr[currentMonth]} {currentYear}
              </h4>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setCurrentMonth(9); // October
                  setCurrentYear(2026);
                  setSelectedDay(22);
                }}
                className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200 bg-white/70 transition cursor-pointer shadow-2xs"
              >
                {isArabic ? 'الشهر الحالي' : 'Ce mois'}
              </button>

              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer shadow-2xs"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer shadow-2xs"
                title="الشهر القادم"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-black text-slate-500 py-1 border-b border-slate-200">
            {(isArabic ? daysOfWeekAr : daysOfWeekFr).map((dayName, idx) => (
              <div key={idx} className="py-1">
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Month Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-18 sm:min-h-22 rounded-xl bg-slate-100/40 border border-transparent"
                  ></div>
                );
              }

              const isSelected = selectedDay === cell.dayNumber;
              const hasActivities = cell.activitiesForDay.length > 0;

              return (
                <div
                  key={`day-${cell.dayNumber}`}
                  onClick={() => setSelectedDay(cell.dayNumber)}
                  className={`min-h-18 sm:min-h-22 p-1.5 sm:p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-400/30'
                      : hasActivities
                      ? 'bg-white border-emerald-300 hover:border-emerald-400 shadow-2xs'
                      : 'bg-white/80 border-slate-200/70 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black ${
                        isSelected
                          ? 'text-indigo-900 bg-indigo-200/70 w-5 h-5 rounded-full flex items-center justify-center'
                          : hasActivities
                          ? 'text-emerald-900 font-extrabold'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasActivities && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    )}
                  </div>

                  {/* Activity Mini Badge Preview */}
                  <div className="space-y-1 mt-1">
                    {cell.activitiesForDay.map((act) => {
                      const meta = getCategoryMeta(act.category);
                      return (
                        <div
                          key={act.id}
                          className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold truncate flex items-center gap-1 shadow-2xs"
                          style={{
                            backgroundColor: `${meta.badgeColor}15`,
                            color: meta.badgeColor,
                            border: `1px solid ${meta.badgeColor}30`,
                          }}
                          title={act.title}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: meta.badgeColor }}
                          ></span>
                          <span className="truncate">{act.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-200">
            <span className="font-semibold">
              {isArabic ? 'اضغط على أي يوم في التقويم لعرض الأنشطة المقررة فيه' : 'Cliquez sur un jour'}
            </span>
            <div className="flex items-center gap-3 font-bold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {isArabic ? 'رحلة ميدانية' : 'Sortie'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {isArabic ? 'بطولة رياضية' : 'Sport'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {isArabic ? 'نشاط علمي' : 'Sciences'}
              </span>
            </div>
          </div>

        </div>

        {/* Selected Day / Live Activities Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Day Highlight Card */}
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold text-slate-700">
                {selectedDay
                  ? `${isArabic ? 'فعاليات يوم' : 'Activités du'} ${selectedDay} ${
                      isArabic ? monthNamesAr[currentMonth] : monthNamesFr[currentMonth]
                    }`
                  : isArabic ? 'حدد يوماً من التقويم' : 'Sélectionnez un jour'}
              </span>
              {selectedDayActivities.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {selectedDayActivities.length} {isArabic ? 'فعالية' : 'activités'}
                </span>
              )}
            </div>

            {selectedDayActivities.length === 0 ? (
              <div className="py-6 text-center text-slate-400 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
                <p className="text-xs font-medium">
                  {isArabic
                    ? 'لا توجد أنشطة مبرمجة في هذا اليوم تحديداً.'
                    : 'Aucune activité ce jour-là.'}
                </p>
                <button
                  onClick={() => {
                    if (selectedDay) {
                      setFormDate(
                        `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                          selectedDay
                        ).padStart(2, '0')}`
                      );
                    }
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition cursor-pointer"
                >
                  + {isArabic ? 'برمجة نشاط في هذا اليوم' : 'Planifier ce jour'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayActivities.map((act) => {
                  const meta = getCategoryMeta(act.category);
                  const status = getStatusBadge(act.status);
                  const MetaIcon = meta.icon;

                  return (
                    <div
                      key={act.id}
                      onClick={() => setSelectedActivityDetail(act)}
                      className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-400 transition cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.bg} flex items-center gap-1`}>
                          <MetaIcon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.bg}`}>
                          {status.label}
                        </span>
                      </div>

                      <h5 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition">
                        {act.title}
                      </h5>

                      <div className="space-y-1 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-700 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {act.time}
                          </span>
                          <span className="font-black text-indigo-700">
                            {act.costPerStudent === 0
                              ? isArabic ? 'مجانية' : 'Gratuit'
                              : `${act.costPerStudent} ${schoolConfig.currency}`}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 truncate">
                          {act.participatingClassIds.length} {isArabic ? 'أقسام مشاركة' : 'classes'}
                        </span>
                        <span className="text-emerald-600 font-bold hover:underline">
                          {isArabic ? 'التفاصيل ←' : 'Détails →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Summary of Upcoming Activities List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                {isArabic ? 'قائمة الفعاليات المجدولة' : 'Activités programmées'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                ({filteredActivities.length})
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100">
              {filteredActivities.slice(0, 5).map((act) => {
                const meta = getCategoryMeta(act.category);
                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivityDetail(act)}
                    className="pt-2 first:pt-0 transition cursor-pointer hover:bg-slate-50/80 p-1.5 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{act.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>📅 {act.date}</span>
                        <span>📍 {act.location.split('-')[0]}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-indigo-700 shrink-0">
                      {act.costPerStudent === 0 ? (isArabic ? 'مجاني' : 'Gratuit') : `${act.costPerStudent} دج`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Add New Activity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {isArabic ? 'إضافة نشاط مدرسي أو رحلة جديدة' : 'Nouvelle Activité ou Sortie'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isArabic
                      ? 'برمجة التواريخ، الأقسام المشاركة، التكلفة، والأستاذ المؤطر'
                      : 'Fixer la date, les classes, le coût et le professeur encadrant'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
              
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isArabic ? 'عنوان النشاط أو الرحلة:' : 'Titre de l’activité:'}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={isArabic ? 'مثال: رحلة استكشافية إلى المتحف الوطني للآثار' : 'Ex: Sortie au musée'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'نوع الفعالية:' : 'Catégorie:'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="trip">🚌 {isArabic ? 'رحلة استكشافية / خرجة ميدانية' : 'Sortie scolaire'}</option>
                    <option value="science">🔬 {isArabic ? 'نشاط أو معرض علمي' : 'Activité scientifique'}</option>
                    <option value="sports">⚽ {isArabic ? 'بطولة أو مسابقة رياضية' : 'Événement sportif'}</option>
                    <option value="culture">🎭 {isArabic ? 'نشاط ثقافي / مسرح / خطابة' : 'Culturel'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'حالة النشاط:' : 'Statut:'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ActivityStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="scheduled">📅 {isArabic ? 'مجدول ومؤكد' : 'Planifié'}</option>
                    <option value="registration_open">✍️ {isArabic ? 'التسجيل مفتوح للأولياء' : 'Inscriptions ouvertes'}</option>
                    <option value="completed">✅ {isArabic ? 'مكتمل' : 'Terminé'}</option>
                  </select>
                </div>
              </div>

              {/* Date, Time & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'تاريخ الفعالية:' : 'Date:'}
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'ساعة الانطلاق:' : 'Heure:'}
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'الوجهة / المكان:' : 'Lieu / Destination:'}
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder={isArabic ? 'مثال: حديقة التجارب، الحامة' : 'Ex: Alger'}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Participating Classes (Multi-Select Pills) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {isArabic ? 'الأقسام المشاركة المستهدفة:' : 'Classes participantes:'}
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  {classes.map((cls) => {
                    const isSelected = formClassIds.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClassSelection(cls.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{cls.name}</span>
                      </button>
                    );
                  })}
                </div>
                {formClassIds.length === 0 && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">
                    {isArabic ? 'يُرجى اختيار قسم واحد على الأقل للمشاركة.' : 'Sélectionnez au moins une classe.'}
                  </p>
                )}
              </div>

              {/* Cost & Estimated Budget & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? `التكلفة للتلميذ (${schoolConfig.currency}):` : 'Coût par élève:'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    placeholder="0 للأنشطة المجانية"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? `الميزانية الإجمالية (${schoolConfig.currency}):` : 'Budget global:'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'العدد الأقصى للمشاركين:' : 'Capacité max:'}
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={formMaxParticipants}
                    onChange={(e) => setFormMaxParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Supervisor Teacher */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isArabic ? 'الأستاذ(ة) المؤطر(ة) / المشرف:' : 'Enseignant responsable:'}
                </label>
                <select
                  value={formSupervisorId}
                  onChange={(e) => setFormSupervisorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description & Pedagogical Goals */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isArabic ? 'الوصف والأهداف البيداغوجية:' : 'Description & Objectifs:'}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={isArabic ? 'أدخل تفاصيل وأهداف النشاط التربوية...' : 'Détails du programme...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                ></textarea>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={formClassIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'حفظ وبرمجة النشاط' : 'Enregistrer'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Activity Details / Permission Slip Modal */}
      {selectedActivityDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/80 no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                {isArabic ? 'بطاقة الفعالية واستمارة الترخيص الأبوي' : 'Fiche d’Activité'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'طباعة الترخيص' : 'Imprimer'}</span>
                </button>
                <button
                  onClick={() => setSelectedActivityDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white printable-document text-xs">
              
              {/* Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
                <h4 className="text-xs font-bold tracking-wide text-slate-600">
                  {schoolConfig.nameAr} - مصلحة الأنشطة المدرسية والرحلات
                </h4>
                <div className="text-base font-black text-emerald-950 pt-1">
                  {selectedActivityDetail.title}
                </div>
                <div className="text-[11px] text-slate-500">
                  الموسم الدراسي: {schoolConfig.academicYear} | التاريخ المبرمج: {selectedActivityDetail.date}
                </div>
              </div>

              {/* Quick Details Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">مكان ووجهة الفعالية:</span>
                  <span className="font-bold text-slate-900">{selectedActivityDetail.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">توقيت الانطلاق:</span>
                  <span className="font-bold text-slate-900">{selectedActivityDetail.time}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">التكلفة لكل تلميذ:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {selectedActivityDetail.costPerStudent === 0
                      ? 'مجانية كلياً'
                      : `${selectedActivityDetail.costPerStudent} ${schoolConfig.currency}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">الأستاذ(ة) المؤطر(ة):</span>
                  <span className="font-bold text-slate-900">
                    {selectedActivityDetail.supervisorName || 'الإدارة العامة'}
                  </span>
                </div>
              </div>

              {/* Participating Classes */}
              <div>
                <span className="font-bold text-slate-700 block mb-1.5">الأقسام المشاركة في الفعالية:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedActivityDetail.participatingClassIds.map((cid) => {
                    const cls = classes.find((c) => c.id === cid);
                    return (
                      <span
                        key={cid}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold"
                      >
                        {cls?.name || cid}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Objectives */}
              {selectedActivityDetail.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">الأهداف والبرنامج:</span>
                  {selectedActivityDetail.description}
                </div>
              )}

              {/* Official Parental Consent Slip (استمارة الترخيص الأبوي) */}
              <div className="p-4 rounded-xl border border-dashed border-slate-400 bg-amber-50/40 space-y-3">
                <div className="font-bold text-slate-900 text-center text-xs">
                  تصريح بالترخيص الأبوي لمشاركة التلميذ(ة) في النشاط / الرحلة
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  أنا الموقع أسفله، ولي أمر التلميذ(ة): .................................................... المسجل(ة) بقسم: ....................
                  أوافق على مشاركة ابني/ابنتي في النشاط المذكور أعلاه وأصرح بالتزامه بتعليمات الأساتذة المؤطرين.
                </p>
                <div className="grid grid-cols-2 pt-4 text-center">
                  <div>
                    <span className="font-bold text-slate-700">تاريخ وتوقيع ولي الأمر:</span>
                    <div className="border-b border-dashed border-slate-400 w-32 mx-auto mt-6"></div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">ختم إدارة المؤسسة:</span>
                    <div className="border-b border-dashed border-slate-400 w-32 mx-auto mt-6"></div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
