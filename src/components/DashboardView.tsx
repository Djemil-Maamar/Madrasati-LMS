import React from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  AlertTriangle,
  UserCheck,
  CreditCard,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  School,
  Clock,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import {
  ClassItem,
  Teacher,
  Student,
  TimetableConflict,
  SchoolConfig,
  Language,
  AttendanceRecord,
  FeePayment,
  Subject,
  GradeRecord,
  TimetableSession,
  SchoolActivity,
  TeacherEvaluation,
  UserRole,
  InventoryItem,
  TeacherLeaveRequest,
} from '../types';
import {
  initialTimetableSessions,
  initialSchoolActivities,
  initialTeacherEvaluations,
  initialInventoryItems,
  initialTeacherLeaveRequests,
} from '../data/mockData';
import { translations } from '../i18n/translations';
import { DashboardAnalyticsCharts } from './DashboardAnalyticsCharts';
import { ClassComparisonPerformanceChart } from './ClassComparisonPerformanceChart';
import { TeacherWorkloadChart } from './TeacherWorkloadChart';
import { SchoolActivitiesCalendar } from './SchoolActivitiesCalendar';
import { TeacherEvaluationDashboardCard } from './TeacherEvaluationDashboardCard';
import { TeacherEvaluationModal } from './TeacherEvaluationModal';
import { SchoolInventoryDashboardModule } from './SchoolInventoryDashboardModule';
import { MonthlyAttendanceAbsenceTrendsChart } from './MonthlyAttendanceAbsenceTrendsChart';

