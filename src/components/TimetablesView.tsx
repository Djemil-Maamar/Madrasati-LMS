import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  User,
  MapPin,
  BookOpen,
  Trash2,
  Edit2,
  Printer,
  Sparkles,
  Layers,
  Check,
  X,
} from 'lucide-react';
import {
  TimetableSession,
  TimetableConflict,
  ClassItem,
  Teacher,
  Subject,
  Room,
  TimeSlot,
  DayOfWeek,
  Language,
  SchoolConfig,
} from '../types';
import { translations } from '../i18n/translations';
import { validateSingleSession } from '../utils/timetableConflict';

interface TimetablesViewProps {
  sessions: TimetableSession[];
  conflicts: TimetableConflict[];
  classes: ClassItem[];
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  language: Language;
  schoolConfig: SchoolConfig;
  onAddSession: (session: Omit<TimetableSession, 'id'>) => void;
  onUpdateSession: (id: string, session: Omit<TimetableSession, 'id'>) => void;
  onDeleteSession: (id: string) => void;
  onOpenConflictsModal: () => void;
}

const DAYS: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

export const TimetablesView: React.FC<TimetablesViewProps> = ({
  sessions,
  conflicts,
  classes,
  teachers,
  subjects,
  rooms,
  timeSlots,
  language,
  schoolConfig,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onOpenConflictsModal,
}) => {
  const t = translations[language];

  // View mode: 'class' | 'teacher' | 'room'
  const [viewMode, setViewMode] = useState<'class' | 'teacher' | 'room'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Modal form fields
  const [formData, setFormData] = useState<{
    day: DayOfWeek;
    slotId: string;
    classId: string;
    teacherId: string;
    subjectId: string;
    roomId: string;
  }>({
    day: 'sunday',
    slotId: timeSlots[0]?.id || 'slot-1',
    classId: classes[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    roomId: rooms[0]?.id || '',
  });

  // Calculate if the current form has conflicts live
  const formConflictCheck = useMemo(() => {
    if (!isModalOpen) return { hasConflict: false };
    return validateSingleSession(
      formData,
      sessions,
      editingSessionId || undefined,
      teachers,
      rooms,
      classes
    );
  }, [formData, sessions, editingSessionId, isModalOpen, teachers, rooms, classes]);

  // Filter sessions according to active viewMode
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (viewMode === 'class') return s.classId === selectedClassId;
      if (viewMode === 'teacher') return s.teacherId === selectedTeacherId;
      if (viewMode === 'room') return s.roomId === selectedRoomId;
      return true;
    });
  }, [sessions, viewMode, selectedClassId, selectedTeacherId, selectedRoomId]);

  // Check if a specific session is in a conflict
  const isSessionInConflict = (sessionId: string) => {
    return conflicts.some((c) => c.sessionA.id === sessionId || c.sessionB.id === sessionId);
  };

  const openAddModal = (day?: DayOfWeek, slotId?: string) => {
    setEditingSessionId(null);
    setFormData({
      day: day || 'sunday',
      slotId: slotId || timeSlots[0]?.id || 'slot-1',
      classId: viewMode === 'class' ? selectedClassId : classes[0]?.id || '',
      teacherId: viewMode === 'teacher' ? selectedTeacherId : teachers[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      roomId: viewMode === 'room' ? selectedRoomId : rooms[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (session: TimetableSession) => {
    setEditingSessionId(session.id);
    setFormData({
      day: session.day,
      slotId: session.slotId,
      classId: session.classId,
      teacherId: session.teacherId,
      subjectId: session.subjectId,
      roomId: session.roomId,
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSessionId) {
      onUpdateSession(editingSessionId, formData);
    } else {
      onAddSession(formData);
    }
    setIsModalOpen(false);
  };

  const getSubject = (subId: string) => subjects.find((s) => s.id === subId);
  const getTeacher = (tchId: string) => teachers.find((t) => t.id === tchId);
  const getRoom = (rmId: string) => rooms.find((r) => r.id === rmId);
  const getClass = (clsId: string) => classes.find((c) => c.id === clsId);

  const getDayName = (day: DayOfWeek) => {
    const map: Record<DayOfWeek, string> = {
      sunday: t.day_sunday,
      monday: t.day_monday,
      tuesday: t.day_tuesday,
      wednesday: t.day_wednesday,
      thursday: t.day_thursday,
    };
    return map[day];
  };

  const currentViewTitle = useMemo(() => {
    if (viewMode === 'class') {
      const c = getClass(selectedClassId);
      return `${t.viewByClass}: ${c ? c.name : ''}`;
    }
    if (viewMode === 'teacher') {
      const tch = getTeacher(selectedTeacherId);
      return `${t.viewByTeacher}: ${tch ? tch.name : ''}`;
    }
    const r = getRoom(selectedRoomId);
    return `${t.viewByRoom}: ${r ? r.name : ''}`;
  }, [viewMode, selectedClassId, selectedTeacherId, selectedRoomId, classes, teachers, rooms, language]);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.timetable_title}</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t.timetable_desc}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {conflicts.length > 0 && (
            <button
              onClick={onOpenConflictsModal}
              className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold transition flex items-center gap-2 cursor-pointer animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{conflicts.length} {t.conflictsFound}</span>
            </button>
          )}

          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSession}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title={t.print}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conflicts Banner Alert (if any) */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border-s-4 border-red-500 p-4 rounded-xl flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">{t.conflictsFound}</h4>
              <p className="text-xs text-red-700 mt-0.5">
                {language === 'ar'
                  ? 'تم العثور على تضارب في المواعيد (نفس الأستاذ أو نفس القاعة محجوزين لحصتين مختلفتين في آن واحد). انقر على الزر لمعاينة وحل التعارضات فوراً.'
                  : 'Des chevauchements d\'horaires ont été détectés. Cliquez pour examiner et résoudre.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenConflictsModal}
            className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 text-xs font-bold rounded-lg shrink-0 cursor-pointer transition"
          >
            {language === 'ar' ? 'فحص وحل التعارضات' : 'Résoudre'}
          </button>
        </div>
      )}

      {/* Controls Bar: Switch View (Class / Teacher / Room) & Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Toggle Mode */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('class')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'class' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.viewByClass}</span>
          </button>
          <button
            onClick={() => setViewMode('teacher')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'teacher' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.viewByTeacher}</span>
          </button>
          <button
            onClick={() => setViewMode('room')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'room' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.viewByRoom}</span>
          </button>
        </div>

        {/* Dynamic Selector based on ViewMode */}
        <div className="flex items-center gap-2 min-w-[240px]">
          {viewMode === 'class' && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.stream || cls.grade})
                </option>
              ))}
            </select>
          )}

          {viewMode === 'teacher' && (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {teachers.map((tch) => (
                <option key={tch.id} value={tch.id}>
                  {tch.name}
                </option>
              ))}
            </select>
          )}

          {viewMode === 'room' && (
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {rooms.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  {rm.name} - {rm.building}
                </option>
              ))}
            </select>
          )}
        </div>

        {viewMode === 'teacher' && (() => {
          const tch = getTeacher(selectedTeacherId);
          if (tch && (tch.status === 'on_leave' || (tch.unavailableDates && tch.unavailableDates.length > 0))) {
            return (
              <div className="w-full mt-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
                  <span className="font-bold text-purple-900 dark:text-purple-200">
                    {language === 'ar' ? 'تنبيه التفرغ والإجازات:' : 'Statut de disponibilité :'}
                  </span>
                  <span className="text-purple-800 dark:text-purple-300">
                    {tch.availabilityNote || (language === 'ar' ? 'الأستاذ في إجازة معتمدة' : 'En congé')}
                  </span>
                </div>
                {tch.unavailableDates && tch.unavailableDates.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-bold">{language === 'ar' ? 'التواريخ:' : 'Dates :'}</span>
                    <span className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                      {tch.unavailableDates.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            );
          }
          return null;
        })()}

      </div>

      {/* Timetable Weekly Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Printable Official Header */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">{currentViewTitle}</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {schoolConfig.academicYear} | {schoolConfig.nameAr}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="p-3 text-start w-28 border-e border-slate-200">
                  {language === 'ar' ? 'اليوم / التوقيت' : 'Jour / Créneau'}
                </th>
                {timeSlots.map((slot) => (
                  <th key={slot.id} className="p-2.5 text-center border-e border-slate-200 font-semibold text-slate-600">
                    <div className="text-[11px] font-bold text-slate-900">{slot.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {DAYS.map((day) => (
                <tr key={day} className="hover:bg-slate-50/40 transition">
                  {/* Day header */}
                  <td className="p-3 font-bold text-slate-800 bg-slate-50/50 border-e border-slate-200">
                    <span className="inline-block px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {getDayName(day)}
                    </span>
                  </td>

                  {/* Slots */}
                  {timeSlots.map((slot) => {
                    const session = filteredSessions.find(
                      (s) => s.day === day && s.slotId === slot.id
                    );

                    const sub = session ? getSubject(session.subjectId) : null;
                    const tch = session ? getTeacher(session.teacherId) : null;
                    const rm = session ? getRoom(session.roomId) : null;
                    const cls = session ? getClass(session.classId) : null;
                    const hasConflict = session ? isSessionInConflict(session.id) : false;

                    return (
                      <td
                        key={slot.id}
                        className={`p-2 border-e border-slate-200 align-top transition min-w-[130px] h-[95px] relative group ${
                          hasConflict ? 'bg-red-50/60' : ''
                        }`}
                      >
                        {session ? (
                          <div
                            className={`h-full p-2 rounded-xl flex flex-col justify-between text-start transition shadow-2xs border ${
                              hasConflict
                                ? 'bg-red-100/90 border-red-300 text-red-950 ring-2 ring-red-400'
                                : 'bg-white border-slate-200/90 hover:border-emerald-300'
                            }`}
                          >
                            <div>
                              {/* Subject title & conflict tag */}
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: sub?.color || '#059669' }}
                                >
                                  {language === 'ar' ? sub?.nameAr : language === 'fr' ? sub?.nameFr : sub?.nameEn || 'مادة'}
                                </span>

                                {hasConflict && (
                                  <span
                                    onClick={onOpenConflictsModal}
                                    className="cursor-pointer inline-flex p-0.5 rounded bg-red-600 text-white animate-bounce"
                                    title="تعارض حصة! اضغط للمعاينة"
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                  </span>
                                )}
                              </div>

                              {/* Details depending on view mode */}
                              <div className="space-y-0.5 text-[11px] text-slate-600">
                                {viewMode !== 'class' && (
                                  <div className="font-semibold text-slate-900 truncate flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{cls?.name}</span>
                                  </div>
                                )}
                                {viewMode !== 'teacher' && (
                                  <div className="truncate flex items-center gap-1">
                                    <User className="w-3 h-3 text-blue-600 shrink-0" />
                                    <span>{tch?.name}</span>
                                  </div>
                                )}
                                {viewMode !== 'room' && (
                                  <div className="truncate flex items-center gap-1 text-[10px] text-slate-500">
                                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span>{rm?.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => openEditModal(session)}
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition cursor-pointer"
                                title={t.edit}
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteSession(session.id)}
                                className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded transition cursor-pointer"
                                title={t.delete}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openAddModal(day, slot.id)}
                            className="w-full h-full rounded-xl border border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-400 hover:text-emerald-700 flex flex-col items-center justify-center gap-1 text-[11px] transition cursor-pointer opacity-70 hover:opacity-100"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.emptySlot}</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            <form onSubmit={handleSaveModal}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                <h3 className="text-base font-bold text-slate-900">
                  {editingSessionId ? t.editSession : t.addSession}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                
                {/* Conflict warning in form if any */}
                {formConflictCheck.hasConflict && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{formConflictCheck.reason}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectDay}</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {getDayName(d)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectSlot}</label>
                    <select
                      value={formData.slotId}
                      onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {timeSlots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectClass}</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.stream || c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectSubject}</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {language === 'ar' ? s.nameAr : language === 'fr' ? s.nameFr : s.nameEn} (معامل {s.coefficient})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectTeacher}</label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {teachers.map((tch) => (
                        <option key={tch.id} value={tch.id}>
                          {tch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.selectRoom}</label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {rooms.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
