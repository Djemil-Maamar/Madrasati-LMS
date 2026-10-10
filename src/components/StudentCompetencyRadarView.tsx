import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Award,
  Sparkles,
  TrendingUp,
  Brain,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Compass,
  Lightbulb,
  Layers,
  ArrowUpRight,
  User,
  Filter,
} from 'lucide-react';
import {
  Student,
  ClassItem,
  Subject,
  GradeRecord,
  Language,
  SchoolConfig,
} from '../types';
import { computeStudentRadarProfile } from '../utils/competencyCalculations';

interface StudentCompetencyRadarViewProps {
  students: Student[];
  selectedStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
  classes: ClassItem[];
  selectedClassId: string;
  subjects: Subject[];
  grades: GradeRecord[];
  selectedTerm: 'T1' | 'T2' | 'T3';
  language: Language;
  schoolConfig: SchoolConfig;
}

export const StudentCompetencyRadarView: React.FC<StudentCompetencyRadarViewProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  classes,
  selectedClassId,
  subjects,
  grades,
  selectedTerm,
  language,
  schoolConfig,
}) => {
  const isArabic = language === 'ar';

  // Active student in the current class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    if (selectedStudentId && classStudents.some((s) => s.id === selectedStudentId)) {
      return selectedStudentId;
    }
    return classStudents[0]?.id || '';
  });

  // Sync if selectedStudentId changes from parent
  React.useEffect(() => {
    if (selectedStudentId && classStudents.some((s) => s.id === selectedStudentId)) {
      setCurrentStudentId(selectedStudentId);
    } else if (classStudents.length > 0 && !classStudents.some((s) => s.id === currentStudentId)) {
      setCurrentStudentId(classStudents[0].id);
    }
  }, [selectedStudentId, classStudents]);

  const activeStudent = useMemo(() => {
    return classStudents.find((s) => s.id === currentStudentId) || classStudents[0];
  }, [classStudents, currentStudentId]);

  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  // Mode: Competencies vs Multi-Subject vs Combined
  const [radarMode, setRadarMode] = useState<'competencies' | 'subjects' | 'benchmark'>('competencies');

  // Compute profile
  const profile = useMemo(() => {
    if (!activeStudent) return null;
    return computeStudentRadarProfile(
      activeStudent,
      classStudents,
      grades,
      subjects,
      selectedTerm
    );
  }, [activeStudent, classStudents, grades, subjects, selectedTerm]);

  // Chart data for Competencies
  const competencyChartData = useMemo(() => {
    if (!profile) return [];
    return profile.competencies.map((comp) => ({
      axis: isArabic ? comp.nameAr : comp.nameFr,
      shortAxis: isArabic ? comp.nameAr.slice(0, 14) : comp.nameFr.slice(0, 14),
      score: comp.score,
      classAvg: comp.classAvg,
      benchmark: comp.benchmark,
      description: comp.description,
      category: comp.category,
    }));
  }, [profile, isArabic]);

  // Chart data for Multi-Subject
  const subjectChartData = useMemo(() => {
    if (!profile) return [];
    return profile.subjects.map((sub) => ({
      axis: isArabic ? sub.nameAr : sub.nameFr,
      shortAxis: isArabic ? sub.nameAr.slice(0, 10) : sub.nameFr.slice(0, 10),
      score: sub.studentAvg,
      classAvg: sub.classAvg,
      coefficient: sub.coefficient,
    }));
  }, [profile, isArabic]);

  // Handle student next/prev navigation
  const currentIndex = classStudents.findIndex((s) => s.id === currentStudentId);
  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextId = classStudents[currentIndex - 1].id;
      setCurrentStudentId(nextId);
      onSelectStudent?.(nextId);
    }
  };
  const handleNext = () => {
    if (currentIndex < classStudents.length - 1) {
      const nextId = classStudents[currentIndex + 1].id;
      setCurrentStudentId(nextId);
      onSelectStudent?.(nextId);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!activeStudent || !profile) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {isArabic ? 'لا يوجد تلاميذ مسجلون في هذا القسم لعرض المخطط الراداري.' : 'Aucun élève trouvé dans cette classe.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-indigo-200 border border-white/20">
            <Compass className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {isArabic ? 'مخطط الرادار للكفاءات والمواد المتعددة' : 'Profil Radar des Compétences & Matières'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
                Recharts Radar
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              {isArabic
                ? 'تحليل بصري متعدد الأبعاد لمدى تمكن التلميذ من الكفاءات المستعرضة ومواد المنهاج مقارنة بالقسم'
                : 'Visualisation multidimensionnelle de la maîtrise des compétences et matières par rapport à la classe'}
            </p>
          </div>
        </div>

        {/* Student Selector & Action buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          {/* Previous / Next buttons */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20 text-xs">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition"
              title={isArabic ? 'التلميذ السابق' : 'Élève précédent'}
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>

            <span className="px-2 text-xs font-bold text-white whitespace-nowrap">
              {currentIndex + 1} / {classStudents.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex >= classStudents.length - 1}
              className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition"
              title={isArabic ? 'التلميذ التالي' : 'Élève suivant'}
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>
          </div>

          {/* Student Dropdown */}
          <select
            value={currentStudentId}
            onChange={(e) => {
              setCurrentStudentId(e.target.value);
              onSelectStudent?.(e.target.value);
            }}
            className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white text-xs font-bold py-2 px-3 rounded-xl border border-indigo-300/40 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-300"
          >
            {classStudents.map((st) => (
              <option key={st.id} value={st.id}>
                {st.fullName} ({st.regNumber})
              </option>
            ))}
          </select>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
            title={isArabic ? 'طباعة تقرير الرادار' : 'Imprimer le profil radar'}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isArabic ? 'طباعة' : 'Imprimer'}</span>
          </button>
        </div>
      </div>

      {/* Student Banner & Quick Stats */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-lg border border-indigo-200 dark:border-indigo-800 shrink-0">
            {activeStudent.fullName.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {activeStudent.fullName}
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
                {activeClass?.name}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{isArabic ? 'رقم القيد:' : 'Matricule:'} {activeStudent.regNumber}</span>
              <span>•</span>
              <span>
                {isArabic ? 'الفصل الدراسي:' : 'Trimestre:'}{' '}
                {selectedTerm === 'T1'
                  ? isArabic ? 'الفصل الأول' : '1er Trimestre'
                  : selectedTerm === 'T2'
                  ? isArabic ? 'الفصل الثاني' : '2ème Trimestre'
                  : isArabic ? 'الفصل الثالث' : '3ème Trimestre'}
              </span>
            </div>
          </div>
        </div>

        {/* Executive KPIs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Overall Mastery Percentage */}
          <div className="bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[100px] shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
              {isArabic ? 'نسبة تمكن الكفاءات' : 'Maîtrise globale'}
            </span>
            <div className="text-lg font-black text-indigo-700 dark:text-indigo-400 flex items-center justify-center gap-1">
              <span>{profile.overallMasteryPercentage}%</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>

          {/* Radar Mode Switcher Tabs */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold no-print">
            <button
              onClick={() => setRadarMode('competencies')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                radarMode === 'competencies'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الكفاءات المستعرضة (8)' : 'Compétences'}</span>
            </button>

            <button
              onClick={() => setRadarMode('subjects')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                radarMode === 'subjects'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المواد والتحصيل الدراسي' : 'Matières'}</span>
            </button>

            <button
              onClick={() => setRadarMode('benchmark')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                radarMode === 'benchmark'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المقارنة المعيارية الشاملة' : 'Benchmark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body: Radar Chart + Pedagogical Analysis Breakdown */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Center: Interactive Recharts Radar Chart */}
        <div className="lg:col-span-7 bg-slate-50/50 dark:bg-slate-850/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {radarMode === 'competencies'
                  ? isArabic
                    ? 'مخطط الرادار: الكفاءات الذهنية والمنهجية والسلوكية'
                    : 'Radar des Compétences Transversales'
                  : radarMode === 'subjects'
                  ? isArabic
                    ? 'مخطط الرادار: توازن التحصيل الدراسي عبر جميع المواد'
                    : 'Radar d’Équilibre des Matières'
                  : isArabic
                  ? 'المخطط الراداري المقارن: نقاط التلميذ مقابل المعيار الوزاري والمتوسط'
                  : 'Radar Comparatif Global avec Standards'}
              </h5>
            </div>

            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {isArabic ? 'المقياس: من 0 إلى 20 نقطة' : 'Échelle: 0 à 20 pts'}
            </span>
          </div>

          {/* Recharts Container */}
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              {radarMode === 'competencies' ? (
                <RadarChart data={competencyChartData} outerRadius="75%">
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="shortAxis"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 20]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-start min-w-[200px]">
                          <div className="font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-1">
                            {item.axis}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.description}
                          </div>
                          <div className="flex justify-between gap-4 pt-1">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                              {isArabic ? 'نقطة التلميذ:' : 'Score élève:'}
                            </span>
                            <span className="font-black text-indigo-900 dark:text-indigo-200">
                              {item.score} / 20
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                              {isArabic ? 'متوسط القسم:' : 'Moyenne classe:'}
                            </span>
                            <span className="font-black text-amber-800 dark:text-amber-300">
                              {item.classAvg} / 20
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 border-t border-slate-100 dark:border-slate-700 pt-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {isArabic ? 'المعيار المستهدف:' : 'Cible standard:'}
                            </span>
                            <span className="font-black text-emerald-800 dark:text-emerald-300">
                              {item.benchmark} / 20
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Radar
                    name={isArabic ? 'تمكن التلميذ' : 'Élève'}
                    dataKey="score"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name={isArabic ? 'متوسط الفوج' : 'Moyenne classe'}
                    dataKey="classAvg"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name={isArabic ? 'المعيار المأمول' : 'Cible attendue'}
                    dataKey="benchmark"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                    strokeDasharray="4 4"
                  />
                </RadarChart>
              ) : radarMode === 'subjects' ? (
                <RadarChart data={subjectChartData} outerRadius="75%">
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="shortAxis"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 20]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1 text-start">
                          <div className="font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-1">
                            {item.axis} (المعامل: {item.coefficient})
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">معدل التلميذ:</span>
                            <span className="font-black text-indigo-900 dark:text-indigo-200">
                              {item.score} / 20
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-amber-600 dark:text-amber-400 font-bold">متوسط القسم:</span>
                            <span className="font-black text-amber-800 dark:text-amber-300">
                              {item.classAvg} / 20
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Radar
                    name={isArabic ? 'معدل التلميذ في المادة' : 'Moyenne élève'}
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name={isArabic ? 'متوسط القسم' : 'Moyenne classe'}
                    dataKey="classAvg"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              ) : (
                <RadarChart data={competencyChartData} outerRadius="75%">
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis
                    dataKey="shortAxis"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 20]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Radar
                    name={isArabic ? 'تحصيل التلميذ الفعلي' : 'Score élève'}
                    dataKey="score"
                    stroke="#4338ca"
                    fill="#4338ca"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name={isArabic ? 'المعيار الوزاري المطلوب' : 'Benchmark'}
                    dataKey="benchmark"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Quick Legend Interpretation */}
          <div className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              {isArabic ? 'المساحة الزرقاء: مستوى التلميذ' : 'Zone bleue: Niveau élève'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              {isArabic ? 'المساحة البرتقالية: متوسط القسم' : 'Zone orange: Moyenne classe'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              {isArabic ? 'المساحة الخضراء: المعيار المطلوب' : 'Zone verte: Objectif attendu'}
            </span>
          </div>
        </div>

        {/* Right: Pedagogical Synthesis, Strengths & Growth Areas */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Pedagogical Guidance Card */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 p-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-800/60 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-extrabold text-xs">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{isArabic ? 'التوجيه والاستشارة البيداغوجية' : 'Recommandation Pédagogique'}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {profile.pedagogicalProfileAdvice}
            </p>
          </div>

          {/* Strengths & Growth Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Top Strengths */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isArabic ? 'أبرز نقاط القوة' : 'Points forts'}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200 font-medium">
                {profile.topStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-black">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Areas */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>{isArabic ? 'فرص التحسين البيداغوجي' : 'Axes de progrès'}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200 font-medium">
                {profile.growthAreas.map((gr, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-black">•</span>
                    <span>{gr}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Detailed Competency Progress Bars */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-700">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                {isArabic ? 'تفصيل نقاط الكفاءات (من 20)' : 'Détail des compétences'}
              </span>
              <span className="text-slate-400 text-[10px]">
                {profile.competencies.length} {isArabic ? 'كفاءات مقيّمة' : 'évaluées'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {profile.competencies.map((comp) => {
                const pct = Math.min(100, Math.round((comp.score / 20) * 100));
                const isAboveClass = comp.score >= comp.classAvg;

                return (
                  <div key={comp.competencyId} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                        {isArabic ? comp.nameAr : comp.nameFr}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-black">
                          {comp.score.toFixed(1)} / 20
                        </span>
                        <span
                          className={`text-[10px] px-1 rounded-sm font-semibold ${
                            isAboveClass
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {isAboveClass ? `+${(comp.score - comp.classAvg).toFixed(1)}` : (comp.score - comp.classAvg).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                      {/* Target marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                        style={{ left: `${(comp.classAvg / 20) * 100}%` }}
                        title={`${isArabic ? 'متوسط القسم:' : 'Moyenne:'} ${comp.classAvg}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