interface DashboardViewProps {
  classes: ClassItem[];
  teachers: Teacher[];
  students: Student[];
  conflicts: TimetableConflict[];
  attendanceRecords: AttendanceRecord[];
  feePayments: FeePayment[];
  subjects?: Subject[];
  grades?: GradeRecord[];
  sessions?: TimetableSession[];
  activities?: SchoolActivity[];
  evaluations?: TeacherEvaluation[];
  inventory?: InventoryItem[];
  leaveRequests?: TeacherLeaveRequest[];
  role?: UserRole;
  activeTeacherId?: string;
  schoolConfig: SchoolConfig;
  language: Language;
  onNavigate: (tabId: string) => void;
  onOpenConflictsModal: () => void;
  onAddActivity?: (act: SchoolActivity) => void;
  onSaveEvaluation?: (evaluation: TeacherEvaluation) => void;
  onNavigateToLeaves?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classes,
  teachers,
  students,
  conflicts,
  attendanceRecords,
  feePayments,
  subjects = [],
  grades = [],
  sessions = initialTimetableSessions,
  activities = initialSchoolActivities,
  evaluations = initialTeacherEvaluations,
  inventory = initialInventoryItems,
  leaveRequests = initialTeacherLeaveRequests,
  role = 'admin',
  activeTeacherId,
  schoolConfig,
  language,
  onNavigate,
  onOpenConflictsModal,
  onAddActivity,
  onSaveEvaluation,
  onNavigateToLeaves,
}) => {
  const t = translations[language];

  // Dashboard Teacher Persona selection
  const [selectedDashboardTeacherId, setSelectedDashboardTeacherId] = React.useState<string>(
    activeTeacherId || teachers[0]?.id || 'tch-1'
  );
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = React.useState(false);

  // Sync if activeTeacherId changes from App bar
  React.useEffect(() => {
    if (activeTeacherId) {
      setSelectedDashboardTeacherId(activeTeacherId);
    }
  }, [activeTeacherId]);

  const activeTeacher =
    teachers.find((tch) => tch.id === selectedDashboardTeacherId) || teachers[0];

  // Calculate today's attendance rate
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr || r.date === '2026-10-09');
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const attendanceRate =
    todayRecords.length > 0 ? Math.round((presentCount / todayRecords.length) * 100) : 96;

  // Calculate fee collection rate
  const paidCount = feePayments.filter((f) => f.status === 'paid').length;
  const feeRate =
    feePayments.length > 0 ? Math.round((paidCount / feePayments.length) * 100) : 75;

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 end-0 -mt-10 -me-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/20">
              <School className="w-3.5 h-3.5" />
              <span>{schoolConfig.academicYear} | {t.appTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === 'ar' ? schoolConfig.nameAr : schoolConfig.nameFr}
            </h2>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              {language === 'ar'
                ? 'مرحباً بك في المنصة الموحدة لتسيير المؤسسة التربوية، جداول التوقيت والتعارضات، ودفاتر النقاط وسجلات الغياب ومولد الفروض الذكي.'
                : 'Bienvenue sur la plateforme unifiée de gestion d\'établissement scolaire.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('ai_exam')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/30 transition cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.nav_ai_exam}</span>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t.recordToday}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conflict Warning Alert Banner if any */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">
                {t.conflictsFound} ({conflicts.length} {language === 'ar' ? 'تعارض في جداول التوقيت' : 'conflits'})
              </h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'تم رصد حصص تتشارك نفس الأستاذ أو نفس القاعة في نفس التوقيت الأسبوعي. يرجى المراجعة الفورية لتفادي التداخل الدراسي.'
                  : 'Des séances se chevauchent sur les mêmes créneaux ou professeurs.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenConflictsModal}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {language === 'ar' ? 'معاينة وحل التعارضات' : 'Examiner'}
            </button>
            <button
              onClick={() => onNavigate('timetables')}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-800 hover:bg-red-100 text-xs font-bold transition cursor-pointer"
            >
              {t.nav_timetables}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Students */}
        <div
          onClick={() => onNavigate('classes_students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{t.kpi_students}</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{students.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">مختلف الأطوار</div>
        </div>

        {/* Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{t.kpi_teachers}</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{teachers.length}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">طاقم تدريسي مؤطر</div>
        </div>

        {/* Classes */}
        <div
          onClick={() => onNavigate('classes_students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{t.kpi_classes}</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{classes.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">ابتدائي، متوسط، ثانوي</div>
        </div>

        {/* Attendance Rate */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{t.kpi_attendanceRate}</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{attendanceRate}%</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">نسبة عالية وممتازة</div>
        </div>

        {/* Conflicts */}
        <div
          onClick={() => (conflicts.length > 0 ? onOpenConflictsModal() : onNavigate('timetables'))}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            conflicts.length > 0
              ? 'bg-red-50/70 border-red-200 text-red-900'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold">{t.kpi_conflicts}</span>
            <div
              className={`p-2 rounded-xl ${
                conflicts.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black">{conflicts.length}</div>
          <div className="text-[11px] font-semibold mt-1">
            {conflicts.length > 0 ? 'يتطلب فحصاً' : 'متوافقة 100%'}
          </div>
        </div>

        {/* Fees */}
        <div
          onClick={() => onNavigate('fees')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{t.kpi_feesCollected}</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">{feeRate}%</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">شهر أكتوبر 2026</div>
        </div>

      </div>

      {/* Teacher Periodic Evaluation & Pedagogical Appraisal Component */}
      <div className="space-y-3">
        {role === 'admin' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'معاينة نتائج تقييم الأستاذ في لوحة التحكم:' : 'Consulter l’évaluation de l’enseignant :'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedDashboardTeacherId}
                onChange={(e) => setSelectedDashboardTeacherId(e.target.value)}
                className="bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 focus:ring-2 focus:ring-purple-400 cursor-pointer"
              >
                {teachers.map((tch) => (
                  <option key={tch.id} value={tch.id}>
                    {tch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <TeacherEvaluationDashboardCard
          teacher={activeTeacher}
          evaluations={evaluations}
          schoolConfig={schoolConfig}
          language={language}
          isAdmin={role === 'admin'}
          onOpenNewEvaluation={() => setIsEvaluationModalOpen(true)}
        />
      </div>

      {isEvaluationModalOpen && activeTeacher && (
        <TeacherEvaluationModal
          isOpen={true}
          onClose={() => setIsEvaluationModalOpen(false)}
          teacher={activeTeacher}
          language={language}
          existingEvaluation={evaluations.find((e) => e.teacherId === activeTeacher.id) || null}
          onSaveEvaluation={(ev) => {
            if (onSaveEvaluation) {
              onSaveEvaluation(ev);
            }
            setIsEvaluationModalOpen(false);
          }}
        />
      )}

      {/* Class Comparison & Academic Performance Trends Recharts Component */}
      <ClassComparisonPerformanceChart
        classes={classes}
        subjects={subjects}
        grades={grades}
        students={students}
        language={language}
      />

      {/* Teacher Workload Distribution & Balancing Recharts Component */}
      <TeacherWorkloadChart
        teachers={teachers}
        sessions={sessions}
        subjects={subjects}
        classes={classes}
        language={language}
      />

      {/* Recharts Analytics Sub-Component */}
      <DashboardAnalyticsCharts
        students={students}
        classes={classes}
        subjects={subjects}
        grades={grades}
        attendanceRecords={attendanceRecords}
        feePayments={feePayments}
        language={language}
        schoolConfig={schoolConfig}
      />

      {/* Monthly Attendance & Absence Trends Recharts Component */}
      <MonthlyAttendanceAbsenceTrendsChart
        language={language}
        schoolConfig={schoolConfig}
        attendanceRecords={attendanceRecords}
        classes={classes}
        students={students}
      />

      {/* School Activities & Trips Management Interactive Calendar Component */}
      <SchoolActivitiesCalendar
        activities={activities}
        classes={classes}
        teachers={teachers}
        schoolConfig={schoolConfig}
        language={language}
        onAddActivity={onAddActivity || (() => {})}
      />

      {/* School Inventory & Equipment Management Dashboard Module */}
      <SchoolInventoryDashboardModule
        inventory={inventory}
        language={language}
        onNavigateToInventory={() => onNavigate('inventory')}
      />

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Timetables Feature Card */}
        <div
          onClick={() => onNavigate('timetables')}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.nav_timetables}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'إنشاء ومتابعة جداول الأقسام والأساتذة والقاعات، وتدقيق التوافقية مع تنبيه تلقائي في حال وجود تعارض.'
                : 'Gestion des emplois du temps et vérification des conflits.'}
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 pt-2">
            <span>فتح الجداول</span>
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Gradebook Feature Card */}
        <div
          onClick={() => onNavigate('gradebook')}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.nav_gradebook}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'إدخال علامات التقويم المستمر والفروض والاختبارات، وحساب المعدلات العامة، وطباعة كشوف النقاط الرسمية.'
                : 'Saisie des notes, calcul des moyennes et génération des bulletins.'}
            </p>
          </div>
          <div className="text-xs font-bold text-blue-700 flex items-center gap-1.5 pt-2">
            <span>فتح دفتر النقاط</span>
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* AI Exam Generator Feature Card */}
        <div
          onClick={() => onNavigate('ai_exam')}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-indigo-950">{t.nav_ai_exam}</h3>
            <p className="text-xs text-indigo-800/80 leading-relaxed">
              {language === 'ar'
                ? 'إنشاء مواضيع فروض متوافقة مع المنهاج التربوي بالذكاء الاصطناعي مع عناصر الإجابة وسلم التنقيط وطباعة فورية.'
                : 'Génération de devoirs conformes aux programmes avec barèmes et corrigés.'}
            </p>
          </div>
          <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 pt-2">
            <span>بدء إنشاء فرض</span>
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Curriculum & Structure Feature Card */}
        <div
          onClick={() => onNavigate('curriculum')}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-purple-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.nav_curriculum}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'إدارة الهيكل والسنوات الدراسية وشجرة المواد لجميع الأطوار وفق المنهاج الجزائري الرسمي.'
                : 'Gestion de la structure des niveaux et catalogue officiel des matières.'}
            </p>
          </div>
          <div className="text-xs font-bold text-purple-700 flex items-center gap-1.5 pt-2">
            <span>إدارة المناهج والسنوات</span>
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

      </div>

    </div>
  );
};
