export interface RawCurriculumEntry {
  stage: string;
  level: string;
  specialty: string;
  subject: string;
  weeklyHours?: number;
  coefficient?: number;
}

export const algerianCurriculumEntries: RawCurriculumEntry[] = [
  // التعليم الابتدائي - السنة الأولى
  { stage: 'التعليم الابتدائي', level: 'السنة الأولى ابتدائي', specialty: 'عام', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الأولى ابتدائي', specialty: 'عام', subject: 'اللغة العربية', weeklyHours: 9, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الأولى ابتدائي', specialty: 'عام', subject: 'الرياضيات', weeklyHours: 5, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الأولى ابتدائي', specialty: 'عام', subject: 'التربية المدنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الأولى ابتدائي', specialty: 'عام', subject: 'التربية العلمية والتكنولوجية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الأولى ابتدائي', specialty: 'عام', subject: 'التربية الفنية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الأولى ابتدائي', specialty: 'عام', subject: 'التربية البدنية والرياضية', weeklyHours: 2, coefficient: 1 },

  // التعليم الابتدائي - السنة الثانية
  { stage: 'التعليم الابتدائي', level: 'السنة الثانية ابتدائي', specialty: 'عام', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثانية ابتدائي', specialty: 'عام', subject: 'اللغة العربية', weeklyHours: 8, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثانية ابتدائي', specialty: 'عام', subject: 'الرياضيات', weeklyHours: 5, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثانية ابتدائي', specialty: 'عام', subject: 'التربية المدنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثانية ابتدائي', specialty: 'عام', subject: 'التربية العلمية والتكنولوجية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثانية ابتدائي', specialty: 'عام', subject: 'التربية الفنية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثانية ابتدائي', specialty: 'عام', subject: 'التربية البدنية والرياضية', weeklyHours: 2, coefficient: 1 },

  // التعليم الابتدائي - السنة الثالثة
  { stage: 'التعليم الابتدائي', level: 'السنة الثالثة ابتدائي', specialty: 'عام', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثالثة ابتدائي', specialty: 'عام', subject: 'اللغة العربية', weeklyHours: 7, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثالثة ابتدائي', specialty: 'عام', subject: 'اللغة الفرنسية', weeklyHours: 4, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثالثة ابتدائي', specialty: 'عام', subject: 'الرياضيات', weeklyHours: 5, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثالثة ابتدائي', specialty: 'عام', subject: 'التربية المدنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثالثة ابتدائي', specialty: 'عام', subject: 'التربية العلمية والتكنولوجية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثالثة ابتدائي', specialty: 'عام', subject: 'التربية الفنية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الثالثة ابتدائي', specialty: 'عام', subject: 'التربية البدنية والرياضية', weeklyHours: 2, coefficient: 1 },

  // التعليم الابتدائي - السنة الرابعة
  { stage: 'التعليم الابتدائي', level: 'السنة الرابعة ابتدائي', specialty: 'عام', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الرابعة ابتدائي', specialty: 'عام', subject: 'اللغة العربية', weeklyHours: 7, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الرابعة ابتدائي', specialty: 'عام', subject: 'اللغة الفرنسية', weeklyHours: 4, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الرابعة ابتدائي', specialty: 'عام', subject: 'الرياضيات', weeklyHours: 5, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الرابعة ابتدائي', specialty: 'عام', subject: 'التربية المدنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الرابعة ابتدائي', specialty: 'عام', subject: 'التربية العلمية والتكنولوجية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الرابعة ابتدائي', specialty: 'عام', subject: 'التربية الفنية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الرابعة ابتدائي', specialty: 'عام', subject: 'التربية البدنية والرياضية', weeklyHours: 2, coefficient: 1 },

  // التعليم الابتدائي - السنة الخامسة
  { stage: 'التعليم الابتدائي', level: 'السنة الخامسة ابتدائي', specialty: 'عام', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الخامسة ابتدائي', specialty: 'عام', subject: 'اللغة العربية', weeklyHours: 7, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الخامسة ابتدائي', specialty: 'عام', subject: 'اللغة الفرنسية', weeklyHours: 4, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الخامسة ابتدائي', specialty: 'عام', subject: 'الرياضيات', weeklyHours: 5, coefficient: 2 },
  { stage: 'التعليم الابتدائي', level: 'السنة الخامسة ابتدائي', specialty: 'عام', subject: 'التربية المدنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الخامسة ابتدائي', specialty: 'عام', subject: 'التربية العلمية والتكنولوجية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الخامسة ابتدائي', specialty: 'عام', subject: 'التربية الفنية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم الابتدائي', level: 'السنة الخامسة ابتدائي', specialty: 'عام', subject: 'التربية البدنية والرياضية', weeklyHours: 2, coefficient: 1 },

  // التعليم المتوسط - 1AM
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'التربية الإسلامية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'اللغة العربية', weeklyHours: 4, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'اللغة الإنجليزية', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'الرياضيات', weeklyHours: 4, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'التاريخ والجغرافيا', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'التربية المدنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'علوم الطبيعة والحياة', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'التربية الفنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الأولى متوسط', specialty: 'عام', subject: 'التربية البدنية', weeklyHours: 2, coefficient: 1 },

  // التعليم المتوسط - 2AM
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'التربية الإسلامية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'اللغة العربية', weeklyHours: 4, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'اللغة الإنجليزية', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'الرياضيات', weeklyHours: 4, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'التاريخ والجغرافيا', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'التربية المدنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'علوم الطبيعة والحياة', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'العلوم الفيزيائية والتكنولوجية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'التربية الفنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثانية متوسط', specialty: 'عام', subject: 'التربية البدنية', weeklyHours: 2, coefficient: 1 },

  // التعليم المتوسط - 3AM
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'التربية الإسلامية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'اللغة العربية', weeklyHours: 4, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'اللغة الإنجليزية', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'الرياضيات', weeklyHours: 4, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'التاريخ والجغرافيا', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'التربية المدنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'علوم الطبيعة والحياة', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'العلوم الفيزيائية والتكنولوجية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'التربية الفنية', weeklyHours: 1, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الثالثة متوسط', specialty: 'عام', subject: 'التربية البدنية', weeklyHours: 2, coefficient: 1 },

  // التعليم المتوسط - 4AM (BEM)
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'التربية الإسلامية', weeklyHours: 1.5, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'اللغة العربية', weeklyHours: 5, coefficient: 5 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'اللغة الفرنسية', weeklyHours: 3.5, coefficient: 3 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'الرياضيات', weeklyHours: 5, coefficient: 4 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'التاريخ والجغرافيا', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'التربية المدنية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'علوم الطبيعة والحياة', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'العلوم الفيزيائية والتكنولوجية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'التربية الفنية', weeklyHours: 1.5, coefficient: 1 },
  { stage: 'التعليم المتوسط', level: 'السنة الرابعة متوسط', specialty: 'عام (تتوج بشهادة BEM)', subject: 'التربية البدنية', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 1AS جذع مشترك علوم وتكنولوجيا
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'القرآن والتربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'الرياضيات', weeklyHours: 5, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'التاريخ والجغرافيا', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'العلوم الفيزيائية', weeklyHours: 4, coefficient: 4 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'علوم الطبيعة والحياة', weeklyHours: 4, coefficient: 4 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'الإعلام الآلي', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك علوم وتكنولوجيا)', specialty: 'جذع مشترك علوم وتكنولوجيا', subject: 'التربية البدنية', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 1AS جذع مشترك آداب وفلسفة
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'القرآن والتربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'اللغة العربية وآدابها', weeklyHours: 5, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'اللغة الفرنسية', weeklyHours: 3.5, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'اللغة الإنجليزية', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'الرياضيات', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'التاريخ والجغرافيا', weeklyHours: 3.5, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'علوم إنسانية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'الإعلام الآلي', weeklyHours: 2, coefficient: 1 },
  { stage: 'التعليم الثانوي', level: 'السنة الأولى ثانوي (جذع مشترك آداب وفلسفة)', specialty: 'جذع مشترك آداب وفلسفة', subject: 'التربية البدنية', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 2AS شعبة علوم تجريبية
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'الرياضيات', weeklyHours: 5, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'علوم الطبيعة والحياة', weeklyHours: 5, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'العلوم الفيزيائية', weeklyHours: 4.5, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'التاريخ والجغرافيا', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'الفلسفة', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثانية ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'التربية البدنية', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة علوم تجريبية (بكالوريا)
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'الرياضيات', weeklyHours: 5.5, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'علوم الطبيعة والحياة', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'العلوم الفيزيائية', weeklyHours: 5.5, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'التاريخ والجغرافيا', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'الفلسفة', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة علوم تجريبية)', specialty: 'شعبة علوم تجريبية', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة رياضيات
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'الرياضيات (تكثيف)', weeklyHours: 7, coefficient: 7 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'العلوم الفيزيائية', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'علوم الطبيعة والحياة', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'التاريخ والجغرافيا', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'الفلسفة', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة رياضيات)', specialty: 'شعبة رياضيات', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة آداب وفلسفة
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة آداب وفلسفة)', specialty: 'شعبة آداب وفلسفة', subject: 'الأدب العربي', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة آداب وفلسفة)', specialty: 'شعبة آداب وفلسفة', subject: 'الفلسفة', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة آداب وفلسفة)', specialty: 'شعبة آداب وفلسفة', subject: 'التاريخ والجغرافيا', weeklyHours: 4, coefficient: 4 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة آداب وفلسفة)', specialty: 'شعبة آداب وفلسفة', subject: 'اللغة الفرنسية', weeklyHours: 3.5, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة آداب وفلسفة)', specialty: 'شعبة آداب وفلسفة', subject: 'اللغة الإنجليزية', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة آداب وفلسفة)', specialty: 'شعبة آداب وفلسفة', subject: 'الرياضيات', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة آداب وفلسفة)', specialty: 'شعبة آداب وفلسفة', subject: 'العلوم الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة آداب وفلسفة)', specialty: 'شعبة آداب وفلسفة', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة لغات أجنبية
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'اللغة العربية وآدابها', weeklyHours: 4, coefficient: 4 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'اللغة الفرنسية', weeklyHours: 5, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'اللغة الإنجليزية', weeklyHours: 5, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'اللغة الإسبانية', weeklyHours: 4, coefficient: 4 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'اللغة الألمانية', weeklyHours: 4, coefficient: 4 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'اللغة الإيطالية', weeklyHours: 4, coefficient: 4 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'الفلسفة', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'التاريخ والجغرافيا', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'الرياضيات', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'العلوم الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة لغات أجنبية)', specialty: 'شعبة لغات أجنبية', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة تسيير واقتصاد
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'التسيير المحاسبي والمالي', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'الاقتصاد والمؤسسة', weeklyHours: 4, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'القانون', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'الرياضيات', weeklyHours: 5, coefficient: 5 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'التاريخ والجغرافيا', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'الفلسفة', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تسيير واقتصاد)', specialty: 'شعبة تسيير واقتصاد', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة تقني رياضي (هندسة ميكانيكية)
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'الرياضيات', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'العلوم الفيزيائية', weeklyHours: 5.5, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'هندسة ميكانيكية', weeklyHours: 6, coefficient: 7 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'التاريخ والجغرافيا', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'الفلسفة', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - ميكانيك)', specialty: 'شعبة تقني رياضي (هندسة ميكانيكية)', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة تقني رياضي (هندسة مدنية)
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'الرياضيات', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'العلوم الفيزيائية', weeklyHours: 5.5, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'هندسة مدنية', weeklyHours: 6, coefficient: 7 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'التاريخ والجغرافيا', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'الفلسفة', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - مدني)', specialty: 'شعبة تقني رياضي (هندسة مدنية)', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة تقني رياضي (هندسة كهربائية)
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'الرياضيات', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'العلوم الفيزيائية', weeklyHours: 5.5, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'هندسة كهربائية', weeklyHours: 6, coefficient: 7 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'التاريخ والجغرافيا', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'الفلسفة', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - كهرباء)', specialty: 'شعبة تقني رياضي (هندسة كهربائية)', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },

  // التعليم الثانوي - 3AS شعبة تقني رياضي (هندسة الطرائق)
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'الرياضيات', weeklyHours: 6, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'العلوم الفيزيائية', weeklyHours: 5.5, coefficient: 6 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'هندسة الطرائق', weeklyHours: 6, coefficient: 7 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'اللغة العربية وآدابها', weeklyHours: 3, coefficient: 3 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'اللغة الفرنسية', weeklyHours: 3, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'اللغة الإنجليزية', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'التاريخ والجغرافيا', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'الفلسفة', weeklyHours: 2.5, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'التربية الإسلامية', weeklyHours: 2, coefficient: 2 },
  { stage: 'التعليم الثانوي', level: 'السنة الثالثة ثانوي (شعبة تقني رياضي - طرائق)', specialty: 'شعبة تقني رياضي (هندسة الطرائق)', subject: 'التربية البدنية (تتوج بالبكالوريا)', weeklyHours: 2, coefficient: 1 },
];
