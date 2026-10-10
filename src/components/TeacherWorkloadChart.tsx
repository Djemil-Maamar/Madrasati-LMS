import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Scale,
  Sparkles,
  Filter,
  Search,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Teacher, TimetableSession, Subject, ClassItem, Language } from '../types';

interface TeacherWorkloadChartProps {
  teachers: Teacher[];
  sessions: TimetableSession[];
  subjects: Subject[];
  classes: ClassItem[];
  language: Language;
}

export const TeacherWorkloadChart: React.FC<TeacherWorkloadChartProps> = ({
  teachers,
  sessions,
  subjects,
  classes,
  language,
}) => {
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';

  // Configurable Weekly Target Quota (النصاب الأسبوعي المرجعي: الافتراضي 18 حصة في النظام الجزائري)
  const [targetQuota, setTargetQuota] = useState<number>(18);
  const [filterStatus, setFilterStatus] = useState<'all' | 'overloaded' | 'balanced' | 'underloaded'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeChartTab, setActiveChartTab] = useState<'sessions_bar' | 'daily_stacked' | 'subject_departments'>('sessions_bar');

  // Days list
  const daysOrder: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday'> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
  ];

  const dayLabels: Record<string, { ar: string; fr: string; en: string }> = {
    sunday: { ar: 'الأحد', fr: 'Dimanche', en: 'Sun' },
    monday: { ar: 'الإثنين', fr: 'Lundi', en: 'Mon' },
    tuesday: { ar: 'الثلاثاء', fr: 'Mardi', en: 'Tue' },
    wednesday: { ar: 'الأربعاء', fr: 'Mercredi', en: 'Wed' },
    thursday: { ar: 'الخميس', fr: 'Jeudi', en: 'Thu' },
  };

  // Helper to map subject names
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Compute workload statistics per teacher
  const teacherStats = useMemo(() => {
    return teachers.map((teacher) => {
      // Find all sessions for this teacher
      const teacherSessions = sessions.filter((s) => s.teacherId === teacher.id);
      const totalSessions = teacherSessions.length;
      const totalHours = totalSessions * 1; // Assuming 1 hour per session standard

      // Day breakdown
      const dayBreakdown: Record<string, number> = {
        sunday: 0,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
      };

      teacherSessions.forEach((s) => {
        if (dayBreakdown[s.day] !== undefined) {
          dayBreakdown[s.day] += 1;
        }
      });

      // Distinct classes taught
      const uniqueClassIds = Array.from(new Set(teacherSessions.map((s) => s.classId)));
      const classNames = uniqueClassIds
        .map((cid) => classes.find((c) => c.id === cid)?.name || cid)
        .join(', ');

      // Teacher subjects
      const teacherSubjectObjs = teacher.subjectIds
        .map((sid) => subjectMap.get(sid))
        .filter(Boolean) as Subject[];

      const subjectNames = teacherSubjectObjs
        .map((s) => (isArabic ? s.nameAr : isFrench ? s.nameFr : s.nameEn))
        .join('، ');

      const primaryColor = teacherSubjectObjs[0]?.color || '#3b82f6';

      // Load status logic
      // Overloaded: > targetQuota + 1
      // Balanced: between targetQuota - 2 and targetQuota + 1
      // Underloaded: < targetQuota - 2
      let status: 'overloaded' | 'balanced' | 'underloaded' = 'balanced';
      if (totalSessions > targetQuota + 1) {
        status = 'overloaded';
      } else if (totalSessions < targetQuota - 2) {
        status = 'underloaded';
      }

      const diff = totalSessions - targetQuota;
      const loadPercentage = Math.round((totalSessions / targetQuota) * 100);

      // Max daily sessions (to detect single-day overload)
      const maxDaily = Math.max(...Object.values(dayBreakdown), 0);

      return {
        id: teacher.id,
        name: teacher.name,
        subjectIds: teacher.subjectIds,
        subjectNames,
        primaryColor,
        totalSessions,
        totalHours,
        diff,
        loadPercentage,
        status,
        dayBreakdown,
        maxDaily,
        uniqueClassIdsCount: uniqueClassIds.length,
        classNames,
      };
    });
  }, [teachers, sessions, subjects, classes, targetQuota, isArabic, isFrench, subjectMap]);

  // Overall KPI aggregates
  const kpiData = useMemo(() => {
    const totalAssignedSessions = teacherStats.reduce((sum, t) => sum + t.totalSessions, 0);
    const avgSessionsPerTeacher =
      teacherStats.length > 0 ? (totalAssignedSessions / teacherStats.length).toFixed(1) : '0';
    const overloadedCount = teacherStats.filter((t) => t.status === 'overloaded').length;
    const balancedCount = teacherStats.filter((t) => t.status === 'balanced').length;
    const underloadedCount = teacherStats.filter((t) => t.status === 'underloaded').length;

    const balanceIndex =
      teacherStats.length > 0 ? Math.round((balancedCount / teacherStats.length) * 100) : 100;

    return {
      totalAssignedSessions,
      avgSessionsPerTeacher,
      overloadedCount,
      balancedCount,
      underloadedCount,
      balanceIndex,
    };
  }, [teacherStats]);

  // Filtered teachers
  const filteredTeacherStats = useMemo(() => {
    return teacherStats.filter((t) => {
      // Status filter
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;

      // Subject filter
      if (selectedSubjectId !== 'all' && !t.subjectIds.includes(selectedSubjectId)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesSubject = t.subjectNames.toLowerCase().includes(query);
        const matchesClass = t.classNames.toLowerCase().includes(query);
        if (!matchesName && !matchesSubject && !matchesClass) return false;
      }

      return true;
    });
  }, [teacherStats, filterStatus, selectedSubjectId, searchQuery]);

  // Daily Stacked Chart Data
  const dailyStackedChartData = useMemo(() => {
    return teacherStats.map((t) => ({
      name: t.name,
      shortName: t.name.replace('أ. ', '').replace('د. ', ''),
      [dayLabels.sunday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']]: t.dayBreakdown.sunday,
      [dayLabels.monday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']]: t.dayBreakdown.monday,
      [dayLabels.tuesday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']]: t.dayBreakdown.tuesday,
      [dayLabels.wednesday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']]: t.dayBreakdown.wednesday,
      [dayLabels.thursday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']]: t.dayBreakdown.thursday,
      total: t.totalSessions,
    }));
  }, [teacherStats, dayLabels, isArabic, isFrench]);

  // Subject Department Workload aggregation
  const departmentWorkloadData = useMemo(() => {
    const deptMap = new Map<string, { name: string; totalSessions: number; teacherCount: number }>();

    subjects.forEach((subj) => {
      const name = isArabic ? subj.nameAr : isFrench ? subj.nameFr : subj.nameEn;
      if (!deptMap.has(subj.id)) {
        deptMap.set(subj.id, { name, totalSessions: 0, teacherCount: 0 });
      }
    });

    teachers.forEach((t) => {
      const tSessions = sessions.filter((s) => s.teacherId === t.id);
      t.subjectIds.forEach((sid) => {
        const entry = deptMap.get(sid);
        if (entry) {
          entry.teacherCount += 1;
        }
      });
      tSessions.forEach((sess) => {
        const entry = deptMap.get(sess.subjectId);
        if (entry) {
          entry.totalSessions += 1;
        }
      });
    });

    return Array.from(deptMap.values())
      .filter((d) => d.totalSessions > 0)
      .map((d) => ({
        subject: d.name,
        sessions: d.totalSessions,
        avgPerTeacher: d.teacherCount > 0 ? Math.round((d.totalSessions / d.teacherCount) * 10) / 10 : 0,
      }));
  }, [subjects, teachers, sessions, isArabic, isFrench]);

  // Status color resolver
  const getStatusBadge = (status: 'overloaded' | 'balanced' | 'underloaded') => {
    switch (status) {
      case 'overloaded':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: isArabic ? 'عبء زائد (فوق النصاب)' : isFrench ? 'Surcharge' : 'Overloaded',
          barColor: '#ef4444',
        };
      case 'balanced':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: isArabic ? 'متوازن (ضمن النصاب)' : isFrench ? 'Équilibré' : 'Balanced',
          barColor: '#10b981',
        };
      case 'underloaded':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: isArabic ? 'سعة متاحة (تحت النصاب)' : isFrench ? 'Sous-charge' : 'Available',
          barColor: '#f59e0b',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-6 p-6">
      
      {/* Header and Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xs">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {isArabic
                  ? 'موازنة العبء التدريسي وتوزيع الحصص الأسبوعي للأساتذة'
                  : isFrench
                  ? 'Répartition horaire et équilibrage de la charge des enseignants'
                  : 'Weekly Teacher Workload Distribution & Load Balancing'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Recharts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic
                ? 'مراقبة عدد الحصص الأسبوعية لكل أستاذ، رصد حالات الإرهاق أو السعة الشاغرة، وتوجيه الإدارة لموازنة الجداول الدراسية'
                : isFrench
                ? 'Suivi du volume horaire hebdomadaire par enseignant et aide à la décision pour équilibrer les plannings'
                : 'Monitor weekly sessions per teacher, detect overload or capacity gaps, and balance the school schedule.'}
            </p>
          </div>
        </div>

        {/* Quota & Benchmark Configuration */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0 self-start lg:self-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{isArabic ? 'النصاب الأسبوعي المستهدف:' : 'Quota de référence:'}</span>
          </div>
          <select
            value={targetQuota}
            onChange={(e) => setTargetQuota(Number(e.target.value))}
            className="px-2.5 py-1 text-xs font-black bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value={15}>15 {isArabic ? 'حصة/أسبوع (ابتدائي)' : 'h/sem'}</option>
            <option value={18}>18 {isArabic ? 'حصة/أسبوع (نصاب ثانوي/متوسط)' : 'h/sem'}</option>
            <option value={20}>20 {isArabic ? 'حصة/أسبوع (عبء موسع)' : 'h/sem'}</option>
            <option value={22}>22 {isArabic ? 'حصة/أسبوع (حد أقصى)' : 'h/sem'}</option>
          </select>
        </div>
      </div>

      {/* KPI Cards for Workload Balancing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Weekly Sessions */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>{isArabic ? 'إجمالي الحصص الأسبوعية' : 'Total des séances'}</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {kpiData.totalAssignedSessions}
            <span className="text-xs font-normal text-slate-500 mx-1">{isArabic ? 'حصة/أسبوع' : 'séances'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isArabic ? 'موزعة على' : 'Réparties sur'} {teachers.length} {isArabic ? 'أساتذة' : 'profs'}
          </div>
        </div>

        {/* Average Load per Teacher */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>{isArabic ? 'متوسط عبء الأستاذ' : 'Moyenne par prof'}</span>
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-950">
            {kpiData.avgSessionsPerTeacher}
            <span className="text-xs font-normal text-slate-500 mx-1">
              / {targetQuota} {isArabic ? 'حصة' : 'h'}
            </span>
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">
            {Number(kpiData.avgSessionsPerTeacher) > targetQuota
              ? isArabic ? 'أعلى من النصاب المستهدف' : 'Supérieur au quota'
              : isArabic ? 'ضمن الحدود الآمنة' : 'Dans les limites idéales'}
          </div>
        </div>

        {/* Balanced Teachers */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
            <span>{isArabic ? 'عبء متوازن' : 'Profs équilibrés'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {kpiData.balancedCount}
            <span className="text-xs font-normal text-emerald-800 mx-1">/ {teachers.length}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {kpiData.balanceIndex}% {isArabic ? 'من الطاقم في وضع متوازن' : 'du corps enseignant'}
          </div>
        </div>

        {/* Overloaded Teachers */}
        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200/80">
          <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
            <span>{isArabic ? 'عبء زائد (إرهاق)' : 'En surcharge'}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">
            {kpiData.overloadedCount}
            <span className="text-xs font-normal text-rose-800 mx-1">{isArabic ? 'أستاذ' : 'profs'}</span>
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            {kpiData.overloadedCount > 0
              ? isArabic ? 'يحتاجون لتخفيف الجداول' : 'À alléger d’urgence'
              : isArabic ? 'لا يوجد أساتذة مجهدون' : 'Aucune surcharge'}
          </div>
        </div>

        {/* Underloaded Teachers */}
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
            <span>{isArabic ? 'سعة تدريس متاحة' : 'Sous-charge'}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">
            {kpiData.underloadedCount}
            <span className="text-xs font-normal text-amber-800 mx-1">{isArabic ? 'أستاذ' : 'profs'}</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {isArabic ? 'إمكانية إسناد حصص إضافية' : 'Capacité disponible'}
          </div>
        </div>

      </div>

      {/* Chart View Switcher & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        
        {/* Tab Buttons for Visualizations */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0 self-start">
          <button
            onClick={() => setActiveChartTab('sessions_bar')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'sessions_bar'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مقارنة الحصص بالنصاب' : 'Volume / Quota'}</span>
          </button>

          <button
            onClick={() => setActiveChartTab('daily_stacked')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'daily_stacked'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isArabic ? 'التوزيع اليومي للأساتذة' : 'Par jour'}</span>
          </button>

          <button
            onClick={() => setActiveChartTab('subject_departments')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === 'subject_departments'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isArabic ? 'العبء حسب التخصص' : 'Par matière'}</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="all">{isArabic ? 'جميع الحالات' : 'Tous les états'}</option>
            <option value="overloaded">{isArabic ? '⚠️ عبء زائد' : 'Surchargés'}</option>
            <option value="balanced">{isArabic ? '✅ متوازن' : 'Équilibrés'}</option>
            <option value="underloaded">{isArabic ? 'ℹ️ سعة متاحة' : 'Sous-chargés'}</option>
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="all">{isArabic ? 'جميع المواد' : 'Toutes les matières'}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {isArabic ? s.nameAr : isFrench ? s.nameFr : s.nameEn}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'بحث عن أستاذ...' : 'Chercher un prof...'}
              className="ps-8 pe-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-36 sm:w-44 shadow-2xs"
            />
          </div>
        </div>

      </div>

      {/* Main Visualizations Render Area */}
      <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
        
        {/* Tab 1: Primary Bar Chart (Teacher Sessions vs Quota) */}
        {activeChartTab === 'sessions_bar' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                {isArabic
                  ? 'مقارنة عدد الحصص الأسبوعية الفعلية مع النصاب المرجعي المحدد'
                  : 'Comparaison des séances effectives par rapport au quota de référence'}
              </span>
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
                  {isArabic ? 'عبء زائد (> النصاب)' : 'Surcharge'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                  {isArabic ? 'متوازن (ضمن النصاب)' : 'Équilibré'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                  {isArabic ? 'سعة شاغرة (< النصاب)' : 'Disponible'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-indigo-700"></span>
                  {isArabic ? `النصاب (${targetQuota} حصة)` : `Quota (${targetQuota}h)`}
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredTeacherStats}
                  margin={{ top: 20, right: 15, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    domain={[0, (dataMax: number) => Math.max(dataMax + 4, targetQuota + 6)]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      const badge = getStatusBadge(data.status);

                      return (
                        <div className="bg-white p-3.5 rounded-xl shadow-xl border border-slate-200 text-xs space-y-2 min-w-56 text-start">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-extrabold text-slate-900 text-sm">{data.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="space-y-1 text-slate-600">
                            <div className="flex justify-between">
                              <span>{isArabic ? 'المادة / التخصص:' : 'Matière:'}</span>
                              <span className="font-bold text-slate-800">{data.subjectNames}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{isArabic ? 'عدد الحصص الأسبوعية:' : 'Séances / semaine:'}</span>
                              <span className="font-black text-indigo-700 text-sm">{data.totalSessions} {isArabic ? 'حصة' : 'h'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{isArabic ? 'الفارق عن النصاب (' + targetQuota + '):' : 'Écart au quota:'}</span>
                              <span className={`font-black ${data.diff > 0 ? 'text-rose-600' : data.diff < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {data.diff > 0 ? `+${data.diff}` : data.diff} {isArabic ? 'حصة' : 'h'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>{isArabic ? 'الأقسام المسندة:' : 'Classes:'}</span>
                              <span className="font-bold text-slate-700">{data.uniqueClassIdsCount} {isArabic ? 'أقسام' : 'classes'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{isArabic ? 'الذروة اليومية القصوى:' : 'Max / jour:'}</span>
                              <span className="font-bold text-slate-700">{data.maxDaily} {isArabic ? 'حصص في يوم واحد' : 'h/j'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    y={targetQuota}
                    stroke="#4338ca"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: isArabic ? `نصاب التدريس: ${targetQuota} حصة` : `Quota: ${targetQuota}h`,
                      fill: '#4338ca',
                      fontSize: 11,
                      position: 'top',
                    }}
                  />
                  <Bar
                    dataKey="totalSessions"
                    name={isArabic ? 'الحصص الأسبوعية' : 'Séances'}
                    radius={[6, 6, 0, 0]}
                  >
                    {filteredTeacherStats.map((entry) => {
                      const badge = getStatusBadge(entry.status);
                      return <Cell key={`cell-${entry.id}`} fill={badge.barColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Daily Stacked Distribution */}
        {activeChartTab === 'daily_stacked' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <Calendar className="w-4 h-4 text-indigo-600" />
                {isArabic
                  ? 'توزيع الحصص لكل أستاذ عبر أيام الأسبوع (الأحد إلى الخميس)'
                  : 'Répartition journalière des cours (Dimanche à Jeudi)'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isArabic
                  ? 'يساعد في منع تكدس الحصص في يوم واحد وتفادي إرهاق الأساتذة'
                  : 'Aide à éviter l’accumulation de cours sur une seule journée'}
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyStackedChartData}
                  margin={{ top: 20, right: 15, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="shortName"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar
                    dataKey={dayLabels.sunday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']}
                    stackId="a"
                    fill="#3b82f6"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey={dayLabels.monday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']}
                    stackId="a"
                    fill="#10b981"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey={dayLabels.tuesday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']}
                    stackId="a"
                    fill="#f59e0b"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey={dayLabels.wednesday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']}
                    stackId="a"
                    fill="#8b5cf6"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey={dayLabels.thursday[isArabic ? 'ar' : isFrench ? 'fr' : 'en']}
                    stackId="a"
                    fill="#ec4899"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Department / Subject Workload Distribution */}
        {activeChartTab === 'subject_departments' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                {isArabic
                  ? 'مجموع الحصص الأسبوعية ومتوسط عبء الأستاذ حسب التخصص الدراسي'
                  : 'Volume horaire total et charge moyenne par département disciplinaire'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Bar comparison per department */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentWorkloadData}
                    margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="subject"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar
                      dataKey="sessions"
                      name={isArabic ? 'إجمالي حصص المادة' : 'Total séances'}
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="avgPerTeacher"
                      name={isArabic ? 'متوسط عبء أستاذ المادة' : 'Moyenne / prof'}
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Department breakdown cards */}
              <div className="grid grid-cols-2 gap-3">
                {departmentWorkloadData.map((dept, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1 text-xs"
                  >
                    <div className="font-bold text-slate-800 truncate">{dept.subject}</div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-slate-500">{isArabic ? 'إجمالي الحصص:' : 'Total:'}</span>
                      <span className="font-black text-indigo-700">{dept.sessions} {isArabic ? 'حصة' : 'h'}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500">{isArabic ? 'معدل الأستاذ:' : 'Moyenne:'}</span>
                      <span className="font-bold text-slate-800">{dept.avgPerTeacher} {isArabic ? 'حصة' : 'h'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Administrative Load Balancing Recommendations & Advisory Panel */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/60 border border-indigo-200/80 space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            {isArabic
              ? 'توصيات الإدارة لموازنة العبء التدريسي وتفادي النزاعات:'
              : 'Recommandations administratives d’équilibrage des charges:'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          
          {/* Overload Alert */}
          {teacherStats.filter((t) => t.status === 'overloaded').length > 0 ? (
            <div className="p-3 bg-white/90 rounded-xl border border-rose-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{isArabic ? 'إعادة توزيع حصص الأساتذة المجهدين' : 'Réaffectation conseillée'}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isArabic
                  ? `الأساتذة (${teacherStats
                      .filter((t) => t.status === 'overloaded')
                      .map((t) => t.name)
                      .join('، ')}) يتجاوزون النصاب بـ +${Math.max(
                      ...teacherStats.filter((t) => t.status === 'overloaded').map((t) => t.diff)
                    )} حصص. يُوصى بنقل حصص فرعية لتخفيف الضغط.`
                  : 'Certains enseignants dépassent largement le quota. Allégez leur emploi du temps.'}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isArabic ? 'لا توجد حالات إرهاق مفرطة' : 'Aucune surcharge excessive'}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isArabic
                  ? 'جميع جداول التدريس ضمن الحدود الطبيعية والمقبولة للنصاب الأسبوعي.'
                  : 'Tous les plannings sont conformes aux normes pédagogiques.'}
              </p>
            </div>
          )}

          {/* Underload Utilization */}
          {teacherStats.filter((t) => t.status === 'underloaded').length > 0 ? (
            <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isArabic ? 'استثمار السعة التدريسية المتاحة' : 'Capacité sous-utilisée'}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isArabic
                  ? `الأساتذة (${teacherStats
                      .filter((t) => t.status === 'underloaded')
                      .map((t) => t.name)
                      .join('، ')}) لديهم فراغ في الجداول. يمكن إسناد حصص الاستدراك أو نوادي الأنشطة لهم.`
                  : 'Capacité disponible pour des heures de soutien ou des activités périscolaires.'}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-white/90 rounded-xl border border-indigo-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{isArabic ? 'استغلال أمثل للطاقات' : 'Optimisation maximale'}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isArabic
                  ? 'جميع الأساتذة يغطون نصابهم دون هدر في الساعات المعتمدة للمؤسسة.'
                  : 'Ressources humaines pleinement et efficacement exploitées.'}
              </p>
            </div>
          )}

          {/* Daily Schedule balance */}
          <div className="p-3 bg-white/90 rounded-xl border border-indigo-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{isArabic ? 'سقف الساعات اليومية' : 'Plafond journalier'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isArabic
                ? 'الحفاظ على حد أقصى 4 إلى 5 حصص في اليوم الواحد للأستاذ يضمن التركيز التربوي وجودة التدريس.'
                : 'Maintenir un maximum de 4-5 heures par jour préserve la qualité pédagogique.'}
            </p>
          </div>

        </div>
      </div>

      {/* Detailed Teachers Workload Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-500" />
            <span>{isArabic ? 'جدول المتابعة التفصيلي لأعباء الأساتذة' : 'Tableau détaillé de suivi des charges'}</span>
            <span className="text-slate-400 font-normal">({filteredTeacherStats.length})</span>
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-start">{isArabic ? 'الأستاذ(ة)' : 'Enseignant'}</th>
                <th className="p-3 text-start">{isArabic ? 'المادة / التخصص' : 'Matière'}</th>
                <th className="p-3 text-center">{isArabic ? 'الأقسام المسندة' : 'Classes'}</th>
                <th className="p-3 text-center">{isArabic ? 'الحصص الأسبوعية' : 'Séances/sem'}</th>
                <th className="p-3 text-center">{isArabic ? 'نسبة النصاب' : 'Taux'}</th>
                <th className="p-3 text-center">{isArabic ? 'الفارق عن المستهدف' : 'Écart'}</th>
                <th className="p-3 text-center">{isArabic ? 'أقصى حصص/يوم' : 'Max/jour'}</th>
                <th className="p-3 text-center">{isArabic ? 'حالة التوازن' : 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTeacherStats.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Teacher Name */}
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0"
                          style={{ backgroundColor: item.primaryColor }}
                        >
                          {item.name.charAt(0)}
                        </div>
                        <span className="truncate">{item.name}</span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold">
                        {item.subjectNames}
                      </span>
                    </td>

                    {/* Classes Count */}
                    <td className="p-3 text-center">
                      <span
                        className="text-[11px] text-slate-600 underline cursor-help"
                        title={item.classNames}
                      >
                        {item.uniqueClassIdsCount} {isArabic ? 'أقسام' : 'classes'}
                      </span>
                    </td>

                    {/* Total Sessions */}
                    <td className="p-3 text-center font-black text-slate-900 text-sm">
                      {item.totalSessions}
                      <span className="text-[10px] font-normal text-slate-400 ms-0.5">
                        {isArabic ? 'حصة' : 'h'}
                      </span>
                    </td>

                    {/* Percentage of Quota */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(item.loadPercentage, 100)}%`,
                              backgroundColor: badge.barColor,
                            }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">
                          {item.loadPercentage}%
                        </span>
                      </div>
                    </td>

                    {/* Difference */}
                    <td className="p-3 text-center font-bold">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] ${
                          item.diff > 0
                            ? 'bg-rose-50 text-rose-700'
                            : item.diff < 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.diff > 0 ? `+${item.diff}` : item.diff}
                      </span>
                    </td>

                    {/* Max Daily */}
                    <td className="p-3 text-center text-slate-600 font-semibold">
                      {item.maxDaily} {isArabic ? 'ح/يوم' : 'h/j'}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        <span>{badge.label}</span>
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
