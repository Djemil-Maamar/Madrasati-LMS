import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Search,
  Filter,
  DollarSign,
  FileText,
  X,
  Check,
  Mail,
  Send,
  AlertTriangle,
  Calendar,
  Sparkles,
  User,
  Info,
} from 'lucide-react';
import { FeePayment, Student, ClassItem, Language, SchoolConfig } from '../types';
import { translations } from '../i18n/translations';

interface FeesPaymentsViewProps {
  feePayments: FeePayment[];
  students: Student[];
  classes: ClassItem[];
  language: Language;
  schoolConfig: SchoolConfig;
  onUpdatePayment: (paymentId: string, status: 'paid' | 'pending' | 'overdue', receiptNo?: string) => void;
}

export const FeesPaymentsView: React.FC<FeesPaymentsViewProps> = ({
  feePayments,
  students,
  classes,
  language,
  schoolConfig,
  onUpdatePayment,
}) => {
  const t = translations[language];
  const isArabic = language === 'ar';
  const isFrench = language === 'fr';

  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<FeePayment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Email Reminder Modal State
  const [reminderPayment, setReminderPayment] = useState<FeePayment | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<string | null>(null);

  // Helper getters
  const getStudent = (stId: string) => students.find((s) => s.id === stId);
  const getClassName = (cId: string) => classes.find((c) => c.id === cId)?.name || cId;

  // Overdue calculation helper
  const isPaymentOverdue = (payment: FeePayment) => {
    if (payment.status === 'paid') return false;
    if (payment.status === 'overdue') return true;
    if (!payment.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return payment.dueDate < today;
  };

  const getDaysOverdue = (dueDateStr: string) => {
    if (!dueDateStr) return 0;
    const due = new Date(dueDateStr).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Filter payments
  const filteredPayments = feePayments.filter((p) => {
    const overdue = isPaymentOverdue(p);
    if (statusFilter === 'overdue') {
      if (!overdue) return false;
    } else if (statusFilter === 'pending') {
      if (p.status !== 'pending' || overdue) return false;
    } else if (statusFilter === 'paid') {
      if (p.status !== 'paid') return false;
    }

    if (searchQuery.trim()) {
      const st = getStudent(p.studentId);
      const q = searchQuery.toLowerCase();
      if (!st) return false;
      return (
        st.fullName.toLowerCase().includes(q) ||
        st.regNumber.toLowerCase().includes(q) ||
        (st.parentName && st.parentName.toLowerCase().includes(q)) ||
        (st.parentEmail && st.parentEmail.toLowerCase().includes(q)) ||
        (p.receiptNo && p.receiptNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCollected = feePayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = feePayments
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const overduePaymentsList = feePayments.filter((p) => isPaymentOverdue(p));
  const overdueCount = overduePaymentsList.length;

  const markAsPaid = (payment: FeePayment) => {
    const recNo = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;
    onUpdatePayment(payment.id, 'paid', recNo);
  };

  // Open email reminder modal
  const handleOpenReminderModal = (payment: FeePayment) => {
    const student = getStudent(payment.studentId);
    const parentEmail = student?.parentEmail || `${student?.regNumber}@parents-al-nour.edu`;
    const daysOver = getDaysOverdue(payment.dueDate);

    setReminderPayment(payment);
    setRecipientEmail(parentEmail);

    if (isArabic) {
      setEmailSubject(`تذكير بموعد سداد الرسوم المدرسية - ${schoolConfig.nameAr}`);
      setEmailBody(
        `إلى السيد(ة) ولي أمر التلميذ(ة): ${student?.fullName || ''} (القسم: ${getClassName(payment.classId)})\n\n` +
        `تحية طيبة وبعد،\n\n` +
        `نحيطكم علماً بأن قسط الرسوم المدرسية لشهر [${payment.month}] بمبلغ [${payment.amount.toLocaleString()} ${schoolConfig.currency}] قد استحق للأداء بتاريخ [${payment.dueDate}] (متأخر بـ ${daysOver > 0 ? daysOver + ' يوم' : 'فترة محددة'}).\n\n` +
        `نرجو منكم التفضل بتسوية المستحقات لدى مصلحة المحاسبة بالمؤسسة أو عبر التحويل البنكي في أقرب الآجال.\n\n` +
        `شاكرين لكم حسن تعاونكم الدائم.\n\n` +
        `إدارة المؤسسة: ${schoolConfig.nameAr}\nهاتف التواصل: ${schoolConfig.phone}`
      );
    } else {
      setEmailSubject(`Rappel d'échéance des frais de scolarité - ${schoolConfig.nameFr}`);
      setEmailBody(
        `Bonjour M./Mme le tuteur de l'élève: ${student?.fullName || ''} (${getClassName(payment.classId)}),\n\n` +
        `Nous vous rappelons que les frais de scolarité pour le mois de [${payment.month}] d'un montant de [${payment.amount.toLocaleString()} ${schoolConfig.currency}] sont arrivés à échéance le [${payment.dueDate}].\n\n` +
        `Merci de bien vouloir régulariser cette situation auprès du service financier de l'établissement.\n\n` +
        `Cordialement,\nLa Direction - ${schoolConfig.nameFr}`
      );
    }
  };

  // Send simulated reminder email
  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderPayment) return;

    setIsSendingEmail(true);

    setTimeout(() => {
      setIsSendingEmail(false);
      const student = getStudent(reminderPayment.studentId);
      setEmailSentSuccess(
        isArabic
          ? `تم إرسال إشعار التذكير بنجاح عبر البريد الإلكتروني إلى ولي أمر (${student?.fullName}) على العنوان: ${recipientEmail}`
          : `Rappel envoyé avec succès au parent de (${student?.fullName}) à: ${recipientEmail}`
      );
      setReminderPayment(null);

      setTimeout(() => {
        setEmailSentSuccess(null);
      }, 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.nav_fees}</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isArabic
              ? 'متابعة الرسوم المدرسية، تنبيهات التأخر في الدفع، وإرسال إشعارات التذكير لأولياء الأمور عبر البريد الإلكتروني.'
              : 'Suivi des frais de scolarité, alertes des retards et envoi des rappels par e-mail.'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{t.print}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {emailSentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs font-bold text-emerald-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailSentSuccess}</span>
          </div>
          <button
            onClick={() => setEmailSentSuccess(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overdue Alert Banner if any overdue payments exist */}
      {overdueCount > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-950 flex items-center gap-2">
                <span>
                  {isArabic
                    ? `تنبيه: يوجد ${overdueCount} تلاميذ تجاوزوا موعد سداد الرسوم المدرسية!`
                    : `Attention: ${overdueCount} élèves ont dépassé l'échéance de paiement!`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200/80 text-rose-900">
                  {isArabic ? 'متأخرات مستحقة' : 'En retard'}
                </span>
              </h4>
              <p className="text-xs text-rose-800/90 mt-0.5">
                {isArabic
                  ? 'يمكنك إرسال إشعارات تذكير رسمية مباشرة عبر البريد الإلكتروني لأولياء أمورهم بنقرة واحدة.'
                  : 'Vous pouvez envoyer directement des rappels par e-mail aux parents concernés.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('overdue')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isArabic ? 'عرض التلاميذ المتأخرين فقط' : 'Filtrer les retards'}</span>
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">
            {isArabic ? 'المداخيل المسددة' : 'Revenus encaissés'}
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {totalCollected.toLocaleString()} {schoolConfig.currency}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">أقساط محصلة بنجاح</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">
            {isArabic ? 'المستحقات المعلقة' : 'Frais en attente'}
          </span>
          <div className="text-2xl font-black text-amber-600">
            {totalPending.toLocaleString()} {schoolConfig.currency}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">في انتظار التسديد</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-bold">
              {isArabic ? 'المدفوعات المتأخرة' : 'Retards de paiement'}
            </span>
            {overdueCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-rose-600">
            {overdueCount} {isArabic ? 'تلاميذ' : 'élèves'}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            {isArabic ? 'تجاوزوا تاريخ الاستحقاق' : 'Échéance dépassée'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">
            {isArabic ? 'نسبة التحصيل' : 'Taux de recouvrement'}
          </span>
          <div className="text-2xl font-black text-blue-600">
            {Math.round((totalCollected / (totalCollected + totalPending || 1)) * 100)}%
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">المعدل العام للمؤسسة</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {isArabic ? 'الكل' : 'Tous'}
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'paid' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {isArabic ? 'مسددة' : 'Réglés'}
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {isArabic ? 'معلقة' : 'En attente'}
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs font-bold' : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isArabic ? `متأخرة (${overdueCount})` : `En retard (${overdueCount})`}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute start-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder={isArabic ? 'بحث بالاسم، رقم التسجيل، الولي...' : t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-amber-500 min-w-[240px]"
          />
        </div>

      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 font-bold text-slate-700">
                <th className="p-3 text-start w-12">#</th>
                <th className="p-3 text-start min-w-[180px]">{language === 'ar' ? 'التلميذ(ة)' : 'Élève'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'القسم' : 'Classe'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'الشهر' : 'Mois'}</th>
                <th className="p-3 text-center">{isArabic ? 'موعد الاستحقاق' : 'Date d’échéance'}</th>
                <th className="p-3 text-center">{language === 'ar' ? 'المبلغ' : 'Montant'}</th>
                <th className="p-3 text-center">{t.status}</th>
                <th className="p-3 text-center">{language === 'ar' ? 'رقم الوصل' : 'N° Reçu'}</th>
                <th className="p-3 text-center min-w-[170px]">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredPayments.map((p, idx) => {
                const st = getStudent(p.studentId);
                const overdue = isPaymentOverdue(p);
                const daysOver = getDaysOverdue(p.dueDate);

                return (
                  <tr
                    key={p.id}
                    className={`transition ${
                      overdue ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="p-3 text-slate-400 font-semibold">{idx + 1}</td>
                    
                    {/* Student Info with Overdue Visual Cue */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {overdue && (
                          <div
                            className="p-1 rounded-md bg-rose-100 text-rose-700 shrink-0"
                            title={isArabic ? `تجاوز موعد الدفع بـ ${daysOver} يوم!` : `En retard de ${daysOver} jours!`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{st?.fullName}</span>
                            {overdue && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                {daysOver} {isArabic ? 'يوم تأخر' : 'j de retard'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {st?.regNumber} {st?.parentName ? `• ولي الأمر: ${st.parentName}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-slate-700">{getClassName(p.classId)}</td>
                    <td className="p-3 font-semibold text-slate-900">{p.month}</td>
                    
                    {/* Due Date with Visual Badge */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className={`font-mono text-xs ${overdue ? 'text-rose-700 font-bold' : 'text-slate-600'}`}>
                          {p.dueDate || '2026-10-05'}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-center font-bold text-slate-900">
                      {p.amount.toLocaleString()} {schoolConfig.currency}
                    </td>

                    {/* Status with tooltips / pill */}
                    <td className="p-3 text-center">
                      {p.status === 'paid' ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{isArabic ? 'مسدد بنجاح' : 'Réglé'}</span>
                        </span>
                      ) : overdue ? (
                        <span
                          className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-black text-[11px] inline-flex items-center gap-1 border border-rose-200"
                          title={isArabic ? `تجاوز تاريخ الاستحقاق (${p.dueDate})` : `Échéance dépassée`}
                        >
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>{isArabic ? 'تجاوز موعد الدفع' : 'Échéance dépassée'}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{isArabic ? 'قيد الانتظار' : 'En attente'}</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center font-mono text-slate-600">
                      {p.receiptNo || '-'}
                    </td>

                    {/* Actions: Pay, Receipt, and Email Reminder */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.status !== 'paid' ? (
                          <>
                            {/* Pay button */}
                            <button
                              onClick={() => markAsPaid(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>{isArabic ? 'تسديد' : 'Payer'}</span>
                            </button>

                            {/* Email Reminder Button */}
                            <button
                              onClick={() => handleOpenReminderModal(p)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                overdue
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-pulse'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                              }`}
                              title={
                                isArabic
                                  ? 'إرسال إشعار تذكير عبر البريد الإلكتروني لولي الأمر'
                                  : 'Envoyer un rappel par e-mail au tuteur'
                              }
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'تذكير إيميل' : 'Rappel'}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedReceiptPayment(p)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>وصل الدفع</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Reminder Modal (نافذة إرسال إشعار تذكير بالدفع عبر البريد الإلكتروني) */}
      {reminderPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-purple-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {isArabic ? 'إرسال إشعار تذكير بسداد الرسوم عبر البريد الإلكتروني' : 'Envoyer un rappel de paiement par e-mail'}
                  </h3>
                  <p className="text-[11px] text-indigo-200">
                    {isArabic ? 'تواصل فوري مع ولي أمر التلميذ المتأخر عن الدفع' : 'Notification officielle au tuteur'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReminderPayment(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendReminder} className="p-6 space-y-4 text-xs">
              
              {/* Alert context banner */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-amber-900">
                  <span className="font-bold">
                    {isArabic ? 'بيانات القسط المتأخر: ' : 'Détails du paiement en retard: '}
                  </span>
                  <span>
                    {getStudent(reminderPayment.studentId)?.fullName} - {reminderPayment.month} (
                    {reminderPayment.amount.toLocaleString()} {schoolConfig.currency})
                  </span>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    {isArabic ? 'تاريخ الاستحقاق الأساسي:' : 'Échéance:'} {reminderPayment.dueDate}
                  </div>
                </div>
              </div>

              {/* Recipient Email */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {isArabic ? 'البريد الإلكتروني لولي الأمر (Destinataire):' : 'E-mail du parent:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    placeholder="parent.email@example.com"
                  />
                </div>
              </div>

              {/* Email Subject */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {isArabic ? 'موضوع الرسالة (Objet):' : 'Objet du message:'}
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {isArabic ? 'نص إشعار التذكير:' : 'Corps du message:'}
                </label>
                <textarea
                  rows={6}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReminderPayment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isArabic ? 'جارٍ الإرسال...' : 'Envoi en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'إرسال الإشعار الآن' : 'Envoyer le rappel'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Official Receipt Modal (وصل دفع الرسوم المدرسية) */}
      {selectedReceiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/70 no-print">
              <span className="text-xs font-bold text-slate-700">وصل استلام الرسوم المدرسية</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3 h-3" />
                  <span>{t.print}</span>
                </button>
                <button
                  onClick={() => setSelectedReceiptPayment(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-900 bg-white">
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="font-bold text-sm">{schoolConfig.nameAr}</h3>
                <p className="text-[11px] text-slate-500">إيصال استلام رسمي | {schoolConfig.academicYear}</p>
                <div className="mt-2 text-xs font-mono font-bold text-amber-800 bg-amber-50 py-1 rounded-md">
                  {selectedReceiptPayment.receiptNo}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">التلميذ(ة):</span>
                  <span className="font-bold">{getStudent(selectedReceiptPayment.studentId)?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم التسجيل:</span>
                  <span className="font-mono">{getStudent(selectedReceiptPayment.studentId)?.regNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">القسم:</span>
                  <span className="font-bold">{getClassName(selectedReceiptPayment.classId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الفترة / الشهر:</span>
                  <span className="font-bold">{selectedReceiptPayment.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاريخ التسديد:</span>
                  <span>{selectedReceiptPayment.paidDate || new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold">المبلغ المسدد:</span>
                  <span className="font-black text-emerald-700">
                    {selectedReceiptPayment.amount.toLocaleString()} {schoolConfig.currency}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-dashed border-slate-300 text-center text-[11px] text-slate-500">
                <div className="mb-8 font-bold">توقيع وختم مصلحة المالية والمحاسبة:</div>
                <div className="border-b border-slate-400 w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
