import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Send,
  Bell,
  CheckCircle2,
  Clock,
  User,
  Users,
  Search,
  Filter,
  Printer,
  Sliders,
  ShieldAlert,
  Phone,
  Calendar,
  Eye,
  FileText,
  Check,
  X,
  Sparkles,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Share2,
} from 'lucide-react';
import {
  Student,
  ClassItem,
  AttendanceRecord,
  ParentAbsenceAlert,
  AbsenceAlertSeverity,
  Language,
  SchoolConfig,
} from '../types';

interface ParentAbsenceAlertsManagerProps {
  students: Student[];
  classes: ClassItem[];
  attendanceRecords: AttendanceRecord[];
  alerts: ParentAbsenceAlert[];
  language: Language;
  schoolConfig: SchoolConfig;
  onSendAlert: (alertData: Omit<ParentAbsenceAlert, 'id' | 'sentDate' | 'status'>) => void;
  onSendBatchAlerts: (alertsList: Omit<ParentAbsenceAlert, 'id' | 'sentDate' | 'status'>[]) => void;
  onApproveParentJustification?: (alertId: string, studentId: string) => void;
  onUpdateAttendanceRecord?: (recordId: string, updates: Partial<AttendanceRecord>) => void;
}

export const ParentAbsenceAlertsManager: React.FC<ParentAbsenceAlertsManagerProps> = ({
  students,
  classes,
  attendanceRecords,
  alerts,
  language,
  schoolConfig,
  onSendAlert,
  onSendBatchAlerts,
  onApproveParentJustification,
}) => {
  // Configurable threshold settings
  const [thresholdDays, setThresholdDays] = useState<number>(3);
  const [countingMode, setCountingMode] = useState<'unjustified_only' | 'all'>('unjustified_only');
  const [autoSendOnSave, setAutoSendOnSave] = useState<boolean>(true);

  // Active view tab
  const [viewTab, setViewTab] = useState<'exceeded_students' | 'alerts_history' | 'policy_settings'>('exceeded_students');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [previewAlertStudent, setPreviewAlertStudent] = useState<{
    student: Student;
    unjustified: number;
    justified: number;
    total: number;
    severity: AbsenceAlertSeverity;
  } | null>(null);

  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customChannel, setCustomChannel] = useState<'parent_portal' | 'sms_and_portal'>('sms_and_portal');

  // Printable Notice Modal
  const [printNoticeData, setPrintNoticeData] = useState<{
    student: Student;
    cls: ClassItem | undefined;
    unjustified: number;
    total: number;
    severity: AbsenceAlertSeverity;
    alert?: ParentAbsenceAlert;
  } | null>(null);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Calculate absences per student
  const studentAbsenceStats = useMemo(() => {
    return students.map((st) => {
      const records = attendanceRecords.filter((r) => r.studentId === st.id);
      const unjustified = records.filter((r) => r.status === 'absent_unjustified').length;
      const justified = records.filter((r) => r.status === 'absent_justified').length;
      const total = unjustified + justified;
      const tardies = records.filter((r) => r.status === 'tardy').length;

      const relevantCount = countingMode === 'unjustified_only' ? unjustified : total;
      const isExceeded = relevantCount >= thresholdDays;

      // Determine severity
      let severity: AbsenceAlertSeverity = 'notice';
      if (relevantCount >= 7) {
        severity = 'summons';
      } else if (relevantCount >= 5) {
        severity = 'formal_notice';
      } else if (relevantCount >= 4) {
        severity = 'warning';
      } else {
        severity = 'notice';
      }

      // Check existing alerts
      const studentAlerts = alerts.filter((a) => a.studentId === st.id);
      const latestAlert = studentAlerts[0] || null;

      const cls = classes.find((c) => c.id === st.classId);

      return {
        student: st,
        classItem: cls,
        unjustified,
        justified,
        total,
        tardies,
        relevantCount,
        isExceeded,
        severity,
        latestAlert,
        alertsCount: studentAlerts.length,
      };
    });
  }, [students, attendanceRecords, thresholdDays, countingMode, alerts, classes]);

  // Exceeded list
  const exceededStudents = useMemo(() => {
    return studentAbsenceStats.filter((item) => item.isExceeded);
  }, [studentAbsenceStats]);

  // Filtered Exceeded Students
  const filteredExceeded = useMemo(() => {
    return exceededStudents.filter((item) => {
      const matchesSearch =
        item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.parentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClassId === 'all' || item.student.classId === selectedClassId;
      const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;

      let matchesStatus = true;
      if (statusFilter === 'pending_send') {
        matchesStatus = !item.latestAlert;
      } else if (statusFilter === 'sent') {
        matchesStatus = !!item.latestAlert && item.latestAlert.status === 'delivered';
      } else if (statusFilter === 'read') {
        matchesStatus = !!item.latestAlert && item.latestAlert.status === 'read';
      } else if (statusFilter === 'justified') {
        matchesStatus = !!item.latestAlert && (item.latestAlert.status === 'acknowledged' || item.latestAlert.status === 'justified');
      }

      return matchesSearch && matchesClass && matchesSeverity && matchesStatus;
    });
  }, [exceededStudents, searchQuery, selectedClassId, severityFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalExceeded = exceededStudents.length;
    const pendingSend = exceededStudents.filter((e) => !e.latestAlert).length;
    const sentDelivered = alerts.filter((a) => a.status === 'delivered' || a.status === 'sent').length;
    const readAcknowledged = alerts.filter((a) => a.status === 'read' || a.status === 'acknowledged').length;
    const responsesCount = alerts.filter((a) => a.parentResponse).length;

    return {
      totalExceeded,
      pendingSend,
      sentDelivered,
      readAcknowledged,
      responsesCount,
    };
  }, [exceededStudents, alerts]);

  // Generate automated message content according to severity
  const generateAlertMessage = (
    studentName: string,
    className: string,
    unjustifiedDays: number,
    totalDays: number,
    severity: AbsenceAlertSeverity
  ) => {
    let title = '';
    let body = '';

    if (severity === 'summons' || severity === 'formal_notice') {
      title = `تنبيه رسمي واستدعاء: تجاوز غياب التلميذ(ة) ${studentName} (${unjustifiedDays} أيام غير مبررة)`;
      body = `إلى السيد(ة) ولي أمر التلميذ(ة) ${studentName} (${className}):\nتنهي إدارة مؤسسة ${schoolConfig.nameAr} إلى علمكم أن ابنكم قد تجاوز الحد القانوني للغياب برصيد ${unjustifiedDays} أيام غياب غير مبررة (${totalDays} أيام إجمالاً). نظراً لخطورة الوضع على مساره الدراسي، يُطلب منكم الحضور عاجلاً إلى مكتب مستشارية التربية خلال 48 ساعة مصحوبين بالوثائق المبررة لتسوية الوضعية قبل الإحالة إلى مجلس التأديب.`;
    } else if (severity === 'warning') {
      title = `إنذار نظامي بالغياب: التلميذ(ة) ${studentName} تجاوز عتبة ${thresholdDays} أيام غياب`;
      body = `تحية طيبة، ولي أمر التلميذ(ة) ${studentName} المحترم:\nنلفت انتباهكم إلى تسجيل ${unjustifiedDays} أيام غياب غير مبررة لابنكم بقسم ${className}. نرجو منكم تأكيد الاطلاع وتبرير هذه الغيابات عبر بوابة الولي الرقمية أو تزويد الإدارة بالشهادات الطبية في أقرب وقت.`;
    } else {
      title = `إشعار غياب آلي: التلميذ(ة) ${studentName} سجل ${unjustifiedDays} أيام غياب`;
      body = `السيد(ة) ولي أمر التلميذ(ة) ${studentName} (${className}):\nنحيطكم علماً بأن ابنكم قد تجاوز حد الغياب المسموح به (${thresholdDays} أيام). نرجو متابعة حضوره والحرص على عدم تكرار الغيابات حرصاً على نتائجه المدرسية.`;
    }

    return { title, body };
  };

  // Open Preview & Customize Modal
  const handleOpenPreview = (item: (typeof studentAbsenceStats)[0]) => {
    const { title, body } = generateAlertMessage(
      item.student.fullName,
      item.classItem?.name || '',
      item.unjustified,
      item.total,
      item.severity
    );
    setPreviewAlertStudent({
      student: item.student,
      unjustified: item.unjustified,
      justified: item.justified,
      total: item.total,
      severity: item.severity,
    });
    setCustomTitle(title);
    setCustomMessage(body);
    setCustomChannel('sms_and_portal');
  };

  // Submit single custom alert
  const handleSendCustomAlert = () => {
    if (!previewAlertStudent) return;

    const cls = classes.find((c) => c.id === previewAlertStudent.student.classId);

    onSendAlert({
      studentId: previewAlertStudent.student.id,
      studentName: previewAlertStudent.student.fullName,
      classId: previewAlertStudent.student.classId,
      className: cls?.name || 'القسم',
      parentName: previewAlertStudent.student.parentName,
      parentPhone: previewAlertStudent.student.parentPhone,
      absenceDaysCount: previewAlertStudent.total,
      unjustifiedCount: previewAlertStudent.unjustified,
      justifiedCount: previewAlertStudent.justified,
      thresholdExceeded: thresholdDays,
      severity: previewAlertStudent.severity,
      title: customTitle,
      message: customMessage,
      sentBy: 'مستشارية التربية وإدارة المؤسسة',
      deliveryChannel: customChannel,
      requiresSummons: previewAlertStudent.severity === 'summons' || previewAlertStudent.severity === 'formal_notice',
    });

    setPreviewAlertStudent(null);
    showToast(`تم إرسال التنبيه بنجاح إلى ولي أمر التلميذ (${previewAlertStudent.student.fullName}) عبر بوابة الولي.`);
  };

  // 1-Click Send single automated alert
  const handleQuickSendAlert = (item: (typeof studentAbsenceStats)[0]) => {
    const { title, body } = generateAlertMessage(
      item.student.fullName,
      item.classItem?.name || '',
      item.unjustified,
      item.total,
      item.severity
    );

    onSendAlert({
      studentId: item.student.id,
      studentName: item.student.fullName,
      classId: item.student.classId,
      className: item.classItem?.name || 'القسم',
      parentName: item.student.parentName,
      parentPhone: item.student.parentPhone,
      absenceDaysCount: item.total,
      unjustifiedCount: item.unjustified,
      justifiedCount: item.justified,
      thresholdExceeded: thresholdDays,
      severity: item.severity,
      title,
      message: body,
      sentBy: 'مستشارية التربية وإدارة المؤسسة',
      deliveryChannel: 'sms_and_portal',
      requiresSummons: item.severity === 'summons' || item.severity === 'formal_notice',
    });

    showToast(`تم إرسال التنبيه الآلي فوراً إلى ولي أمر (${item.student.fullName}) عبر بوابة الولي.`);
  };

  // Batch Send automated alerts to all pending exceeded students
  const handleBatchSendAlerts = () => {
    const targets = exceededStudents.filter((e) => !e.latestAlert || e.latestAlert.status === 'pending');
    if (targets.length === 0) {
      showToast('جميع الأولياء المعنيين قد تم إرسال تنبيهات سابقة لهم بالفعل.');
      return;
    }

    const newAlerts = targets.map((item) => {
      const { title, body } = generateAlertMessage(
        item.student.fullName,
        item.classItem?.name || '',
        item.unjustified,
        item.total,
        item.severity
      );

      return {
        studentId: item.student.id,
        studentName: item.student.fullName,
        classId: item.student.classId,
        className: item.classItem?.name || 'القسم',
        parentName: item.student.parentName,
        parentPhone: item.student.parentPhone,
        absenceDaysCount: item.total,
        unjustifiedCount: item.unjustified,
        justifiedCount: item.justified,
        thresholdExceeded: thresholdDays,
        severity: item.severity,
        title,
        message: body,
        sentBy: 'مستشارية التربية وإدارة المؤسسة',
        deliveryChannel: 'sms_and_portal' as const,
        requiresSummons: item.severity === 'summons' || item.severity === 'formal_notice',
      };
    });

    onSendBatchAlerts(newAlerts);
    showToast(`تم إرسال تنبيهات آلية دفعة واحدة لـ (${newAlerts.length}) ولي أمر بنجاح.`);
  };

  // Accept parent justification & convert absences to justified
  const handleApproveJustification = (alertItem: ParentAbsenceAlert) => {
    if (onApproveParentJustification) {
      onApproveParentJustification(alertItem.id, alertItem.studentId);
      showToast(`تم اعتماد تبرير الولي وتحديث سجل مواظبة التلميذ (${alertItem.studentName}) رسمياً.`);
    }
  };

  return (
    <div className="space-y-6">

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Card with Threshold Controls */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-purple-800/40 relative overflow-hidden">
        <div className="absolute -top-12 -end-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
              <Bell className="w-3.5 h-3.5 text-purple-300 animate-bounce" />
              <span>نظام التنبيهات الآلية لأولياء الأمور</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              إدارة إشعارات وتنبيهات تجاوز الغياب المسموح به
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
              رصد تلقائي للتلاميذ المتجاوزين لعتبة الغياب النظامية، وإرسال إشعارات فورية وإنذارات واستدعاءات رسمية لأولياء الأمور عبر بوابة الولي الرقمية وفق القانون التوجيهي للتربية الوطنية.
            </p>
          </div>

          {/* Quick Action: Batch Send */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleBatchSendAlerts}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-lg shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>إرسال تنبيهات آلية للمتجاوزين ({stats.pendingSend})</span>
            </button>
          </div>
        </div>

        {/* Threshold Configuration Strip */}
        <div className="mt-6 pt-5 border-t border-purple-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          {/* Threshold Stepper */}
          <div className="bg-purple-950/60 p-3 rounded-2xl border border-purple-700/40">
            <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-1.5">
              <span>حد الغياب المحدد:</span>
              <span className="text-amber-300 font-black">{thresholdDays} أيام غياب</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={thresholdDays}
                onChange={(e) => setThresholdDays(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex gap-1 shrink-0">
                {[2, 3, 5, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => setThresholdDays(num)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                      thresholdDays === num ? 'bg-amber-400 text-slate-900' : 'bg-purple-800 text-purple-200 hover:bg-purple-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Counting Mode */}
          <div className="bg-purple-950/60 p-3 rounded-2xl border border-purple-700/40">
            <span className="text-xs font-bold text-purple-200 block mb-1.5">طريقة احتساب الغياب:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCountingMode('unjustified_only')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  countingMode === 'unjustified_only'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-300 hover:bg-purple-900/60'
                }`}
              >
                غير المبررة فقط
              </button>
              <button
                onClick={() => setCountingMode('all')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  countingMode === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-300 hover:bg-purple-900/60'
                }`}
              >
                إجمالي الغيابات
              </button>
            </div>
          </div>

          {/* Auto-Dispatch Toggle */}
          <div className="bg-purple-950/60 p-3 rounded-2xl border border-purple-700/40 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-purple-200 block">الإرسال التلقائي الفوري:</span>
              <span className="text-[10px] text-purple-300 block">عند حفظ مناداة الحصة</span>
            </div>
            <button
              onClick={() => setAutoSendOnSave(!autoSendOnSave)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                autoSendOnSave ? 'bg-emerald-500' : 'bg-purple-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  autoSendOnSave ? (language === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Threshold Summary Badge */}
          <div className="bg-purple-950/60 p-3 rounded-2xl border border-purple-700/40 text-center">
            <span className="text-[10px] text-purple-300 font-bold block">التلاميذ المتجاوزون حالياً</span>
            <div className="text-xl font-black text-amber-300">
              {stats.totalExceeded} <span className="text-xs text-purple-200 font-normal">من أصل {students.length}</span>
            </div>
          </div>

        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">تجاوزوا حد {thresholdDays} أيام</span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.totalExceeded} تلميذ</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">بانتظار إرسال التنبيه</span>
            <div className="text-xl font-black text-red-600 dark:text-red-400">{stats.pendingSend} ولي</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">إجمالي التنبيهات المرسلة</span>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{alerts.length} تنبيه</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">تبريرات وردود الأولياء</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.responsesCount} تبرير</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs gap-2 text-xs font-bold">
        <button
          onClick={() => setViewTab('exceeded_students')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            viewTab === 'exceeded_students'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>قائمة التلاميذ المتجاوزين للحد ({exceededStudents.length})</span>
        </button>

        <button
          onClick={() => setViewTab('alerts_history')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            viewTab === 'alerts_history'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>سجل الإرسال وردود الأولياء ({alerts.length})</span>
        </button>

        <button
          onClick={() => setViewTab('policy_settings')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            viewTab === 'policy_settings'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>قوالب الرسائل والسياسة المدرسية</span>
        </button>
      </div>

      {/* VIEW TAB 1: EXCEEDED STUDENTS */}
      {viewTab === 'exceeded_students' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              <input
                type="text"
                placeholder="بحث بالاسم، رقم القيد أو الولي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Class Filter */}
            <div>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full py-2 px-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">جميع الأقسام والأفواج</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.grade})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">جميع درجات الإنذار</option>
                <option value="notice">إشعار غياب (3 أيام)</option>
                <option value="warning">إنذار بالغياب (4-5 أيام)</option>
                <option value="formal_notice">إعذار رسمي أول (5-6 أيام)</option>
                <option value="summons">إعذار ثانٍ واستدعاء (7+ أيام)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">جميع حالات الإرسال</option>
                <option value="pending_send">بانتظار الإرسال</option>
                <option value="sent">تم الإرسال عبر البوابة</option>
                <option value="read">تم الاطلاع من الولي</option>
                <option value="justified">تم إرسال تبرير / مبرر</option>
              </select>
            </div>

          </div>

          {/* Exceeded Students Table */}
          {filteredExceeded.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                لا يوجد تلاميذ متجاوزون للحد المحدد ({thresholdDays} أيام)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                وفق معايير الفلترة الحالية وطريقة الاحتساب المحددة، جميع التلاميذ يحافظون على نسب مواظبة ضمن الحدود النظامية المقبولة.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    التلاميذ المطالبون بالإشعار أو الإنذار:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
                    {filteredExceeded.length} تلميذ
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  القانون الداخلي: إشعار بالغياب بعد 3 أيام • إنذار بعد 5 أيام • إعذار واستدعاء بعد 7 أيام
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      <th className="p-3.5 text-start">التلميذ / القسم</th>
                      <th className="p-3.5 text-start">ولي الأمر والاتصال</th>
                      <th className="p-3.5 text-center">أيام الغياب</th>
                      <th className="p-3.5 text-start">درجة التنبيه</th>
                      <th className="p-3.5 text-start">حالة الإشعار بالبوابة</th>
                      <th className="p-3.5 text-end">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredExceeded.map((item) => {
                      const hasAlert = !!item.latestAlert;
                      const alertStatus = item.latestAlert?.status;

                      return (
                        <tr
                          key={item.student.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                        >
                          {/* Student Info */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs shrink-0">
                                {item.student.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {item.student.fullName}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                  <span>{item.classItem?.name || item.student.grade}</span>
                                  <span>•</span>
                                  <span>{item.student.regNumber}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Guardian Info */}
                          <td className="p-3.5">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {item.student.parentName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span dir="ltr">{item.student.parentPhone}</span>
                            </div>
                          </td>

                          {/* Absence Counter */}
                          <td className="p-3.5 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-sm font-black text-red-600 dark:text-red-400">
                                {item.unjustified} <span className="text-[10px] font-normal text-slate-500">غير مبرر</span>
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({item.total} أيام إجمالي)
                              </span>
                            </div>
                          </td>

                          {/* Severity Badge */}
                          <td className="p-3.5">
                            {item.severity === 'summons' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-bold text-[11px] border border-red-200 dark:border-red-800">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                <span>إعذار ثانٍ واستدعاء للولي</span>
                              </span>
                            )}
                            {item.severity === 'formal_notice' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 font-bold text-[11px] border border-orange-200 dark:border-orange-800">
                                <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span>إعذار أول (إنذار رسمي)</span>
                              </span>
                            )}
                            {item.severity === 'warning' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[11px] border border-amber-200 dark:border-amber-800">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>إنذار بالغياب</span>
                              </span>
                            )}
                            {item.severity === 'notice' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 font-bold text-[11px] border border-yellow-200 dark:border-yellow-800">
                                <Bell className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                                <span>إشعار غياب أولي</span>
                              </span>
                            )}
                          </td>

                          {/* Delivery Status */}
                          <td className="p-3.5">
                            {!hasAlert ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                                <Clock className="w-3 h-3" />
                                <span>لم يُرسل بعد</span>
                              </span>
                            ) : alertStatus === 'read' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[11px] font-bold">
                                <Eye className="w-3 h-3 text-blue-600" />
                                <span>اطلع عليه الولي</span>
                              </span>
                            ) : alertStatus === 'acknowledged' || alertStatus === 'justified' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>تم تقديم تبرير</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[11px] font-bold">
                                <Send className="w-3 h-3 text-purple-600" />
                                <span>مرسل عبر البوابة</span>
                              </span>
                            )}

                            {item.latestAlert?.sentDate && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.latestAlert.sentDate}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* 1-Click Quick Send */}
                              <button
                                onClick={() => handleQuickSendAlert(item)}
                                title="إرسال تنبيه آلي فوري للولي عبر بوابة الولي"
                                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                              </button>

                              {/* Customize / Preview Modal */}
                              <button
                                onClick={() => handleOpenPreview(item)}
                                title="تخصيص ومعاينة نص التنبيه"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>

                              {/* Official Printable Document */}
                              <button
                                onClick={() =>
                                  setPrintNoticeData({
                                    student: item.student,
                                    cls: item.classItem,
                                    unjustified: item.unjustified,
                                    total: item.total,
                                    severity: item.severity,
                                    alert: item.latestAlert || undefined,
                                  })
                                }
                                title="طباعة الإعذار أو الإشعار الرسمي بالغياب (وثيقة إدارية)"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                              >
                                <Printer className="w-4 h-4" />
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

        </div>
      )}

      {/* VIEW TAB 2: ALERTS HISTORY & PARENT RESPONSES */}
      {viewTab === 'alerts_history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                سجل التنبيهات المرسلة وتبريرات الأولياء
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تتبع حالة استلام الإشعارات وتأكيد القراءة من الأولياء واعتماد تبريرات الغياب والشهادات الطبية المقدمة عبر البوابة.
              </p>
            </div>
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-xl">
              إجمالي التنبيهات: {alerts.length}
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لم يتم إرسال أي تنبيهات لأولياء الأمور بعد.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-purple-300 dark:hover:border-purple-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {al.studentName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                          {al.className}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <span>الولي: {al.parentName}</span>
                        <span>•</span>
                        <span dir="ltr">{al.parentPhone}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {al.status === 'justified' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                          مبرر ومعتمد
                        </span>
                      ) : al.status === 'acknowledged' ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black">
                          تم تقديم تبرير
                        </span>
                      ) : al.status === 'read' ? (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-black">
                          مقروء بالبوابة
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                          تم التسليم للبوابة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Title & Body */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="font-bold text-purple-900 dark:text-purple-300">
                      {al.title}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">
                      {al.message}
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>أرسل بواسطة: {al.sentBy}</span>
                      <span>{al.sentDate}</span>
                    </div>
                  </div>

                  {/* Parent Response Box if available */}
                  {al.parentResponse && (
                    <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>رد وتبرير الولي عبر البوابة:</span>
                        </span>
                        {al.parentResponseDate && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                            {al.parentResponseDate}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed font-medium">
                        "{al.parentResponse}"
                      </p>

                      {al.status !== 'justified' && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleApproveJustification(al)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>اعتماد التبرير وقبول العذر</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom details & Print button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      تجاوز العتبة: {al.thresholdExceeded} أيام ({al.unjustifiedCount} غير مبررة)
                    </span>
                    <button
                      onClick={() => {
                        const st = students.find((s) => s.id === al.studentId);
                        const cls = classes.find((c) => c.id === al.classId);
                        if (st) {
                          setPrintNoticeData({
                            student: st,
                            cls,
                            unjustified: al.unjustifiedCount,
                            total: al.absenceDaysCount,
                            severity: al.severity,
                            alert: al,
                          });
                        }
                      }}
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة نسخة الإعذار الرسمي</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* VIEW TAB 3: POLICY & TEMPLATES */}
      {viewTab === 'policy_settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              السياسة المدرسية المعتمدة لإشعارات المواظبة والغيابات
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              تنظيم الإجراءات الإدارية المتبعة طبقاً لتعليمات وزارة التربية الوطنية الجزائرية المنظمة لغيابات التلاميذ والمواظبة العامة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Level 1: Notice */}
            <div className="p-4 rounded-2xl bg-yellow-50/70 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 space-y-2">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300 font-bold text-xs">
                <Bell className="w-4 h-4 text-yellow-600" />
                <span>المرحلة 1: إشعار بالغياب (3 أيام)</span>
              </div>
              <p className="text-xs text-yellow-900/80 dark:text-yellow-200/80 leading-relaxed">
                يُرسل إشعار لفت انتباه فوري إلى الولي عبر بوابة الولي عند تراكم 3 أيام غياب متفرقة أو متتالية لحث التلميذ على عدم الغياب وتبرير الحصص.
              </p>
            </div>

            {/* Level 2: Warning */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>المرحلة 2: إنذار بالغياب (5 أيام)</span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                إنذار رسمي أول يُلزم الولي بتقديم المبررات القانونية والشهادات الطبية في أجل 48 ساعة، ويُسجل الإنذار في الملف الإداري للمواظبة.
              </p>
            </div>

            {/* Level 3: Formal Notice & Summons */}
            <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-2">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>المرحلة 3: إعذار ثانٍ واستدعاء (7+ أيام)</span>
              </div>
              <p className="text-xs text-red-900/80 dark:text-red-200/80 leading-relaxed">
                استدعاء إلزامي لولي الأمر للمؤسسة لمقابلة مستشار التربية ورئيس المؤسسة، قبل اتخاذ تدابير الإحالة لمجلس التأديب أو الشطب التلقائي بعد استنفاد الإعذارات القانونية.
              </p>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  ربط التنبيهات المباشر مع بوابة الولي
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  أي تنبيه يتم إرساله يظهر كبطاقة حمراء/برتقالية بارزة في فضاء الولي، وتتيح للولي الرد الفوري وتبرير الغياب.
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl shrink-0">
              النظام نشط ومتصل 100%
            </span>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PREVIEW & CUSTOMIZE ALERT MODAL */}
      {/* ======================================================== */}
      {previewAlertStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    معاينة وتخصيص تنبيه الغياب للولي
                  </h3>
                  <span className="text-xs text-slate-400">
                    التلميذ(ة): {previewAlertStudent.student.fullName} ({previewAlertStudent.unjustified} أيام غير مبررة)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewAlertStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Recipient Details */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">المستلم (الولي):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{previewAlertStudent.student.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">رقم هاتف الولي:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200" dir="ltr">{previewAlertStudent.student.parentPhone}</span>
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان التنبيه:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Message Body input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نص التنبيه الرسمي (سيظهر في فضاء الولي):
                </label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 leading-relaxed font-sans"
                />
              </div>

              {/* Delivery Channel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  قنوات التبليغ المعتمدة:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCustomChannel('sms_and_portal')}
                    className={`p-2.5 rounded-xl border text-start font-bold cursor-pointer transition ${
                      customChannel === 'sms_and_portal'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>بوابة الولي + رسالة SMS</span>
                    <span className="block text-[10px] font-normal text-slate-400">إشعار رقمي متزامن</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomChannel('parent_portal')}
                    className={`p-2.5 rounded-xl border text-start font-bold cursor-pointer transition ${
                      customChannel === 'parent_portal'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>بوابة الولي فقط</span>
                    <span className="block text-[10px] font-normal text-slate-400">فضاء المتابعة الرقمي</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewAlertStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSendCustomAlert}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>إرسال التنبيه الآن</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PRINTABLE OFFICIAL NOTICE MODAL (PDF / PRINT) */}
      {/* ======================================================== */}
      {printNoticeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none print:max-w-none print:w-full">
            
            {/* Top Toolbar (Hidden when printing) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-sm text-slate-800">معاينة وثيقة الإعذار الرسمي للطباعة</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة فورية</span>
                </button>
                <button
                  onClick={() => setPrintNoticeData(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Algerian Education Notice Sheet */}
            <div className="space-y-6 text-slate-900 border-2 border-slate-800 p-8 rounded-2xl bg-white font-serif">
              
              {/* Header */}
              <div className="text-center space-y-1 text-xs">
                <div className="font-bold text-sm">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div className="font-bold">وزارة التربية الوطنية</div>
                <div>مديرية التربية لولاية الجزائر</div>
                <div className="font-bold text-sm pt-1">{schoolConfig.nameAr}</div>
                <div className="text-[11px] text-slate-600">السنة الدراسية: {schoolConfig.academicYear}</div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-b border-slate-300 pb-2">
                <span>الرقم: ........ / م.ن / {new Date().getFullYear()}</span>
                <span>الجزائر في: {new Date().toISOString().split('T')[0]}</span>
              </div>

              {/* Title Badge */}
              <div className="text-center py-3">
                <div className="inline-block border-2 border-slate-900 px-6 py-2 rounded-xl text-base font-black uppercase tracking-wider bg-slate-50">
                  {printNoticeData.severity === 'summons'
                    ? 'إعذار ثانٍ واستدعاء رسمي لولي الأمر'
                    : printNoticeData.severity === 'formal_notice'
                    ? 'إعذار أول بالغياب'
                    : 'إشعار رسمي بتجاوز حد الغياب'}
                </div>
              </div>

              {/* Content Body */}
              <div className="space-y-3 text-xs leading-loose text-justify font-sans">
                <p>
                  إلى السيد(ة): <strong className="text-sm underline">{printNoticeData.student.parentName}</strong> ولي أمر التلميذ(ة): <strong className="text-sm underline">{printNoticeData.student.fullName}</strong>
                </p>
                <p>
                  المسجل(ة) بقسم: <strong>{printNoticeData.cls?.name || printNoticeData.student.grade}</strong> تحت رقم القيد: <strong>{printNoticeData.student.regNumber}</strong>
                </p>
                <p>
                  تنهي إدارة مؤسسة <strong>{schoolConfig.nameAr}</strong> إلى علمكم أن ابنكم(تكم) قد سجل غياباً لمدة <strong className="text-red-700 underline text-sm">{printNoticeData.unjustified} أيام غير مبررة</strong> (من إجمالي {printNoticeData.total} أيام غياب)، وهو ما يتجاوز الحد القانوني المسموح به في النظام الداخلي للمؤسسة.
                </p>
                <p>
                  وعليه، وطبقاً للمناشير والتعليمات الوزارية المنظمة للمواظبة والانضباط المدرسي، نطلب منكم الاتصال العاجل بمصلحة مستشارية التربية خلال أجل أقصاه <strong>48 ساعة</strong> من تاريخ استلام هذا الإشعار لتبرير هذه الغيابات أو تقديم الشهادات الطبية المعتمدة.
                </p>
                {printNoticeData.severity === 'summons' && (
                  <p className="font-bold text-red-800 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    تنبيه قانوني هام: في حالة عدم حضوركم أو عدم تقديم تبرير مقبول في الأجل المحدد، سيتم إحالة ملف التلميذ إلى مجلس التأديب مع احتمال تطبيق إجراءات الشطب من قوائم المؤسسة.
                  </p>
                )}
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 flex justify-between items-start text-xs">
                <div className="text-center space-y-12">
                  <div className="font-bold">مستشار(ة) التربية</div>
                  <div className="text-slate-400 text-[10px]">(التوقيع)</div>
                </div>
                <div className="text-center space-y-12">
                  <div className="font-bold">مدير(ة) المؤسسة: {schoolConfig.directorName}</div>
                  <div className="w-24 h-24 border border-dashed border-slate-400 rounded-full flex items-center justify-center text-slate-400 text-[10px] mx-auto">
                    الختم الرسمي
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
