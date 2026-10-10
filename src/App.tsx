/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileSpreadsheet,
  UserCheck,
  Sparkles,
  Users,
  GraduationCap,
  CreditCard,
  Settings,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Layers,
  Package,
  FileText,
} from 'lucide-react';

import {
  Language,
  UserRole,
  SchoolConfig,
  TimetableSession,
  ClassItem,
  Teacher,
  Subject,
  Room,
  TimeSlot,
  Student,
  GradeRecord,
  AttendanceRecord,
  FeePayment,
  InternalMessage,
  SchoolActivity,
  TeacherEvaluation,
  ThemeMode,
  InventoryItem,
  TeacherLeaveRequest,
} from './types';

import {
  initialSchoolConfig,
  standardTimeSlots,
  initialClasses,
  initialSubjects,
  initialRooms,
  initialTeachers,
  initialTimetableSessions,
  initialStudents,
  initialGradeRecords,
  initialAttendanceRecords,
  initialFeePayments,
  initialInternalMessages,
  initialSchoolActivities,
  initialTeacherEvaluations,
  initialInventoryItems,
  initialTeacherLeaveRequests,
} from './data/mockData';

import { translations } from './i18n/translations';
import { detectAllConflicts } from './utils/timetableConflict';

import { Navbar } from './components/Navbar';
import { TimetableConflictModal } from './components/TimetableConflictModal';
import { DashboardView } from './components/DashboardView';
import { TimetablesView } from './components/TimetablesView';
import { GradebookView } from './components/GradebookView';
import { AttendanceView } from './components/AttendanceView';
import { AIExamGeneratorView } from './components/AIExamGeneratorView';
import { ClassesStudentsView } from './components/ClassesStudentsView';
import { TeachersView } from './components/TeachersView';
import { FeesPaymentsView } from './components/FeesPaymentsView';
import { SettingsView } from './components/SettingsView';
import CascadingLevelsManager from './components/CascadingLevelsManager';
import { ParentPortalView } from './components/ParentPortalView';
import { SchoolInventoryView } from './components/SchoolInventoryView';
import { TeacherLeaveRequestsManager } from './components/TeacherLeaveRequestsManager';

