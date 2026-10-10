import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Phone,
  Mail,
  User,
  Calendar,
  Layers,
  Check,
  X,
  Award,
  Star,
  FileCheck,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  Teacher,
  Subject,
  ClassItem,
  Language,
  TeacherEvaluation,
  SchoolConfig,
  TeacherLeaveRequest,
  UserRole,
} from '../types';
import { translations } from '../i18n/translations';
import { TeacherEvaluationModal } from './TeacherEvaluationModal';
import { TeacherEvaluationDashboardCard } from './TeacherEvaluationDashboardCard';
import { TeacherLeaveRequestsManager } from './TeacherLeaveRequestsManager';

interface TeachersViewProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassItem[];
  language: Language;
  evaluations?: TeacherEvaluation[];
  schoolConfig?: SchoolConfig;
  leaveRequests?: TeacherLeaveRequest[];
  userRole?: UserRole;
  activeTeacherId?: string;
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onNavigateToTeacherTimetable: (teacherId: string) => void;
  onSaveEvaluation?: (evaluation: TeacherEvaluation) => void;
  onAddLeaveRequest?: (req: Omit<TeacherLeaveRequest, 'id' | 'status' | 'requestDate'>) => void;
  onApproveLeaveRequest?: (requestId: string, adminNotes?: string, substituteTeacherId?: string) => void;
  onRejectLeaveRequest?: (requestId: string, adminNotes: string) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  subjects,
  classes,
  language,
  evaluations = [],
  schoolConfig,
  leaveRequests = [],
  userRole = 'admin',
  activeTeacherId,
  onAddTeacher,
  onNavigateToTeacherTimetable,
  onSaveEvaluation,
  onAddLeaveRequest = () => {},
  onApproveLeaveRequest = () => {},
  onRejectLeaveRequest = () => {},
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'teachers' | 'leaves'>('teachers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [evaluatingTeacher, setEvaluatingTeacher] = useState<Teacher | null>(null);
  const [viewingEvaluationTeacher, setViewingEvaluationTeacher] = useState<Teacher | null>(null);

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    subjectIds: [subjects[0]?.id || ''],
    assignedClassIds: [classes[0]?.id || ''],
  });

  const getSubjectName = (subId: string) => {
    const s = subjects.find((x) => x.id === subId);
    if (!s) return subId;
    return language === 'ar' ? s.nameAr : language === 'fr' ? s.nameFr : s.nameEn;
  };

  const getClassName = (clsId: string) => {
    return classes.find((c) => c.id === clsId)?.name || clsId;
  };

  const getTeacherEvaluation = (teacherId: string) => {
    const list = evaluations.filter((e) => e.teacherId === teacherId);
    return list[list.length - 1] || null;
  };

  // Evaluation Statistics
  const evaluatedCount = teachers.filter((tch) => getTeacherEvaluation(tch.id) !== null).length;
  const avgEvaluationScore =
    evaluatedCount > 0
      ? (
          teachers.reduce((sum, tch) => sum + (getTeacherEvaluation(tch.id)?.totalScore || 0), 0) /
          evaluatedCount
        ).toFixed(1)
      : '0';

  const filteredTeachers = teachers.filter((tch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tch.name.toLowerCase().includes(q) ||
      tch.email.toLowerCase().includes(q) ||
      tch.phone.toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTeacher(newTeacher);
    setIsAddOpen(false);
    setNewTeacher({
      name: '',
      email: '',
      phone: '',
      subjectIds: [subjects[0]?.id || ''],
      assignedClassIds: [classes[0]?.id || ''],
    });
  };

  const pendingLeavesCount = leaveRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t.nav_teachers}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ar'
              ? 'إدارة الطاقم التربوي والأساتذة، تقييم الأداء الدوري من الإدارة، وجداول التوقيت وسير عمل الإجازات والتفرغ.'
              : 'Corps professoral, fiches d’évaluation pédagogique, et gestion des congés et de la disponibilité.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle: Teachers vs Leaves */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'teachers'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{language === 'ar' ? 'سجل الأساتذة والتقييم' : 'Enseignants'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
                {teachers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'leaves'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{language === 'ar' ? 'طلبات الإجازات وسير العمل' : 'Congés & Workflow'}</span>
              {pendingLeavesCount > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                  {pendingLeavesCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'teachers' && (
            <>
              {/* Quick Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 ltr:left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث عن أستاذ...' : 'Rechercher...'}
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs rtl:pr-9 ltr:pl-9 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة أستاذ جديد' : 'Ajouter un enseignant'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conditionally Render Leave Requests & Workflow Manager */}
      {activeTab === 'leaves' ? (
        <TeacherLeaveRequestsManager
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          leaveRequests={leaveRequests}
          language={language}
          schoolConfig={schoolConfig || ({ nameAr: '', nameFr: '', academicYear: '' } as any)}
          userRole={userRole}
          activeTeacherId={activeTeacherId}
          onAddLeaveRequest={onAddLeaveRequest}
          onApproveLeaveRequest={onApproveLeaveRequest}
          onRejectLeaveRequest={onRejectLeaveRequest}
        />
      ) : (
        <>
          {/* KPI Evaluation Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
              {language === 'ar' ? 'إجمالي الأساتذة' : 'Total Enseignants'}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
              {teachers.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block">
              {language === 'ar' ? 'نسبة إنجاز التقييم الدوري' : 'Taux d’évaluation'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300">
                {evaluatedCount}
              </span>
              <span className="text-xs font-bold text-slate-400">/ {teachers.length} أستاذ</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
              {language === 'ar' ? 'معدل تقييم الأداء العام' : 'Moyenne générale'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {avgEvaluationScore}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 20</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Teachers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((tch) => {
          const evalItem = getTeacherEvaluation(tch.id);
          return (
            <div
              key={tch.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${
                        tch.avatarColor || 'bg-purple-600'
                      } text-white flex items-center justify-center font-bold text-base shadow-xs`}
                    >
                      {tch.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{tch.name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{tch.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{tch.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Score Badge */}
                  {evalItem ? (
                    <div className="text-center">
                      <div className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-black text-xs">
                        {evalItem.totalScore} / 20
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                        {evalItem.rating === 'excellent'
                          ? 'ممتاز'
                          : evalItem.rating === 'very_good'
                          ? 'جيد جداً'
                          : 'جيد'}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500">
                      قيد التقييم
                    </span>
                  )}
                </div>

                {/* Assigned Subjects */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'المواد المسندة:' : 'Matières:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tch.subjectIds.map((sid) => (
                      <span
                        key={sid}
                        className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-800"
                      >
                        {getSubjectName(sid)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assigned Classes */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'الأقسام المسندة:' : 'Classes:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tch.assignedClassIds.map((cid) => (
                      <span
                        key={cid}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      >
                        {getClassName(cid)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability & Leave Status */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold">
                    {language === 'ar' ? 'حالة التفرغ:' : 'Disponibilité :'}
                  </span>
                  {tch.status === 'on_leave' || (tch.unavailableDates && tch.unavailableDates.length > 0) ? (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" />
                      <span>{language === 'ar' ? 'في إجازة معتمدة' : 'En congé'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{language === 'ar' ? 'متفرغ ومتاح' : 'Disponible'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Timetable & Periodic Evaluation */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onNavigateToTeacherTimetable(tch.id)}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'جدول التوقيت' : 'Emploi'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {evalItem && (
                    <button
                      onClick={() => setViewingEvaluationTeacher(tch)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title={language === 'ar' ? 'عرض بطاقة التقييم الدوري' : 'Voir l’évaluation'}
                    >
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      <span>{language === 'ar' ? 'النتائج' : 'Bilan'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setEvaluatingTeacher(tch)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {evalItem
                        ? language === 'ar'
                          ? 'تحديث التقييم'
                          : 'Modifier'
                        : language === 'ar'
                        ? 'تقييم الأداء'
                        : 'Évaluer'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Periodic Evaluation Form Modal (Admin Recording) */}
      {evaluatingTeacher && (
        <TeacherEvaluationModal
          isOpen={true}
          onClose={() => setEvaluatingTeacher(null)}
          teacher={evaluatingTeacher}
          language={language}
          existingEvaluation={getTeacherEvaluation(evaluatingTeacher.id)}
          onSaveEvaluation={(ev) => {
            if (onSaveEvaluation) {
              onSaveEvaluation(ev);
            }
            setEvaluatingTeacher(null);
          }}
        />
      )}

      {/* Periodic Evaluation Results View Modal */}
      {viewingEvaluationTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>{language === 'ar' ? 'تقرير التقييم الدوري للأستاذ' : 'Fiche d’évaluation'}</span>
              </h3>
              <button
                onClick={() => setViewingEvaluationTeacher(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TeacherEvaluationDashboardCard
              teacher={viewingEvaluationTeacher}
              evaluations={evaluations}
              schoolConfig={schoolConfig || { nameAr: 'المؤسسة', nameFr: 'École', nameEn: 'School', academicYear: '2026-2027', directorName: '', phone: '', email: '', address: '', currency: 'د.ج', activeCycles: [] }}
              language={language}
              isAdmin={true}
              onOpenNewEvaluation={() => {
                const tch = viewingEvaluationTeacher;
                setViewingEvaluationTeacher(null);
                setEvaluatingTeacher(tch);
              }}
            />
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'إضافة أستاذ جديد' : 'Nouvel Enseignant'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل للأستاذ</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    placeholder="مثال: أ. بلقاسم بن عيسى"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                      placeholder="teacher@school.edu"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={newTeacher.phone}
                      onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                      placeholder="0550..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المادة الأساسية</label>
                  <select
                    value={newTeacher.subjectIds[0]}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subjectIds: [e.target.value] })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {language === 'ar' ? s.nameAr : s.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}

    </div>
  );
};

