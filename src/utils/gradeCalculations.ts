import { GradeRecord, Subject, Student } from '../types';

export function calculateSubjectAverage(record?: GradeRecord): number | null {
  if (!record) return null;

  const { continuousAssessment, quiz1, quiz2, exam } = record;
  let quizAvg = quiz1;
  if (quiz2 !== undefined && quiz2 !== null) {
    quizAvg = (quiz1 + quiz2) / 2;
  }

  // Official secondary formula: ( (تقويم + فرض) / 2 + اختبار * 2 ) / 3
  const classWork = (continuousAssessment + quizAvg) / 2;
  const avg = (classWork + exam * 2) / 3;

  return Math.round(avg * 100) / 100;
}

export interface StudentTermSummary {
  student: Student;
  subjectGrades: {
    subject: Subject;
    record?: GradeRecord;
    average: number | null;
    weightedTotal: number | null;
  }[];
  totalPoints: number;
  totalCoefficients: number;
  generalAverage: number;
  rank: number;
  appreciation: string;
}

export function computeClassTermSummary(
  students: Student[],
  grades: GradeRecord[],
  subjects: Subject[],
  term: 'T1' | 'T2' | 'T3'
): StudentTermSummary[] {
  const summaries: Omit<StudentTermSummary, 'rank'>[] = students.map((student) => {
    let totalPoints = 0;
    let totalCoefficients = 0;

    const subjectGrades = subjects.map((subject) => {
      const record = grades.find(
        (g) => g.studentId === student.id && g.subjectId === subject.id && g.term === term
      );
      const average = calculateSubjectAverage(record);
      const coeff = subject.coefficient || 1;

      if (average !== null) {
        totalPoints += average * coeff;
        totalCoefficients += coeff;
      }

      return {
        subject,
        record,
        average,
        weightedTotal: average !== null ? Math.round(average * coeff * 100) / 100 : null,
      };
    });

    const generalAverage =
      totalCoefficients > 0
        ? Math.round((totalPoints / totalCoefficients) * 100) / 100
        : 0;

    return {
      student,
      subjectGrades,
      totalPoints: Math.round(totalPoints * 100) / 100,
      totalCoefficients,
      generalAverage,
      appreciation: getAppreciation(generalAverage),
    };
  });

  // Sort by generalAverage descending to calculate rank
  summaries.sort((a, b) => b.generalAverage - a.generalAverage);

  return summaries.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

export function getAppreciation(avg: number, lang: 'ar' | 'fr' | 'en' = 'ar'): string {
  if (lang === 'fr') {
    if (avg >= 18) return 'Excellent - Félicitations du Conseil';
    if (avg >= 16) return 'Très Bien - Tableau d\'Honneur';
    if (avg >= 14) return 'Bien - Encouragements';
    if (avg >= 12) return 'Assez Bien';
    if (avg >= 10) return 'Passable - Admis';
    if (avg >= 8) return 'Insuffisant - Travail à intensifier';
    return 'Faible - Avertissement';
  }

  if (lang === 'en') {
    if (avg >= 18) return 'Outstanding - High Honors';
    if (avg >= 16) return 'Very Good - Honor Roll';
    if (avg >= 14) return 'Good - Commendation';
    if (avg >= 12) return 'Satisfactory';
    if (avg >= 10) return 'Passing';
    if (avg >= 8) return 'Needs Improvement';
    return 'Unsatisfactory - Academic Warning';
  }

  // Arabic
  if (avg >= 18) return 'ممتاز مع تهنئة المجلس';
  if (avg >= 16) return 'جيد جداً مع لوحة شرف';
  if (avg >= 14) return 'جيد مع تشجيع';
  if (avg >= 12) return 'قريب من الجيد';
  if (avg >= 10) return 'مقبول (ينتقل)';
  if (avg >= 8) return 'دون المتوسط - يلزم بذل جهد أكبر';
  return 'ضعيف - إنذار وتنبيه';
}