export default function App() {
  // Language & Role & Theme
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('madrasati_lang') as Language) || 'ar';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('madrasati_theme') as ThemeMode) || 'light';
  });

  const [role, setRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // Active Persona selections when switching roles
  const [activeTeacherId, setActiveTeacherId] = useState<string>('tch-1');
  const [activeParentStudentId, setActiveParentStudentId] = useState<string>('std-1');

  // Core Data States (with localStorage persistence)
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem('madrasati_config');
    return saved ? JSON.parse(saved) : initialSchoolConfig;
  });

  const [sessions, setSessions] = useState<TimetableSession[]>(() => {
    const saved = localStorage.getItem('madrasati_sessions');
    return saved ? JSON.parse(saved) : initialTimetableSessions;
  });

  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('madrasati_classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('madrasati_teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [subjects] = useState<Subject[]>(initialSubjects);
  const [rooms] = useState<Room[]>(initialRooms);
  const [timeSlots] = useState<TimeSlot[]>(standardTimeSlots);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('madrasati_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    const saved = localStorage.getItem('madrasati_grades');
    return saved ? JSON.parse(saved) : initialGradeRecords;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('madrasati_attendance');
    return saved ? JSON.parse(saved) : initialAttendanceRecords;
  });

  const [feePayments, setFeePayments] = useState<FeePayment[]>(() => {
    const saved = localStorage.getItem('madrasati_fees');
    return saved ? JSON.parse(saved) : initialFeePayments;
  });

  const [messages, setMessages] = useState<InternalMessage[]>(() => {
    const saved = localStorage.getItem('madrasati_messages');
    return saved ? JSON.parse(saved) : initialInternalMessages;
  });

  const [activities, setActivities] = useState<SchoolActivity[]>(() => {
    const saved = localStorage.getItem('madrasati_activities');
    return saved ? JSON.parse(saved) : initialSchoolActivities;
  });

  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>(() => {
    const saved = localStorage.getItem('madrasati_evaluations');
    return saved ? JSON.parse(saved) : initialTeacherEvaluations;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('madrasati_inventory');
    return saved ? JSON.parse(saved) : initialInventoryItems;
  });

  const [leaveRequests, setLeaveRequests] = useState<TeacherLeaveRequest[]>(() => {
    const saved = localStorage.getItem('madrasati_leave_requests');
    return saved ? JSON.parse(saved) : initialTeacherLeaveRequests;
  });

  // Sync Language and Direction on <html>
  useEffect(() => {
    localStorage.setItem('madrasati_lang', language);
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Sync Theme (Light / Dark / System) on <html>
  useEffect(() => {
    localStorage.setItem('madrasati_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem('madrasati_config', JSON.stringify(schoolConfig));
  }, [schoolConfig]);

  useEffect(() => {
    localStorage.setItem('madrasati_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('madrasati_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('madrasati_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('madrasati_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('madrasati_fees', JSON.stringify(feePayments));
  }, [feePayments]);

  useEffect(() => {
    localStorage.setItem('madrasati_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('madrasati_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('madrasati_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('madrasati_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('madrasati_leave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('madrasati_teachers', JSON.stringify(teachers));
  }, [teachers]);

  const handleAddLeaveRequest = (
    requestData: Omit<TeacherLeaveRequest, 'id' | 'status' | 'requestDate'>
  ) => {
    const newReq: TeacherLeaveRequest = {
      ...requestData,
      id: `leave-${Date.now()}`,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests((prev) => [newReq, ...prev]);

    // Send internal alert message to administration
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const adminAlert: InternalMessage = {
      id: `msg-${Date.now()}`,
      title: `طلب إجازة جديد: ${requestData.teacherName} (${requestData.daysCount} أيام)`,
      body: `تقدم الأستاذ ${requestData.teacherName} بطلب إجازة (${requestData.leaveType}) للفترة من ${requestData.startDate} إلى ${requestData.endDate}. يرجى مراجعة الطلب واعتماده أو رفضه.`,
      senderName: requestData.teacherName,
      senderRole: 'teacher',
      targetAudience: 'all',
      priority: 'urgent',
      date: nowStr,
      isRead: false,
      category: 'system_alert',
    };
    setMessages((prev) => [adminAlert, ...prev]);
  };

  const handleApproveLeaveRequest = (
    requestId: string,
    adminNotes?: string,
    substituteTeacherId?: string
  ) => {
    const targetReq = leaveRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const substituteTeacher = teachers.find((t) => t.id === substituteTeacherId);

    // 1. Update Request
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved' as const,
              reviewedDate: new Date().toISOString().split('T')[0],
              reviewedBy: `${schoolConfig.directorName} (مدير المؤسسة)`,
              adminNotes: adminNotes || 'تمت الموافقة والاعتماد رسمياً.',
              substituteTeacherId,
              substituteTeacherName: substituteTeacher?.name || r.substituteTeacherName,
            }
          : r
      )
    );

    // 2. Generate date range array
    const dates: string[] = [];
    const cur = new Date(targetReq.startDate);
    const end = new Date(targetReq.endDate);
    while (cur <= end) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    // 3. Automatically update Teacher's Availability in system!
    setTeachers((prev) =>
      prev.map((tch) => {
        if (tch.id === targetReq.teacherId) {
          const prevDates = tch.unavailableDates || [];
          const updatedDates = Array.from(new Set([...prevDates, ...dates]));
          return {
            ...tch,
            status: 'on_leave' as const,
            unavailableDates: updatedDates,
            availabilityNote: `في إجازة معتمدة (${targetReq.startDate} إلى ${targetReq.endDate})${
              substituteTeacher ? ` - المستخلف المعين: ${substituteTeacher.name}` : ''
            }`,
            currentLeave: {
              leaveId: targetReq.id,
              leaveType: targetReq.leaveType,
              startDate: targetReq.startDate,
              endDate: targetReq.endDate,
              daysCount: targetReq.daysCount,
              substituteTeacherName: substituteTeacher?.name,
            },
          };
        }
        return tch;
      })
    );

    // 4. Send notification to the Teacher
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const notifyTeacher: InternalMessage = {
      id: `msg-${Date.now()}`,
      title: `الموافقة على طلب الإجازة: ${targetReq.startDate} إلى ${targetReq.endDate}`,
      body: `نحيطكم علماً بأنه تمت الموافقة على طلب إجازتكم للفترة ${targetReq.startDate} إلى ${targetReq.endDate}. تم تحديث سجل التفرغ تلقائياً في النظام.${
        adminNotes ? ` ملاحظة: ${adminNotes}` : ''
      }`,
      senderName: schoolConfig.directorName,
      senderRole: 'director',
      targetAudience: 'teachers',
      targetTeacherId: targetReq.teacherId,
      priority: 'normal',
      date: nowStr,
      isRead: false,
      category: 'administrative',
    };
    setMessages((prev) => [notifyTeacher, ...prev]);
  };

  const handleRejectLeaveRequest = (requestId: string, adminNotes: string) => {
    const targetReq = leaveRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected' as const,
              reviewedDate: new Date().toISOString().split('T')[0],
              reviewedBy: `${schoolConfig.directorName} (مدير المؤسسة)`,
              adminNotes: adminNotes || 'تعذر الاعتماد لضرورة المصلحة التربوية.',
            }
          : r
      )
    );

    // Send notification to Teacher
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const notifyTeacher: InternalMessage = {
      id: `msg-${Date.now()}`,
      title: `قرار بخصوص طلب الإجازة: تعذر الموافقة`,
      body: `نحيطكم علماً بأنه تعذر قبول طلب إجازتكم للفترة ${targetReq.startDate} إلى ${targetReq.endDate}. السبب: ${adminNotes}`,
      senderName: schoolConfig.directorName,
      senderRole: 'director',
      targetAudience: 'teachers',
      targetTeacherId: targetReq.teacherId,
      priority: 'urgent',
      date: nowStr,
      isRead: false,
      category: 'administrative',
    };
    setMessages((prev) => [notifyTeacher, ...prev]);
  };

  const handleAddInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => [item, ...prev]);
  };

  const handleUpdateInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSendMessage = (msg: InternalMessage) => {
    setMessages((prev) => [msg, ...prev]);
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
    );
  };

  const handleMarkAllAsRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
  };

  const handleAddActivity = (act: SchoolActivity) => {
    setActivities((prev) => [act, ...prev]);
  };

  const handleSaveEvaluation = (newEval: TeacherEvaluation) => {
    setEvaluations((prev) => {
      const idx = prev.findIndex((e) => e.id === newEval.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newEval;
        return next;
      }
      return [newEval, ...prev];
    });
  };

  // Timetable Conflict Detection Engine
  const conflicts = useMemo(() => {
    return detectAllConflicts(sessions, teachers, rooms, classes);
  }, [sessions, teachers, rooms, classes]);

  const t = translations[language];

  // Handlers for state updates
  const handleAddSession = (sessionData: Omit<TimetableSession, 'id'>) => {
    const newSession: TimetableSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    setSessions((prev) => [...prev, newSession]);
  };

  const handleUpdateSession = (id: string, sessionData: Omit<TimetableSession, 'id'>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...sessionData, id } : s))
    );
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateGrade = (updatedRecord: GradeRecord) => {
    setGrades((prev) => {
      const idx = prev.findIndex((g) => g.id === updatedRecord.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedRecord;
        return next;
      }
      return [...prev, updatedRecord];
    });
  };

  const handleUpdateAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords((prev) => {
      const updatedMap = new Map(prev.map((r) => [r.id, r]));
      newRecords.forEach((r) => {
        updatedMap.set(r.id, r);
      });
      return Array.from(updatedMap.values());
    });
  };

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newSt: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newSt]);
  };

  const handleAddTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTch: Teacher = {
      ...teacherData,
      id: `tch-${Date.now()}`,
      avatarColor: 'bg-emerald-600',
    };
    setTeachers((prev) => [...prev, newTch]);
  };

  const handleUpdatePayment = (paymentId: string, status: 'paid' | 'pending' | 'overdue', receiptNo?: string) => {
    setFeePayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status,
              receiptNo: receiptNo || p.receiptNo,
              paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : p.paidDate,
            }
          : p
      )
    );
  };

  // Navigation Items according to active role
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'parent') {
      setActiveTab('parent_portal');
    } else if (newRole === 'teacher') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const navItems = useMemo(() => {
    if (role === 'parent') {
      return [
        { id: 'parent_portal', label: language === 'ar' ? 'كشف النقاط والنتائج' : 'Bulletin & Notes', icon: FileSpreadsheet, highlight: true },
        { id: 'parent_attendance', label: language === 'ar' ? 'سجل المواظبة والغيابات' : 'Assiduité & Absences', icon: UserCheck },
        { id: 'parent_schedule', label: language === 'ar' ? 'جدول حصص القسم' : 'Emploi du temps', icon: Calendar },
        { id: 'parent_fees', label: language === 'ar' ? 'الرسوم المدرسية والأقساط' : 'Frais & Quittances', icon: CreditCard },
      ];
    }

    const pendingLeavesCount = leaveRequests.filter((r) => r.status === 'pending').length;

    if (role === 'teacher') {
      const myPendingLeaves = leaveRequests.filter(
        (r) => r.teacherId === activeTeacherId && r.status === 'pending'
      ).length;

      return [
        { id: 'dashboard', label: language === 'ar' ? 'لوحة تحكم الأستاذ' : 'Tableau de bord', icon: LayoutDashboard },
        { id: 'timetables', label: language === 'ar' ? 'جدول حصصي الأسبوعي' : 'Mon Emploi du temps', icon: Calendar, badge: conflicts.length > 0 ? conflicts.length : null },
        { id: 'gradebook', label: language === 'ar' ? 'دفتر النقاط والتقويم' : 'Carnet de notes', icon: FileSpreadsheet },
        { id: 'attendance', label: language === 'ar' ? 'تسجيل الغياب اليومي' : 'Appel du jour', icon: UserCheck },
        { id: 'ai_exam', label: language === 'ar' ? 'مولد الفروض الذكي (AI)' : 'Générateur de devoirs', icon: Sparkles, highlight: true },
        {
          id: 'teacher_leaves',
          label: language === 'ar' ? 'طلبات الإجازة والتفرغ' : 'Congés & Absences',
          icon: FileText,
          badge: myPendingLeaves > 0 ? myPendingLeaves : null,
        },
        { id: 'curriculum', label: language === 'ar' ? 'المنهاج وشجرة المواد' : 'Programmes & Matières', icon: Layers },
        { id: 'classes_students', label: language === 'ar' ? 'تلاميذ أقسامي' : 'Mes Élèves', icon: Users },
        { id: 'inventory', label: language === 'ar' ? 'الوسائل والمكتبة' : 'Matériel & Inventaire', icon: Package },
      ];
    }

    // Default Admin Navigation Items
    const maintenanceAlertsCount = inventory.filter(
      (i) => i.condition === 'needs_maintenance' || i.condition === 'under_repair'
    ).length;

    return [
      { id: 'dashboard', label: t.nav_dashboard, icon: LayoutDashboard },
      { id: 'timetables', label: t.nav_timetables, icon: Calendar, badge: conflicts.length > 0 ? conflicts.length : null },
      { id: 'gradebook', label: t.nav_gradebook, icon: FileSpreadsheet },
      { id: 'attendance', label: t.nav_attendance, icon: UserCheck },
      { id: 'ai_exam', label: t.nav_ai_exam, icon: Sparkles, highlight: true },
      { id: 'classes_students', label: t.nav_classes_students, icon: Users },
      {
        id: 'teachers',
        label: t.nav_teachers,
        icon: GraduationCap,
        badge: pendingLeavesCount > 0 ? pendingLeavesCount : null,
      },
      { id: 'curriculum', label: t.nav_curriculum, icon: Layers },
      {
        id: 'inventory',
        label: language === 'ar' ? 'جرد التجهيزات والمخزون' : 'Inventaire & Équipements',
        icon: Package,
        badge: maintenanceAlertsCount > 0 ? maintenanceAlertsCount : null,
      },
      { id: 'fees', label: t.nav_fees, icon: CreditCard },
      { id: 'settings', label: t.nav_settings, icon: Settings },
    ];
  }, [role, conflicts.length, t, language, inventory, leaveRequests, activeTeacherId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navigation Bar */}
      <Navbar
        schoolConfig={schoolConfig}
        language={language}
        onLanguageChange={setLanguage}
        role={role}
        onRoleChange={handleRoleChange}
        conflictCount={conflicts.length}
        onOpenConflictsModal={() => setIsConflictModalOpen(true)}
        onQuickAiExam={() => setActiveTab('ai_exam')}
        messages={messages}
        classes={classes}
        teachers={teachers}
        theme={theme}
        onThemeChange={setTheme}
        onSendMessage={handleSendMessage}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* Role Context Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-2xs py-2 px-4 sm:px-8 text-xs font-medium no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {role === 'admin' && (
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-900 dark:text-white">فضاء الإدارة العامة:</span>
              <span>تحكم كامل في كافة الأطوار، جداول التوقيت والتعارضات، تقييم الأساتذة الدوري، والأنشطة المدرسية.</span>
            </div>
          )}

          {role === 'teacher' && (
            <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-slate-300 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="font-bold text-purple-900 dark:text-purple-300">فضاء الأستاذ:</span>
                <span>أهلاً بك، أستاذ(ة):</span>
              </div>
              <select
                value={activeTeacherId}
                onChange={(e) => setActiveTeacherId(e.target.value)}
                className="bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-lg px-2.5 py-1 text-xs font-bold text-purple-900 dark:text-purple-300 focus:ring-2 focus:ring-purple-400 cursor-pointer"
              >
                {teachers.map((tch) => (
                  <option key={tch.id} value={tch.id}>
                    {tch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === 'parent' && (
            <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-slate-300 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="font-bold text-blue-900 dark:text-blue-300">فضاء الولي / التلميذ:</span>
                <span>متابعة التلميذ(ة):</span>
              </div>
              <select
                value={activeParentStudentId}
                onChange={(e) => setActiveParentStudentId(e.target.value)}
                className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 text-xs font-bold text-blue-900 dark:text-blue-300 focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.grade} - {st.regNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
            {schoolConfig.academicYear} | {language === 'ar' ? schoolConfig.nameAr : schoolConfig.nameFr}
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Mobile Navigation Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">القائمة الرئيسية:</span>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`lg:w-64 shrink-0 no-print ${
            isMobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 sticky top-22">
            
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'الوحدات التعليمية' : 'Modules'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                        : 'bg-emerald-600 text-white shadow-xs'
                      : item.highlight
                      ? 'text-indigo-900 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100/80'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-bold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Helper Badge */}
            <div className="pt-4 px-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 text-start space-y-1">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                  {language === 'ar' ? 'حالة النظام' : 'État du système'}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {conflicts.length === 0
                    ? (language === 'ar' ? 'الجداول متوافقة كلياً' : 'Aucun conflit détecté')
                    : `${conflicts.length} ${language === 'ar' ? 'تضارب بحاجة للمراجعة' : 'conflits à résoudre'}`}
                </p>
              </div>
            </div>

          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0">
          
          {(role === 'parent' || activeTab.startsWith('parent_')) ? (
            <ParentPortalView
              students={students}
              classes={classes}
              subjects={subjects}
              grades={grades}
              attendanceRecords={attendanceRecords}
              feePayments={feePayments}
              sessions={sessions}
              timeSlots={timeSlots}
              schoolConfig={schoolConfig}
              language={language}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  classes={classes}
                  teachers={teachers}
                  students={students}
                  conflicts={conflicts}
                  attendanceRecords={attendanceRecords}
                  feePayments={feePayments}
                  subjects={subjects}
                  grades={grades}
                  sessions={sessions}
                  activities={activities}
                  evaluations={evaluations}
                  inventory={inventory}
                  leaveRequests={leaveRequests}
                  role={role}
                  activeTeacherId={activeTeacherId}
                  schoolConfig={schoolConfig}
                  language={language}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenConflictsModal={() => setIsConflictModalOpen(true)}
                  onAddActivity={handleAddActivity}
                  onSaveEvaluation={handleSaveEvaluation}
                  onNavigateToLeaves={() => setActiveTab(role === 'teacher' ? 'teacher_leaves' : 'teachers')}
                />
              )}

              {activeTab === 'timetables' && (
                <TimetablesView
                  sessions={sessions}
                  conflicts={conflicts}
                  classes={classes}
                  teachers={teachers}
                  subjects={subjects}
                  rooms={rooms}
                  timeSlots={timeSlots}
                  language={language}
                  schoolConfig={schoolConfig}
                  onAddSession={handleAddSession}
                  onUpdateSession={handleUpdateSession}
                  onDeleteSession={handleDeleteSession}
                  onOpenConflictsModal={() => setIsConflictModalOpen(true)}
                />
              )}

              {activeTab === 'gradebook' && (
                <GradebookView
                  grades={grades}
                  classes={classes}
                  subjects={subjects}
                  students={students}
                  language={language}
                  schoolConfig={schoolConfig}
                  onUpdateGrade={handleUpdateGrade}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceView
                  attendanceRecords={attendanceRecords}
                  classes={classes}
                  students={students}
                  language={language}
                  schoolConfig={schoolConfig}
                  onUpdateAttendance={handleUpdateAttendance}
                />
              )}

              {activeTab === 'ai_exam' && (
                <AIExamGeneratorView
                  language={language}
                  schoolConfig={schoolConfig}
                />
              )}

              {activeTab === 'classes_students' && (
                <ClassesStudentsView
                  classes={classes}
                  students={students}
                  language={language}
                  onAddStudent={handleAddStudent}
                  onAddClass={(cls) => setClasses((prev) => [...prev, { ...cls, id: `cls-${Date.now()}` }])}
                />
              )}

              {activeTab === 'teachers' && (
                <TeachersView
                  teachers={teachers}
                  subjects={subjects}
                  classes={classes}
                  language={language}
                  evaluations={evaluations}
                  schoolConfig={schoolConfig}
                  leaveRequests={leaveRequests}
                  userRole={role}
                  activeTeacherId={activeTeacherId}
                  onAddTeacher={handleAddTeacher}
                  onNavigateToTeacherTimetable={(teacherId) => {
                    setActiveTab('timetables');
                  }}
                  onSaveEvaluation={handleSaveEvaluation}
                  onAddLeaveRequest={handleAddLeaveRequest}
                  onApproveLeaveRequest={handleApproveLeaveRequest}
                  onRejectLeaveRequest={handleRejectLeaveRequest}
                />
              )}

              {activeTab === 'teacher_leaves' && (
                <TeacherLeaveRequestsManager
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  leaveRequests={leaveRequests}
                  language={language}
                  schoolConfig={schoolConfig}
                  userRole={role}
                  activeTeacherId={activeTeacherId}
                  onAddLeaveRequest={handleAddLeaveRequest}
                  onApproveLeaveRequest={handleApproveLeaveRequest}
                  onRejectLeaveRequest={handleRejectLeaveRequest}
                />
              )}

              {activeTab === 'curriculum' && (
                <CascadingLevelsManager />
              )}

              {activeTab === 'fees' && (
                <FeesPaymentsView
                  feePayments={feePayments}
                  students={students}
                  classes={classes}
                  language={language}
                  schoolConfig={schoolConfig}
                  onUpdatePayment={handleUpdatePayment}
                />
              )}

              {activeTab === 'inventory' && (
                <SchoolInventoryView
                  inventory={inventory}
                  classes={classes}
                  teachers={teachers}
                  students={students}
                  language={language}
                  schoolConfig={schoolConfig}
                  onAddItem={handleAddInventoryItem}
                  onUpdateItem={handleUpdateInventoryItem}
                  onDeleteItem={handleDeleteInventoryItem}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  schoolConfig={schoolConfig}
                  language={language}
                  theme={theme}
                  onSaveConfig={setSchoolConfig}
                  onThemeChange={setTheme}
                />
              )}
            </>
          )}

        </main>

      </div>

      {/* Global Timetable Conflicts Modal */}
      <TimetableConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflicts={conflicts}
        language={language}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
        classes={classes}
        onDeleteSession={(sId) => {
          handleDeleteSession(sId);
        }}
      />

    </div>
  );
}
