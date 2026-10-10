import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  User,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { ClassItem, Student, Language, EducationCycle } from '../types';
import { translations } from '../i18n/translations';

interface ClassesStudentsViewProps {
  classes: ClassItem[];
  students: Student[];
  language: Language;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onAddClass: (classItem: Omit<ClassItem, 'id'>) => void;
}

export const ClassesStudentsView: React.FC<ClassesStudentsViewProps> = ({
  classes,
  students,
  language,
  onAddStudent,
  onAddClass,
}) => {
  const t = translations[language];

  const [activeCycleFilter, setActiveCycleFilter] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Student Modal
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    fullName: '',
    fullNameFr: '',
    regNumber: `2025-0${students.length + 1}`,
    classId: classes[0]?.id || '',
    birthDate: '2008-01-01',
    gender: 'male' as 'male' | 'female',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (activeCycleFilter !== 'all' && s.cycle !== activeCycleFilter) return false;
    if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        (s.parentName && s.parentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === newStudentData.classId);
    onAddStudent({
      ...newStudentData,
      cycle: targetClass?.cycle || 'secondary',
      grade: targetClass?.grade || '3AS',
    });
    setIsAddStudentOpen(false);
    setNewStudentData({
      fullName: '',
      fullNameFr: '',
      regNumber: `2025-0${students.length + 2}`,
      classId: classes[0]?.id || '',
      birthDate: '2008-01-01',
      gender: 'male',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
    });
  };

  const getClassName = (cid: string) => classes.find((c) => c.id === cid)?.name || cid;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.nav_classes_students}</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'ar'
              ? 'إدارة سجلات الأقسام، المستويات، والتلاميذ وأولياء الأمور بمختلف الأطوار.'
              : 'Gestion des classes, niveaux et élèves inscrits.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddStudentOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة تلميذ جديد' : 'Ajouter un élève'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Cycle filter pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveCycleFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeCycleFilter === 'all' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {t.allCycles}
          </button>
          <button
            onClick={() => setActiveCycleFilter('primary')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeCycleFilter === 'primary' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {t.cycle_primary}
          </button>
          <button
            onClick={() => setActiveCycleFilter('middle')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeCycleFilter === 'middle' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {t.cycle_middle}
          </button>
          <button
            onClick={() => setActiveCycleFilter('secondary')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeCycleFilter === 'secondary' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {t.cycle_secondary}
          </button>
        </div>

        {/* Class selector & search */}
        <div className="flex items-center gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            <option value="all">{language === 'ar' ? 'جميع الأقسام' : 'Toutes les classes'}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-2 text-slate-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 font-bold text-slate-700">
                <th className="p-3 text-start w-16">#</th>
                <th className="p-3 text-start">{language === 'ar' ? 'التلميذ(ة)' : 'Élève'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'القسم والمستوى' : 'Classe'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'ولي الأمر' : 'Parent'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'رقم الهاتف' : 'Téléphone'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'تاريخ الميلاد' : 'Date Naissance'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredStudents.map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 text-slate-400 font-semibold">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{st.fullName}</div>
                    <div className="text-[11px] text-slate-400">{st.regNumber}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                      {getClassName(st.classId)}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{st.parentName || '-'}</td>
                  <td className="p-3 text-slate-600 font-mono text-[11px]">{st.parentPhone || '-'}</td>
                  <td className="p-3 text-slate-500">{st.birthDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleStudentSubmit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'ar' ? 'تسجيل تلميذ جديد' : 'Nouvel Élève'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم واللقب (بالعربية)</label>
                  <input
                    type="text"
                    required
                    value={newStudentData.fullName}
                    onChange={(e) => setNewStudentData({ ...newStudentData, fullName: e.target.value })}
                    placeholder="مثال: أمين حمداوي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">القسم</label>
                    <select
                      value={newStudentData.classId}
                      onChange={(e) => setNewStudentData({ ...newStudentData, classId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رقم التسجيل</label>
                    <input
                      type="text"
                      required
                      value={newStudentData.regNumber}
                      onChange={(e) => setNewStudentData({ ...newStudentData, regNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ الميلاد</label>
                    <input
                      type="date"
                      value={newStudentData.birthDate}
                      onChange={(e) => setNewStudentData({ ...newStudentData, birthDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الجنس</label>
                    <select
                      value={newStudentData.gender}
                      onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الولي</label>
                    <input
                      type="text"
                      value={newStudentData.parentName}
                      onChange={(e) => setNewStudentData({ ...newStudentData, parentName: e.target.value })}
                      placeholder="اسم الأب أو الأم"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">هاتف الولي</label>
                    <input
                      type="tel"
                      value={newStudentData.parentPhone}
                      onChange={(e) => setNewStudentData({ ...newStudentData, parentPhone: e.target.value })}
                      placeholder="0660..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
