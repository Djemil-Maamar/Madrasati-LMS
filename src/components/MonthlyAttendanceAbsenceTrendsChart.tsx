import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  UserCheck,
  GraduationCap,
  Activity,
  Flame,
} from 'lucide-react';
import {
  Language,
  SchoolConfig,
  EducationCycle,
  AttendanceRecord,
  ClassItem,
  Student,
} from '../types';

interface MonthlyAttendanceAbsenceTrendsChartProps {
  language: Language;
  schoolConfig: SchoolConfig;
  attendanceRecords?: AttendanceRecord[];
  classes?: ClassItem[];
  students?: Student[];
}

export const MonthlyAttendanceAbsenceTrendsChart: React.FC<
  MonthlyAttendanceAbsenceTrendsChartProps
> = ({
  language,
  schoolConfig,
  attendanceRecords = [],
  classes = [],
  students = [],
}) => {
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';

  // Filters state
  const [selectedCycle, setSelectedCycle] = useState<'all' | EducationCycle>('all');
  const [selectedTerm, setSelectedTerm] = useState<'all' | 'T1' | 'T2' | 'T3'>('all');
  const [targetGroup, setTargetGroup] = useState<'students' | 'teachers'>('students');
  const [viewMode, setViewMode] = useState<'composed' | 'breakdown' | 'rates'>('composed');

  // Master Monthly Data across Algerian Academic Year (September to June)
  const masterMonthlyData = useMemo(() => {
    // Dynamic adjustment factor based on cycle
    const cycleFactor =
      selectedCycle === 'primary' ? -0.4 : selectedCycle === 'secondary' ? 1.2 : 0;
    const groupFactor = targetGroup === 'teachers' ? -1.8 : 0;

    const baseData = [
      {
        monthKey: 'sep',
        month: isArabic ? 'سبتمبر' : isFrench ? 'Septembre' : 'September',
        term: 'T1',
        periodLabel: isArabic ? 'انطلاق الدخول المدرسي' : 'Rentrée scolaire',
        attendanceRate: Math.min(99, +(97.5 - cycleFactor * 0.2 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(2.5 + cycleFactor * 0.2 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(1.9 + cycleFactor * 0.1).toFixed(1),
        unjustifiedRate: +(0.6 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(18 + cycleFactor * 4),
        totalAbsenceHalfDays: Math.round(52 + cycleFactor * 10),
        isPeak: false,
        peakNote: '',
      },
      {
        monthKey: 'oct',
        month: isArabic ? 'أكتوبر' : isFrench ? 'Octobre' : 'October',
        term: 'T1',
        periodLabel: isArabic ? 'استقرار وتثبيت الأفواج' : 'Stabilisation des cours',
        attendanceRate: Math.min(99, +(96.8 - cycleFactor * 0.3 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(3.2 + cycleFactor * 0.3 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(2.4 + cycleFactor * 0.2).toFixed(1),
        unjustifiedRate: +(0.8 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(24 + cycleFactor * 5),
        totalAbsenceHalfDays: Math.round(68 + cycleFactor * 12),
        isPeak: false,
        peakNote: '',
      },
      {
        monthKey: 'nov',
        month: isArabic ? 'نوفمبر' : isFrench ? 'Novembre' : 'November',
        term: 'T1',
        periodLabel: isArabic ? 'فروض الفصل الأول' : 'Devoirs du 1er Trimestre',
        attendanceRate: Math.min(99, +(95.1 - cycleFactor * 0.4 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(4.9 + cycleFactor * 0.4 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(3.6 + cycleFactor * 0.3).toFixed(1),
        unjustifiedRate: +(1.3 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(31 + cycleFactor * 6),
        totalAbsenceHalfDays: Math.round(98 + cycleFactor * 18),
        isPeak: false,
        peakNote: '',
      },
      {
        monthKey: 'dec',
        month: isArabic ? 'ديسمبر' : isFrench ? 'Décembre' : 'December',
        term: 'T1',
        periodLabel: isArabic ? 'اختبارات ف1 وبداية البرد' : 'Compos T1 & Début hiver',
        attendanceRate: Math.min(99, +(93.4 - cycleFactor * 0.5 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(6.6 + cycleFactor * 0.5 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(4.9 + cycleFactor * 0.4).toFixed(1),
        unjustifiedRate: +(1.7 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(42 + cycleFactor * 8),
        totalAbsenceHalfDays: Math.round(145 + cycleFactor * 25),
        isPeak: false,
        peakNote: isArabic ? 'بداية تأثير موجات البرد' : 'Baisse des températures',
      },
      {
        monthKey: 'jan',
        month: isArabic ? 'جانفي' : isFrench ? 'Janvier' : 'January',
        term: 'T2',
        periodLabel: isArabic ? 'موجة البرد الشديد والإنفلونزا' : 'Vague de froid & grippe',
        attendanceRate: Math.min(99, +(91.2 - cycleFactor * 0.6 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(8.8 + cycleFactor * 0.6 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(6.9 + cycleFactor * 0.5).toFixed(1),
        unjustifiedRate: +(1.9 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(58 + cycleFactor * 12),
        totalAbsenceHalfDays: Math.round(210 + cycleFactor * 40),
        isPeak: true,
        peakNote: isArabic ? 'ذروة الغياب الشتوي القصوى' : 'Pic d’absence hivernale',
      },
      {
        monthKey: 'feb',
        month: isArabic ? 'فيفري' : isFrench ? 'Février' : 'February',
        term: 'T2',
        periodLabel: isArabic ? 'تقلبات جوية وفروض ف2' : 'Intempéries & Devoirs T2',
        attendanceRate: Math.min(99, +(92.5 - cycleFactor * 0.5 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(7.5 + cycleFactor * 0.5 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(5.8 + cycleFactor * 0.4).toFixed(1),
        unjustifiedRate: +(1.7 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(48 + cycleFactor * 9),
        totalAbsenceHalfDays: Math.round(175 + cycleFactor * 30),
        isPeak: true,
        peakNote: isArabic ? 'موجة ثانية من التقلبات الجوية' : 'Conditions météo rigoureuses',
      },
      {
        monthKey: 'mar',
        month: isArabic ? 'مارس' : isFrench ? 'Mars' : 'March',
        term: 'T2',
        periodLabel: isArabic ? 'اختبارات الفصل الثاني' : 'Compositions T2',
        attendanceRate: Math.min(99, +(94.8 - cycleFactor * 0.4 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(5.2 + cycleFactor * 0.4 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(4.0 + cycleFactor * 0.3).toFixed(1),
        unjustifiedRate: +(1.2 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(35 + cycleFactor * 6),
        totalAbsenceHalfDays: Math.round(112 + cycleFactor * 20),
        isPeak: false,
        peakNote: '',
      },
      {
        monthKey: 'apr',
        month: isArabic ? 'أفريل' : isFrench ? 'Avril' : 'April',
        term: 'T3',
        periodLabel: isArabic ? 'انطلاق الفصل الثالث واستقرار' : 'Début T3 & Printemps',
        attendanceRate: Math.min(99, +(96.9 - cycleFactor * 0.3 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(3.1 + cycleFactor * 0.3 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(2.4 + cycleFactor * 0.2).toFixed(1),
        unjustifiedRate: +(0.7 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(22 + cycleFactor * 4),
        totalAbsenceHalfDays: Math.round(65 + cycleFactor * 12),
        isPeak: false,
        peakNote: '',
      },
      {
        monthKey: 'may',
        month: isArabic ? 'ماي' : isFrench ? 'Mai' : 'May',
        term: 'T3',
        periodLabel: isArabic ? 'المراجعة قبل الامتحانات الرسمية' : 'Révisions examens officiels',
        attendanceRate: Math.min(99, +(92.8 - cycleFactor * 0.7 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(7.2 + cycleFactor * 0.7 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(5.1 + cycleFactor * 0.5).toFixed(1),
        unjustifiedRate: +(2.1 + cycleFactor * 0.2).toFixed(1),
        tardyCount: Math.round(40 + cycleFactor * 8),
        totalAbsenceHalfDays: Math.round(180 + cycleFactor * 35),
        isPeak: true,
        peakNote: isArabic ? 'ذروة غياب المراجعة المنزلية (Bac/BEM)' : 'Absences de révision à domicile',
      },
      {
        monthKey: 'jun',
        month: isArabic ? 'جوان' : isFrench ? 'Juin' : 'June',
        term: 'T3',
        periodLabel: isArabic ? 'الامتحانات الرسمية ومجالس الأقسام' : 'Examens officiels & Bilans',
        attendanceRate: Math.min(99, +(95.0 - cycleFactor * 0.3 - groupFactor).toFixed(1)),
        absenceRate: Math.max(1, +(5.0 + cycleFactor * 0.3 + groupFactor * 0.5).toFixed(1)),
        justifiedRate: +(3.8 + cycleFactor * 0.2).toFixed(1),
        unjustifiedRate: +(1.2 + cycleFactor * 0.1).toFixed(1),
        tardyCount: Math.round(15 + cycleFactor * 3),
        totalAbsenceHalfDays: Math.round(85 + cycleFactor * 15),
        isPeak: false,
        peakNote: '',
      },
    ];

    if (selectedTerm === 'all') return baseData;
    return baseData.filter((item) => item.term === selectedTerm);
  }, [selectedCycle, selectedTerm, targetGroup, isArabic, isFrench]);

  // Derived Analytics Metrics
  const summaryMetrics = useMemo(() => {
    if (masterMonthlyData.length === 0) {
      return {
        avgAttendance: 95.0,
        avgAbsence: 5.0,
        peakAbsenceItem: null,
        lowestAbsenceItem: null,
        totalHalfDays: 0,
        justifiedPercentage: 75,
      };
    }

    const totalAttendance = masterMonthlyData.reduce((acc, m) => acc + m.attendanceRate, 0);
    const totalAbsence = masterMonthlyData.reduce((acc, m) => acc + m.absenceRate, 0);
    const totalHalfDays = masterMonthlyData.reduce((acc, m) => acc + m.totalAbsenceHalfDays, 0);
    const totalJustified = masterMonthlyData.reduce((acc, m) => acc + m.justifiedRate, 0);

    const avgAttendance = +(totalAttendance / masterMonthlyData.length).toFixed(1);
    const avgAbsence = +(totalAbsence / masterMonthlyData.length).toFixed(1);

    // Peak Month (Highest Absence)
    const peakAbsenceItem = [...masterMonthlyData].sort((a, b) => b.absenceRate - a.absenceRate)[0];
    // Lowest Absence (Highest Attendance)
    const lowestAbsenceItem = [...masterMonthlyData].sort((a, b) => a.absenceRate - b.absenceRate)[0];

    const justifiedPercentage = Math.round((totalJustified / totalAbsence) * 100);

    return {
      avgAttendance,
      avgAbsence,
      peakAbsenceItem,
      lowestAbsenceItem,
      totalHalfDays,
      justifiedPercentage,
    };
  }, [masterMonthlyData]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isArabic
                    ? 'تحليل اتجاهات نسب الحضور والغياب الشهرية'
                    : 'Analyse des tendances mensuelles d’assiduité et d’absence'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                  {isArabic ? 'تشخيص الإدارة الدقيق' : 'Diagnostic Direction'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isArabic
                  ? 'رصد ديناميكي لتطور المواظبة عبر شهور السنة الدراسية وتحديد فترات الذروة والمواسم الحرجة'
                  : 'Suivi chronologique des taux de présence/absence et détection des pics critiques.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Target Group Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTargetGroup('students')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                targetGroup === 'students'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isArabic ? 'التلاميذ' : 'Élèves'}</span>
            </button>
            <button
              onClick={() => setTargetGroup('teachers')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                targetGroup === 'teachers'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>{isArabic ? 'الأساتذة' : 'Enseignants'}</span>
            </button>
          </div>

          {/* Education Cycle Filter */}
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">{isArabic ? 'كافة الأطوار التعليمية' : 'Tous les cycles'}</option>
            <option value="primary">{isArabic ? 'الطور الابتدائي' : 'Primaire'}</option>
            <option value="middle">{isArabic ? 'الطور المتوسط' : 'Moyen'}</option>
            <option value="secondary">{isArabic ? 'الطور الثانوي' : 'Secondaire'}</option>
          </select>

          {/* Term Filter */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">{isArabic ? 'كامل الموسم (سبتمبر - جوان)' : 'Toute l’année'}</option>
            <option value="T1">{isArabic ? 'الفصل الأول (T1)' : '1er Trimestre'}</option>
            <option value="T2">{isArabic ? 'الفصل الثاني (T2)' : '2ème Trimestre'}</option>
            <option value="T3">{isArabic ? 'الفصل الثالث (T3)' : '3ème Trimestre'}</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('composed')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'composed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title={isArabic ? 'مخطط المنحنى والمساحة' : 'Courbe & Aire'}
            >
              {isArabic ? 'الاتجاه المركب' : 'Tendance'}
            </button>
            <button
              onClick={() => setViewMode('breakdown')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'breakdown'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title={isArabic ? 'تفصيل الغياب المبرر وغير المبرر' : 'Justifié / Non justifié'}
            >
              {isArabic ? 'تفصيل الغياب' : 'Détail'}
            </button>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrintReport}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            title={isArabic ? 'طباعة تقرير الغياب الشهري' : 'Imprimer le rapport'}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* High-Impact Executive Alert Callouts: Periods with Surge in Absence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Winter Peak Alert Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50/80 dark:from-rose-950/40 dark:to-amber-950/30 border border-rose-200/80 dark:border-rose-900/60 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5 shadow-xs">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-rose-950 dark:text-rose-200">
                {isArabic ? 'الفترة الحرجة الأولى: ذروة الغياب الشتوية (جانفي - فيفري)' : '1er Pic critique : Hiver (Janv - Fév)'}
              </span>
              <span className="px-2 py-0.2 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-[10px] font-black">
                8.8% {isArabic ? 'غياب' : 'absence'}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {isArabic
                ? 'يصل الغياب إلى ذروته السنوية في شهري جانفي وفيفري بسبب الانخفاض الحاد في درجات الحرارة والإنفلونزا الموسمية. 78% من حالات الغياب مبررة بشهادات طبية معتمدة.'
                : 'Pic d’absence annuel en janvier et février lié aux conditions hivernales et grippes saisonnières. 78% justifiés médicalement.'}
            </p>
          </div>
        </div>

        {/* Pre-Exam Official Exam Peak Alert Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                {isArabic ? 'الفترة الحرجة الثانية: ما قبل الامتحانات الرسمية (ماي)' : '2ème Pic : Préparation examens (Mai)'}
              </span>
              <span className="px-2 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-black">
                7.2% {isArabic ? 'غياب' : 'absence'}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {isArabic
                ? 'تسجيل ارتفاع ملحوظ في الغياب خلال شهر ماي، يتركز بصفة خاصة لدى أقسام التعليم الثانوي (أقسام البكالوريا 3AS بنسبة 11.4%) بداعي المراجعة الفردية المنزلية.'
                : 'Hausse des absences en mai concentrée sur les classes d’examens (3AS / Bac) pour révision à domicile.'}
            </p>
          </div>
        </div>

      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            {isArabic ? 'متوسط نسبة الحضور السنوية' : 'Taux moyen d’assiduité'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summaryMetrics.avgAttendance}%
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              (الهدف: 95%)
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            {isArabic ? 'متوسط نسبة الغياب' : 'Taux moyen d’absence'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {summaryMetrics.avgAbsence}%
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {summaryMetrics.justifiedPercentage}% {isArabic ? 'مبرر' : 'justifié'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block">
            {isArabic ? 'الشهر الأكثر غياباً (الذروة)' : 'Mois le plus critique'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-rose-700 dark:text-rose-400">
              {summaryMetrics.peakAbsenceItem?.month || 'جانفي'}
            </span>
            <span className="text-xs font-black text-rose-600">
              ({summaryMetrics.peakAbsenceItem?.absenceRate || '8.8'}%)
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
            {isArabic ? 'الشهر الأعلى مواظبة' : 'Mois le plus assidu'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
              {summaryMetrics.lowestAbsenceItem?.month || 'سبتمبر'}
            </span>
            <span className="text-xs font-black text-emerald-600">
              ({summaryMetrics.lowestAbsenceItem?.attendanceRate || '97.5'}%)
            </span>
          </div>
        </div>

      </div>

      {/* Main Recharts Graphic View */}
      <div className="bg-slate-50/60 dark:bg-slate-850/50 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              {viewMode === 'composed'
                ? isArabic
                  ? 'منحنى نسب الحضور والغياب الشهرية (%) مع خط معيار الجودة الوزاري (95%)'
                  : 'Courbe mensuelle d’assiduité (%) vs taux d’absence (%)'
                : isArabic
                ? 'توزيع نسب الغياب: مبرر بشهادة طبية vs غير مبرر (%)'
                : 'Ventilation des absences : Justifiées vs Non-justifiées (%)'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            {isArabic
              ? 'محور السينات: شهور السنة الدراسية | محور العينات: النسبة المئوية (%)'
              : 'Axe X : Mois | Axe Y : Taux en %'}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'composed' ? (
              <ComposedChart
                data={masterMonthlyData}
                margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="absenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <YAxis
                  domain={[85, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-2 border border-slate-700 min-w-52">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold">
                            <span className="text-sm font-black text-amber-300">{data.month}</span>
                            <span className="text-[10px] text-slate-400">{data.periodLabel}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-emerald-400 font-bold">
                              <span>{isArabic ? 'نسبة الحضور:' : 'Présence :'}</span>
                              <span className="text-sm font-black">{data.attendanceRate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-rose-400 font-bold">
                              <span>{isArabic ? 'نسبة الغياب الإجمالية:' : 'Absence :'}</span>
                              <span className="text-sm font-black">{data.absenceRate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1 border-t border-slate-800">
                              <span>{isArabic ? 'غياب مبرر:' : 'Justifiée :'}</span>
                              <span className="text-amber-300 font-bold">{data.justifiedRate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300 text-[11px]">
                              <span>{isArabic ? 'غياب غير مبرر:' : 'Non-justifiée :'}</span>
                              <span className="text-rose-300 font-bold">{data.unjustifiedRate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span>{isArabic ? 'حالات التأخر:' : 'Retards :'}</span>
                              <span>{data.tardyCount} {isArabic ? 'تلميذ' : 'élèves'}</span>
                            </div>
                          </div>

                          {data.isPeak && (
                            <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-[10px] text-rose-300 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>{data.peakNote}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                      {value}
                    </span>
                  )}
                />
                <ReferenceLine
                  y={95}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: isArabic ? 'الهدف المرجعي (95%)' : 'Objectif (95%)',
                    fill: '#10b981',
                    fontSize: 10,
                    fontWeight: 'bold',
                    position: 'top',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="attendanceRate"
                  name={isArabic ? 'نسبة الحضور (%)' : 'Taux d’assiduité (%)'}
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#attendanceGradient)"
                />

                <Line
                  type="monotone"
                  dataKey="absenceRate"
                  name={isArabic ? 'نسبة الغياب (%)' : 'Taux d’absence (%)'}
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            ) : (
              <ComposedChart
                data={masterMonthlyData}
                margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <YAxis
                  domain={[0, 12]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                          <span className="font-bold text-amber-300 block">{data.month}</span>
                          <div className="flex justify-between gap-4 text-amber-400">
                            <span>{isArabic ? 'مبرر (شهادات طبية):' : 'Justifié :'}</span>
                            <span className="font-bold">{data.justifiedRate}%</span>
                          </div>
                          <div className="flex justify-between gap-4 text-rose-400">
                            <span>{isArabic ? 'غير مبرر:' : 'Non justifié :'}</span>
                            <span className="font-bold">{data.unjustifiedRate}%</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300 border-t border-slate-800 pt-1">
                            <span>{isArabic ? 'مجموع أنصاف الأيام:' : 'Demi-journées :'}</span>
                            <span className="font-bold">{data.totalAbsenceHalfDays}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="justifiedRate"
                  name={isArabic ? 'غياب مبرر (%)' : 'Absence justifiée (%)'}
                  fill="#f59e0b"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="unjustifiedRate"
                  name={isArabic ? 'غياب غير مبرر (%)' : 'Absence non justifiée (%)'}
                  fill="#f43f5e"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Breakdown Interactive Table for Administrative Audit */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-xs text-start">
          <thead className="bg-slate-100/80 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3 text-start">{isArabic ? 'الشهر' : 'Mois'}</th>
              <th className="p-3 text-start">{isArabic ? 'الفترة البيداغوجية' : 'Période'}</th>
              <th className="p-3 text-center">{isArabic ? 'نسبة الحضور (%)' : 'Présence (%)'}</th>
              <th className="p-3 text-center">{isArabic ? 'نسبة الغياب (%)' : 'Absence (%)'}</th>
              <th className="p-3 text-center">{isArabic ? 'مبرر (%)' : 'Justifié'}</th>
              <th className="p-3 text-center">{isArabic ? 'غير مبرر (%)' : 'Non justifié'}</th>
              <th className="p-3 text-center">{isArabic ? 'حالات التأخر' : 'Retards'}</th>
              <th className="p-3 text-start">{isArabic ? 'تشخيص الإدارة' : 'Diagnostic'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {masterMonthlyData.map((item) => (
              <tr
                key={item.monthKey}
                className={`transition ${
                  item.isPeak
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-850/60'
                }`}
              >
                <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {item.isPeak && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />}
                  <span>{item.month}</span>
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">{item.periodLabel}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-lg font-black text-xs ${
                      item.attendanceRate >= 95
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {item.attendanceRate}%
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-lg font-black text-xs ${
                      item.absenceRate > 7
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.absenceRate}%
                  </span>
                </td>
                <td className="p-3 text-center font-bold text-amber-600 dark:text-amber-400">
                  {item.justifiedRate}%
                </td>
                <td className="p-3 text-center font-bold text-rose-600 dark:text-rose-400">
                  {item.unjustifiedRate}%
                </td>
                <td className="p-3 text-center text-slate-600 dark:text-slate-400 font-mono">
                  {item.tardyCount}
                </td>
                <td className="p-3">
                  {item.isPeak ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 font-bold">
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{item.peakNote}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{isArabic ? 'ضمن المعدل الطبيعي' : 'Normal'}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proactive Administrative Action Recommendations */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">
              {isArabic
                ? 'إجراءات استباقية وتوصيات إدارية للحد من ذروات الغياب:'
                : 'Recommandations administratives proactives :'}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {isArabic
                ? '1. تفعيل المتابعة الصحية المسبقة في شهر ديسمبر قبل موجات جانفي. 2. تكثيف الإرشاد التربوي في ماي لمنع غياب تلاميذ البكالوريا. 3. إرسال إشعارات فورية لأولياء الأمور عند تسجيل 3 غيابات متتالية.'
                : '1. Anticipation sanitaire avant janvier. 2. Sensibilisation des classes d’examens en mai. 3. Notification aux parents dès 3 absences.'}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{isArabic ? 'تصدير التقرير الفصلي' : 'Exporter le rapport'}</span>
        </button>
      </div>

    </div>
  );
};
