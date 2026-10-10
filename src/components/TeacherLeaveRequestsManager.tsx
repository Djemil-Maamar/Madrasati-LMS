import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Paperclip,
  Check,
  X,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  MessageSquare,
  Printer,
  Info,
} from 'lucide-react';
import {
  Teacher,
  TeacherLeaveRequest,
  TeacherLeaveType,
  LeaveApprovalStatus,
  Language,
  SchoolConfig,
  UserRole,
  ClassItem,
  Subject,
} from '../types';

interface TeacherLeaveRequestsManagerProps {
  teachers: Teacher[];
  classes: ClassItem[];
  subjects: Subject[];
  leaveRequests: TeacherLeaveRequest[];
  language: Language;
  schoolConfig: SchoolConfig;
  userRole: UserRole;
  activeTeacherId?: string;
  onAddLeaveRequest: (request: Omit<TeacherLeaveRequest, 'id' | 'status' | 'requestDate'>) => void;
  onApproveLeaveRequest: (
    requestId: string,
    adminNotes?: string,
    substituteTeacherId?: string
  ) => void;
  onRejectLeaveRequest: (requestId: string, adminNotes: string) => void;
}

export const TeacherLeaveRequestsManager: React.FC<TeacherLeaveRequestsManagerProps> = ({
  teachers,
  classes,
  subjects,
  leaveRequests,
  language,
  schoolConfig,
  userRole,
  activeTeacherId,
  onAddLeaveRequest,
  onApproveLeaveRequest,
  onRejectLeaveRequest,
}) => {
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';

  // State
  const [activeTab, setActiveTab] = useState<'submit' | 'list' | 'availability'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | LeaveApprovalStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<TeacherLeaveRequest | null>(null);
  const [adminReviewNotes, setAdminReviewNotes] = useState('');
  const [assignedSubstituteId, setAssignedSubstituteId] = useState('');

  // Form State for new leave request
  const [formTeacherId, setFormTeacherId] = useState(activeTeacherId || teachers[0]?.id || '');
  const [formLeaveType, setFormLeaveType] = useState<TeacherLeaveType>('sick');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReason, setFormReason] = useState('');
  const [formSupportingDoc, setFormSupportingDoc] = useState('');
  const [formSubstituteId, setFormSubstituteId] = useState('');
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(false);

  // Auto-sync formTeacherId if activeTeacherId changes
  React.useEffect(() => {
    if (activeTeacherId) {
      setFormTeacherId(activeTeacherId);
    }
  }, [activeTeacherId]);

  // Calculate days difference
  const calculatedDays = useMemo(() => {
    if (!formStartDate || !formEndDate) return 1;
    const start = new Date(formStartDate);
    const end = new Date(formEndDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  }, [formStartDate, formEndDate]);

  // Leave Type Labels & Badges
  const getLeaveTypeInfo = (type: TeacherLeaveType) => {
    switch (type) {
      case 'sick':
        return {
          label: isArabic ? 'إجازة مرضية' : 'Congé de maladie',
          color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
        };
      case 'emergency':
        return {
          label: isArabic ? 'ظرف عائلي طارئ' : 'Événement familial',
          color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
        };
      case 'maternity':
        return {
          label: isArabic ? 'إجازة أمومة ورعاية' : 'Maternité / Garde',
          color: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-900',
        };
      case 'training':
        return {
          label: isArabic ? 'تكوين بيداغوجي / تفتيش' : 'Formation pédagogique',
          color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900',
        };
      case 'official_mission':
        return {
          label: isArabic ? 'مهمة رسمية / تصحيح' : 'Mission officielle',
          color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900',
        };
      case 'unpaid':
        return {
          label: isArabic ? 'عطلة استيداع غير مدفوعة' : 'Congé sans solde',
          color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        };
      case 'annual':
        return {
          label: isArabic ? 'إجازة سنوية' : 'Congé annuel',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900',
        };
      default:
        return {
          label: type,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  // Status Info
  const getStatusInfo = (status: LeaveApprovalStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: isArabic ? 'قيد المعالجة بالإدارة' : 'En attente',
          icon: Clock,
          badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        };
      case 'approved':
        return {
          label: isArabic ? 'موافق عليه ومعتمد' : 'Approuvé',
          icon: CheckCircle2,
          badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        };
      case 'rejected':
        return {
          label: isArabic ? 'مرفوض من الإدارة' : 'Rejeté',
          icon: XCircle,
          badgeColor: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        };
      case 'cancelled':
        return {
          label: isArabic ? 'ملغى' : 'Annulé',
          icon: X,
          badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
        };
    }
  };

  // Handle Form Submission
  const handleSubmitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === formTeacherId);
    if (!teacher) return;

    const substituteTeacher = teachers.find((t) => t.id === formSubstituteId);

    onAddLeaveRequest({
      teacherId: formTeacherId,
      teacherName: teacher.name,
      leaveType: formLeaveType,
      startDate: formStartDate,
      endDate: formEndDate,
      daysCount: calculatedDays,
      reason: formReason.trim() || (isArabic ? 'طلب إجازة رسمي مبرر' : 'Demande officielle'),
      supportingDocument: formSupportingDoc.trim() || undefined,
      substituteTeacherId: formSubstituteId || undefined,
      substituteTeacherName: substituteTeacher?.name || undefined,
      affectsTimetableSessionsCount: calculatedDays * 3, // estimation based on daily average
    });

    setSubmitSuccessMsg(true);
    setTimeout(() => setSubmitSuccessMsg(false), 4000);

    // Reset Form
    setFormReason('');
    setFormSupportingDoc('');
    setFormSubstituteId('');
    setActiveTab('list');
  };

  // Filtered Requests List
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      // If user is teacher, filter to their requests unless viewing general list
      if (userRole === 'teacher' && activeTeacherId && req.teacherId !== activeTeacherId) {
        return false;
      }

      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          req.teacherName.toLowerCase().includes(q) ||
          req.reason.toLowerCase().includes(q) ||
          req.startDate.includes(q) ||
          req.endDate.includes(q)
        );
      }

      return true;
    });
  }, [leaveRequests, userRole, activeTeacherId, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter((r) => r.status === 'pending').length;
    const approved = leaveRequests.filter((r) => r.status === 'approved').length;
    const activeLeaves = teachers.filter((t) => t.status === 'on_leave' || (t.unavailableDates && t.unavailableDates.length > 0)).length;

    return { total, pending, approved, activeLeaves };
  }, [leaveRequests, teachers]);

  const handleOpenReview = (req: TeacherLeaveRequest) => {
    setSelectedRequestForReview(req);
    setAdminReviewNotes(req.adminNotes || '');
    setAssignedSubstituteId(req.substituteTeacherId || '');
  };

  const handleConfirmApproval = () => {
    if (!selectedRequestForReview) return;
    onApproveLeaveRequest(
      selectedRequestForReview.id,
      adminReviewNotes,
      assignedSubstituteId
    );
    setSelectedRequestForReview(null);
  };

  const handleConfirmRejection = () => {
    if (!selectedRequestForReview) return;
    onRejectLeaveRequest(
      selectedRequestForReview.id,
      adminReviewNotes || (isArabic ? 'تعذر الموافقة لضرورة المصلحة التربوية' : 'Rejet pour impératif de service')
    );
    setSelectedRequestForReview(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isArabic
                    ? 'نظام طلبات الإجازات والتغيب وسير عمل الاعتماد'
                    : 'Gestion des congés & circuit d’approbation'}
                </h3>
                {stats.pending > 0 && userRole === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                    {stats.pending} {isArabic ? 'طلبات قيد المراجعة' : 'en attente'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isArabic
                  ? 'تقديم طلبات الإجازة للأساتذة، دورة موافقة الإدارة، والتحديث التلقائي الفوري لسجل التفرغ وجداول الحصص.'
                  : 'Soumission des congés, workflow de validation administrative et mise à jour de la disponibilité.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Switches */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isArabic ? 'سير عمل الطلبات' : 'Demandes & Workflow'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
              {filteredRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'submit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isArabic ? 'نموذج طلب إجازة جديد' : 'Nouveau congé'}</span>
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'availability'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>{isArabic ? 'سجل التفرغ الحالي' : 'Disponibilité'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            {isArabic ? 'إجمالي طلبات الإجازة' : 'Total demandes'}
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {stats.total}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
            {isArabic ? 'طلبات قيد المراجعة (انتظار)' : 'En attente de validation'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.pending}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {isArabic ? 'بحاجة لقرار الإدارة' : 'action requise'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
            {isArabic ? 'إجازات معتمدة وموافق عليها' : 'Congés approuvés'}
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats.approved}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 block">
            {isArabic ? 'الأساتذة غير المتفرغين حالياً' : 'Actuellement indisponibles'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-purple-700 dark:text-purple-300">
              {stats.activeLeaves}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {isArabic ? 'في عطلة / مهمة' : 'en mission/congé'}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submitSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {isArabic
                ? 'تم إرسال طلب الإجازة بنجاح إلى إدارة المؤسسة وسيتم إشعارك فور اعتماد القرار وتحديث جدول التفرغ.'
                : 'Demande de congé transmise avec succès à l’administration.'}
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: SUBMIT NEW LEAVE REQUEST FORM */}
      {activeTab === 'submit' && (
        <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-750 pb-3">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {isArabic ? 'استمارة طلب إجازة / تغيب للمعلم' : 'Formulaire de demande d’absence'}
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {isArabic ? 'المادة 12 من النظام الداخلي للتربية الوطنية' : 'Règlement interne'}
            </span>
          </div>

          <form onSubmit={handleSubmitLeaveRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Teacher Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'الأستاذ صاحب الطلب:' : 'Enseignant :'}
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  disabled={userRole === 'teacher'}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-80"
                >
                  {teachers.map((tch) => (
                    <option key={tch.id} value={tch.id}>
                      {tch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'طبيعة ونوع الإجازة:' : 'Nature du congé :'}
                </label>
                <select
                  value={formLeaveType}
                  onChange={(e) => setFormLeaveType(e.target.value as TeacherLeaveType)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="sick">{isArabic ? 'إجازة مرضية (شهادة طبية)' : 'Maladie'}</option>
                  <option value="emergency">{isArabic ? 'ظرف عائلي طارئ / قاهر' : 'Événement familial'}</option>
                  <option value="maternity">{isArabic ? 'إجازة أمومة ورعاية' : 'Maternité'}</option>
                  <option value="training">{isArabic ? 'تكوين بيداغوجي / ندوة تفتيشية' : 'Formation pédagogique'}</option>
                  <option value="official_mission">{isArabic ? 'مهمة رسمية / تصحيح الامتحانات' : 'Mission officielle'}</option>
                  <option value="unpaid">{isArabic ? 'عطلة استيداع غير مدفوعة' : 'Sans solde'}</option>
                  <option value="annual">{isArabic ? 'إجازة سنوية' : 'Annuel'}</option>
                </select>
              </div>

              {/* Date Range & Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'الفترة الزمنية وعدد الأيام:' : 'Durée calculée :'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    required
                    className="w-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-slate-400 text-xs">إلى</span>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    required
                    className="w-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{isArabic ? 'المدة المحسوبة:' : 'Total :'}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {calculatedDays} {isArabic ? 'أيام عمل' : 'jours'}
                  </span>
                </div>
              </div>

            </div>

            {/* Reason Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'سبب التغيب والمبررات بالتفصيل:' : 'Motif détaillé de l’absence :'}
              </label>
              <textarea
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                rows={3}
                placeholder={
                  isArabic
                    ? 'مثال: وعكة صحية تستوجب الراحة التامة بناءً على الفحص الطبي، أو حضور ندوة تكوينية لمفتشية التعليم...'
                    : 'Précisez la raison légale ou pédagogique...'
                }
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Supporting Document */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'الوثيقة التبريرية المرفقة:' : 'Justificatif joint :'}
                </label>
                <div className="relative">
                  <Paperclip className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                  <input
                    type="text"
                    value={formSupportingDoc}
                    onChange={(e) => setFormSupportingDoc(e.target.value)}
                    placeholder={
                      isArabic
                        ? 'مثال: شهادة_مرضية_د_سليماني.pdf أو استدعاء_تفتيش.pdf'
                        : 'Nom du fichier justificatif...'
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs ps-9 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isArabic
                    ? 'شهادة طبية، استدعاء رسمي من مديرية التربية، أو رخصة غياب استثنائية.'
                    : 'Certificat médical, convocation officielle, etc.'}
                </span>
              </div>

              {/* Proposed Substitute Teacher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'اقتراح أستاذ مستخلف / معوض للحصص (اختياري):' : 'Remplaçant proposé (optionnel) :'}
                </label>
                <select
                  value={formSubstituteId}
                  onChange={(e) => setFormSubstituteId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">{isArabic ? '-- تكليف الإدارة بتعيين البديل --' : '-- À désigner par l’administration --'}</option>
                  {teachers
                    .filter((t) => t.id !== formTeacherId)
                    .map((tch) => (
                      <option key={tch.id} value={tch.id}>
                        {tch.name}
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isArabic
                    ? 'سيتم إشعار الأستاذ المعوض بالحصص في حال اعتماد الإجازة.'
                    : 'Sera notifié en cas d’approbation.'}
                </span>
              </div>

            </div>

            {/* Note on Auto Availability Update */}
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                {isArabic
                  ? 'تنبيه النظام: بمجرد اعتماد الإجازة من قبل إدارة المؤسسة، سيقوم النظام تلقائياً بتحديث سجل التفرغ للأستاذ، وإدراج علامة (في إجازة رسمية) وتجميد تعارضات الحصص خلال تلك التواريخ.'
                  : 'Mise à jour automatique : L’approbation de la direction actualisera directement le planning et le statut de disponibilité.'}
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                {isArabic ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إرسال طلب الإجازة للاعتماد' : 'Soumettre la demande'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REQUESTS LIST & WORKFLOW APPROVALS */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'بحث باسم الأستاذ أو السبب...' : 'Rechercher...'}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-1.5 text-xs ps-8 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">{isArabic ? 'كافة الحالات' : 'Tous les statuts'}</option>
                <option value="pending">{isArabic ? 'قيد المعالجة (انتظار)' : 'En attente'}</option>
                <option value="approved">{isArabic ? 'موافق عليه ومعتمد' : 'Approuvés'}</option>
                <option value="rejected">{isArabic ? 'مرفوض' : 'Rejetés'}</option>
              </select>
            </div>

            <button
              onClick={() => setActiveTab('submit')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'طلب إجازة جديد' : 'Nouveau congé'}</span>
            </button>
          </div>

          {/* Requests Grid / Cards */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold">
                {isArabic ? 'لا توجد طلبات إجازة مطابقة للمعايير المحددة' : 'Aucune demande trouvée'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => {
                const typeInfo = getLeaveTypeInfo(req.leaveType);
                const statusInfo = getStatusInfo(req.status);
                const StatusIcon = statusInfo.icon;
                const teacher = teachers.find((t) => t.id === req.teacherId);

                return (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-slate-850 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      
                      {/* Card Header: Teacher & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl ${
                              teacher?.avatarColor || 'bg-indigo-600'
                            } text-white flex items-center justify-center font-bold text-sm shrink-0`}
                          >
                            {req.teacherName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">
                              {req.teacherName}
                            </h4>
                            <span className="text-[10px] text-slate-400 block">
                              {isArabic ? 'تاريخ التقديم:' : 'Demandé le :'} {req.requestDate}
                            </span>
                          </div>
                        </div>

                        {/* Status Chip */}
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center gap-1 ${statusInfo.badgeColor}`}
                        >
                          <StatusIcon className="w-3 h-3 shrink-0" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>

                      {/* Leave Type & Duration */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>

                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {req.startDate} {isArabic ? 'إلى' : 'au'} {req.endDate} ({req.daysCount} {isArabic ? 'أيام' : 'j'})
                          </span>
                        </span>
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed">
                        {req.reason}
                      </p>

                      {/* Supporting Doc & Substitute Info */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                        {req.supportingDocument && (
                          <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate max-w-40">{req.supportingDocument}</span>
                          </div>
                        )}

                        {req.substituteTeacherName && (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <User className="w-3 h-3 text-emerald-500" />
                            <span>{isArabic ? 'المستخلف:' : 'Remplaçant :'} {req.substituteTeacherName}</span>
                          </div>
                        )}
                      </div>

                      {/* Admin Decision Notes if processed */}
                      {req.adminNotes && (
                        <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {isArabic ? 'قرار وملاحظات الإدارة:' : 'Note de la direction :'}
                          </span>
                          <span>{req.adminNotes}</span>
                          {req.reviewedBy && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {req.reviewedBy} ({req.reviewedDate})
                            </span>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Admin Workflow Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{req.id}
                      </span>

                      {/* Workflow decision actions (admin only) */}
                      {userRole === 'admin' ? (
                        <div className="flex items-center gap-1.5">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleOpenReview(req)}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{isArabic ? 'معالجة واعتماد' : 'Traiter'}</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenReview(req)}
                              className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              {isArabic ? 'مراجعة القرار' : 'Détails'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] font-bold text-slate-500">
                          {req.status === 'approved' && (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'معتمد في سجل التفرغ' : 'Acté au planning'}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: AVAILABILITY REGISTRY OVERVIEW */}
      {activeTab === 'availability' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                {isArabic ? 'سجل التفرغ والجاهزية التربوية التلقائي' : 'Registre automatisé de disponibilité'}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                {isArabic
                  ? 'يتم تحديث هذا السجل آنياً عند اعتماد الإجازات من قبل الإدارة، مما يمنع تعارض الحصص ويسهل تعيين الأساتذة المعوضين في جداول التوقيت.'
                  : 'Actualisé en temps réel lors de l’approbation des congés.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-100/80 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 text-start">{isArabic ? 'الأستاذ' : 'Enseignant'}</th>
                  <th className="p-3 text-start">{isArabic ? 'المادة المسندة' : 'Matière'}</th>
                  <th className="p-3 text-center">{isArabic ? 'الحالة الحالية' : 'Statut'}</th>
                  <th className="p-3 text-start">{isArabic ? 'تواريخ عدم التفرغ / الإجازة' : 'Indisponibilité'}</th>
                  <th className="p-3 text-start">{isArabic ? 'ملاحظات التفرغ والمستخلف' : 'Observations'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teachers.map((tch) => {
                  const isOnLeave = tch.status === 'on_leave' || (tch.unavailableDates && tch.unavailableDates.length > 0);
                  const subSubject = subjects.find((s) => tch.subjectIds.includes(s.id));

                  return (
                    <tr
                      key={tch.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-850/60 transition ${
                        isOnLeave ? 'bg-purple-50/30 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg ${
                            tch.avatarColor || 'bg-indigo-600'
                          } text-white flex items-center justify-center font-bold text-xs`}
                        >
                          {tch.name.charAt(0)}
                        </div>
                        <span>{tch.name}</span>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {subSubject ? (isArabic ? subSubject.nameAr : subSubject.nameFr) : 'متعدد'}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isOnLeave
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isOnLeave ? (isArabic ? 'في إجازة معتمدة' : 'En congé') : (isArabic ? 'متفرغ ومتاح' : 'Disponible')}
                        </span>
                      </td>

                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {tch.unavailableDates && tch.unavailableDates.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {tch.unavailableDates.map((d) => (
                              <span
                                key={d}
                                className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono text-[10px] border border-rose-200 dark:border-rose-900"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            {isArabic ? 'كافة الأيام متاحة' : 'Totalement disponible'}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        {tch.availabilityNote || (isArabic ? 'تفرغ تام وفق جدول الحصص الأسبوعي' : 'Normal')}
                        {tch.currentLeave?.substituteTeacherName && (
                          <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                            {isArabic ? 'المستخلف المعين:' : 'Remplaçant :'} {tch.currentLeave.substituteTeacherName}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN WORKFLOW APPROVAL / REJECTION MODAL */}
      {selectedRequestForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {isArabic ? 'سير عمل دراسة واعتماد طلب الإجازة' : 'Traitement de la demande de congé'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    #{selectedRequestForReview.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequestForReview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Request Summary Overview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedRequestForReview.teacherName}
                </span>
                <span className="px-2 py-0.5 rounded-lg font-black text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {getLeaveTypeInfo(selectedRequestForReview.leaveType).label}
                </span>
              </div>

              <div className="text-slate-600 dark:text-slate-400 text-[11px] space-y-1">
                <div>
                  <span className="font-bold">{isArabic ? 'الفترة:' : 'Période :'}</span>{' '}
                  {selectedRequestForReview.startDate} {isArabic ? 'إلى' : 'au'}{' '}
                  {selectedRequestForReview.endDate} ({selectedRequestForReview.daysCount}{' '}
                  {isArabic ? 'أيام' : 'j'})
                </div>
                <div>
                  <span className="font-bold">{isArabic ? 'السبب:' : 'Motif :'}</span>{' '}
                  {selectedRequestForReview.reason}
                </div>
                {selectedRequestForReview.supportingDocument && (
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <span>{selectedRequestForReview.supportingDocument}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Substitute Teacher assignment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'تعيين / تأكيد الأستاذ المستخلف المعوض:' : 'Enseignant remplaçant désigné :'}
              </label>
              <select
                value={assignedSubstituteId}
                onChange={(e) => setAssignedSubstituteId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">{isArabic ? '-- بدون مستخلف (حفظ الحصص) --' : '-- Sans remplaçant --'}</option>
                {teachers
                  .filter((t) => t.id !== selectedRequestForReview.teacherId)
                  .map((tch) => (
                    <option key={tch.id} value={tch.id}>
                      {tch.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Admin Decision Notes / Rejection Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isArabic ? 'ملاحظات الإدارة أو سبب الرفض:' : 'Observations de la direction :'}
              </label>
              <textarea
                value={adminReviewNotes}
                onChange={(e) => setAdminReviewNotes(e.target.value)}
                rows={2}
                placeholder={
                  isArabic
                    ? 'مثال: طلب معتمد رسمياً. تم تكليف الأستاذ المستخلف وتحديث جدول التفرغ.'
                    : 'Notes ou motif de rejet...'
                }
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 transition flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isArabic ? 'رفض الطلب' : 'Rejeter'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForReview(null)}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproval}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'موافقة واعتماد الإجازة' : 'Approuver le congé'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
