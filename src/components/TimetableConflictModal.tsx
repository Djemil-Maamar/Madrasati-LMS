import React from 'react';
import {
  AlertTriangle,
  X,
  Clock,
  MapPin,
  User,
  BookOpen,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { TimetableConflict, Language, Subject, Teacher, Room, ClassItem } from '../types';
import { translations } from '../i18n/translations';

interface TimetableConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: TimetableConflict[];
  language: Language;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  classes: ClassItem[];
  onDeleteSession: (sessionId: string) => void;
}

export const TimetableConflictModal: React.FC<TimetableConflictModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  language,
  subjects,
  teachers,
  rooms,
  classes,
  onDeleteSession,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const getSubjectName = (subId: string) => {
    const s = subjects.find((x) => x.id === subId);
    if (!s) return subId;
    return language === 'ar' ? s.nameAr : language === 'fr' ? s.nameFr : s.nameEn;
  };

  const getTeacherName = (tId: string) => {
    return teachers.find((x) => x.id === tId)?.name || tId;
  };

  const getRoomName = (rId: string) => {
    return rooms.find((x) => x.id === rId)?.name || rId;
  };

  const getClassName = (cId: string) => {
    return classes.find((x) => x.id === cId)?.name || cId;
  };

  const getDayLabel = (dayKey: string) => {
    const map: Record<string, string> = {
      sunday: t.day_sunday,
      monday: t.day_monday,
      tuesday: t.day_tuesday,
      wednesday: t.day_wednesday,
      thursday: t.day_thursday,
    };
    return map[dayKey] || dayKey;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {t.conflictsFound}
              </h3>
              <p className="text-xs text-red-700 font-medium">
                {conflicts.length} {language === 'ar' ? 'تعارض(ات) مكتشفة في جدول التوقيت' : 'conflit(s) détecté(s)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {conflicts.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800">{t.noConflicts}</p>
            </div>
          ) : (
            conflicts.map((conflict, idx) => (
              <div
                key={conflict.id || idx}
                className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                      {conflict.type === 'teacher'
                        ? (language === 'ar' ? 'تعارض أستاذ' : 'Conflit Enseignant')
                        : conflict.type === 'room'
                        ? (language === 'ar' ? 'تعارض قاعة' : 'Conflit Salle')
                        : (language === 'ar' ? 'تعارض قسم' : 'Conflit Classe')}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {getDayLabel(conflict.day)}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-800 leading-snug">
                  {conflict.message}
                </p>

                {/* Conflicting Sessions details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-red-100">
                  {/* Session A */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>الحصة الأولى (A)</span>
                      <button
                        onClick={() => onDeleteSession(conflict.sessionA.id)}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition cursor-pointer"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>{getSubjectName(conflict.sessionA.subjectId)}</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-blue-600" />
                      <span>{getTeacherName(conflict.sessionA.teacherId)}</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>{getRoomName(conflict.sessionA.roomId)} ({getClassName(conflict.sessionA.classId)})</span>
                    </div>
                  </div>

                  {/* Session B */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>الحصة الثانية (B)</span>
                      <button
                        onClick={() => onDeleteSession(conflict.sessionB.id)}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition cursor-pointer"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>{getSubjectName(conflict.sessionB.subjectId)}</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-blue-600" />
                      <span>{getTeacherName(conflict.sessionB.teacherId)}</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>{getRoomName(conflict.sessionB.roomId)} ({getClassName(conflict.sessionB.classId)})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{t.resolveConflictTip}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>

      </div>
    </div>
  );
};
