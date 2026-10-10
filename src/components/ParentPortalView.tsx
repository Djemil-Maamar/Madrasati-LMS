import React, { useState, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  UserCheck,
  CreditCard,
  Printer,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronDown,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  Student,
  ClassItem,
  Subject,
  GradeRecord,
  AttendanceRecord,
  FeePayment,
  TimetableSession,
  TimeSlot,
  SchoolConfig,
  Language,
} from '../types';
import { translations } from '../i18n/translations';
import { computeClassTermSummary, getAppreciation } from '../utils/gradeCalculations';

interface ParentPortalViewProps {
  students: Student[];
  classes: ClassItem[];
  subjects: Subject[];
  grades: GradeRecord[];
  attendanceRecords: AttendanceRecord[];
  feePayments: FeePayment[];
  sessions: TimetableSession[];
  timeSlots: TimeSlot[];
  schoolConfig: SchoolConfig;
  language: Language;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  students,
  classes,
  subjects,
  grades,
  attendanceRecords,
  feePayments,
  sessions,
  timeSlots,
  schoolConfig,
  language,
}) => {
  const t = translations[language];

  // Active child selector
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'schedule' | 'fees'>('grades');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentClass = classes.find((c) => c.id === currentStudent?.classId);

  // Calculate student grades & ranking for the selected term
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter((s) => s.classId === currentClass.id);
  }, [students, currentClass]);

  const classSummaries = useMemo(() => {
    return computeClassTermSummary(classStudents, grades, subjects, selectedTerm);
  }, [classStudents, grades, subjects, selectedTerm]);

  const studentSummary = useMemo(() => {
    return classSummaries.find((cs) => cs.student.id === currentStudent?.id);
  }, [classSummaries, currentStudent]);

  // Attendance stats for this student
  const studentAttendanceList = useMemo(() => {
    if (!currentStudent) return [];
    return attendanceRecords.filter((r) => r.studentId === currentStudent.id);
  }, [attendanceRecords, currentStudent]);

  const totalAbsences = studentAttendanceList.filter((r) => r.status.includes('absent')).length;
  const justifiedAbsences = studentAttendanceList.filter((r) => r.status === 'absent_justified').length;
  const totalTardies = studentAttendanceList.filter((r) => r.status === 'tardy').length;
  const totalRecorded = studentAttendanceList.length || 1;
  const presents = studentAttendanceList.filter((r) => r.status === 'present').length;
  const attendanceRate = Math.round((presents / totalRecorded) * 100) || 96;

  // Student fees
  const studentFees = useMemo(() => {
    if (!currentStudent) return [];
    return feePayments.filter((f) => f.studentId === currentStudent.id);
  }, [feePayments, currentStudent]);

  // Student class timetable sessions
  const studentTimetable = useMemo(() => {
    if (!currentClass) return [];
    return sessions.filter((s) => s.classId === currentClass.id);
  }, [sessions, currentClass]);

  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;
  const getSubject = (sid: string) => subjects.find((s) => s.id === sid);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner: Child Switcher & Student Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>فضاء أولياء الأمور والتلاميذ الموحد</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentStudent?.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200/90 mt-1 font-medium">
                <span>القسم: <b className="text-white">{currentClass?.name}</b></span>
                <span>•</span>
                <span>رقم التسجيل: <b className="text-white font-mono">{currentStudent?.regNumber}</b></span>
                <span>•</span>
                <span>تاريخ الميلاد: <b className="text-white">{currentStudent?.birthDate}</b></span>
              </div>
            </div>
          </div>

          {/* Child Switcher Dropdown */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2 min-w-[260px]">
            <label className="block text-[11px] font-bold text-emerald-200">
              تبديل التلميذ / الابن(ة):
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-900/80 text-white border border-white/30 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id} className="bg-slate-800 text-white">
                  {st.fullName} ({st.grade} - {st.regNumber})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('grades')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'grades'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>كشف النقاط والنتائج</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>سجل المواظبة والغيابات</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>جدول حصص القسم</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'fees'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>الرسوم ووصولات الدفع</span>
        </button>
      </div>

      {/* TAB 1: GRADES & REPORT CARD */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          
          {/* Term Selector & General Average Ribbon */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">الفصل الدراسي:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSelectedTerm('T1')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    selectedTerm === 'T1' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  الفصل الأول
                </button>
                <button
                  onClick={() => setSelectedTerm('T2')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    selectedTerm === 'T2' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  الفصل الثاني
                </button>
                <button
                  onClick={() => setSelectedTerm('T3')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    selectedTerm === 'T3' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  الفصل الثالث
                </button>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف النقاط الرسمي</span>
            </button>
          </div>

          {/* Quick Metrics */}
          {studentSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">المعدل العام الفصلي</span>
                <div className="text-3xl font-black text-emerald-700">
                  {studentSummary.generalAverage.toFixed(2)} <span className="text-sm text-slate-400">/ 20</span>
                </div>
                <div className="text-xs font-bold text-emerald-800 mt-1">
                  {studentSummary.appreciation}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">الرتبة في القسم</span>
                <div className="text-3xl font-black text-indigo-700">
                  {studentSummary.rank} <span className="text-sm text-slate-400">من {classStudents.length}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {studentSummary.generalAverage >= 10 ? 'ناجح بملاحظة ممتازة' : 'بحاجة لجهد أكبر'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                <span className="text-xs text-slate-500 font-bold block mb-1">مجموع النقاط والمعاملات</span>
                <div className="text-3xl font-black text-slate-800">
                  {studentSummary.totalPoints}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  مجموع المعاملات: {studentSummary.totalCoefficients}
                </div>
              </div>
            </div>
          )}

          {/* Subject Grades Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">
                جدول تفصيل نقاط المواد - {selectedTerm === 'T1' ? 'الفصل الأول' : selectedTerm === 'T2' ? 'الفصل الثاني' : 'الفصل الثالث'}
              </h3>
              <span className="text-xs text-slate-500 font-medium">{schoolConfig.academicYear}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 font-bold text-slate-700">
                    <th className="p-3 text-start">المادة</th>
                    <th className="p-3 text-center">التقويم المستمر</th>
                    <th className="p-3 text-center">الفرض 1</th>
                    <th className="p-3 text-center">الاختبار</th>
                    <th className="p-3 text-center">معدل المادة</th>
                    <th className="p-3 text-center">المعامل</th>
                    <th className="p-3 text-center">المجموع</th>
                    <th className="p-3 text-start">ملاحظة وتقدير الأستاذ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentSummary?.subjectGrades.map((item) => (
                    <tr key={item.subject.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-900">{item.subject.nameAr}</td>
                      <td className="p-3 text-center">{item.record ? item.record.continuousAssessment : '-'}</td>
                      <td className="p-3 text-center">{item.record ? item.record.quiz1 : '-'}</td>
                      <td className="p-3 text-center">{item.record ? item.record.exam : '-'}</td>
                      <td className="p-3 text-center">
                        {item.average !== null ? (
                          <span
                            className={`px-2 py-0.5 rounded-lg font-bold ${
                              item.average >= 10
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.average.toFixed(2)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-600">{item.subject.coefficient}</td>
                      <td className="p-3 text-center font-bold text-emerald-800">
                        {item.weightedTotal !== null ? item.weightedTotal.toFixed(2) : '-'}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.average !== null ? getAppreciation(item.average, language) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ATTENDANCE & DISCIPLINE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs text-slate-500 font-bold block mb-1">نسبة المواظبة</span>
              <div className="text-2xl font-black text-emerald-600">{attendanceRate}%</div>
              <span className="text-[11px] text-emerald-700">معدل الحضور العام</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي الغيابات</span>
              <div className="text-2xl font-black text-slate-800">{totalAbsences}</div>
              <span className="text-[11px] text-slate-400">حصص مسجلة</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs text-slate-500 font-bold block mb-1">الغيابات المبررة</span>
              <div className="text-2xl font-black text-amber-600">{justifiedAbsences}</div>
              <span className="text-[11px] text-amber-700">شهادات طبية وإشعارات</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs text-slate-500 font-bold block mb-1">مرات التأخر</span>
              <div className="text-2xl font-black text-purple-600">{totalTardies}</div>
              <span className="text-[11px] text-purple-700">تأخر صباحي / مسائي</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">السجل الزمني للغيابات والتأخرات</h3>
              <span className="text-xs text-slate-500">{currentStudent?.fullName}</span>
            </div>

            {studentAttendanceList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-bold text-slate-800">
                  سجل نظيف تماماً! لا توجد غيابات مسجلة لهذا التلميذ.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-3 text-start">التاريخ</th>
                      <th className="p-3 text-start">الفترة</th>
                      <th className="p-3 text-start">الحالة</th>
                      <th className="p-3 text-start">التبرير / الملاحظة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {studentAttendanceList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{item.date}</td>
                        <td className="p-3 text-slate-600">{item.period}</td>
                        <td className="p-3">
                          {item.status === 'present' && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              حاضر
                            </span>
                          )}
                          {item.status === 'absent_unjustified' && (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold">
                              غائب غير مبرر
                            </span>
                          )}
                          {item.status === 'absent_justified' && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                              غائب مبرر
                            </span>
                          )}
                          {item.status === 'tardy' && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                              متأخر ({item.tardyMinutes || 10} دقيقة)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-700">{item.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TIMETABLE */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">
              جدول توقيت الحصص الأسبوعي لقسم: {currentClass?.name}
            </h3>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الجدول</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 font-bold text-slate-700">
                  <th className="p-3 text-start w-28 border-e border-slate-200">اليوم</th>
                  {timeSlots.map((slot) => (
                    <th key={slot.id} className="p-2.5 text-center border-e border-slate-200 font-bold">
                      {slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DAYS.map((day) => {
                  const dayLabels: Record<string, string> = {
                    sunday: 'الأحد',
                    monday: 'الإثنين',
                    tuesday: 'الثلاثاء',
                    wednesday: 'الأربعاء',
                    thursday: 'الخميس',
                  };

                  return (
                    <tr key={day} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800 bg-slate-50/60 border-e border-slate-200">
                        {dayLabels[day]}
                      </td>
                      {timeSlots.map((slot) => {
                        const session = studentTimetable.find(
                          (s) => s.day === day && s.slotId === slot.id
                        );
                        const sub = session ? getSubject(session.subjectId) : null;

                        return (
                          <td key={slot.id} className="p-2 border-e border-slate-200 text-center min-w-[120px] h-[75px]">
                            {session ? (
                              <div
                                className="p-2 rounded-xl text-white font-bold text-[11px] shadow-2xs space-y-0.5"
                                style={{ backgroundColor: sub?.color || '#059669' }}
                              >
                                <div className="truncate">{sub?.nameAr}</div>
                                <div className="text-[10px] opacity-90 font-normal">قاعة مخصصة</div>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-[11px]">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FEES & PAYMENT RECEIPTS */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">سجل الرسوم والأقساط المدرسية</h3>
              <span className="text-xs text-slate-500">{schoolConfig.academicYear}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 font-bold text-slate-700">
                    <th className="p-3 text-start">الشهر / القسط</th>
                    <th className="p-3 text-center">المبلغ</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">تاريخ الدفع</th>
                    <th className="p-3 text-center">رقم الإيصال</th>
                    <th className="p-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{fee.month}</td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {fee.amount.toLocaleString()} {schoolConfig.currency}
                      </td>
                      <td className="p-3 text-center">
                        {fee.status === 'paid' && (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                            مسدد بنجاح
                          </span>
                        )}
                        {fee.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold">
                            قيد الانتظار
                          </span>
                        )}
                        {fee.status === 'overdue' && (
                          <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-800 font-bold">
                            متأخر
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">{fee.paidDate || '-'}</td>
                      <td className="p-3 text-center font-mono text-slate-600">{fee.receiptNo || '-'}</td>
                      <td className="p-3 text-center">
                        {fee.status === 'paid' && (
                          <button
                            onClick={() => setSelectedReceipt(fee)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>معاينة الوصل</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-sm">وصل دفع الرسوم المدرسية</span>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-center font-bold text-sm text-slate-900">{schoolConfig.nameAr}</div>
              <div className="text-center text-[11px] text-slate-500">رقم الوصل: {selectedReceipt.receiptNo}</div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">التلميذ:</span>
                <span className="font-bold">{currentStudent?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">القسم:</span>
                <span className="font-bold">{currentClass?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الشهر:</span>
                <span className="font-bold">{selectedReceipt.month}</span>
              </div>
              <div className="flex justify-between text-base font-black text-emerald-700 pt-2 border-t">
                <span>المبلغ المسدد:</span>
                <span>{selectedReceipt.amount.toLocaleString()} {schoolConfig.currency}</span>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الوصل</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
