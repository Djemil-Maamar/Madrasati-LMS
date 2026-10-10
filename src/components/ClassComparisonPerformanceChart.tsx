import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ClassItem, Subject, GradeRecord, Student, Language } from '../types';

interface ClassComparisonPerformanceChartProps {
  classes: ClassItem[];
  subjects: Subject[];
  grades: GradeRecord[];
  students: Student[];
  language: Language;
}

export const ClassComparisonPerformanceChart: React.FC<ClassComparisonPerformanceChartProps> = ({
  classes,
  subjects,
  grades,
  students,
  language,
}) => {
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';

  const [activeCycle, setActiveCycle] = useState<'all' | 'primary' | 'middle' | 'secondary'>('all');
  const [selectedTerm, setSelectedTerm] = useState<'all' | 'T1' | 'T2' | 'T3'>('all');
  const [metricView, setMetricView] = useState<'bar_comparison' | 'term_trends'>('bar_comparison');

  // Realistic mock baseline averages for different classes across the terms (T1, T2, T3)
  const defaultClassBenchmarks: Record<string, { name: string; shortName: string; cycle: string; T1: number; T2: number; T3: number; passRate: number }> = {
    'cls-1ap': { name: '1 ابتدائي (1AP)', shortName: '1AP', cycle: 'primary', T1: 15.8, T2: 16.2, T3: 16.9, passRate: 95 },
    'cls-5ap': { name: '5 ابتدائي (5AP)', shortName: '5AP', cycle: 'primary', T1: 14.6, T2: 15.1, T3: 15.8, passRate: 92 },
    'cls-1am': { name: '1 متوسط (1AM)', shortName: '1AM', cycle: 'middle', T1: 13.2, T2: 13.8, T3: 14.4, passRate: 85 },
    'cls-4am': { name: '4 متوسط - BEM', shortName: '4AM', cycle: 'middle', T1: 12.8, T2: 13.5, T3: 14.2, passRate: 83 },
    'cls-1as-tc': { name: '1 ثانوي - ج.م.ع', shortName: '1AS', cycle: 'secondary', T1: 13.1, T2: 13.9, T3: 14.5, passRate: 86 },
    'cls-2as-math': { name: '2 ثانوي - رياضيات', shortName: '2AS Math', cycle: 'secondary', T1: 14.9, T2: 15.5, T3: 16.3, passRate: 94 },
    'cls-3as-sci': { name: '3 ثانوي - علوم (بكالوريا)', shortName: '3AS Sci', cycle: 'secondary', T1: 14.4, T2: 15.0, T3: 15.7, passRate: 89 },
    'cls-3as-lit': { name: '3 ثانوي - آداب وفلسفة', shortName: '3AS Lit', cycle: 'secondary', T1: 12.5, T2: 13.1, T3: 13.8, passRate: 78 },
  };

  // Filter classes based on activeCycle
  const filteredClassData = useMemo(() => {
    return classes
      .filter((cls) => activeCycle === 'all' || cls.cycle === activeCycle)
      .map((cls) => {
        const benchmark = defaultClassBenchmarks[cls.id] || {
          name: cls.name,
          shortName: cls.name.slice(0, 10),
          cycle: cls.cycle,
          T1: 13.0,
          T2: 13.7,
          T3: 14.3,
          passRate: 80,
        };

        const overallAvg = parseFloat(((benchmark.T1 + benchmark.T2 + benchmark.T3) / 3).toFixed(2));
        const progressDelta = parseFloat((benchmark.T3 - benchmark.T1).toFixed(2));

        return {
          id: cls.id,
          name: isArabic ? cls.name : cls.name,
          shortName: benchmark.shortName,
          cycle: cls.cycle,
          studentCount: cls.studentCount || 25,
          T1: benchmark.T1,
          T2: benchmark.T2,
          T3: benchmark.T3,
          overallAvg,
          passRate: benchmark.passRate,
          progressDelta,
        };
      });
  }, [classes, activeCycle, isArabic]);

  // Overall statistics for highlighted cards
  const highestAvgClass = useMemo(() => {
    if (filteredClassData.length === 0) return null;
    return [...filteredClassData].sort((a, b) => b.overallAvg - a.overallAvg)[0];
  }, [filteredClassData]);

  const mostImprovedClass = useMemo(() => {
    if (filteredClassData.length === 0) return null;
    return [...filteredClassData].sort((a, b) => b.progressDelta - a.progressDelta)[0];
  }, [filteredClassData]);

  const schoolAverage = useMemo(() => {
    if (filteredClassData.length === 0) return 0;
    const sum = filteredClassData.reduce((acc, c) => acc + c.overallAvg, 0);
    return parseFloat((sum / filteredClassData.length).toFixed(2));
  }, [filteredClassData]);

  // Term trends comparison dataset (aggregating over terms)
  const termProgressionData = useMemo(() => {
    const t1Sum = filteredClassData.reduce((acc, c) => acc + c.T1, 0) / (filteredClassData.length || 1);
    const t2Sum = filteredClassData.reduce((acc, c) => acc + c.T2, 0) / (filteredClassData.length || 1);
    const t3Sum = filteredClassData.reduce((acc, c) => acc + c.T3, 0) / (filteredClassData.length || 1);

    return [
      {
        term: isArabic ? 'الفصل الأول (T1)' : isFrench ? '1er Trimestre (T1)' : 'Term 1',
        average: parseFloat(t1Sum.toFixed(2)),
        target: 14.0,
      },
      {
        term: isArabic ? 'الفصل الثاني (T2)' : isFrench ? '2ème Trimestre (T2)' : 'Term 2',
        average: parseFloat(t2Sum.toFixed(2)),
        target: 14.0,
      },
      {
        term: isArabic ? 'الفصل الثالث (T3)' : isFrench ? '3ème Trimestre (T3)' : 'Term 3',
        average: parseFloat(t3Sum.toFixed(2)),
        target: 14.0,
      },
    ];
  }, [filteredClassData, isArabic, isFrench]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      
      {/* Header and View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>
                  {isArabic
                    ? 'مقارنة متوسطات درجات الفصول واتجاهات الأداء الأكاديمي'
                    : isFrench
                    ? 'Comparaison des Moyennes de Classes & Tendances Académiques'
                    : 'Class Grade Comparison & Academic Performance Trends'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                  Recharts AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isArabic
                  ? 'رصد مقارن لمعدلات الأقسام عبر الفصول الثلاثة (T1، T2، T3) ونسب النجاح والتقدم الدراسي'
                  : 'Suivi comparatif des moyennes par classe à travers les trois trimestres.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters: Cycle & Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Cycle filter pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveCycle('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCycle === 'all'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isArabic ? 'الكل' : 'Tous'}
            </button>
            <button
              onClick={() => setActiveCycle('primary')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCycle === 'primary'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isArabic ? 'ابتدائي' : 'Primaire'}
            </button>
            <button
              onClick={() => setActiveCycle('middle')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCycle === 'middle'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isArabic ? 'متوسط' : 'Moyen'}
            </button>
            <button
              onClick={() => setActiveCycle('secondary')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCycle === 'secondary'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isArabic ? 'ثانوي' : 'Secondaire'}
            </button>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center bg-blue-50/70 p-1 rounded-xl text-xs font-bold border border-blue-200/60">
            <button
              onClick={() => setMetricView('bar_comparison')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                metricView === 'bar_comparison'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-800 hover:text-blue-950'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isArabic ? 'مقارنة الأقسام بالفصول' : 'Moyennes par Classe'}</span>
            </button>
            <button
              onClick={() => setMetricView('term_trends')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                metricView === 'term_trends'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-800 hover:text-blue-950'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تطور الأداء العام' : 'Courbe d\'évolution'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Highlights Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Overall School Average */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isArabic ? 'معدل الأقسام الإجمالي' : 'Moyenne Globale des Classes'}
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {schoolAverage} <span className="text-xs font-semibold text-slate-400">/ 20</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isArabic ? 'أعلى من المعدل المرجعي (10/20)' : 'Au-dessus de la moyenne'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Highest Performing Class */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-800 font-bold">
              {isArabic ? 'القسم المتصدر أكاديمياً' : 'Classe Leader'}
            </div>
            <div className="text-lg font-black text-emerald-950 mt-1 truncate max-w-[190px]">
              {highestAvgClass?.name || '-'}
            </div>
            <div className="text-xs font-bold text-emerald-700 mt-0.5">
              {isArabic ? 'المعدل السنوي: ' : 'Moyenne: '}
              <span className="text-sm font-black">{highestAvgClass?.overallAvg}</span> / 20
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Most Improved Class */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/40 border border-purple-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs text-purple-800 font-bold">
              {isArabic ? 'أعلى نسبة تحسن عبر الفصول' : 'Meilleure Progression'}
            </div>
            <div className="text-lg font-black text-purple-950 mt-1 truncate max-w-[190px]">
              {mostImprovedClass?.name || '-'}
            </div>
            <div className="text-xs font-bold text-purple-700 mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>+{mostImprovedClass?.progressDelta} {isArabic ? 'نقطة (من T1 إلى T3)' : 'pts'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Interactive Recharts Area */}
      {metricView === 'bar_comparison' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">
              {isArabic
                ? 'مقارنة متوسطات كل قسم عبر الفصول الثلاثة (T1، T2، T3):'
                : 'Moyennes comparatives par classe et par trimestre:'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {isArabic ? 'الدرجات مصححة على سلم 20 نقطة' : 'Noté sur 20 points'}
            </span>
          </div>

          <div className="h-[360px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredClassData}
                margin={{ top: 20, right: 15, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} / 20`,
                    name === 'T1'
                      ? isArabic ? 'الفصل الأول' : '1er Trimestre'
                      : name === 'T2'
                      ? isArabic ? 'الفصل الثاني' : '2ème Trimestre'
                      : isArabic ? 'الفصل الثالث' : '3ème Trimestre',
                  ]}
                  labelFormatter={(label) => {
                    const found = filteredClassData.find((c) => c.shortName === label);
                    return found ? found.name : label;
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }}
                />
                <ReferenceLine
                  y={10}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: isArabic ? 'عتبة النجاح (10)' : 'Seuil (10)',
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
                <Bar
                  dataKey="T1"
                  name={isArabic ? 'الفصل الأول (T1)' : 'Trimestre 1'}
                  fill="#94a3b8"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="T2"
                  name={isArabic ? 'الفصل الثاني (T2)' : 'Trimestre 2'}
                  fill="#60a5fa"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="T3"
                  name={isArabic ? 'الفصل الثالث (T3)' : 'Trimestre 3'}
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">
              {isArabic
                ? 'منحنى اتجاه التطور الأكاديمي العام عبر الفصول الدراسية (Term Progression):'
                : 'Courbe d’évolution de la performance académique à travers les trimestres:'}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">
              {isArabic ? 'مسار تصاعدي إيجابي مستمر' : 'Tendance à la hausse continue'}
            </span>
          </div>

          <div className="h-[360px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={termProgressionData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="term"
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                />
                <YAxis
                  domain={[10, 20]}
                  ticks={[10, 12, 14, 16, 18, 20]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} / 20`,
                    name === 'average'
                      ? isArabic ? 'معدل الأقسام المحقق' : 'Moyenne Réalisée'
                      : isArabic ? 'الهدف المستهدف' : 'Objectif Cible',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }}
                />
                <ReferenceLine
                  y={10}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: isArabic ? 'عتبة النجاح (10)' : 'Seuil (10)',
                    fill: '#ef4444',
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  name={isArabic ? 'المعدل المحقق' : 'Moyenne'}
                  stroke="#2563eb"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name={isArabic ? 'الهدف المنشود' : 'Cible'}
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#94a3b8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Classes Performance Breakdown Table */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-800 mb-3">
          {isArabic ? 'جدول مقارنة معدلات الأقسام ونسب النجاح الفصلي:' : 'Tableau comparatif des classes:'}
        </h4>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3 text-start">{isArabic ? 'القسم / الفوج' : 'Classe'}</th>
                <th className="p-3 text-center">{isArabic ? 'الطور' : 'Cycle'}</th>
                <th className="p-3 text-center">{isArabic ? 'تلاميذ' : 'Effectif'}</th>
                <th className="p-3 text-center font-bold text-slate-800">T1</th>
                <th className="p-3 text-center font-bold text-slate-800">T2</th>
                <th className="p-3 text-center font-bold text-slate-800">T3</th>
                <th className="p-3 text-center font-black text-blue-900">{isArabic ? 'المعدل السنوي' : 'Moy. Annuelle'}</th>
                <th className="p-3 text-center">{isArabic ? 'نسبة النجاح' : 'Taux Réussite'}</th>
                <th className="p-3 text-center">{isArabic ? 'التطور' : 'Progression'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredClassData.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-bold text-slate-900">{cls.name}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {cls.cycle === 'primary'
                        ? isArabic ? 'ابتدائي' : 'Primaire'
                        : cls.cycle === 'middle'
                        ? isArabic ? 'متوسط' : 'Moyen'
                        : isArabic ? 'ثانوي' : 'Secondaire'}
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-600 font-semibold">{cls.studentCount}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{cls.T1.toFixed(2)}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{cls.T2.toFixed(2)}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{cls.T3.toFixed(2)}</td>
                  <td className="p-3 text-center font-black text-blue-900 text-sm">
                    {cls.overallAvg.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      cls.passRate >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cls.passRate}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-0.5 font-bold text-emerald-700 text-xs">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+{cls.progressDelta}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
