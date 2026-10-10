import React, { useState, useMemo } from 'react';
import {
  Bell,
  Send,
  Plus,
  Check,
  CheckCheck,
  AlertTriangle,
  FileText,
  Users,
  GraduationCap,
  Calendar,
  X,
  Printer,
  ChevronDown,
  Sparkles,
  Info,
  Layers,
  Inbox,
  Filter,
} from 'lucide-react';
import {
  InternalMessage,
  MessageAudience,
  MessagePriority,
  ClassItem,
  Teacher,
  UserRole,
  Language,
} from '../types';

interface InternalMessagingNotificationsProps {
  messages: InternalMessage[];
  classes: ClassItem[];
  teachers: Teacher[];
  role: UserRole;
  language: Language;
  onSendMessage: (msg: InternalMessage) => void;
  onMarkAsRead: (messageId: string) => void;
  onMarkAllAsRead: () => void;
}

export const InternalMessagingNotifications: React.FC<InternalMessagingNotificationsProps> = ({
  messages,
  classes,
  teachers,
  role,
  language,
  onSendMessage,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';

  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'circulars'>('all');
  const [selectedMessage, setSelectedMessage] = useState<InternalMessage | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Form State for Composing
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeAudience, setComposeAudience] = useState<MessageAudience>('all');
  const [composeClassId, setComposeClassId] = useState<string>('');
  const [composePriority, setComposePriority] = useState<MessagePriority>('official_circular');
  const [composeCategory, setComposeCategory] = useState('تعميم رسمي');
  const [composeAttachments, setComposeAttachments] = useState('');

  // Filter messages based on active role & tabs
  const relevantMessages = useMemo(() => {
    return messages.filter((m) => {
      // Role visibility:
      // Admin sees everything
      if (role === 'admin') return true;
      // Teacher sees 'all' or 'teachers'
      if (role === 'teacher') return m.targetAudience === 'all' || m.targetAudience === 'teachers';
      // Parent sees 'all' or 'parents' or 'class'
      if (role === 'parent') return m.targetAudience === 'all' || m.targetAudience === 'parents' || m.targetAudience === 'class';
      return true;
    });
  }, [messages, role]);

  const unreadCount = useMemo(() => {
    return relevantMessages.filter((m) => !m.isRead).length;
  }, [relevantMessages]);

  const displayedMessages = useMemo(() => {
    if (filterTab === 'unread') {
      return relevantMessages.filter((m) => !m.isRead);
    }
    if (filterTab === 'circulars') {
      return relevantMessages.filter((m) => m.priority === 'official_circular');
    }
    return relevantMessages;
  }, [relevantMessages, filterTab]);

  // Priority badge helper
  const getPriorityBadge = (priority: MessagePriority) => {
    switch (priority) {
      case 'urgent':
        return {
          label: isArabic ? 'تنبيه عاجل' : isFrench ? 'Urgent' : 'Urgent',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'official_circular':
        return {
          label: isArabic ? 'تعميم رسمي' : isFrench ? 'Circulaire Officielle' : 'Circular',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
        };
      case 'event':
        return {
          label: isArabic ? 'نشاط ورحلات' : isFrench ? 'Activité / Sortie' : 'Event',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'normal':
      default:
        return {
          label: isArabic ? 'إشعار إداري' : isFrench ? 'Information' : 'Notice',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  // Audience label helper
  const getAudienceLabel = (audience: MessageAudience, classId?: string) => {
    switch (audience) {
      case 'teachers':
        return {
          icon: GraduationCap,
          text: isArabic ? 'موجه للأساتذة' : isFrench ? 'Enseignants' : 'Teachers',
          color: 'text-purple-700 bg-purple-50',
        };
      case 'parents':
        return {
          icon: Users,
          text: isArabic ? 'موجه للأولياء' : isFrench ? 'Parents' : 'Parents',
          color: 'text-blue-700 bg-blue-50',
        };
      case 'class':
        const cls = classes.find((c) => c.id === classId);
        return {
          icon: Layers,
          text: cls ? `${isArabic ? 'قسم:' : 'Classe:'} ${cls.name}` : isArabic ? 'قسم محدد' : 'Classe',
          color: 'text-teal-700 bg-teal-50',
        };
      case 'all':
      default:
        return {
          icon: Users,
          text: isArabic ? 'عام (الجميع)' : isFrench ? 'Général' : 'All',
          color: 'text-emerald-700 bg-emerald-50',
        };
    }
  };

  // Submit new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeBody.trim()) return;

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}`;

    const newMsg: InternalMessage = {
      id: `msg-${Date.now()}`,
      title: composeTitle.trim(),
      body: composeBody.trim(),
      senderName: role === 'admin' ? 'إدارة المؤسسة' : 'أستاذ منسق',
      senderRole: role === 'admin' ? 'admin' : 'pedagogy_council',
      targetAudience: composeAudience,
      targetClassId: composeAudience === 'class' ? composeClassId : undefined,
      priority: composePriority,
      category: composeCategory.trim() || 'إشعار إداري',
      date: dateFormatted,
      isRead: false,
      attachmentsNote: composeAttachments.trim() || undefined,
    };

    onSendMessage(newMsg);
    setComposeTitle('');
    setComposeBody('');
    setComposeAttachments('');
    setIsComposeOpen(false);
  };

  return (
    <div className="relative">
      
      {/* Toolbar Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center border border-slate-200/60 shadow-2xs"
        title={isArabic ? 'الرسائل والتعميمات الداخلية' : 'Messages & Circulaires'}
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 bg-red-600 text-white text-[10px] font-black rounded-full shadow-xs animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notification Center Popover */}
      {isOpen && (
        <>
          {/* Backdrop click to dismiss */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute end-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Popover Header */}
            <div className="p-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    {isArabic ? 'التعميمات والمراسلات' : 'Circulaires & Messages'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {unreadCount > 0
                      ? `${unreadCount} ${isArabic ? 'رسائل جديدة غير مقروءة' : 'non lus'}`
                      : isArabic ? 'جميع الرسائل مقروءة' : 'Tout est lu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                    title={isArabic ? 'تحديد الكل كمقروء' : 'Marquer tout comme lu'}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Compose Button (Admin or Teacher) */}
                {role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsComposeOpen(true);
                      setIsOpen(false);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تعميم جديد' : 'Nouveau'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-2 bg-slate-50/80 border-b border-slate-100 text-xs font-bold">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white text-indigo-700 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isArabic ? 'الكل' : 'Tous'} ({relevantMessages.length})
              </button>
              <button
                onClick={() => setFilterTab('unread')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition cursor-pointer ${
                  filterTab === 'unread'
                    ? 'bg-white text-indigo-700 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isArabic ? 'غير مقروء' : 'Non lus'} ({unreadCount})
              </button>
              <button
                onClick={() => setFilterTab('circulars')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition cursor-pointer ${
                  filterTab === 'circulars'
                    ? 'bg-white text-indigo-700 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isArabic ? 'التعميمات' : 'Circulaires'}
              </button>
            </div>

            {/* Messages List */}
            <div className="overflow-y-auto divide-y divide-slate-100 max-h-88">
              {displayedMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Inbox className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs font-semibold">
                    {isArabic ? 'لا توجد رسائل مطابقة حالياً' : 'Aucun message pour le moment'}
                  </p>
                </div>
              ) : (
                displayedMessages.map((msg) => {
                  const priority = getPriorityBadge(msg.priority);
                  const aud = getAudienceLabel(msg.targetAudience, msg.targetClassId);
                  const AudIcon = aud.icon;

                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        onMarkAsRead(msg.id);
                        setSelectedMessage(msg);
                        setIsOpen(false);
                      }}
                      className={`p-3.5 transition cursor-pointer hover:bg-slate-50 flex flex-col gap-1.5 ${
                        !msg.isRead ? 'bg-indigo-50/30' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {!msg.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${priority.bg}`}
                          >
                            {priority.label}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 truncate ${aud.color}`}
                          >
                            <AudIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{aud.text}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {msg.date.split(' ')[0]}
                        </span>
                      </div>

                      <h5
                        className={`text-xs truncate ${
                          !msg.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'
                        }`}
                      >
                        {msg.title}
                      </h5>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {msg.body}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>{msg.senderName}</span>
                        <span className="text-indigo-600 font-bold hover:underline">
                          {isArabic ? 'قراءة التفاصيل ←' : 'Voir plus →'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {role === 'admin' && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsComposeOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full py-2 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50/50 transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'إرسال تعميم أو رسالة جديدة للأساتذة أو الأولياء' : 'Rédiger une circulaire'}</span>
                </button>
              </div>
            )}

          </div>
        </>
      )}

      {/* Compose Message Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {isArabic ? 'إرسال تعميم أو رسالة موجهة' : 'Nouveau Message / Circulaire'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isArabic
                      ? 'إرسال إشعار فوري للأساتذة، الأولياء، أو قسم دراسي محدد'
                      : 'Diffuser une communication aux enseignants ou aux parents'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleSendMessage} className="p-6 space-y-4 overflow-y-auto text-xs">
              
              {/* Target Audience */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {isArabic ? 'الجهة المستهدفة (المستلمون):' : 'Destinataires:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setComposeAudience('all')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      composeAudience === 'all'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-black ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{isArabic ? 'الجميع' : 'Tous'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposeAudience('teachers')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      composeAudience === 'teachers'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-black ring-1 ring-purple-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{isArabic ? 'الأساتذة' : 'Enseignants'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposeAudience('parents')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      composeAudience === 'parents'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-black ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{isArabic ? 'أولياء الأمور' : 'Parents'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposeAudience('class')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      composeAudience === 'class'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-black ring-1 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>{isArabic ? 'قسم محدد' : 'Classe'}</span>
                  </button>
                </div>
              </div>

              {/* Class Selector if audience is 'class' */}
              {composeAudience === 'class' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'اختر القسم المستهدف:' : 'Sélectionnez la classe:'}
                  </label>
                  <select
                    value={composeClassId}
                    onChange={(e) => setComposeClassId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{isArabic ? '-- اختر القسم --' : '-- Choisir --'}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'نوع الرسالة / الأولوية:' : 'Priorité:'}
                  </label>
                  <select
                    value={composePriority}
                    onChange={(e) => setComposePriority(e.target.value as MessagePriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="official_circular">📜 {isArabic ? 'تعميم رسمي وإداري' : 'Circulaire officielle'}</option>
                    <option value="urgent">🔴 {isArabic ? 'تنبيه عاجل وهام' : 'Urgent'}</option>
                    <option value="event">📅 {isArabic ? 'رحلة أو نشاط مدرسي' : 'Activité / Sortie'}</option>
                    <option value="normal">ℹ️ {isArabic ? 'إشعار وتذكير عام' : 'Notification standard'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isArabic ? 'التصنيف الداخلي:' : 'Catégorie:'}
                  </label>
                  <input
                    type="text"
                    value={composeCategory}
                    onChange={(e) => setComposeCategory(e.target.value)}
                    placeholder={isArabic ? 'مثال: تعميم رسمي، بيداغوجيا، نشاط' : 'Ex: Circulaire, Pédagogie'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Subject / Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isArabic ? 'موضوع التعميم / عنوان الرسالة:' : 'Objet / Titre:'}
                </label>
                <input
                  type="text"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder={isArabic ? 'أدخل عنوان الرسالة أو التعميم...' : 'Titre du communiqué...'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isArabic ? 'نص التعميم أو الرسالة:' : 'Contenu du message:'}
                </label>
                <textarea
                  rows={4}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder={isArabic ? 'اكتب تفاصيل التوجيهات، المواعيد، أو التعليمات هنا...' : 'Rédigez le texte complet ici...'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs leading-relaxed"
                ></textarea>
              </div>

              {/* Attachments Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isArabic ? 'ملاحظة المرفقات أو الاستمارات (اختياري):' : 'Pièces jointes / Formulaire:'}
                </label>
                <input
                  type="text"
                  value={composeAttachments}
                  onChange={(e) => setComposeAttachments(e.target.value)}
                  placeholder={isArabic ? 'مثال: استمارة الترخيص الأبوي، جدول المداولات (PDF)' : 'Ex: Formulaire d’autorisation (PDF)'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'إرسال التعميم الآن' : 'Envoyer'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Message Reader / Full Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/80 no-print">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                {isArabic ? 'معاينة التعميم الرسمي' : 'Détails du Communiqué'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'طباعة' : 'Imprimer'}</span>
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white printable-document text-xs">
              
              {/* Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
                <h4 className="text-xs font-bold tracking-wide text-slate-600">
                  الجمهورية الجزائرية الديمقراطية الشعبية / وزارة التربية الوطنية
                </h4>
                <div className="text-base font-black text-indigo-950 pt-1">
                  {selectedMessage.title}
                </div>
                <div className="flex justify-between items-center text-slate-500 pt-2 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-800">المرسل: </span>
                    {selectedMessage.senderName}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">التاريخ: </span>
                    {selectedMessage.date}
                  </div>
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                    getPriorityBadge(selectedMessage.priority).bg
                  }`}
                >
                  {getPriorityBadge(selectedMessage.priority).label}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    getAudienceLabel(selectedMessage.targetAudience, selectedMessage.targetClassId).color
                  }`}
                >
                  {getAudienceLabel(selectedMessage.targetAudience, selectedMessage.targetClassId).text}
                </span>

                {selectedMessage.category && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {selectedMessage.category}
                  </span>
                )}
              </div>

              {/* Message Body Content */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 leading-relaxed text-sm whitespace-pre-line">
                {selectedMessage.body}
              </div>

              {/* Attachments if any */}
              {selectedMessage.attachmentsNote && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold">المرفقات والوثائق المطلوبة: </span>
                    <span>{selectedMessage.attachmentsNote}</span>
                  </div>
                </div>
              )}

              {/* Signature Block */}
              <div className="pt-8 text-end">
                <div className="font-bold text-slate-800 mb-8">{selectedMessage.senderName}</div>
                <div className="border-b border-dashed border-slate-400 w-36 ms-auto"></div>
                <div className="text-[10px] text-slate-400 mt-1">الختم والتأشيرة الرسمية</div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
