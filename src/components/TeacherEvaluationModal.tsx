import React, { useState } from 'react';
import {
  Award,
  Star,
  CheckCircle2,
  Calendar,
  User,
  FileText,
  Sliders,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
  Printer,
  X,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  Teacher,
  TeacherEvaluation,
  EvaluationCriterion,
  EvaluationPeriod,
  EvaluationRating,
  Language,
} from '../types';
import { standardEvaluationCriteria } from '../data/mockData';

interface TeacherEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  onSaveEvaluation: (evaluation: TeacherEvaluation) => void;
  language: Language;
  existingEvaluation?: TeacherEvaluation | null;
}

export const TeacherEvaluationModal: React.FC<TeacherEvaluationModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onSaveEvaluation,
  language,
  existingEvaluation,
}) => {
  const isArabic = language === 'ar';

  const [period, setPeriod] = useState<EvaluationPeriod>(existingEvaluation?.period || 'term1');
  const [academicYear, setAcademicYear] = useState<string>(existingEvaluation?.academicYear || '2026-2027');
  const [date, setDate] = useState<string>(existingEvaluation?.date || new Date().toISOString().split('T')[0]);
  const [evaluatorName, setEvaluatorName] = useState<string>(
    existingEvaluation?.evaluatorName || (isArabic ? 'أ. الطيب بلقاسم (مدير المؤسسة)' : 'M. Belkacem (Directeur)')
  );
  const [evaluatorRole, setEvaluatorRole] = useState<'director' | 'inspector' | 'pedagogy_advisor'>(
    existingEvaluation?.evaluatorRole || 'director'
  );

  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(() => {
    if (existingEvaluation?.criteria && existingEvaluation.criteria.length > 0) {
      return existingEvaluation.criteria;
    }
    return standardEvaluationCriteria.map((c) => ({ ...c }));
  });

  const [generalComments, setGeneralComments] = useState<string>(
    existingEvaluation?.generalComments ||
      (isArabic
        ? 'أداء تربوي متميز وتفاعل إيجابي مع التلاميذ والبرنامج الوزاري مع انضباط عالٍ في إعداد الوثائق البيداغوجية.'
        : 'Excellente prestation pédagogique et très bon suivi des élèves.')
  );

  const [strengths, setStrengths] = useState<string[]>(
    existingEvaluation?.strengths || [
      isArabic ? 'التحكم المعرفي الدقيق في مفاهيم المنهاج' : 'Maîtrise rigoureuse du programme',
      isArabic ? 'إدارة القسم ومناخ التعلم الهادئ والمحفز' : 'Gestion exemplaire de la classe',
      isArabic ? 'إشراك التلاميذ واستخدام طرائق تفاعلية' : 'Pédagogie active et participative',
    ]
  );
  const [newStrengthInput, setNewStrengthInput] = useState('');

  const [recommendations, setRecommendations] = useState<string[]>(
    existingEvaluation?.recommendations || [
      isArabic ? 'مواصلة تنظيم حصص الدعم البيداغوجي للتلاميذ المتعثرين' : 'Poursuivre le soutien scolaire',
      isArabic ? 'تعزيز استخدام الموارد الرقمية في الدروس' : 'Intégrer davantage les outils numériques',
    ]
  );
  const [newRecInput, setNewRecInput] = useState('');

  const [attendanceRateNote, setAttendanceRateNote] = useState<string>(
    existingEvaluation?.attendanceRateNote || (isArabic ? 'حضور منتظم ومواظبة تامة بنسبة 100%' : 'Assiduité exemplaire (100%)')
  );

  if (!isOpen) return null;

  // Calculate total score out of 20
  const totalScore = parseFloat(
    criteria.reduce((sum, c) => sum + (Number(c.score) || 0), 0).toFixed(2)
  );

  // Compute rating based on total score (out of 20)
  const computeRating = (score: number): EvaluationRating => {
    if (score >= 18) return 'excellent';
    if (score >= 16) return 'very_good';
    if (score >= 14) return 'good';
    if (score >= 10) return 'acceptable';
    return 'needs_improvement';
  };

  const rating = computeRating(totalScore);

  const getRatingLabel = (r: EvaluationRating) => {
    switch (r) {
      case 'excellent':
        return isArabic ? 'ممتاز (Excellent)' : 'Excellent';
      case 'very_good':
        return isArabic ? 'جيد جداً (Très Bien)' : 'Très Bien';
      case 'good':
        return isArabic ? 'جيد (Bien)' : 'Bien';
      case 'acceptable':
        return isArabic ? 'مقبول (Passable)' : 'Passable';
      case 'needs_improvement':
        return isArabic ? 'بحاجة للتحسين (À améliorer)' : 'À améliorer';
    }
  };

  const getRatingBadgeColor = (r: EvaluationRating) => {
    switch (r) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'very_good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'good':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'acceptable':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'needs_improvement':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-700';
    }
  };

  const handleScoreChange = (id: string, newScore: number) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, score: Math.min(c.maxScore, Math.max(0, newScore)) } : c))
    );
  };

  const handleNoteChange = (id: string, notes: string) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, notes } : c)));
  };

  const handleAddStrength = () => {
    if (newStrengthInput.trim()) {
      setStrengths([...strengths, newStrengthInput.trim()]);
      setNewStrengthInput('');
    }
  };

  const handleRemoveStrength = (idx: number) => {
    setStrengths(strengths.filter((_, i) => i !== idx));
  };

  const handleAddRec = () => {
    if (newRecInput.trim()) {
      setRecommendations([...recommendations, newRecInput.trim()]);
      setNewRecInput('');
    }
  };

  const handleRemoveRec = (idx: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluationData: TeacherEvaluation = {
      id: existingEvaluation?.id || `eval-${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      academicYear,
      period,
      date,
      evaluatorName,
      evaluatorRole,
      criteria,
      totalScore,
      maxTotalScore: 20,
      rating,
      generalComments,
      strengths,
      recommendations,
      attendanceRateNote,
      signedByTeacher: true,
    };

    onSaveEvaluation(evaluationData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {isArabic ? 'نموذج التقييم الدوري للأستاذ(ة)' : 'Fiche d’Évaluation Pédagogique'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {isArabic ? 'إدارة المؤسسة' : 'Direction'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isArabic ? 'الأستاذ(ة):' : 'Enseignant:'}{' '}
                <span className="font-bold text-purple-900 dark:text-purple-300">{teacher.name}</span>
                {' · '}{teacher.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Metadata Grid */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'الفترة / المناسبة' : 'Période'}
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as EvaluationPeriod)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
              >
                <option value="term1">{isArabic ? 'تقييم الفصل الأول' : '1er Trimestre'}</option>
                <option value="term2">{isArabic ? 'تقييم الفصل الثاني' : '2ème Trimestre'}</option>
                <option value="term3">{isArabic ? 'تقييم الفصل الثالث' : '3ème Trimestre'}</option>
                <option value="annual">{isArabic ? 'التقييم السنوي الشامل' : 'Bilan Annuel'}</option>
                <option value="inspection">{isArabic ? 'زيارة تفتيشية رسمية' : 'Visite d’inspection'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'السنة الدراسية' : 'Année Scolaire'}
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'تاريخ التقييم' : 'Date de l’évaluation'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'صفة المقيم' : 'Rôle de l’évaluateur'}
              </label>
              <select
                value={evaluatorRole}
                onChange={(e) => setEvaluatorRole(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="director">{isArabic ? 'مدير المؤسسة' : 'Directeur'}</option>
                <option value="inspector">{isArabic ? 'مفتش التربية الوطنية' : 'Inspecteur'}</option>
                <option value="pedagogy_advisor">{isArabic ? 'مستشار بيداغوجي / ناظر' : 'Conseiller pédagogique'}</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'اسم المسؤول المقيم والتوقيع' : 'Nom de l’évaluateur'}
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder={isArabic ? 'مثال: أ. الطيب بلقاسم (مدير الثانوية)' : 'M. Belkacem'}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Performance Criteria (Grid of 5 items totaling 20) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>{isArabic ? 'شبكة معايير ونقاط الأداء البيداغوجي (سلم 20 نقطة)' : 'Grille d’évaluation pédagogique (sur 20)'}</span>
              </h3>

              {/* Live Score Display */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isArabic ? 'المجموع المحصل:' : 'Total:'}
                </span>
                <span className="text-base font-black px-3 py-1 rounded-xl bg-purple-600 text-white shadow-xs">
                  {totalScore} / 20
                </span>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getRatingBadgeColor(rating)}`}>
                  {getRatingLabel(rating)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {criteria.map((crit, idx) => (
                <div
                  key={crit.id}
                  className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                          {isArabic ? crit.nameAr : crit.nameFr}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="range"
                          min="0"
                          max={crit.maxScore}
                          step="0.25"
                          value={crit.score}
                          onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value))}
                          className="w-28 accent-purple-600 cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max={crit.maxScore}
                          step="0.25"
                          value={crit.score}
                          onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-black text-purple-700 dark:text-purple-300"
                        />
                        <span className="font-bold text-slate-400">/ {crit.maxScore}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={crit.notes || ''}
                      onChange={(e) => handleNoteChange(crit.id, e.target.value)}
                      placeholder={isArabic ? 'ملاحظة خاصة بهذا المعيار...' : 'Remarque spécifique...'}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Qualitative Comments & Pedagogical Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strengths */}
            <div className="bg-emerald-50/60 dark:bg-slate-850 p-4 rounded-2xl border border-emerald-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-emerald-950 dark:text-emerald-400">
                  {isArabic ? 'نقاط القوة والمكتسبات البيداغوجية' : 'Points forts et acquis'}
                </h4>
              </div>

              <div className="space-y-1.5">
                {strengths.map((str, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700"
                  >
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                      • {str}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStrength(i)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStrengthInput}
                  onChange={(e) => setNewStrengthInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStrength();
                    }
                  }}
                  placeholder={isArabic ? 'إضافة نقطة قوة جديدة...' : 'Ajouter un point fort...'}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddStrength}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-indigo-50/60 dark:bg-slate-850 p-4 rounded-2xl border border-indigo-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-indigo-950 dark:text-indigo-400">
                  {isArabic ? 'التوجيهات والتوصيات للتحسين والتطوير' : 'Recommandations & Axes d’amélioration'}
                </h4>
              </div>

              <div className="space-y-1.5">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700"
                  >
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                      • {rec}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRec(i)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRecInput}
                  onChange={(e) => setNewRecInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRec();
                    }
                  }}
                  placeholder={isArabic ? 'إضافة توجيه بيداغوجي...' : 'Ajouter une recommandation...'}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddRec}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* General Comments */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              {isArabic ? 'التقدير العام والملاحظات الإدارية / التفتيشية الشاملة' : 'Appréciation générale de la direction'}
            </label>
            <textarea
              rows={3}
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              placeholder={isArabic ? 'اكتب تقييم الإدارة للأستاذ هنا...' : 'Commentaires généraux...'}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Attendance Note */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              {isArabic ? 'ملاحظة المواظبة والانضباط الزمني' : 'Assiduité & Ponctualité'}
            </label>
            <input
              type="text"
              value={attendanceRateNote}
              onChange={(e) => setAttendanceRateNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              {isArabic ? 'سيتم اعتماد هذا التقييم وعرضه في لوحة تحكم الأستاذ تلقائياً.' : 'Cette fiche sera visible sur l’espace enseignant.'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {isArabic ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isArabic ? 'حفظ واعتماد التقييم' : 'Enregistrer l’évaluation'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
