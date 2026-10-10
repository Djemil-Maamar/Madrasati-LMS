export type Language = 'ar' | 'fr' | 'en';
export type UserRole = 'admin' | 'teacher' | 'parent';

export type EducationCycle = 'primary' | 'middle' | 'secondary';

export interface ClassItem {
  id: string;
  name: string;
  cycle: EducationCycle;
  grade: string; // e.g. "1AP", "4AM", "3AS"
  stream?: string; // e.g. "علمي", "أدبي", "علوم تجريبية", "رياضيات"
  roomDefaultId?: string;
  studentCount: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjectIds: string[];
  assignedClassIds: string[];
  avatarColor?: string;
  status?: 'active' | 'on_leave' | 'delegated'; // الحالة: نشط / في إجازة / منتدب
  currentLeave?: {
    leaveId: string;
    leaveType: TeacherLeaveType;
    startDate: string;
    endDate: string;
    daysCount: number;
    substituteTeacherName?: string;
  };
  unavailableDates?: string[]; // تواريخ عدم التفرغ بسبب الإجازة
  availabilityNote?: string;
}

export type TeacherLeaveType =
  | 'sick'              // إجازة مرضية
  | 'emergency'         // غياب طارئ / ظرف عائلي قاهر
  | 'maternity'         // إجازة أمومة ورعاية
  | 'training'          // تكوين بيداغوجي / ندوة تربوية
  | 'official_mission'  // مهمة رسمية / تصحيح الامتحانات
  | 'unpaid'            // استيداع / عطلة غير مدفوعة
  | 'annual';           // إجازة سنوية

export type LeaveApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface TeacherLeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  leaveType: TeacherLeaveType;
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
  daysCount: number;
  reason: string;
  supportingDocument?: string; // اسم الوثيقة المرفقة / تبرير
  status: LeaveApprovalStatus;
  requestDate: string;      // YYYY-MM-DD
  reviewedDate?: string;    // YYYY-MM-DD
  reviewedBy?: string;      // اسم المدير / الإدارة
  adminNotes?: string;      // ملاحظات الإدارة أو سبب الرفض
  substituteTeacherId?: string;
  substituteTeacherName?: string;
  affectsTimetableSessionsCount?: number;
}

export interface Subject {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  code: string;
  cycle: EducationCycle;
  coefficient: number;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'standard' | 'lab' | 'computer' | 'sports';
  building?: string;
}

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday';

export interface TimeSlot {
  id: string;
  start: string; // "08:00"
  end: string;   // "09:00"
  label: string;
}

export interface TimetableSession {
  id: string;
  day: DayOfWeek;
  slotId: string; // connects to TimeSlot
  classId: string;
  teacherId: string;
  subjectId: string;
  roomId: string;
  notes?: string;
}

export interface TimetableConflict {
  id: string;
  type: 'teacher' | 'room' | 'class';
  day: DayOfWeek;
  slotId: string;
  sessionA: TimetableSession;
  sessionB: TimetableSession;
  message: string;
}

export interface Student {
  id: string;
  regNumber: string; // رقم التسجيل
  fullName: string;
  fullNameFr?: string;
  cycle: EducationCycle;
  grade: string;
  classId: string;
  birthDate: string;
  gender: 'male' | 'female';
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  term: 'T1' | 'T2' | 'T3';
  continuousAssessment: number; // تقويم مستمر / 20
  quiz1: number;                 // فرض 1 / 20
  quiz2?: number;                // فرض 2 / 20 (optional)
  exam: number;                  // اختبار / 20
}

export type AttendanceStatus = 'present' | 'absent_unjustified' | 'absent_justified' | 'tardy';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  period: string; // 'morning' | 'afternoon' or slot label
  status: AttendanceStatus;
  tardyMinutes?: number;
  reason?: string;
  recordedByTeacherId?: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  classId: string;
  month: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  receiptNo?: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer';
}

export interface SchoolConfig {
  nameAr: string;
  nameFr: string;
  nameEn: string;
  academicYear: string;
  directorName: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  activeCycles: EducationCycle[];
}

export interface AIExamSectionQuestion {
  qNumber: string;
  question: string;
  points: number;
  subQuestions?: string[];
}

export interface AIExamSectionAnswer {
  qNumber: string;
  solution: string;
  gradingCriteria?: string;
  points: number;
}

export interface AIExamSection {
  id: string;
  title: string;
  points: number;
  context?: string;
  questions: AIExamSectionQuestion[];
  answerKey: AIExamSectionAnswer[];
}

export interface AIExamResult {
  title: string;
  examTypeLabel: string;
  cycleName: string;
  gradeLevel: string;
  streamName?: string;
  subjectName: string;
  duration: string;
  totalPoints: number;
  instructions: string[];
  sections: AIExamSection[];
  pedagogicalCompetencies: string[];
  teacherAdvice?: string;
}

export type MessageAudience = 'all' | 'teachers' | 'parents' | 'class';
export type MessagePriority = 'normal' | 'urgent' | 'official_circular' | 'event';

export interface InternalMessage {
  id: string;
  title: string;
  body: string;
  senderName: string;
  senderRole: 'admin' | 'director' | 'pedagogy_council' | 'teacher';
  targetAudience: MessageAudience;
  targetClassId?: string;
  targetTeacherId?: string;
  targetStudentId?: string;
  targetParentPhone?: string;
  absenceAlertId?: string;
  priority: MessagePriority;
  date: string; // YYYY-MM-DD HH:mm
  isRead?: boolean;
  category?: string;
  attachmentsNote?: string;
}

