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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import {
  Printer,
  Download,
  X,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  School,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  HelpCircle,
  Check,
} from 'lucide-react';
import {
  Student,
  ClassItem,
  Subject,
  GradeRecord,
  SchoolConfig,
  Language,
} from '../types';
import { translations } from '../i18n/translations';
import {
  calculateSubjectAverage,
  computeClassTermSummary,
  getAppreciation,
} from '../utils/gradeCalculations';

interface StudentPerformancePDFReportModalProps {
  student: Student;
  classItem?: ClassItem;
  initialTerm?: 'T1' | 'T2' | 'T3';
  grades: GradeRecord[];
  subjects: Subject[];
  studentsInClass: Student[];
  schoolConfig: SchoolConfig;
  language: Language;
  onClose: () => void;
}

export const StudentPerformancePDFReportModal: React.FC<StudentPerformancePDFReportModalProps> = ({
  student,
  classItem,
  initialTerm = 'T1',
  grades,
  subjects,
  studentsInClass,
  schoolConfig,
  language,
  onClose,
}) => {
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';
  const t = translations[language];

  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>(initialTerm);
  const [activeTab, setActiveTab] = useState<'barchart' | 'radarchart' | 'trend'>('barchart');

  // Term Labels
  const termName =
    selectedTerm === 'T1'
      ? isArabic ? 'الفصل الدراسي الأول' : isFrench ? 'Premier Trimestre (T1)' : 'Term 1'
      : selectedTerm === 'T2'
      ? isArabic ? 'الفصل الدراسي الثاني' : isFrench ? 'Deuxième Trimestre (T2)' : 'Term 2'
      : isArabic ? 'الفصل الدراسي الثالث' : isFrench ? 'Troisième Trimestre (T3)' : 'Term 3';

  // Compute all students term summaries for the selected term to get accurate class averages & ranks
  const classTermSummaries = useMemo(() => {
    return computeClassTermSummary(studentsInClass, grades, subjects, selectedTerm);
  }, [studentsInClass, grades, subjects, selectedTerm]);

  // Active student summary
  const studentSummary = useMemo(() => {
    return classTermSummaries.find((s) => s.student.id === student.id) || null;
  }, [classTermSummaries, student.id]);

  // Compute Class Overall General Average
  const classGeneralAverage = useMemo(() => {
    if (classTermSummaries.length === 0) return 0;
    const sum = classTermSummaries.reduce((acc, s) => acc + s.generalAverage, 0);
    return Math.round((sum / classTermSummaries.length) * 100) / 100;
  }, [classTermSummaries]);

  // Highest and Lowest General Average in the class
  const classHighestAvg = useMemo(() => {
    if (classTermSummaries.length === 0) return 0;
    return Math.max(...classTermSummaries.map((s) => s.generalAverage));
  }, [classTermSummaries]);

  const classLowestAvg = useMemo(() => {
    if (classTermSummaries.length === 0) return 0;
    return Math.min(...classTermSummaries.map((s) => s.generalAverage));
  }, [classTermSummaries]);

  // Subject-by-subject comparison data
  const subjectComparisonData = useMemo(() => {
    return subjects.map((subj) => {
      const subjName = isArabic ? subj.nameAr : isFrench ? subj.nameFr : subj.nameEn;

      // Student grade in this subject
      const studentRec = grades.find(
        (g) => g.studentId === student.id && g.subjectId === subj.id && g.term === selectedTerm
      );
      const studentAvg = calculateSubjectAverage(studentRec);

      // Class average in this subject
      const validClassAvgs: number[] = [];
      studentsInClass.forEach((st) => {
        const rec = grades.find(
          (g) => g.studentId === st.id && g.subjectId === subj.id && g.term === selectedTerm
        );
        const avg = calculateSubjectAverage(rec);
        if (avg !== null) validClassAvgs.push(avg);
      });

      const classAvg =
        validClassAvgs.length > 0
          ? Math.round((validClassAvgs.reduce((a, b) => a + b, 0) / validClassAvgs.length) * 100) / 100
          : 0;

      const classHighest = validClassAvgs.length > 0 ? Math.max(...validClassAvgs) : 0;
      const classLowest = validClassAvgs.length > 0 ? Math.min(...validClassAvgs) : 0;

      const diff = studentAvg !== null ? Math.round((studentAvg - classAvg) * 100) / 100 : null;

      // Student Rank in this subject
      let subjectRank: number | null = null;
      if (studentAvg !== null) {
        const sorted = [...validClassAvgs].sort((a, b) => b - a);
        subjectRank = sorted.indexOf(studentAvg) + 1;
      }

      return {
        subjectId: subj.id,
        subjectName: subjName,
        code: subj.code,
        coefficient: subj.coefficient,
        color: subj.color,
        studentAvg: studentAvg !== null ? Number(studentAvg.toFixed(2)) : null,
        classAvg: Number(classAvg.toFixed(2)),
        diff,
        classHighest: Number(classHighest.toFixed(2)),
        classLowest: Number(classLowest.toFixed(2)),
        subjectRank,
        totalInClass: validClassAvgs.length,
        isAboveAverage: diff !== null ? diff >= 0 : false,
      };
    });
  }, [subjects, grades, student.id, selectedTerm, studentsInClass, isArabic, isFrench]);

  // Progression across Terms (T1, T2, T3) for line chart
  const termProgressionData = useMemo(() => {
    const terms: Array<'T1' | 'T2' | 'T3'> = ['T1', 'T2', 'T3'];
    return terms.map((termKey) => {
      const summaries = computeClassTermSummary(studentsInClass, grades, subjects, termKey);
      const stdSum = summaries.find((s) => s.student.id === student.id);
      const classAvg =
        summaries.length > 0
          ? summaries.reduce((acc, s) => acc + s.generalAverage, 0) / summaries.length
          : 0;

      const label =
        termKey === 'T1'
          ? isArabic ? 'الفصل 1' : 'T1'
          : termKey === 'T2'
          ? isArabic ? 'الفصل 2' : 'T2'
          : isArabic ? 'الفصل 3' : 'T3';

      return {
        term: label,
        studentAverage: stdSum ? Number(stdSum.generalAverage.toFixed(2)) : null,
        classAverage: Number(classAvg.toFixed(2)),
      };
    });
  }, [studentsInClass, grades, subjects, student.id, isArabic]);

  // Strengths and Improvement Areas
  const strengths = useMemo(() => {
    return subjectComparisonData
      .filter((s) => s.diff !== null && s.diff >= 0.5)
      .sort((a, b) => (b.diff || 0) - (a.diff || 0));
  }, [subjectComparisonData]);

  const areasForImprovement = useMemo(() => {
    return subjectComparisonData
      .filter((s) => s.diff !== null && s.diff < 0)
      .sort((a, b) => (a.diff || 0) - (b.diff || 0));
  }, [subjectComparisonData]);

  // Overall Delta
  const generalDelta = studentSummary
    ? Math.round((studentSummary.generalAverage - classGeneralAverage) * 100) / 100
    : 0;

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Top Control Bar (Hidden during Print) */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/90 no-print gap-3 shrink-0">
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {isArabic
                    ? 'تقرير الأداء الأكاديمي المفصل ومقارنة المستوى مع متوسط القسم'
                    : 'Rapport d’Analyse des Performances & Comparaison à la Moyenne'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  PDF / Print Ready
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {student.fullName} ({classItem?.name || ''})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Term Selector */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-bold shadow-2xs">
              <button
                onClick={() => setSelectedTerm('T1')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  selectedTerm === 'T1' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                T1
              </button>
              <button
                onClick={() => setSelectedTerm('T2')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  selectedTerm === 'T2' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                T2
              </button>
              <button
                onClick={() => setSelectedTerm('T3')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  selectedTerm === 'T3' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                T3
              </button>
            </div>

            {/* Print / Export PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isArabic ? 'طباعة / حفظ كـ PDF' : 'Imprimer en PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Printable Detailed Report Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white printable-document">
          
          {/* Official Ministry and School Header */}
          <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-800">
            <h4 className="text-xs sm:text-sm font-bold tracking-wide text-slate-800">
              {t.officialHeader}
            </h4>
            <div className="text-base sm:text-lg font-black text-indigo-950">
              {isArabic
                ? 'تقرير الأداء والمستوى الأكاديمي المفصل للتلميذ (مقارنة مع متوسط القسم)'
                : 'Rapport Pédagogique Analytique et Comparatif de l’Élève'}
            </div>
            <div className="flex flex-wrap justify-between items-center text-xs text-slate-600 px-2 pt-2">
              <div>
                <span className="font-bold text-slate-800">المؤسسة: </span>
                {isArabic ? schoolConfig.nameAr : schoolConfig.nameFr}
              </div>
              <div className="font-bold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                {termName} - {schoolConfig.academicYear}
              </div>
              <div>
                <span className="font-bold text-slate-800">القسم: </span>
                {classItem?.name || ''}
              </div>
            </div>
          </div>

          {/* Student Profile Metadata Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-slate-500 font-medium">{isArabic ? 'التلميذ(ة):' : 'Élève:'}</div>
              <div className="text-sm font-black text-slate-900">{student.fullName}</div>
              {student.fullNameFr && (
                <div className="text-[11px] text-slate-500">{student.fullNameFr}</div>
              )}
            </div>
            <div>
              <div className="text-slate-500 font-medium">{isArabic ? 'رقم التسجيل:' : 'Matricule:'}</div>
              <div className="text-sm font-bold text-slate-900 font-mono">{student.regNumber}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">{isArabic ? 'تاريخ الميلاد:' : 'Date de naissance:'}</div>
              <div className="text-sm font-bold text-slate-900">{student.birthDate}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">{isArabic ? 'ولي الأمر:' : 'Parent:'}</div>
              <div className="text-sm font-bold text-slate-900">{student.parentName}</div>
              <div className="text-[11px] text-slate-500">{student.parentPhone}</div>
            </div>
          </div>

          {/* Executive Performance Benchmark Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            
            {/* Student General Average */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200">
              <div className="text-xs text-indigo-700 font-bold mb-1">
                {isArabic ? 'معدل التلميذ العام' : 'Moyenne de l’élève'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-950">
                {studentSummary ? studentSummary.generalAverage.toFixed(2) : '--'}
                <span className="text-xs font-normal text-slate-500 mx-1">/ 20</span>
              </div>
              <div className="text-xs font-bold text-indigo-700 mt-1">
                {studentSummary?.appreciation || ''}
              </div>
            </div>

            {/* Class Average */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-600 font-bold mb-1">
                {isArabic ? 'متوسط القسم العام' : 'Moyenne générale classe'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {classGeneralAverage.toFixed(2)}
                <span className="text-xs font-normal text-slate-500 mx-1">/ 20</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {isArabic ? 'أعلى:' : 'Max:'} {classHighestAvg.toFixed(2)} | {isArabic ? 'أدنى:' : 'Min:'} {classLowestAvg.toFixed(2)}
              </div>
            </div>

            {/* Performance Gap (Delta) */}
            <div className={`p-4 rounded-xl border ${
              generalDelta >= 0
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              <div className="text-xs font-bold mb-1">
                {isArabic ? 'فارق المستوى عن القسم' : 'Écart à la moyenne'}
              </div>
              <div className="text-2xl sm:text-3xl font-black flex items-center gap-1">
                {generalDelta >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-rose-600" />
                )}
                <span>
                  {generalDelta >= 0 ? `+${generalDelta.toFixed(2)}` : generalDelta.toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] font-semibold mt-1">
                {generalDelta >= 0
                  ? isArabic ? 'متفوق(ة) على متوسط القسم' : 'Au-dessus de la moyenne'
                  : isArabic ? 'أقل من متوسط القسم' : 'En-dessous de la moyenne'}
              </div>
            </div>

            {/* Rank in Class */}
            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200">
              <div className="text-xs text-amber-800 font-bold mb-1">
                {isArabic ? 'المرتبة في القسم' : 'Rang dans la classe'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-950">
                {studentSummary?.rank || '--'}
                <span className="text-xs font-normal text-slate-500 mx-1">
                  {isArabic ? 'من' : 'sur'} {studentsInClass.length}
                </span>
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">
                {studentSummary && studentSummary.generalAverage >= 10
                  ? isArabic ? 'مؤهل للنجاح والتفوق' : 'Admis avec succès'
                  : isArabic ? 'يحتاج إلى تحسين النتائج' : 'Résultats à améliorer'}
              </div>
            </div>

          </div>

          {/* Recharts Graphical Analysis Section */}
          <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
            
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  {isArabic
                    ? 'التحليل البياني لمستوى التلميذ مقارنة بمتوسط القسم (Recharts)'
                    : 'Visualisation graphique des performances comparées'}
                </h4>
              </div>

              {/* View Selector (Interactive on screen, prints active one) */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-bold no-print">
                <button
                  onClick={() => setActiveTab('barchart')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    activeTab === 'barchart' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                  }`}
                >
                  {isArabic ? 'مقارنة المواد (أعمدة)' : 'Par matière'}
                </button>
                <button
                  onClick={() => setActiveTab('radarchart')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    activeTab === 'radarchart' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                  }`}
                >
                  {isArabic ? 'المخطط الراداري' : 'Radar'}
                </button>
                <button
                  onClick={() => setActiveTab('trend')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    activeTab === 'trend' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                  }`}
                >
                  {isArabic ? 'التطور عبر الفصول' : 'Progression'}
                </button>
              </div>
            </div>

            {/* Recharts Chart 1: Dual BarChart (Student vs Class Average per Subject) */}
            {activeTab === 'barchart' && (
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subjectComparisonData}
                    margin={{ top: 20, right: 15, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="subjectName"
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
                      domain={[0, 20]}
                      ticks={[0, 5, 10, 15, 20]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-200 text-xs space-y-1.5 text-start">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                              {data.subjectName} (المعامل: {data.coefficient})
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-indigo-700 font-bold">معدل التلميذ:</span>
                              <span className="font-black text-indigo-900">
                                {data.studentAvg !== null ? `${data.studentAvg} / 20` : 'غير متاح'}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-amber-700 font-bold">متوسط القسم:</span>
                              <span className="font-black text-amber-900">{data.classAvg} / 20</span>
                            </div>
                            {data.diff !== null && (
                              <div className="flex justify-between gap-4 pt-1 border-t border-slate-100">
                                <span className="text-slate-500 font-medium">الفارق:</span>
                                <span className={`font-black ${data.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {data.diff >= 0 ? `+${data.diff}` : data.diff}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between gap-4 text-slate-500">
                              <span>الرتبة في المادة:</span>
                              <span className="font-bold text-slate-700">
                                {data.subjectRank ? `${data.subjectRank} من ${data.totalInClass}` : '--'}
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <ReferenceLine
                      y={10}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{
                        value: isArabic ? 'عتبة النجاح (10/20)' : 'Moyenne (10/20)',
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'top',
                      }}
                    />
                    <Bar
                      dataKey="studentAvg"
                      name={isArabic ? 'معدل التلميذ' : 'Moyenne élève'}
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="classAvg"
                      name={isArabic ? 'متوسط القسم' : 'Moyenne classe'}
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recharts Chart 2: Radar Chart */}
            {activeTab === 'radarchart' && (
              <div className="h-64 sm:h-72 w-full pt-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={subjectComparisonData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="code" tick={{ fontSize: 11, fill: '#475569' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 20]} />
                    <Radar
                      name={isArabic ? 'معدل التلميذ' : 'Élève'}
                      dataKey="studentAvg"
                      stroke="#4f46e5"
                      fill="#4f46e5"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name={isArabic ? 'متوسط القسم' : 'Classe'}
                      dataKey="classAvg"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.25}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recharts Chart 3: Term Trends Progression */}
            {activeTab === 'trend' && (
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={termProgressionData}
                    margin={{ top: 20, right: 20, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="term" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 20]} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="studentAverage"
                      name={isArabic ? 'معدل التلميذ العام' : 'Moyenne élève'}
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#4f46e5' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="classAverage"
                      name={isArabic ? 'متوسط القسم العام' : 'Moyenne classe'}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#f59e0b' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>

          {/* Detailed Comparative Table by Subject */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span>{isArabic ? 'جدول مقارنة نتائج المواد والتفوق النسبي' : 'Tableau comparatif des matières'}</span>
            </h4>

            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-start">{isArabic ? 'المادة' : 'Matière'}</th>
                  <th className="border border-slate-300 p-2 text-center w-14">{isArabic ? 'المعامل' : 'Coeff'}</th>
                  <th className="border border-slate-300 p-2 text-center w-24 bg-indigo-50/70 text-indigo-900">
                    {isArabic ? 'معدل التلميذ' : 'Élève (/20)'}
                  </th>
                  <th className="border border-slate-300 p-2 text-center w-24 bg-amber-50/70 text-amber-900">
                    {isArabic ? 'متوسط القسم' : 'Classe (/20)'}
                  </th>
                  <th className="border border-slate-300 p-2 text-center w-20">{isArabic ? 'الفارق' : 'Écart'}</th>
                  <th className="border border-slate-300 p-2 text-center w-24">{isArabic ? 'الرتبة في المادة' : 'Rang'}</th>
                  <th className="border border-slate-300 p-2 text-center w-24">{isArabic ? 'أعلى / أدنى' : 'Max / Min'}</th>
                  <th className="border border-slate-300 p-2 text-start">{isArabic ? 'التقييم التوجيهي' : 'Appréciation'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium">
                {subjectComparisonData.map((item) => (
                  <tr key={item.subjectId} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 font-bold text-slate-900">
                      {item.subjectName}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-semibold">
                      {item.coefficient}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-black text-indigo-900 bg-indigo-50/40">
                      {item.studentAvg !== null ? item.studentAvg.toFixed(2) : '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-amber-900 bg-amber-50/40">
                      {item.classAvg.toFixed(2)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {item.diff !== null ? (
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            item.diff >= 0
                              ? 'bg-emerald-50 text-emerald-700 font-black'
                              : 'bg-rose-50 text-rose-700 font-black'
                          }`}
                        >
                          {item.diff >= 0 ? `+${item.diff.toFixed(2)}` : item.diff.toFixed(2)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-semibold text-slate-700">
                      {item.subjectRank ? `${item.subjectRank} / ${item.totalInClass}` : '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center text-[11px] text-slate-500">
                      {item.classHighest} / {item.classLowest}
                    </td>
                    <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                      {item.studentAvg !== null ? getAppreciation(item.studentAvg, language) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pedagogical Guidance & Strengths / Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strengths Card */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isArabic ? 'نقاط القوة والتميز الأكاديمي' : 'Points forts & Disciplines maîtresses'}</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                {strengths.length > 0 ? (
                  strengths.slice(0, 4).map((s) => (
                    <li key={s.subjectId}>
                      <span className="font-bold text-emerald-950">{s.subjectName}</span>: معدل{' '}
                      <span className="font-extrabold text-emerald-700">{s.studentAvg}</span> (فارق{' '}
                      <span className="font-bold">+{s.diff}</span> عن متوسط القسم).
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">
                    {isArabic
                      ? 'النتائج متقاربة مع المعدل العام للقسم.'
                      : 'Performances homogènes avec la moyenne générale.'}
                  </li>
                )}
              </ul>
            </div>

            {/* Improvement Recommendations Card */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{isArabic ? 'مجالات التحسين والتوصيات التربوية' : 'Axes d’amélioration recommandés'}</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                {areasForImprovement.length > 0 ? (
                  areasForImprovement.slice(0, 4).map((s) => (
                    <li key={s.subjectId}>
                      <span className="font-bold text-amber-950">{s.subjectName}</span>: معدل{' '}
                      <span className="font-extrabold text-rose-700">{s.studentAvg}</span> (يحتاج دعم{' '}
                      <span className="font-bold text-rose-600">{s.diff}</span> للوصول لمعدل القسم).
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-700 font-medium">
                    {isArabic
                      ? 'ممتاز! التلميذ متفوق في كافة المواد المقررة.'
                      : 'Excellent! L’élève est au-dessus de la moyenne dans toutes les matières.'}
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Official Signatures & Seal Block */}
          <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
            <div>
              <div className="font-bold text-slate-700 mb-10">
                {isArabic ? 'ملاحظة وتوقيع الأستاذ(ة) المسؤول:' : 'Professeur principal:'}
              </div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
            </div>
            <div>
              <div className="font-bold text-slate-700 mb-10">
                {isArabic ? 'تأشيرة وتوقيع ولي الأمر:' : 'Visa du responsable légal:'}
              </div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
            </div>
            <div>
              <div className="font-bold text-slate-700 mb-10">
                {isArabic ? 'ختم وتوقيع مدير(ة) المؤسسة:' : 'Le Directeur de l’établissement:'}
              </div>
              <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
