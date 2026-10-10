import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  Printer,
  Copy,
  Download,
  AlertCircle,
  FileText,
  HelpCircle,
  Layers,
  GraduationCap,
  Award,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Language, EducationCycle, SchoolConfig, AIExamResult } from '../types';
import { translations } from '../i18n/translations';

interface AIExamGeneratorViewProps {
  language: Language;
  schoolConfig: SchoolConfig;
}

export const AIExamGeneratorView: React.FC<AIExamGeneratorViewProps> = ({
  language,
  schoolConfig,
}) => {
  const t = translations[language];

  // Form selections
  const [cycle, setCycle] = useState<EducationCycle>('secondary');
  const [grade, setGrade] = useState<string>('3AS');
  const [stream, setStream] = useState<string>('علوم تجريبية (بكالوريا)');
  const [subject, setSubject] = useState<string>('الرياضيات');
  const [examType, setExamType] = useState<string>('quiz');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [lessonObjectives, setLessonObjectives] = useState<string>(
    'دراسة الدوال العددية، النهايات والاستمرارية، الاشتقاقية، التفسير الهندسي للمماسات والمقاربات، وحساب نقط الانعطاف.'
  );
  const [examLanguage, setExamLanguage] = useState<string>(language);

  // Loading & Result state
  const [isLoading, setIsLoading] = useState(false);
  const [examResult, setExamResult] = useState<AIExamResult | null>(null);
  const [activeTab, setActiveTab] = useState<'sheet' | 'answers' | 'competencies'>('sheet');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Grade Options based on Cycle
  const gradeOptions = {
    primary: [
      { id: '1AP', name: 'السنة 1 ابتدائي (1AP)' },
      { id: '2AP', name: 'السنة 2 ابتدائي (2AP)' },
      { id: '3AP', name: 'السنة 3 ابتدائي (3AP)' },
      { id: '4AP', name: 'السنة 4 ابتدائي (4AP)' },
      { id: '5AP', name: 'السنة 5 ابتدائي (5AP)' },
    ],
    middle: [
      { id: '1AM', name: 'السنة 1 متوسط (1AM)' },
      { id: '2AM', name: 'السنة 2 متوسط (2AM)' },
      { id: '3AM', name: 'السنة 3 متوسط (3AM)' },
      { id: '4AM', name: 'السنة 4 متوسط - شهادة BEM' },
    ],
    secondary: [
      { id: '1AS', name: 'السنة 1 ثانوي (1AS)' },
      { id: '2AS', name: 'السنة 2 ثانوي (2AS)' },
      { id: '3AS', name: 'السنة 3 ثانوي - شهادة البكالوريا (3AS)' },
    ],
  };

  // Dynamic Stream Options based on Cycle
  const streamOptions = {
    primary: ['تعليم عام أساسي'],
    middle: ['تعليم عام موحد'],
    secondary: [
      'علوم تجريبية (بكالوريا)',
      'رياضيات',
      'تقني رياضي (هندسة ميكانيكية/كهربائية/مدنية/طرائق)',
      'تسيير واقتصاد',
      'آداب وفلسفة',
      'لغات أجنبية',
      'جذع مشترك علوم وتكنولوجيا (1AS)',
      'جذع مشترك آداب (1AS)',
    ],
  };

  // Dynamic Subject Options based on Cycle
  const subjectOptions = {
    primary: [
      'اللغة العربية',
      'الرياضيات',
      'التربية العلمية والتكنولوجية',
      'اللغة الفرنسية',
      'التربية الإسلامية',
      'التاريخ والجغرافيا',
    ],
    middle: [
      'الرياضيات',
      'العلوم الفيزيائية والتكنولوجيا',
      'علوم الطبيعة والحياة',
      'اللغة العربية',
      'اللغة الفرنسية',
      'اللغة الإنجليزية',
      'التاريخ والجغرافيا',
      'التربية الإسلامية',
      'الإعلام الآلي',
    ],
    secondary: [
      'الرياضيات',
      'العلوم الفيزيائية',
      'علوم الطبيعة والحياة',
      'اللغة العربية وآدابها',
      'الفلسفة',
      'اللغة الفرنسية',
      'اللغة الإنجليزية',
      'التاريخ والجغرافيا',
      'العلوم الإسلامية',
      'التسيير المالي والمحاسبي',
      'الاقتصاد والمناجمنت',
      'القانون',
      'التكنولوجيا (هندسة مدنية / ميكانيكية)',
      'اللغة الألمانية / الإسبانية / الإيطالية',
    ],
  };

  const handleCycleChange = (newCycle: EducationCycle) => {
    setCycle(newCycle);
    setGrade(gradeOptions[newCycle][0].id);
    setStream(streamOptions[newCycle][0]);
    setSubject(subjectOptions[newCycle][0]);
  };

  // Curriculum presets for quick fill
  const loadPreset = (presetSubject: string, text: string) => {
    setSubject(presetSubject);
    setLessonObjectives(text);
  };

  const handleGenerateExam = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle,
          grade,
          stream,
          subject,
          lessonObjectives,
          examType,
          difficulty,
          durationMinutes,
          totalPoints: 20,
          language: examLanguage,
        }),
      });

      const data = await response.json();
      if (data.success && data.exam) {
        setExamResult(data.exam);
        setActiveTab('sheet');
      } else {
        throw new Error(data.errorNotice || 'فشل في توليد الموضوع');
      }
    } catch (err: any) {
      console.error('AI Exam Generator fetch error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي');
    } finally {
      setIsLoading(false);
    }
  };

  const copyExamText = () => {
    if (!examResult) return;
    let fullText = `${examResult.title}\nالمستوى: ${examResult.gradeLevel} - ${examResult.streamName || ''}\nالمادة: ${examResult.subjectName} | المدة: ${examResult.duration}\n\n`;
    
    examResult.sections.forEach((sec) => {
      fullText += `--- ${sec.title} (${sec.points} نقاط) ---\n`;
      if (sec.context) fullText += `${sec.context}\n`;
      sec.questions.forEach((q) => {
        fullText += `السؤال ${q.qNumber}: ${q.question} (${q.points}ن)\n`;
        if (q.subQuestions) {
          q.subQuestions.forEach((sq) => {
            fullText += `  - ${sq}\n`;
          });
        }
      });
      fullText += '\n';
    });

    navigator.clipboard.writeText(fullText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Curriculum Engine - نموذج الذكاء الاصطناعي للتعليم</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.ai_exam_title}
          </h2>
          <p className="text-indigo-200/90 text-sm leading-relaxed">
            {t.ai_exam_desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: Parameter selections (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>{language === 'ar' ? 'معايير الفرض والمنهاج' : 'Paramètres du devoir'}</span>
          </h3>

          {/* Education Cycle Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.exam_cycle}</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleCycleChange('primary')}
                className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                  cycle === 'primary'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.cycle_primary}
              </button>
              <button
                type="button"
                onClick={() => handleCycleChange('middle')}
                className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                  cycle === 'middle'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.cycle_middle}
              </button>
              <button
                type="button"
                onClick={() => handleCycleChange('secondary')}
                className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                  cycle === 'secondary'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.cycle_secondary}
              </button>
            </div>
          </div>

          {/* Grade & Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.exam_grade}</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {gradeOptions[cycle].map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.exam_stream}</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {streamOptions[cycle].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.exam_subject}</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {subjectOptions[cycle].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type, Difficulty & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.exam_type}</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="quiz">{t.exam_quiz}</option>
                <option value="quiz2">{t.exam_quiz2}</option>
                <option value="exam">{t.exam_term}</option>
                <option value="diagnostic">{t.exam_diagnostic}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.exam_difficulty}</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">{t.diff_easy}</option>
                <option value="medium">{t.diff_medium}</option>
                <option value="hard">{t.diff_hard}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.exam_duration}</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value={45}>45 {t.exam_duration_mins}</option>
                <option value={60}>60 {t.exam_duration_mins} (1 س)</option>
                <option value={120}>120 {t.exam_duration_mins} (2 س)</option>
              </select>
            </div>
          </div>

          {/* Lesson Objectives Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">{t.exam_objectives}</label>
              <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer">
                وفق المنهاج الرسمي
              </span>
            </div>
            <textarea
              rows={4}
              value={lessonObjectives}
              onChange={(e) => setLessonObjectives(e.target.value)}
              placeholder={t.exam_objectives_ph}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Quick preset chips */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">أمثلة سريعة للمنهاج:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  loadPreset(
                    'الرياضيات',
                    'دراسة الدوال الأسية واللوغارتمية، حساب المشتقات والنهايات والمماسات، ورسم المنحنى البياني.'
                  )
                }
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition cursor-pointer"
              >
                دوال أسية ولوغارتمية
              </button>
              <button
                type="button"
                onClick={() =>
                  loadPreset(
                    'العلوم الفيزيائية',
                    'المتابعة الزمنية لتحول كيميائي، الناقلية وقياس الضغط، جدول التقدم وزمن نصف التفاعل t1/2.'
                  )
                }
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition cursor-pointer"
              >
                تحول كيميائي t1/2
              </button>
              <button
                type="button"
                onClick={() =>
                  loadPreset(
                    'علوم الطبيعة والحياة',
                    'آليات تركيب البروتين، الاستنساخ والترجمة، ومقر تركيب البروتين في الهيولى.'
                  )
                }
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition cursor-pointer"
              >
                تركيب البروتين
              </button>
            </div>
          </div>

          {/* Exam Output Language */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'لغة صياغة الموضوع' : 'Langue du sujet'}
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setExamLanguage('ar')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  examLanguage === 'ar' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setExamLanguage('fr')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  examLanguage === 'fr' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setExamLanguage('en')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  examLanguage === 'en' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGenerateExam}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.generatingWait}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.generateExamBtn}</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Right Output: Exam Subject & Model Answers (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Top Bar with Tabs and Print Actions */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 no-print">
            
            {/* Tabs */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('sheet')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'sheet'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.tab_examSheet}</span>
              </button>
              <button
                onClick={() => setActiveTab('answers')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'answers'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.tab_answerKey}</span>
              </button>
              <button
                onClick={() => setActiveTab('competencies')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'competencies'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{t.tab_competencies}</span>
              </button>
            </div>

            {/* Print & Copy buttons */}
            {examResult && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyExamText}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title={t.copyExam}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedNotice ? t.success : t.copyExam}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printExam}</span>
                </button>
              </div>
            )}

          </div>

          {/* Content display */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-white">
            {!examResult ? (
              <div className="h-full py-20 flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-base font-bold text-slate-700">
                    {language === 'ar' ? 'جاهز لإنشاء موضوع الفرض' : 'Prêt à générer le devoir'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'حدد الطور والمستوى والمادة واكتب أهداف الدرس ثم انقر على "إنشاء موضوع الفرض بالذكاء الاصطناعي".'
                      : 'Renseignez les champs à gauche et cliquez sur Générer pour créer le sujet.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Official Exam Paper Tab */}
                {activeTab === 'sheet' && (
                  <div className="space-y-6">
                    
                    {/* Official Examination Header */}
                    <div className="border-b-2 border-slate-800 pb-4 text-center space-y-2">
                      <div className="text-xs font-bold text-slate-700 tracking-wide">
                        {t.officialHeader}
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 pt-2 px-2">
                        <div className="text-start">
                          <span className="font-bold">المؤسسة: </span>
                          <span>{language === 'ar' ? schoolConfig.nameAr : schoolConfig.nameFr}</span>
                        </div>
                        <div className="text-end">
                          <span className="font-bold">{t.academicYearLabel}: </span>
                          <span>{schoolConfig.academicYear}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-900">
                        <div>المستوى: {examResult.gradeLevel} {examResult.streamName ? `(${examResult.streamName})` : ''}</div>
                        <div className="text-sm font-extrabold text-indigo-900">{examResult.title}</div>
                        <div>المادة: {examResult.subjectName} | المدة: {examResult.duration}</div>
                      </div>
                    </div>

                    {/* Candidate Instructions */}
                    {examResult.instructions && examResult.instructions.length > 0 && (
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                        <span className="font-bold block">توجيهات للمترشح:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                          {examResult.instructions.map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Exercises / Sections */}
                    <div className="space-y-6">
                      {examResult.sections.map((section, sIdx) => (
                        <div
                          key={section.id || sIdx}
                          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-sm font-extrabold text-indigo-950">
                              {section.title}
                            </h4>
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg border border-indigo-200">
                              ({section.points} {language === 'ar' ? 'نقاط' : 'pts'})
                            </span>
                          </div>

                          {section.context && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                              {section.context}
                            </p>
                          )}

                          <div className="space-y-3 pt-1">
                            {section.questions.map((q, qIdx) => (
                              <div key={qIdx} className="text-xs space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="font-bold text-slate-900 leading-snug">
                                    <span className="text-indigo-600 font-extrabold me-1.5">
                                      {q.qNumber})
                                    </span>
                                    {q.question}
                                  </div>
                                  <span className="text-slate-500 font-bold shrink-0 text-[11px]">
                                    [{q.points}ن]
                                  </span>
                                </div>

                                {q.subQuestions && q.subQuestions.length > 0 && (
                                  <ul className="list-disc list-inside ps-4 space-y-1 text-slate-700 text-[11px]">
                                    {q.subQuestions.map((sq, sqIdx) => (
                                      <li key={sqIdx}>{sq}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center pt-4 border-t border-slate-200 text-xs font-bold text-slate-400">
                      --- بالتوفيق والنجاح لجميع المترشحين ---
                    </div>

                  </div>
                )}

                {/* Model Answer Key & Rubric Tab */}
                {activeTab === 'answers' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">الإجابة النموذجية وسلم التنقيط المفصل:</span>
                        <p className="text-[11px] text-emerald-800">
                          شبكة التقييم وفق معايير الملاءمة، الاستعمال السليم لأدوات المادة، والانسجام والإتقان.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {examResult.sections.map((section, sIdx) => (
                        <div
                          key={section.id || sIdx}
                          className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
                        >
                          <div className="bg-slate-100 p-3 flex justify-between items-center text-xs font-bold text-slate-800">
                            <span>{section.title} - عناصر الإجابة</span>
                            <span>المجموع: {section.points} نقاط</span>
                          </div>

                          <div className="p-4 divide-y divide-slate-100 text-xs space-y-3">
                            {section.answerKey.map((ans, aIdx) => (
                              <div key={aIdx} className="pt-3 first:pt-0 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-bold text-emerald-700">
                                    السؤال {ans.qNumber}:
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                                    {ans.points}ن
                                  </span>
                                </div>
                                <div className="text-slate-800 leading-relaxed ps-2 font-medium">
                                  {ans.solution}
                                </div>
                                {ans.gradingCriteria && (
                                  <div className="text-[11px] text-slate-500 ps-2">
                                    <span className="font-bold text-slate-600">معيار التنقيط: </span>
                                    {ans.gradingCriteria}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {examResult.teacherAdvice && (
                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-900 space-y-1">
                        <span className="font-bold block">توجيهات بيداغوجية للأستاذ المصحح:</span>
                        <p className="text-[11px] leading-relaxed text-indigo-800">
                          {examResult.teacherAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pedagogical Competencies Tab */}
                {activeTab === 'competencies' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600 shrink-0" />
                      <div>
                        <span className="font-bold">الكفاءات والمؤشرات المستهدفة وفق المنهاج الوزاري:</span>
                        <p className="text-[11px] text-purple-800">
                          تقييم مدى تحكم المتعلم في الموارد والكفاءات الختامية للمادة.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                      <h4 className="text-sm font-bold text-slate-900">
                        الكفاءات التربوية المقيّمة في هذا الموضوع:
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {examResult.pedagogicalCompetencies.map((comp, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <span>{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
