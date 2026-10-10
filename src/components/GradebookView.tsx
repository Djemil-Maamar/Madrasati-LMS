import React, { useState, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Save,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  X,
  Compass,
  Brain,
} from 'lucide-react';
import {
  GradeRecord,
  ClassItem,
  Subject,
  Student,
  Language,
  SchoolConfig,
} from '../types';
import { translations } from '../i18n/translations';
import {
  calculateSubjectAverage,
  computeClassTermSummary,
  getAppreciation,
  StudentTermSummary,
} from '../utils/gradeCalculations';
import { StudentPerformancePDFReportModal } from './StudentPerformancePDFReportModal';
import { StudentCompetencyRadarView } from './StudentCompetencyRadarView';

interface GradebookViewProps {
  grades: GradeRecord[];
  classes: ClassItem[];
  subjects: Subject[];
  students: Student[];
  language: Language;
  schoolConfig: SchoolConfig;
  onUpdateGrade: (record: GradeRecord) => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  grades,
  classes,
  subjects,
  students,
  language,
  schoolConfig,
  onUpdateGrade,
}) => {
  const t = translations[language];

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Card Modal
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [detailedReportStudent, setDetailedReportStudent] = useState<Student | null>(null);
  const [isClassRecordModalOpen, setIsClassRecordModalOpen] = useState(false);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // View Mode: 'combined' (Table + Radar), 'table', 'radar'
  const [viewMode, setViewMode] = useState<'combined' | 'table' | 'radar'>('combined');
  const [selectedRadarStudentId, setSelectedRadarStudentId] = useState<string>('');

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Compute overall class rankings and general averages for this term
  const termSummaries: StudentTermSummary[] = useMemo(() => {
    return computeClassTermSummary(classStudents, grades, subjects, selectedTerm);
  }, [classStudents, grades, subjects, selectedTerm]);

  // Subject averages statistics for the class
  const classSubjectStats = useMemo(() => {
    const validAvgs: number[] = [];
    classStudents.forEach((student) => {
      const rec = grades.find(
        (g) =>
          g.studentId === student.id &&
          g.subjectId === selectedSubjectId &&
          g.term === selectedTerm
      );
      const avg = calculateSubjectAverage(rec);
      if (avg !== null) validAvgs.push(avg);
    });

    if (validAvgs.length === 0) {
      return { avg: 0, highest: 0, lowest: 0, passRate: 0, count: 0 };
    }

    const sum = validAvgs.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / validAvgs.length) * 100) / 100;
    const highest = Math.max(...validAvgs);
    const lowest = Math.min(...validAvgs);
    const passed = validAvgs.filter((x) => x >= 10).length;
    const passRate = Math.round((passed / validAvgs.length) * 100);

    return { avg, highest, lowest, passRate, count: validAvgs.length };
  }, [classStudents, grades, selectedSubjectId, selectedTerm]);

  // Handle grade input change
  const handleInputChange = (
    studentId: string,
    field: 'continuousAssessment' | 'quiz1' | 'quiz2' | 'exam',
    valueStr: string
  ) => {
    const val = valueStr === '' ? 0 : Math.min(20, Math.max(0, parseFloat(valueStr) || 0));

    const existing = grades.find(
      (g) =>
        g.studentId === studentId &&
        g.subjectId === selectedSubjectId &&
        g.term === selectedTerm
    );

    if (existing) {
      onUpdateGrade({
        ...existing,
        [field]: val,
      });
    } else {
      const newRec: GradeRecord = {
        id: `grd-${Date.now()}-${studentId}`,
        studentId,
        subjectId: selectedSubjectId,
        classId: selectedClassId,
        term: selectedTerm,
        continuousAssessment: field === 'continuousAssessment' ? val : 10,
        quiz1: field === 'quiz1' ? val : 10,
        quiz2: field === 'quiz2' ? val : undefined,
        exam: field === 'exam' ? val : 10,
      };
      onUpdateGrade(newRec);
    }
  };

  const handleTriggerSave = () => {
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // Selected student summary for report card modal
  const activeStudentSummary = useMemo(() => {
    if (!reportCardStudent) return null;
    return termSummaries.find((s) => s.student.id === reportCardStudent.id) || null;
  }, [reportCardStudent, termSummaries]);

  const filteredClassStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase();
    return classStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        (s.fullNameFr && s.fullNameFr.toLowerCase().includes(q))
    );
  }, [classStudents, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.gradebook_title}</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t.gradebook_desc}</p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessNotice && (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{t.success}</span>
            </span>
          )}

          {/* View Mode Toggle: Table / Radar / Combined */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'جدول النقاط' : 'Tableau'}</span>
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'radar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'ar' ? 'مخطط الرادار' : 'Radar'}</span>
            </button>
            <button
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'combined'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'عرض مدمج' : 'Combiné'}</span>
            </button>
          </div>

          <button
            onClick={handleTriggerSave}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveGrades}</span>
          </button>

          {/* Print/Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setPrintMenuOpen(!printMenuOpen)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ar' ? 'طباعة وتصدير (PDF)' : 'Imprimer / Exporter'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {printMenuOpen && (
              <div className="absolute end-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 text-xs font-bold">
                <button
                  onClick={() => {
                    setIsClassRecordModalOpen(true);
                    setPrintMenuOpen(false);
                  }}
                  className="w-full text-start px-4 py-2.5 hover:bg-blue-50 text-slate-800 hover:text-blue-700 flex items-center gap-2 cursor-pointer transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <div>
                    <div>{language === 'ar' ? 'كشف نقاط القسم المجمع الكامل' : 'PV de Délibération Complet'}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {language === 'ar' ? 'محضر المداولات الرسمي لجميع التلاميذ' : 'Pour toute la classe'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (classStudents[0]) {
                      setReportCardStudent(classStudents[0]);
                    }
                    setPrintMenuOpen(false);
                  }}
                  className="w-full text-start px-4 py-2.5 hover:bg-blue-50 text-slate-800 hover:text-blue-700 flex items-center gap-2 cursor-pointer transition border-t border-slate-100"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div>{language === 'ar' ? 'كشف نقاط تلميذ فردي' : 'Bulletin Individuel'}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {language === 'ar' ? 'طباعة كشف النقاط الفصلي لتلميذ' : 'Par élève sélectionné'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (classStudents[0]) {
                      setDetailedReportStudent(classStudents[0]);
                    }
                    setPrintMenuOpen(false);
                  }}
                  className="w-full text-start px-4 py-2.5 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 flex items-center gap-2 cursor-pointer transition border-t border-slate-100"
                >
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-indigo-900 font-extrabold">
                      {language === 'ar' ? 'تقرير أداء مفصل ومقارن (PDF)' : 'Rapport Analytique Détaillé'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {language === 'ar'
                        ? 'مقارنة بيانية لمستوى التلميذ مع متوسط القسم'
                        : 'Graphiques comparatifs élève vs classe'}
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Ribbon: Class, Subject, Term */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Class */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectClass}</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.studentCount} تلميذ)
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectSubject}</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {language === 'ar' ? sub.nameAr : language === 'fr' ? sub.nameFr : sub.nameEn} (معامل {sub.coefficient})
              </option>
            ))}
          </select>
        </div>

        {/* Term */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t.academicYearLabel}</label>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedTerm('T1')}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                selectedTerm === 'T1' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.term_1}
            </button>
            <button
              onClick={() => setSelectedTerm('T2')}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                selectedTerm === 'T2' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.term_2}
            </button>
            <button
              onClick={() => setSelectedTerm('T3')}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                selectedTerm === 'T3' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.term_3}
            </button>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t.search}</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

      </div>

      {/* Class Subject Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t.average}</div>
            <div className="text-lg font-bold text-slate-900">{classSubjectStats.avg} <span className="text-xs font-normal text-slate-500">/ 20</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t.highestMark}</div>
            <div className="text-lg font-bold text-emerald-700">{classSubjectStats.highest} <span className="text-xs font-normal text-slate-500">/ 20</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t.lowestMark}</div>
            <div className="text-lg font-bold text-rose-700">{classSubjectStats.lowest} <span className="text-xs font-normal text-slate-500">/ 20</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-50 text-violet-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t.passRate}</div>
            <div className="text-lg font-bold text-violet-700">{classSubjectStats.passRate}%</div>
          </div>
        </div>
      </div>

      {/* Student Multi-Competency & Multi-Subject Radar View */}
      {(viewMode === 'radar' || viewMode === 'combined') && (
        <StudentCompetencyRadarView
          students={students}
          selectedStudentId={selectedRadarStudentId || classStudents[0]?.id}
          onSelectStudent={(id) => setSelectedRadarStudentId(id)}
          classes={classes}
          selectedClassId={selectedClassId}
          subjects={subjects}
          grades={grades}
          selectedTerm={selectedTerm}
          language={language}
          schoolConfig={schoolConfig}
        />
      )}

      {/* Main Gradebook Table */}
      {(viewMode === 'table' || viewMode === 'combined') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {selectedClass?.name} - {language === 'ar' ? selectedSubject?.nameAr : selectedSubject?.nameFr}
            </h3>
          </div>
          <p className="text-xs text-slate-500">{t.autoCalculateNotice}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="p-3 text-start w-16">#</th>
                <th className="p-3 text-start min-w-[180px]">{language === 'ar' ? 'اسم ولقب التلميذ' : 'Nom et Prénom'}</th>
                <th className="p-3 text-center w-28">{t.continuousAssessment} (20)</th>
                <th className="p-3 text-center w-28">{t.quiz1} (20)</th>
                <th className="p-3 text-center w-28">{t.quiz2} (20)</th>
                <th className="p-3 text-center w-28">{t.exam} (20)</th>
                <th className="p-3 text-center w-28">{t.subjectAverage}</th>
                <th className="p-3 text-center w-36">{t.appreciation}</th>
                <th className="p-3 text-center w-28">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {filteredClassStudents.map((student, idx) => {
                const rec = grades.find(
                  (g) =>
                    g.studentId === student.id &&
                    g.subjectId === selectedSubjectId &&
                    g.term === selectedTerm
                );
                const avg = calculateSubjectAverage(rec);
                const isPassed = avg !== null && avg >= 10;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition">
                    
                    <td className="p-3 text-slate-400 font-semibold">{idx + 1}</td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900">{student.fullName}</div>
                      <div className="text-[11px] text-slate-400">{student.regNumber}</div>
                    </td>

                    {/* Continuous assessment input */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={rec ? rec.continuousAssessment : ''}
                        onChange={(e) =>
                          handleInputChange(student.id, 'continuousAssessment', e.target.value)
                        }
                        placeholder="--"
                        className="w-16 text-center py-1.5 px-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    {/* Quiz 1 input */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={rec ? rec.quiz1 : ''}
                        onChange={(e) => handleInputChange(student.id, 'quiz1', e.target.value)}
                        placeholder="--"
                        className="w-16 text-center py-1.5 px-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    {/* Quiz 2 input (optional) */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={rec && rec.quiz2 !== undefined ? rec.quiz2 : ''}
                        onChange={(e) => handleInputChange(student.id, 'quiz2', e.target.value)}
                        placeholder="اختياري"
                        className="w-16 text-center py-1.5 px-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    {/* Exam input */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={rec ? rec.exam : ''}
                        onChange={(e) => handleInputChange(student.id, 'exam', e.target.value)}
                        placeholder="--"
                        className="w-16 text-center py-1.5 px-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    {/* Subject Average */}
                    <td className="p-3 text-center">
                      {avg !== null ? (
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {avg.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">--</span>
                      )}
                    </td>

                    {/* Appreciation */}
                    <td className="p-3 text-center">
                      {avg !== null ? (
                        <span className="text-[11px] text-slate-600 font-semibold truncate block">
                          {getAppreciation(avg, language)}
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    {/* Actions: View Bulletin & Detailed Performance PDF */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setReportCardStudent(student)}
                          className="px-2 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer flex items-center gap-1"
                          title={t.reportCard}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'كشف النقاط' : 'Bulletin'}</span>
                        </button>

                        <button
                          onClick={() => setDetailedReportStudent(student)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title={language === 'ar' ? 'تحميل تقرير أداء مفصل مع الرسوم البيانية مقارنة بمتوسط القسم' : 'Rapport analytique PDF'}
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{language === 'ar' ? 'تقرير أداء (PDF)' : 'Rapport PDF'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRadarStudentId(student.id);
                            if (viewMode === 'table') setViewMode('combined');
                          }}
                          className="px-2.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/70 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title={language === 'ar' ? 'عرض مخطط الرادار للكفاءات والمواد لهذا التلميذ' : 'Profil radar des compétences'}
                        >
                          <Compass className="w-3.5 h-3.5 text-purple-600" />
                          <span>{language === 'ar' ? 'رادار الكفاءات' : 'Radar'}</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
      )}

      {/* Official Student Report Card Modal (كشف النقاط الفصلي) */}
      {reportCardStudent && activeStudentSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/70 no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                {t.studentReportCard}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const s = reportCardStudent;
                    setReportCardStudent(null);
                    setDetailedReportStudent(s);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-indigo-200"
                  title="فتح تقرير الأداء التحليلي والمقارن مع متوسط القسم"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تقرير الأداء المقارن (PDF)' : 'Rapport Analytique'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.print}</span>
                </button>
                <button
                  onClick={() => setReportCardStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Bulletin Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white">
              
              {/* Official Ministry Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
                <h4 className="text-sm font-bold tracking-wide">
                  {t.officialHeader}
                </h4>
                <div className="flex justify-between items-center text-xs text-slate-600 px-4 pt-2">
                  <div>
                    <span className="font-bold text-slate-800">المؤسسة: </span>
                    {language === 'ar' ? schoolConfig.nameAr : schoolConfig.nameFr}
                  </div>
                  <div className="text-center font-bold text-blue-900 text-base">
                    {t.reportCard} - {selectedTerm === 'T1' ? t.term_1 : selectedTerm === 'T2' ? t.term_2 : t.term_3}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{t.academicYearLabel}: </span>
                    {schoolConfig.academicYear}
                  </div>
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">{language === 'ar' ? 'التلميذ(ة):' : 'Élève:'}</div>
                  <div className="text-sm font-bold text-slate-900">{reportCardStudent.fullName}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">{language === 'ar' ? 'القسم:' : 'Classe:'}</div>
                  <div className="text-sm font-bold text-slate-900">{selectedClass?.name}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">{language === 'ar' ? 'رقم التسجيل:' : 'Matricule:'}</div>
                  <div className="text-sm font-bold text-slate-900">{reportCardStudent.regNumber}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">{language === 'ar' ? 'تاريخ الميلاد:' : 'Date de naiss.:'}</div>
                  <div className="text-sm font-bold text-slate-900">{reportCardStudent.birthDate}</div>
                </div>
              </div>

              {/* Subjects Grades Breakdown Table */}
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-start">{language === 'ar' ? 'المادة' : 'Matière'}</th>
                    <th className="border border-slate-300 p-2 text-center w-16">{t.continuousAssessment}</th>
                    <th className="border border-slate-300 p-2 text-center w-16">{t.quiz1}</th>
                    <th className="border border-slate-300 p-2 text-center w-16">{t.exam}</th>
                    <th className="border border-slate-300 p-2 text-center w-16">{t.subjectAverage}</th>
                    <th className="border border-slate-300 p-2 text-center w-14">المعامل</th>
                    <th className="border border-slate-300 p-2 text-center w-20">المجموع</th>
                    <th className="border border-slate-300 p-2 text-start">{t.appreciation}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {activeStudentSummary.subjectGrades.map((item) => (
                    <tr key={item.subject.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-bold">
                        {language === 'ar' ? item.subject.nameAr : item.subject.nameFr}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {item.record ? item.record.continuousAssessment : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {item.record ? item.record.quiz1 : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {item.record ? item.record.exam : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        {item.average !== null ? item.average.toFixed(2) : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-semibold">
                        {item.subject.coefficient}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-blue-900">
                        {item.weightedTotal !== null ? item.weightedTotal.toFixed(2) : '-'}
                      </td>
                      <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                        {item.average !== null ? getAppreciation(item.average, language) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total & General Average Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="text-center">
                  <div className="text-xs text-blue-700 font-medium">{t.total} النقاط والمعاملات</div>
                  <div className="text-lg font-bold text-blue-950">
                    {activeStudentSummary.totalPoints} / {activeStudentSummary.totalCoefficients * 20}
                  </div>
                  <div className="text-[11px] text-slate-500">مجموع المعاملات: {activeStudentSummary.totalCoefficients}</div>
                </div>

                <div className="text-center border-x border-blue-200">
                  <div className="text-xs text-blue-700 font-medium">{t.generalAverage}</div>
                  <div className="text-2xl font-extrabold text-blue-900">
                    {activeStudentSummary.generalAverage.toFixed(2)} <span className="text-xs font-normal text-slate-600">/ 20</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">
                    {activeStudentSummary.appreciation}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-blue-700 font-medium">{t.rank} في القسم</div>
                  <div className="text-2xl font-extrabold text-blue-950">
                    {activeStudentSummary.rank} <span className="text-xs font-normal text-slate-500">من {classStudents.length}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {activeStudentSummary.generalAverage >= 10 ? 'ناجح(ة)' : 'مؤجل'}
                  </div>
                </div>
              </div>

              {/* Signatures & Teacher Council Remark */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-700 mb-8">ملاحظة وتوقيع الأستاذ(ة) المسؤول:</div>
                  <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
                </div>
                <div>
                  <div className="font-bold text-slate-700 mb-8">ختم وتوقيع مدير(ة) المؤسسة:</div>
                  <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Official Class Deliberation PV Modal (كشف نقاط القسم المجمع الكامل) */}
      {isClassRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/70 no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'محضر مداولات وكشف نتائج القسم الكامل (PV)' : 'Procès-Verbal de Délibération'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'طباعة / تصدير PDF' : 'Imprimer PDF'}</span>
                </button>
                <button
                  onClick={() => setIsClassRecordModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white printable-document">
              
              {/* Ministry & School Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
                <h4 className="text-sm font-bold tracking-wide">
                  {t.officialHeader}
                </h4>
                <div className="flex justify-between items-center text-xs text-slate-600 px-4 pt-2">
                  <div>
                    <span className="font-bold text-slate-800">المؤسسة: </span>
                    {language === 'ar' ? schoolConfig.nameAr : schoolConfig.nameFr}
                  </div>
                  <div className="text-center font-black text-slate-900 text-base">
                    محضر مداولات وكشف نتائج الفصل {selectedTerm === 'T1' ? 'الأول' : selectedTerm === 'T2' ? 'الثاني' : 'الثالث'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{t.academicYearLabel}: </span>
                    {schoolConfig.academicYear}
                  </div>
                </div>
              </div>

              {/* Class Meta & Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">القسم / الفوج:</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedClass?.name}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">عدد التلاميذ:</span>
                  <div className="font-bold text-slate-900 text-sm">{classStudents.length} تلميذ</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">معدل القسم العام:</span>
                  <div className="font-bold text-blue-900 text-sm">
                    {termSummaries.length > 0
                      ? (termSummaries.reduce((acc, s) => acc + s.generalAverage, 0) / termSummaries.length).toFixed(2)
                      : '0.00'} / 20
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">نسبة النجاح (≥ 10/20):</span>
                  <div className="font-bold text-emerald-700 text-sm">
                    {termSummaries.length > 0
                      ? Math.round((termSummaries.filter(s => s.generalAverage >= 10).length / termSummaries.length) * 100)
                      : 0}%
                  </div>
                </div>
              </div>

              {/* Comprehensive Class Grades Table */}
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-10">الرقم</th>
                    <th className="border border-slate-300 p-2 text-start">اسم ولقب التلميذ</th>
                    <th className="border border-slate-300 p-2 text-center w-24">رقم التسجيل</th>
                    <th className="border border-slate-300 p-2 text-center w-28">مجموع النقاط</th>
                    <th className="border border-slate-300 p-2 text-center w-24">المعدل العام</th>
                    <th className="border border-slate-300 p-2 text-center w-16">الرتبة</th>
                    <th className="border border-slate-300 p-2 text-center w-28">القرار والملاحظة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {termSummaries.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center text-slate-500 font-bold">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold text-slate-900">{item.student.fullName}</td>
                      <td className="border border-slate-300 p-2 text-center text-slate-600">{item.student.regNumber}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">
                        {item.totalPoints.toFixed(2)} / {item.totalCoefficients * 20}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-black text-sm text-blue-900">
                        {item.generalAverage.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-extrabold text-slate-800">
                        {item.rank}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.generalAverage >= 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.generalAverage >= 10 ? 'ناجح(ة)' : 'مؤجل'} - {item.appreciation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Committee Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-700 mb-8">مستشار التربية / الناظر:</div>
                  <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
                </div>
                <div>
                  <div className="font-bold text-slate-700 mb-8">الأستاذ(ة) المسؤول:</div>
                  <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
                </div>
                <div>
                  <div className="font-bold text-slate-700 mb-8">ختم وتوقيع مدير(ة) المؤسسة:</div>
                  <div className="border-b border-dashed border-slate-400 w-32 mx-auto"></div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Official Student Performance Detailed PDF Report Modal with Recharts Charts */}
      {detailedReportStudent && (
        <StudentPerformancePDFReportModal
          student={detailedReportStudent}
          classItem={selectedClass}
          initialTerm={selectedTerm}
          grades={grades}
          subjects={subjects}
          studentsInClass={classStudents}
          schoolConfig={schoolConfig}
          language={language}
          onClose={() => setDetailedReportStudent(null)}
        />
      )}

    </div>
  );
};
