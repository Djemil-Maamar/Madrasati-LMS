import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  UserCheck,
  CreditCard,
  Award,
  Layers,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  Student,
  ClassItem,
  Subject,
  GradeRecord,
  AttendanceRecord,
  FeePayment,
  Language,
  SchoolConfig,
} from '../types';

interface DashboardAnalyticsChartsProps {
  students: Student[];
  classes: ClassItem[];
  subjects: Subject[];
  grades: GradeRecord[];
  attendanceRecords: AttendanceRecord[];
  feePayments: FeePayment[];
  language: Language;
  schoolConfig: SchoolConfig;
}

export const DashboardAnalyticsCharts: React.FC<DashboardAnalyticsChartsProps> = ({
  students,
  classes,
  subjects,
  grades,
  attendanceRecords,
  feePayments,
  language,
  schoolConfig,
}) => {
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<'all' | 'primary' | 'middle' | 'secondary'>('all');
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';

  // 1. Student Performance Trends Data (by Subject / Category across Terms T1, T2, T3)
  const performanceTrendData = [
    {
      name: isArabic ? 'الرياضيات' : isFrench ? 'Maths' : 'Math',
      T1: 14.8,
      T2: 15.4,
      T3: 16.1,
    },
    {
      name: isArabic ? 'العلوم الطبيعية' : isFrench ? 'SVT' : 'Science',
      T1: 15.2,
      T2: 15.8,
      T3: 16.5,
    },
    {
      name: isArabic ? 'العلوم الفيزيائية' : isFrench ? 'Physique' : 'Physics',
      T1: 14.1,
      T2: 14.6,
      T3: 15.3,
    },
    {
      name: isArabic ? 'اللغة العربية' : isFrench ? 'Arabe' : 'Arabic',
      T1: 15.6,
      T2: 15.9,
      T3: 16.2,
    },
    {
      name: isArabic ? 'اللغات الأجنبية' : isFrench ? 'Langues' : 'Languages',
      T1: 16.2,
      T2: 16.7,
      T3: 17.0,
    },
    {
      name: isArabic ? 'الاجتماعيات والفلسفة' : isFrench ? 'Histoire & Philo' : 'Humanities',
      T1: 13.9,
      T2: 14.5,
      T3: 15.1,
    },
  ];

  // 2. Grade Distribution Data (ممتاز، جيد جدا، مقبول، دون المتوسط)
  const gradeDistributionData = [
    {
      range: isArabic ? 'ممتاز (≥ 16)' : 'Très Bien (≥ 16)',
      count: 68,
      fill: '#10b981', // emerald
    },
    {
      range: isArabic ? 'جيد (14 - 15.99)' : 'Bien (14 - 15.99)',
      count: 94,
      fill: '#3b82f6', // blue
    },
    {
      range: isArabic ? 'قريب من الجيد (12 - 13.99)' : 'Assez Bien (12 - 13.99)',
      count: 72,
      fill: '#8b5cf6', // purple
    },
    {
      range: isArabic ? 'مقبول (10 - 11.99)' : 'Passable (10 - 11.99)',
      count: 45,
      fill: '#f59e0b', // amber
    },
    {
      range: isArabic ? 'دون المتوسط (< 10)' : 'Insuffisant (< 10)',
      count: 18,
      fill: '#f43f5e', // rose
    },
  ];

  // 3. Monthly Attendance Trends (نسبة الحضور شهرياً خلال السنة الدراسية)
  const monthlyAttendanceData = [
    { month: isArabic ? 'سبتمبر' : 'Sep', attendance: 97.2, target: 95 },
    { month: isArabic ? 'أكتوبر' : 'Oct', attendance: 95.8, target: 95 },
    { month: isArabic ? 'نوفمبر' : 'Nov', attendance: 94.6, target: 95 },
    { month: isArabic ? 'ديسمبر' : 'Dec', attendance: 93.9, target: 95 },
    { month: isArabic ? 'جانفي' : 'Jan', attendance: 96.1, target: 95 },
    { month: isArabic ? 'فيفري' : 'Feb', attendance: 95.4, target: 95 },
    { month: isArabic ? 'مارس' : 'Mar', attendance: 94.8, target: 95 },
    { month: isArabic ? 'أفريل' : 'Apr', attendance: 96.5, target: 95 },
    { month: isArabic ? 'ماي' : 'May', attendance: 97.0, target: 95 },
  ];

  // 4. Attendance Breakdown Pie Data
  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length || 180;
  const justifiedCount = attendanceRecords.filter((r) => r.status === 'absent_justified').length || 8;
  const unjustifiedCount = attendanceRecords.filter((r) => r.status === 'absent_unjustified').length || 4;
  const tardyCount = attendanceRecords.filter((r) => r.status === 'tardy').length || 6;

  const attendancePieData = [
    { name: isArabic ? 'حضور تام' : 'Présent', value: presentCount, color: '#10b981' },
    { name: isArabic ? 'غياب مبرر' : 'Absence justifiée', value: justifiedCount, color: '#f59e0b' },
    { name: isArabic ? 'غياب غير مبرر' : 'Absence non justifiée', value: unjustifiedCount, color: '#f43f5e' },
    { name: isArabic ? 'تأخر بالدقائق' : 'En retard', value: tardyCount, color: '#8b5cf6' },
  ];

  // 5. Fee Collection Progress by Month (مسدد vs معلق vs متأخر)
  const feeMonthlyData = [
    {
      month: isArabic ? 'سبتمبر' : 'Sep',
      paid: 320000,
      pending: 24000,
      overdue: 12000,
    },
    {
      month: isArabic ? 'أكتوبر' : 'Oct',
      paid: 310000,
      pending: 36000,
      overdue: 14000,
    },
    {
      month: isArabic ? 'نوفمبر' : 'Nov',
      paid: 290000,
      pending: 48000,
      overdue: 18000,
    },
    {
      month: isArabic ? 'ديسمبر' : 'Dec',
      paid: 275000,
      pending: 65000,
      overdue: 22000,
    },
    {
      month: isArabic ? 'جانفي' : 'Jan',
      paid: 305000,
      pending: 40000,
      overdue: 15000,
    },
  ];

  const totalPaidSum = feeMonthlyData.reduce((acc, curr) => acc + curr.paid, 0);
  const totalPendingSum = feeMonthlyData.reduce((acc, curr) => acc + curr.pending + curr.overdue, 0);
  const collectionRateOverall = Math.round((totalPaidSum / (totalPaidSum + totalPendingSum)) * 100);

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>
              {isArabic
                ? 'لوحة التحليلات البيانية الذكية (Recharts Analytics Hub)'
                : 'Analyses & Tendances de l’Année Scolaire'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isArabic
              ? 'مؤشرات الأداء الدراسي، نسب المواظبة الأسبوعية، وتقدم تحصيل الرسوم المدرسية للسنة الحالية.'
              : 'Indicateurs de performance, taux d\'assiduité et recouvrement des frais.'}
          </p>
        </div>

        {/* Cycle Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => setSelectedCycleFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              selectedCycleFilter === 'all'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isArabic ? 'كافة الأطوار' : 'Tous cycles'}
          </button>
          <button
            onClick={() => setSelectedCycleFilter('primary')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              selectedCycleFilter === 'primary'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isArabic ? 'الابتدائي' : 'Primaire'}
          </button>
          <button
            onClick={() => setSelectedCycleFilter('middle')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              selectedCycleFilter === 'middle'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isArabic ? 'المتوسط' : 'Moyen'}
          </button>
          <button
            onClick={() => setSelectedCycleFilter('secondary')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              selectedCycleFilter === 'secondary'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isArabic ? 'الثانوي' : 'Secondaire'}
          </button>
        </div>
      </div>

      {/* Grid Row 1: Student Performance Trends & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Performance Trends Across Terms (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>
                  {isArabic
                    ? 'تطور معدلات المواد حسب الفصول الدراسية (الفصل 1، 2، 3)'
                    : 'Évolution des moyennes par trimestre (T1, T2, T3)'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                {isArabic ? 'مقارنة تقدم التحصيل المعرفي للمواد الأساسية' : 'Progression trimestrielle'}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
              {isArabic ? '+1.2ن تحسن فصلي' : '+1.2 pts'}
            </span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorT1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorT2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorT3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[10, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="T1" name={isArabic ? 'الفصل 1' : 'T1'} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorT1)" />
                <Area type="monotone" dataKey="T2" name={isArabic ? 'الفصل 2' : 'T2'} stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorT2)" />
                <Area type="monotone" dataKey="T3" name={isArabic ? 'الفصل 3' : 'T3'} stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorT3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grade Distribution Histogram (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>
                {isArabic ? 'توزيع التقديرات والمعدلات العامة' : 'Distribution des moyennes'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              {isArabic ? 'عدد التلاميذ في كل شريحة معدل' : 'Répartition des effectifs'}
            </p>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistributionData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} width={110} />
                <Tooltip
                  formatter={(value: any) => [`${value} تلميذ`, 'العدد']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid Row 2: Attendance Rates (Monthly Trend + Breakdown Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 3: Monthly Attendance Line (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>
                  {isArabic
                    ? 'معدل المواظبة والحضور الشهري مقارنة بالهدف الوزاري'
                    : 'Taux d\'assiduité mensuel vs Objectif'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                {isArabic ? 'النسبة المئوية للحضور الصباحي والمسائي' : 'Pourcentage de présence'}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-bold text-xs rounded-lg border border-teal-200">
              {isArabic ? 'متوسط 95.8%' : 'Moyenne 95.8%'}
            </span>
          </div>

          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name={isArabic ? 'نسبة الحضور الفعلي %' : 'Présence réelle %'}
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0d9488' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name={isArabic ? 'الهدف الموصى به (95%)' : 'Objectif 95%'}
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Attendance Breakdown Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>
                {isArabic ? 'توزيع حالات الحضور والغياب والتأخر' : 'Répartition Présence / Absences'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              {isArabic ? 'تفصيل الحالات المسجلة بالسجل اليومي' : 'Détail des statuts'}
            </p>
          </div>

          <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendancePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {attendancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} حالة`, '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid Row 3: Fee Collection Progress (Stacked Composed Bars) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>
                {isArabic
                  ? 'مؤشرات تحصيل الرسوم المدرسية والأقساط الشهرية'
                  : 'Recouvrement des frais de scolarité par mois'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              {isArabic
                ? 'مقارنة المبالغ المسددة، المعلقة، والمتأخرة بـ ' + schoolConfig.currency
                : 'Montants réglés vs restants'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
            <span className="text-xs font-bold text-amber-900">
              {isArabic ? 'نسبة التحصيل التراكمية:' : 'Taux global:'}
            </span>
            <span className="text-sm font-black text-emerald-700">
              {collectionRateOverall}%
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeMonthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [`${Number(val).toLocaleString()} ${schoolConfig.currency}`, '']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="paid" name={isArabic ? 'المبالغ المسددة' : 'Payé'} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name={isArabic ? 'المستحقات المعلقة' : 'En attente'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="overdue" name={isArabic ? 'الأقساط المتأخرة' : 'En retard'} fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
