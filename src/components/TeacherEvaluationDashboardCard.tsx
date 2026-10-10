import React, { useState } from 'react';
import {
  Award,
  Star,
  CheckCircle2,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Printer,
  ChevronDown,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  Building,
  Plus,
} from 'lucide-react';
import {
  Teacher,
  TeacherEvaluation,
  EvaluationRating,
  Language,
  SchoolConfig,
} from '../types';

interface TeacherEvaluationDashboardCardProps {
  teacher: Teacher;
  evaluations: TeacherEvaluation[];
  schoolConfig: SchoolConfig;
  language: Language;
  onOpenNewEvaluation?: () => void;
  isAdmin?: boolean;
}

export const TeacherEvaluationDashboardCard: React.FC<TeacherEvaluationDashboardCardProps> = ({
  teacher,
  evaluations,
  schoolConfig,
  language,
  onOpenNewEvaluation,
  isAdmin = false,
}) => {
  const isArabic = language === 'ar';

  // Find evaluations for this teacher
  const teacherEvaluations = evaluations.filter((e) => e.teacherId === teacher.id);
  const latestEvaluation = teacherEvaluations[teacherEvaluations.length - 1];

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>(
    latestEvaluation?.id || ''
  );
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const activeEvaluation =
    teacherEvaluations.find((e) => e.id === selectedEvaluationId) || latestEvaluation;

  const getRatingBadge = (rating: EvaluationRating) => {
    switch (rating) {
      case 'excellent':
        return {
          label: isArabic ? 'ممتاز (Excellent)' : 'Excellent',
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-750',
          starColor: 'text-emerald-500',
        };
      case 'very_good':
        return {
          label: isArabic ? 'جيد جداً (Très Bien)' : 'Très Bien',
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-750',
          starColor: 'text-blue-500',
        };
      case 'good':
        return {
          label: isArabic ? 'جيد (Bien)' : 'Bien',
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-750',
          starColor: 'text-amber-500',
        };
      case 'acceptable':
        return {
          label: isArabic ? 'مقبول (Passable)' : 'Passable',
          bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-750',
          starColor: 'text-orange-500',
        };
      case 'needs_improvement':
        return {
          label: isArabic ? 'بحاجة للتحسين' : 'À améliorer',
          bg: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-300 dark:border-red-750',
          starColor: 'text-red-500',
        };
    }
  };

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case 'term1':
        return isArabic ? 'تقييم الفصل الأول' : '1er Trimestre';
      case 'term2':
        return isArabic ? 'تقييم الفصل الثاني' : '2ème Trimestre';
      case 'term3':
        return isArabic ? 'تقييم الفصل الثالث' : '3ème Trimestre';
      case 'annual':
        return isArabic ? 'التقييم السنوي الشامل' : 'Bilan Annuel';
      case 'inspection':
        return isArabic ? 'زيارة تفتيشية رسمية' : 'Inspection officielle';
      default:
        return p;
    }
  };

  if (!activeEvaluation) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isArabic ? 'نتائج التقييم الدوري للأستاذ' : 'Évaluation périodique de l’enseignant'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {teacher.name}
              </p>
            </div>
          </div>

          {isAdmin && onOpenNewEvaluation && (
            <button
              onClick={onOpenNewEvaluation}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تسجيل أول تقييم' : 'Nouvelle évaluation'}</span>
            </button>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isArabic
              ? 'لم يتم تسجيل تقييم دوري لهذا الأستاذ بعد خلال هذا الموسم.'
              : 'Aucune fiche d’évaluation enregistrée pour cet enseignant.'}
          </p>
          <p className="text-[11px] text-slate-500">
            {isArabic
              ? 'تقوم إدارة المؤسسة أو مفتش المقاطعة بتسجيل نقاط الأداء والتوجيهات البيداغوجية هنا.'
              : 'La direction ou l’inspection peut consigner les notes et remarques ici.'}
          </p>
        </div>
      </div>
    );
  }

  const badge = getRatingBadge(activeEvaluation.rating);
  const percentage = Math.round((activeEvaluation.totalScore / activeEvaluation.maxTotalScore) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-600/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isArabic ? 'نتائج التقييم الإداري والتربوي الدوري' : 'Bilan de l’Évaluation Pédagogique'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isArabic ? 'ملف الأستاذ(ة):' : 'Fiche de:'}{' '}
              <span className="font-bold text-purple-700 dark:text-purple-300">{teacher.name}</span>
              {' · '}
              {getPeriodLabel(activeEvaluation.period)} ({activeEvaluation.academicYear})
            </p>
          </div>
        </div>

        {/* Action Controls & History Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {teacherEvaluations.length > 1 && (
            <select
              value={activeEvaluation.id}
              onChange={(e) => setSelectedEvaluationId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              {teacherEvaluations.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {getPeriodLabel(ev.period)} ({ev.date}) - {ev.totalScore}/20
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
            title={isArabic ? 'معاينة وطباعة بطاقة التقييم الرسمية كـ PDF' : 'Imprimer la fiche officielle'}
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{isArabic ? 'بطاقة التقييم (PDF)' : 'Fiche PDF'}</span>
          </button>

          {isAdmin && onOpenNewEvaluation && (
            <button
              onClick={onOpenNewEvaluation}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تقييم جديد' : 'Nouvelle évaluation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Score Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Main Score Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-transparent dark:from-purple-950/40 dark:to-slate-850 border border-purple-200 dark:border-purple-800/60 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block">
              {isArabic ? 'نقطة التقييم الإجمالية' : 'Note Globale'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {activeEvaluation.totalScore}
              </span>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                / {activeEvaluation.maxTotalScore}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/40 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-600 dark:text-slate-400">{percentage}%</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">
              {badge.label}
            </span>
          </div>
        </div>

        {/* Evaluator Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <User className="w-3.5 h-3.5 text-purple-600" />
            <span>{isArabic ? 'المسؤول المقيم:' : 'Évaluateur:'}</span>
          </div>
          <p className="font-bold text-xs text-slate-900 dark:text-white">
            {activeEvaluation.evaluatorName}
          </p>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{activeEvaluation.date}</span>
          </div>
        </div>

        {/* Attendance Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isArabic ? 'المواظبة والانضباط:' : 'Assiduité:'}</span>
          </div>
          <p className="font-bold text-xs text-slate-900 dark:text-white">
            {activeEvaluation.attendanceRateNote || (isArabic ? 'مواظبة تامة وانضباط تام' : 'Exemplaire')}
          </p>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isArabic ? 'سجل الغيابات سليم' : 'Conforme'}</span>
          </div>
        </div>

        {/* Status / Signature Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{isArabic ? 'حالة الاعتماد:' : 'Statut:'}</span>
          </div>
          <p className="font-bold text-xs text-slate-900 dark:text-white">
            {isArabic ? 'معتمد ومثبت رسمياً' : 'Validé et certifié'}
          </p>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
            {isArabic ? 'مؤشر من طرف الأستاذ والإدارة' : 'Signé'}
          </div>
        </div>

      </div>

      {/* Criteria Breakdown Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>{isArabic ? 'تفاصيل تنقيط الكفاءات والمعايير البيداغوجية' : 'Détail des compétences évaluées'}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeEvaluation.criteria.map((crit) => {
            const critPct = Math.round((crit.score / crit.maxScore) * 100);
            return (
              <div
                key={crit.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isArabic ? crit.nameAr : crit.nameFr}
                  </span>
                  <span className="font-black text-purple-700 dark:text-purple-300">
                    {crit.score} <span className="text-slate-400 font-normal">/ {crit.maxScore}</span>
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      critPct >= 90
                        ? 'bg-emerald-500'
                        : critPct >= 75
                        ? 'bg-purple-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${critPct}%` }}
                  />
                </div>

                {crit.notes && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    "{crit.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Qualitative Feedback: Strengths & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Strengths */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-850 border border-emerald-200/80 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h5 className="font-bold text-xs text-emerald-950 dark:text-emerald-400">
              {isArabic ? 'نقاط القوة والمكتسبات الملحوظة' : 'Points forts constatés'}
            </h5>
          </div>

          <ul className="space-y-1.5">
            {activeEvaluation.strengths.map((s, idx) => (
              <li key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-850 border border-indigo-200/80 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h5 className="font-bold text-xs text-indigo-950 dark:text-indigo-400">
              {isArabic ? 'التوجيهات والتوصيات للتحسين والتطوير' : 'Conseils et orientations'}
            </h5>
          </div>

          <ul className="space-y-1.5">
            {activeEvaluation.recommendations.map((r, idx) => (
              <li key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* General Evaluation Text */}
      <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-slate-850 border border-purple-200/70 dark:border-slate-800 space-y-2">
        <h5 className="font-bold text-xs text-purple-950 dark:text-purple-300">
          {isArabic ? 'التقدير الشامل والملاحظة البيداغوجية للإدارة' : 'Appréciation générale de la direction'}
        </h5>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          "{activeEvaluation.generalComments}"
        </p>
      </div>

      {/* Print / Export Official Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in">
            
            <div className="flex items-center justify-between no-print border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-black text-sm text-slate-800 dark:text-white">
                {isArabic ? 'معاينة بطاقة التقييم الإداري والتربوي للطباعة' : 'Aperçu d’impression de la fiche'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isArabic ? 'طباعة / حفظ PDF' : 'Imprimer'}</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  {isArabic ? 'إغلاق' : 'Fermer'}
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="printable-document bg-white text-black p-8 rounded-2xl border border-slate-300 space-y-6">
              
              {/* Official Algerian Ministry Header */}
              <div className="text-center space-y-1 border-b pb-4">
                <h4 className="text-xs font-bold text-slate-700">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
                <h3 className="text-xs font-bold text-slate-800">وزارة التربية الوطنية - مديرية التربية</h3>
                <h2 className="text-sm font-black text-slate-900">{schoolConfig.nameAr}</h2>
                <div className="text-[11px] text-slate-500 font-medium">
                  بطاقة التقييم الإداري والتربوي الدوري للأستاذ · الموسم الدراسي {activeEvaluation.academicYear}
                </div>
              </div>

              {/* Teacher Info Table */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-600">اسم ولقب الأستاذ:</span>{' '}
                  <span className="font-black text-slate-900">{teacher.name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">تاريخ التقييم:</span>{' '}
                  <span className="font-bold text-slate-900">{activeEvaluation.date}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">الفترة البيداغوجية:</span>{' '}
                  <span className="font-bold text-purple-800">{getPeriodLabel(activeEvaluation.period)}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">المسؤول المقيم:</span>{' '}
                  <span className="font-bold text-slate-900">{activeEvaluation.evaluatorName}</span>
                </div>
              </div>

              {/* Criteria Table */}
              <table className="w-full text-xs border border-slate-300 text-right">
                <thead className="bg-slate-100 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-l border-slate-300 w-12 text-center">الرقم</th>
                    <th className="p-2 border-l border-slate-300">معيار الكفاءة والنشاط البيداغوجي</th>
                    <th className="p-2 border-l border-slate-300 w-24 text-center">النقطة الممنوحة</th>
                    <th className="p-2">الملاحظات التوجيهية</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEvaluation.criteria.map((c, i) => (
                    <tr key={c.id} className="border-b border-slate-200">
                      <td className="p-2 border-l border-slate-200 text-center font-bold">{i + 1}</td>
                      <td className="p-2 border-l border-slate-200 font-medium">{c.nameAr}</td>
                      <td className="p-2 border-l border-slate-200 text-center font-bold text-purple-900">
                        {c.score} / {c.maxScore}
                      </td>
                      <td className="p-2 text-slate-600">{c.notes || '—'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black">
                    <td colSpan={2} className="p-2.5 border-l border-slate-300 text-left">
                      المجموع العام والتقدير:
                    </td>
                    <td className="p-2.5 border-l border-slate-300 text-center text-sm text-purple-900">
                      {activeEvaluation.totalScore} / 20
                    </td>
                    <td className="p-2.5 text-purple-900">{badge.label}</td>
                  </tr>
                </tbody>
              </table>

              {/* General Appreciation */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-1 text-xs">
                <span className="font-bold text-slate-800">ملاحظة الإدارة والتوجيهات البيداغوجية:</span>
                <p className="text-slate-700 italic">"{activeEvaluation.generalComments}"</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-700">توقيع وتأشيرة الأستاذ(ة)</p>
                  <p className="text-[10px] text-slate-400 mt-1">(اطلعت عليه ووافقت)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700">توقيع وخاتم مدير المؤسسة / المفتش</p>
                  <p className="text-[10px] text-slate-400 mt-1">حرر بـ: {schoolConfig.address}</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