// ==========================================
// Parent Absence Alert Types
// ==========================================
export type AbsenceAlertSeverity = 'notice' | 'warning' | 'formal_notice' | 'summons';
export type AbsenceAlertStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'acknowledged' | 'justified';

export interface ParentAbsenceAlert {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  parentName: string;
  parentPhone: string;
  absenceDaysCount: number;
  unjustifiedCount: number;
  justifiedCount: number;
  thresholdExceeded: number;
  severity: AbsenceAlertSeverity; // 'notice' (3d), 'warning' (5d), 'formal_notice' (7d), 'summons' (10+d)
  title: string;
  message: string;
  sentDate: string; // YYYY-MM-DD HH:mm
  sentBy: string; // e.g. "إدارة المؤسسة / مستشارية التربية"
  status: AbsenceAlertStatus;
  deliveryChannel?: 'parent_portal' | 'sms_and_portal';
  parentResponse?: string;
  parentResponseDate?: string;
  requiresSummons?: boolean;
}

export type ActivityCategory = 'trip' | 'science' | 'sports' | 'culture' | 'workshop' | 'competition';
export type ActivityStatus = 'scheduled' | 'registration_open' | 'completed' | 'cancelled';

export interface SchoolActivity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  endDate?: string;
  time?: string;
  location: string;
  participatingClassIds: string[];
  costPerStudent: number; // 0 for free
  totalBudget?: number;
  supervisorTeacherId?: string;
  supervisorName?: string;
  maxParticipants?: number;
  currentParticipantsCount?: number;
  status: ActivityStatus;
  contactNotes?: string;
}

// Teacher Periodic Evaluation System Types
export type EvaluationPeriod = 'term1' | 'term2' | 'term3' | 'annual' | 'inspection';
export type EvaluationRating = 'excellent' | 'very_good' | 'good' | 'acceptable' | 'needs_improvement';

export interface EvaluationCriterion {
  id: string;
  nameAr: string;
  nameFr: string;
  maxScore: number;
  score: number;
  notes?: string;
}

export interface TeacherEvaluation {
  id: string;
  teacherId: string;
  teacherName?: string;
  academicYear: string;
  period: EvaluationPeriod;
  date: string; // YYYY-MM-DD
  evaluatorName: string;
  evaluatorRole: 'director' | 'inspector' | 'pedagogy_advisor';
  criteria: EvaluationCriterion[];
  totalScore: number; // sum of criterion scores (max 20)
  maxTotalScore: number; // 20
  rating: EvaluationRating;
  generalComments: string;
  strengths: string[];
  recommendations: string[];
  attendanceRateNote?: string;
  signedByTeacher?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// ==========================================
// Student Competencies & Radar Analysis Types
// ==========================================
export interface StudentCompetencyScore {
  competencyId: string;
  nameAr: string;
  nameFr: string;
  category: 'cognitive' | 'methodological' | 'linguistic' | 'behavioral' | 'practical';
  score: number; // 0 to 20
  classAvg: number; // 0 to 20
  benchmark: number; // Target benchmark (e.g. 12/20)
  description?: string;
}

export interface StudentMultiSubjectScore {
  subjectId: string;
  subjectCode: string;
  nameAr: string;
  nameFr: string;
  studentAvg: number; // 0 to 20
  classAvg: number; // 0 to 20
  coefficient: number;
}

export interface StudentRadarProfile {
  studentId: string;
  studentName: string;
  classId: string;
  term: 'T1' | 'T2' | 'T3';
  competencies: StudentCompetencyScore[];
  subjects: StudentMultiSubjectScore[];
  overallMasteryPercentage: number;
  pedagogicalProfileAdvice: string;
  topStrengths: string[];
  growthAreas: string[];
}

// ==========================================
// School Inventory & Asset Management Types
// ==========================================
export type InventoryCategory =
  | 'equipment'
  | 'library_book'
  | 'classroom_asset'
  | 'it_devices'
  | 'lab_gear'
  | 'sports';

export type MaintenanceStatus = 'good' | 'needs_maintenance' | 'under_repair' | 'damaged';

export type AssignmentStatus =
  | 'in_storage'
  | 'assigned_classroom'
  | 'assigned_teacher'
  | 'borrowed_student';

export interface MaintenanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  issueDescription: string;
  actionTaken?: string;
  technicianName?: string;
  cost?: number; // DZD
  status: 'pending' | 'in_progress' | 'completed';
}

export interface InventoryItem {
  id: string;
  nameAr: string;
  nameFr: string;
  category: InventoryCategory;
  barcode: string; // Serial / Barcode / ISBN
  quantity: number;
  availableQuantity: number;
  condition: MaintenanceStatus;
  assignmentStatus: AssignmentStatus;

  // Location & assignment
  assignedToLocation?: string; // e.g. "قاعة 1AM-1" or "مخبر العلوم"
  assignedToName?: string; // e.g. "أ. أحمد بلحاج"
  assignedDate?: string;
  expectedReturnDate?: string;

  // Book details
  author?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;

  // Maintenance details
  lastMaintenanceDate?: string;
  nextScheduledMaintenance?: string;
  maintenanceNotes?: string;
  maintenanceHistory?: MaintenanceRecord[];

  // Purchase & financial value
  purchaseDate?: string;
  unitValueDZD?: number; // Value in Algerian Dinars
  supplier?: string;
  notes?: string;
}

