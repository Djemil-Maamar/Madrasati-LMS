import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  History,
  Printer,
  Save,
  Search,
  User,
  UserCheck,
  UserX,
  XCircle,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  ClassItem,
  Student,
  Language,
  SchoolConfig,
} from '../types';
import { translations } from '../i18n/translations';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  classes: ClassItem[];
  students: Student[];
  language: Language;
  schoolConfig: SchoolConfig;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  classes,
  students,
  language,
  schoolConfig,
  onUpdateAttendance,
}) => {
  const t = translations[language];

  // Active Tab: 'roll_call' | 'student_history'
  const [activeTab, setActiveTab] = useState<'roll_call' | 'student_history'>('roll_call');

  // Roll call filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('الفترة الصباحية');

  // Student history filter
  const [historyStudentId, setHistoryStudentId] = useState<string>(students[0]?.id || '');

  // Print Modals
  const [isPrintClassRecordModalOpen, setIsPrintClassRecordModalOpen] = useState(false);
  const [isPrintStudentModalOpen, setIsPrintStudentModalOpen] = useState(false);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  // Local draft of roll call for today
  const [draftRecords, setDraftRecords] = useState<Record<string, AttendanceRecord>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);


  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Synchronize or initialize draft records for current class/date/period
  useMemo(() => {
    const existing = attendanceRecords.filter(
      (r) =>
        r.classId === selectedClassId &&
        r.date === selectedDate &&
        r.period === selectedPeriod
    );

    const map: Record<string, AttendanceRecord> = {};
    classStudents.forEach((student) => {
      const found = existing.find((r) => r.studentId === student.id);
      if (found) {
        map[student.id] = { ...found };
      } else {
        map[student.id] = {
          id: `att-${Date.now()}-${student.id}`,
          studentId: student.id,
          classId: selectedClassId,
          date: selectedDate,
          period: selectedPeriod,
          status: 'present',
        };
      }
    });

    setDraftRecords(map);
  }, [selectedClassId, selectedDate, selectedPeriod, classStudents, attendanceRecords]);

  // Status changer for single student
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          id: `att-${Date.now()}-${studentId}`,
          studentId,
          classId: selectedClassId,
          date: selectedDate,
          period: selectedPeriod,
        }),
        status,
        tardyMinutes: status === 'tardy' ? (prev[studentId]?.tardyMinutes || 10) : undefined,
      },
    }));
  };

  const handleTardyMinutesChange = (studentId: string, minutes: number) => {
    setDraftRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        tardyMinutes: minutes,
      },
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setDraftRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    setDraftRecords((prev) => {
      const next = { ...prev };
      classStudents.forEach((st) => {
        next[st.id] = {
          ...next[st.id],
          status: 'present',
          reason: undefined,
          tardyMinutes: undefined,
        };
      });
      return next;
    });
  };

  const handleSaveRollCall = () => {
    const newRecordsList = Object.values(draftRecords);
    onUpdateAttendance(newRecordsList);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Student history calculation
  const selectedHistoryStudent = students.find((s) => s.id === historyStudentId);
  const studentHistoryRecords = useMemo(() => {
    return attendanceRecords
      .filter((r) => r.studentId === historyStudentId && r.status !== 'present')
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, historyStudentId]);

  const studentStats = useMemo(() => {
    const all = attendanceRecords.filter((r) => r.studentId === historyStudentId);
    const totalRecorded = all.length || 1;
    const absencesUnjustified = all.filter((r) => r.status === 'absent_unjustified').length;
    const absencesJustified = all.filter((r) => r.status === 'absent_justified').length;
    const tardies = all.filter((r) => r.status === 'tardy').length;
    const presents = all.filter((r) => r.status === 'present').length;

    const rate = Math.round((presents / totalRecorded) * 100);

    return {
      totalRecorded,
      absencesUnjustified,
      absencesJustified,
      totalAbsences: absencesUnjustified + absencesJustified,
      tardies,
      attendanceRate: Math.max(0, Math.min(100, rate)),
    };
  }, [attendanceRecords, historyStudentId]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.attendance_title}</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t.attendance_desc}</p>
        </div>

        {/* Controls & Tab switch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Print/Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setPrintMenuOpen(!printMenuOpen)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ar' ? 'طباعة وتصدير (PDF)' : 'Imprimer / Exporter'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {printMenuOpen && (
              <div className="absolute end-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 text-xs font-bold">
                <button
                  onClick={() => {
                    setIsPrintClassRecordModalOpen(true);
                    setPrintMenuOpen(false);
                  }}
                  className="w-full text-start px-4 py-2.5 hover:bg-purple-50 text-slate-800 hover:text-purple-700 flex items-center gap-2 cursor-pointer transition"
                >
                  <FileText className="w-4 h-4 text-purple-600" />
                  <div>
                    <div>{language === 'ar' ? 'سجل حضور وغياب القسم اليومي' : 'Feuille d\'appel de la classe'}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {language === 'ar' ? 'تقرير مناداة الحصة اليومية للفوج' : 'Pour toute la classe'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsPrintStudentModalOpen(true);
                    setPrintMenuOpen(false);
                  }}
                  className="w-full text-start px-4 py-2.5 hover:bg-purple-50 text-slate-800 hover:text-purple-700 flex items-center gap-2 cursor-pointer transition border-t border-slate-100"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div>{language === 'ar' ? 'شهادة / كشف مواظبة وغيابات فردية' : 'Fiche d\'assiduité individuelle'}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {language === 'ar' ? 'السجل الفردي الكامل لتلميذ محدد' : 'Par élève sélectionné'}
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('roll_call')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roll_call'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{t.recordToday}</span>
            </button>
            <button
              onClick={() => setActiveTab('student_history')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'student_history'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t.studentHistory}</span>
            </button>
          </div>
        </div>
      </div>


      {/* TAB 1: Roll Call Mode */}
      {activeTab === 'roll_call' && (
        <div className="space-y-6">
          
          {/* Controls Ribbon */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectClass}</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.date}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{language === 'ar' ? 'الفترة' : 'Période'}</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
              >
                <option value="الفترة الصباحية">{language === 'ar' ? 'الفترة الصباحية (08:00 - 12:00)' : 'Matinée'}</option>
                <option value="الفترة المسائية">{language === 'ar' ? 'الفترة المسائية (13:30 - 16:30)' : 'Après-midi'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.markAllPresent}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRollCall}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.save}</span>
              </button>
            </div>

          </div>

          {/* Roll Call Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {selectedClass?.name} - {selectedDate} ({selectedPeriod})
              </span>
              {saveSuccess && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.success}</span>
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold text-slate-700">
                    <th className="p-3 text-start w-16">#</th>
                    <th className="p-3 text-start min-w-[180px]">{language === 'ar' ? 'التلميذ(ة)' : 'Élève'}</th>
                    <th className="p-3 text-center min-w-[320px]">{t.status}</th>
                    <th className="p-3 text-start min-w-[200px]">{t.absenceReason}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-medium">
                  {classStudents.map((student, idx) => {
                    const rec = draftRecords[student.id];
                    const currentStatus = rec?.status || 'present';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition">
                        
                        <td className="p-3 text-slate-400 font-semibold">{idx + 1}</td>

                        <td className="p-3">
                          <div className="font-bold text-slate-900">{student.fullName}</div>
                          <div className="text-[11px] text-slate-400">{student.regNumber}</div>
                        </td>

                        {/* Status pills selector */}
                        <td className="p-3">
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'present')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>{t.present}</span>
                            </button>

                            {/* Absent Unjustified */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'absent_unjustified')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'absent_unjustified'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              <span>{t.absent_unjustified}</span>
                            </button>

                            {/* Absent Justified */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'absent_justified')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'absent_justified'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>{t.absent_justified}</span>
                            </button>

                            {/* Tardy */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'tardy')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'tardy'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{t.tardy}</span>
                            </button>

                          </div>
                        </td>

                        {/* Reason / Tardy Minutes Input */}
                        <td className="p-3">
                          {currentStatus === 'tardy' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[11px] font-bold">تأخر:</span>
                              <input
                                type="number"
                                min="1"
                                max="120"
                                value={rec?.tardyMinutes || 10}
                                onChange={(e) =>
                                  handleTardyMinutesChange(
                                    student.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                              />
                              <span className="text-slate-500 text-[11px]">دقيقة</span>
                            </div>
                          ) : currentStatus !== 'present' ? (
                            <input
                              type="text"
                              value={rec?.reason || ''}
                              onChange={(e) => handleReasonChange(student.id, e.target.value)}
                              placeholder="سبب الغياب أو رقم المبرر..."
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-purple-500"
                            />
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Student Attendance History Sheet */}
      {activeTab === 'student_history' && (
        <div className="space-y-6">
          
          {/* Student Selector Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-0.5">
                  {language === 'ar' ? 'اختر التلميذ لمعاينة سجل حضوره' : 'Sélectionner l\'élève'}
                </label>
                <select
                  value={historyStudentId}
                  onChange={(e) => setHistoryStudentId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 min-w-[260px]"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.grade} - {st.regNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.print}</span>
            </button>
          </div>

          {/* Student Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-medium">{t.attendanceRate}</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{studentStats.attendanceRate}%</div>
              <div className="text-[11px] text-slate-400">مواظبة عامة</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-medium">{t.totalAbsences}</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{studentStats.totalAbsences}</div>
              <div className="text-[11px] text-slate-400">حصة غياب</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-medium">{t.justifiedCount} / {t.unjustifiedCount}</div>
              <div className="text-xl font-black text-amber-600 mt-1">
                {studentStats.absencesJustified} <span className="text-xs text-slate-400">مبررة</span> / {studentStats.absencesUnjustified} <span className="text-xs text-red-500 font-bold">غير مبررة</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-xs text-slate-500 font-medium">{t.totalTardies}</div>
              <div className="text-2xl font-black text-purple-600 mt-1">{studentStats.tardies}</div>
              <div className="text-[11px] text-slate-400">مرات تأخر</div>
            </div>
          </div>

          {/* Chronological History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'السجل التفصيلي للغيابات والتأخرات المسجلة' : 'Historique détaillé'}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {selectedHistoryStudent?.fullName} ({selectedHistoryStudent?.regNumber})
              </span>
            </div>

            {studentHistoryRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-bold text-slate-800">
                  {language === 'ar' ? 'سجل نظيف! لا توجد غيابات أو تأخرات مسجلة لهذا التلميذ.' : 'Aucune absence enregistrée.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-3 text-start w-28">{t.date}</th>
                      <th className="p-3 text-start w-36">{language === 'ar' ? 'الفترة' : 'Période'}</th>
                      <th className="p-3 text-start w-40">{t.status}</th>
                      <th className="p-3 text-start">{t.absenceReason}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {studentHistoryRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-bold text-slate-900">{item.date}</td>
                        <td className="p-3 text-slate-600">{item.period}</td>
                        <td className="p-3">
                          {item.status === 'absent_unjustified' && (
                            <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-800 font-bold">
                              {t.absent_unjustified}
                            </span>
                          )}
                          {item.status === 'absent_justified' && (
                            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold">
                              {t.absent_justified}
                            </span>
                          )}
                          {item.status === 'tardy' && (
                            <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-bold">
                              {t.tardy} ({item.tardyMinutes || 10} دقيقة)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-700">{item.reason || 'لا يوجد مبرر مدون'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Official Full Class Daily Attendance Record Modal (سجل حضور وغياب القسم اليومي) */}
      {isPrintClassRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/70 no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>{language === 'ar' ? 'سجل الحضور والغياب اليومي للقسم (PDF)' : 'Feuille d\'appel journalière'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'طباعة / تصدير PDF' : 'Imprimer PDF'}</span>
                </button>
                <button
                  onClick={() => setIsPrintClassRecordModalOpen(false)}
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
                    سجل مناداة وحضور وغياب التلاميذ
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{t.academicYearLabel}: </span>
                    {schoolConfig.academicYear}
                  </div>
                </div>
              </div>

              {/* Attendance Sheet Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">القسم / الفوج:</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedClass?.name}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">التاريخ:</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedDate}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">الفترة / التوقيت:</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedPeriod}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">عدد التلاميذ:</span>
                  <div className="font-bold text-slate-900 text-sm">{classStudents.length} تلميذ</div>
                </div>
              </div>

              {/* Class Roll Call Table */}
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-10">#</th>
                    <th className="border border-slate-300 p-2 text-start">اسم ولقب التلميذ</th>
                    <th className="border border-slate-300 p-2 text-center w-28">رقم التسجيل</th>
                    <th className="border border-slate-300 p-2 text-center w-28">وضعية الحضور</th>
                    <th className="border border-slate-300 p-2 text-start">الملاحظات والمبررات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {classStudents.map((student, idx) => {
                    const rec = draftRecords[student.id];
                    const currentStatus = rec?.status || 'present';
                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center text-slate-500 font-bold">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-bold text-slate-900">{student.fullName}</td>
                        <td className="border border-slate-300 p-2 text-center text-slate-600">{student.regNumber}</td>
                        <td className="border border-slate-300 p-2 text-center">
                          {currentStatus === 'present' && (
                            <span className="font-bold text-emerald-700">حاضر(ة)</span>
                          )}
                          {currentStatus === 'absent_unjustified' && (
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">غائب غير مبرر</span>
                          )}
                          {currentStatus === 'absent_justified' && (
                            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">غائب مبرر</span>
                          )}
                          {currentStatus === 'tardy' && (
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                              تأخر ({rec?.tardyMinutes || 10} د)
                            </span>
                          )}
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-700 text-[11px]">
                          {rec?.reason || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Attendance Statistics Summary Footer */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <span>
                  <strong>الحاضرون:</strong> {classStudents.filter(s => (draftRecords[s.id]?.status || 'present') === 'present').length}
                </span>
                <span>
                  <strong>الغيابات:</strong> {classStudents.filter(s => ['absent_unjustified', 'absent_justified'].includes(draftRecords[s.id]?.status || '')).length}
                </span>
                <span>
                  <strong>التأخرات:</strong> {classStudents.filter(s => (draftRecords[s.id]?.status || '') === 'tardy').length}
                </span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-700 mb-8">الأستاذ(ة) / المؤطر الحاضر:</div>
                  <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
                </div>
                <div>
                  <div className="font-bold text-slate-700 mb-8">مساعد التربية / ناظر المؤسسة:</div>
                  <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Official Individual Student Attendance Record Modal (شهادة / كشف مواظبة وغيابات فردية) */}
      {isPrintStudentModalOpen && selectedHistoryStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/70 no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'كشف المواظبة والسلوك الفردي (PDF)' : 'Fiche d\'assiduité individuelle'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'طباعة / تصدير PDF' : 'Imprimer PDF'}</span>
                </button>
                <button
                  onClick={() => setIsPrintStudentModalOpen(false)}
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
                    شهادة وكشف مواظبة وغيابات التلميذ(ة)
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
                  <div className="text-slate-500 font-medium">اسم ولقب التلميذ:</div>
                  <div className="text-sm font-bold text-slate-900">{selectedHistoryStudent.fullName}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">القسم:</div>
                  <div className="text-sm font-bold text-slate-900">{selectedClass?.name || selectedHistoryStudent.grade}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">رقم التسجيل:</div>
                  <div className="text-sm font-bold text-slate-900">{selectedHistoryStudent.regNumber}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">تاريخ الميلاد:</div>
                  <div className="text-sm font-bold text-slate-900">{selectedHistoryStudent.birthDate}</div>
                </div>
              </div>

              {/* Attendance Rate & Summary KPIs */}
              <div className="grid grid-cols-4 gap-3 bg-purple-50/70 p-4 rounded-xl border border-purple-200 text-center">
                <div>
                  <div className="text-[11px] text-purple-700 font-semibold">نسبة المواظبة</div>
                  <div className="text-xl font-black text-purple-900">{studentStats.attendanceRate}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-purple-700 font-semibold">مجموع الغيابات</div>
                  <div className="text-xl font-black text-slate-800">{studentStats.totalAbsences}</div>
                </div>
                <div>
                  <div className="text-[11px] text-purple-700 font-semibold">غيابات غير مبررة</div>
                  <div className="text-xl font-black text-red-600">{studentStats.absencesUnjustified}</div>
                </div>
                <div>
                  <div className="text-[11px] text-purple-700 font-semibold">مرات التأخر</div>
                  <div className="text-xl font-black text-amber-700">{studentStats.tardies}</div>
                </div>
              </div>

              {/* Records Breakdown */}
              <h5 className="font-bold text-xs text-slate-800 pt-2">جدول الوقائع المسجلة:</h5>
              {studentHistoryRecords.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700">لم تسجل أي غيابات أو تأخرات على التلميذ حتى تاريخ اليوم.</p>
                </div>
              ) : (
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className="border border-slate-300 p-2 text-center w-28">التاريخ</th>
                      <th className="border border-slate-300 p-2 text-center w-32">الفترة</th>
                      <th className="border border-slate-300 p-2 text-center w-36">الوضعية</th>
                      <th className="border border-slate-300 p-2 text-start">السبب / المبرر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-medium">
                    {studentHistoryRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center font-bold">{item.date}</td>
                        <td className="border border-slate-300 p-2 text-center text-slate-600">{item.period}</td>
                        <td className="border border-slate-300 p-2 text-center">
                          {item.status === 'absent_unjustified' && (
                            <span className="text-red-700 font-bold">غياب غير مبرر</span>
                          )}
                          {item.status === 'absent_justified' && (
                            <span className="text-amber-700 font-bold">غياب مبرر</span>
                          )}
                          {item.status === 'tardy' && (
                            <span className="text-purple-700 font-bold">تأخر ({item.tardyMinutes || 10} د)</span>
                          )}
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-700">{item.reason || 'لا يوجد مبرر'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Remarks & Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-700 mb-8">مستشار التربية:</div>
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


    </div>
  );
};
