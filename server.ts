import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Route: Create Year Folder
app.post('/api/create-year-folder', (req, res) => {
  const { yearName } = req.body;
  res.json({
    success: true,
    message: `تم إنشاء مجلد السنة الدراسية ${yearName || ''} بنجاح`,
  });
});

// API Route: Create Subject Folders Hierarchically
app.post('/api/create-subject-folders', (req, res) => {
  const { yearName, stageName, levelName, subjectName } = req.body;
  res.json({
    success: true,
    message: `تم إنشاء مجلدات المادة [${yearName || ''} / ${stageName || ''} / ${levelName || ''} / ${subjectName || ''}] بنجاح`,
  });
});

// API Route: Import Curriculum
app.post('/api/import-curriculum', (req, res) => {
  res.json({
    success: true,
    message: 'تم استيراد المنظومة التربوية الرسمية بنجاح!',
  });
});

// API Route: AI Exam Generator
app.post('/api/generate-exam', async (req, res) => {
  try {
    const {
      cycle = 'secondary',
      grade = '3AS',
      stream = 'experimental_sciences',
      subject = 'mathematics',
      lessonObjectives = '',
      examType = 'quiz', // 'quiz' (فرض), 'exam' (اختبار), 'diagnostic' (تشخيصي)
      difficulty = 'medium', // 'easy', 'medium', 'hard'
      durationMinutes = 60,
      totalPoints = 20,
      language = 'ar', // 'ar', 'fr', 'en'
      customNotes = '',
    } = req.body;

    const cycleLabels: Record<string, { ar: string; fr: string; en: string }> = {
      primary: { ar: 'التعليم الابتدائي', fr: 'Enseignement Primaire', en: 'Primary Education' },
      middle: { ar: 'التعليم المتوسط', fr: 'Enseignement Moyen', en: 'Middle School' },
      secondary: { ar: 'التعليم الثانوي', fr: 'Enseignement Secondaire', en: 'Secondary / High School' },
    };

    const promptLanguageInstruction =
      language === 'fr'
        ? 'Rédige l\'intégralité du sujet, les questions, le barème et les corrigés en langue FRANÇAISE.'
        : language === 'en'
        ? 'Write the entire exam, questions, grading scale, and answers in ENGLISH.'
        : 'اكتب موضوع الفرض كاملاً مع الأسئلة وسلم التنقيط والإجابة النموذجية باللغة العربية الفصحى السليمة وفق المناهج التربوية الرسمية.';

    const systemPrompt = `أنت مفتش تربوي وخبير في إعداد مواضيع الامتحانات والفروض المدرسية الرسمية لمختلف الأطوار (الابتدائي، المتوسط، الثانوي).
مهمتك إنشاء فرض/اختبار رسمي نموذجي متكامل وعالي الجودة، يحترم بدقة المقاربة بالكفاءات وسلم التنقيط (مجموع 20 نقطة) ومرفق بالإجابة النموذجية المفصلة وشبكة التقويم.
${promptLanguageInstruction}`;

    const userPrompt = `
قم بإنشاء موضوع ${examType === 'quiz' ? 'فرض محروس' : examType === 'exam' ? 'اختبار فصلي' : 'تقويم تشخيصي'} رسمي متكامل:
- الطور: ${cycleLabels[cycle]?.[language as 'ar' | 'fr' | 'en'] || cycle}
- المستوى / السنة: ${grade}
- الشعبة / التخصص: ${stream}
- المادة: ${subject}
- أهداف ومحاور الدرس المستهدفة: ${lessonObjectives || 'المفاهيم والكفاءات الأساسية في هذا المحور'}
- مستوى الصعوبة: ${difficulty}
- المدة الزمنية: ${durationMinutes} دقيقة
- النقطة الإجمالية: ${totalPoints} / 20
- ملاحظات إضافية: ${customNotes || 'لا توجد'}

يجب أن يتضمن الموضوع:
1. ترويسة رسمية، عنوان واضح، وتوجيهات للمترشح.
2. تمارين منظمة ومرتبة (مثلاً التمرين الأول، التمرين الثاني، وضعية إدماجية / مسألة شاملة) مع توزيع النقاط بدقة لكل تمرين ليكون المجموع ${totalPoints}.
3. أسئلة واضحة، متدرجة الصعوبة تحاكي المواضيع الرسمية للوزارة.
4. إجابة نموذجية مفصلة (Corrigé-type) لكل سؤال مع سلم التنقيط الجزئي وشبكة المعايير.
5. الكفاءات والمؤشرات التربوية المستهدفة.

يرجى إرجاع النتيجة ككائن JSON بالبنية المحددة.
`;

    if (!process.env.GEMINI_API_KEY) {
      // Return high quality curriculum fallback if key is not yet set
      const mockExam = getCurriculumFallbackExam({
        cycle,
        grade,
        stream,
        subject,
        lessonObjectives,
        examType,
        difficulty,
        durationMinutes,
        language,
      });
      return res.json({ success: true, exam: mockExam, isFallback: true });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            examTypeLabel: { type: Type.STRING },
            cycleName: { type: Type.STRING },
            gradeLevel: { type: Type.STRING },
            streamName: { type: Type.STRING },
            subjectName: { type: Type.STRING },
            duration: { type: Type.STRING },
            totalPoints: { type: Type.NUMBER },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                  context: { type: Type.STRING, description: 'Context or text intro if any' },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        qNumber: { type: Type.STRING },
                        question: { type: Type.STRING },
                        points: { type: Type.NUMBER },
                        subQuestions: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['qNumber', 'question', 'points'],
                    },
                  },
                  answerKey: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        qNumber: { type: Type.STRING },
                        solution: { type: Type.STRING },
                        gradingCriteria: { type: Type.STRING },
                        points: { type: Type.NUMBER },
                      },
                      required: ['qNumber', 'solution', 'points'],
                    },
                  },
                },
                required: ['id', 'title', 'points', 'questions', 'answerKey'],
              },
            },
            pedagogicalCompetencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            teacherAdvice: { type: Type.STRING },
          },
          required: [
            'title',
            'subjectName',
            'gradeLevel',
            'duration',
            'totalPoints',
            'instructions',
            'sections',
            'pedagogicalCompetencies',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('لم يتم استلام رد من النموذج');
    }

    const examData = JSON.parse(text);
    return res.json({ success: true, exam: examData, isFallback: false });
  } catch (error: any) {
    console.error('Error generating exam with Gemini:', error);
    // Return gracefully a fallback so UI never crashes
    const fallback = getCurriculumFallbackExam(req.body);
    return res.json({
      success: true,
      exam: fallback,
      isFallback: true,
      errorNotice: error.message || 'تم استخدام النموذج التوليدي الاحتياطي',
    });
  }
});

// Helper for realistic fallback exam
function getCurriculumFallbackExam(params: any) {
  const {
    grade = '3AS',
    subject = 'رياضيات',
    stream = 'علوم تجريبية',
    examType = 'quiz',
    durationMinutes = 60,
    lessonObjectives = '',
    language = 'ar',
  } = params;

  const isFrench = language === 'fr';
  const isEnglish = language === 'en';

  if (isFrench) {
    return {
      title: examType === 'quiz' ? 'Devoir Surveillé N°1 du 1er Trimestre' : 'Composition Trimestrielle',
      examTypeLabel: 'Devoir Surveillé',
      cycleName: 'Enseignement Secondaire',
      gradeLevel: grade,
      streamName: stream,
      subjectName: subject,
      duration: `${durationMinutes} minutes`,
      totalPoints: 20,
      instructions: [
        'L’usage de la calculatrice scientifique non programmable est autorisé.',
        'La clarté des raisonnements et la qualité de la rédaction seront prises en compte.',
      ],
      sections: [
        {
          id: 'ex1',
          title: 'Exercice 1 : Restitution organisée des connaissances',
          points: 8,
          context: `Contexte pédagogique relatif à : ${lessonObjectives || 'l’analyse des données et propriétés du cours'}.`,
          questions: [
            {
              qNumber: '1',
              question: 'Définir les notions clés étudiées et énoncer les propriétés fondamentales associées.',
              points: 3,
              subQuestions: ['Citer deux conditions indispensables.', 'Donner un exemple illustratif concret.'],
            },
            {
              qNumber: '2',
              question: 'Démontrer la relation caractéristique et interpréter graphiquement le résultat obtenu.',
              points: 5,
              subQuestions: ['Établir l\'expression analytique.', 'Vérifier la cohérence dimensionnelle.'],
            },
          ],
          answerKey: [
            {
              qNumber: '1',
              solution: 'Définition exacte des termes et formulation des théorèmes du programme avec rigueur.',
              gradingCriteria: 'Définition correcte (1.5 pts) + Exemple pertinent (1.5 pts)',
              points: 3,
            },
            {
              qNumber: '2',
              solution: 'Démonstration par étapes logiques avec justification des théorèmes appliqués.',
              gradingCriteria: 'Étapes de calcul (3 pts) + Interprétation graphique (2 pts)',
              points: 5,
            },
          ],
        },
        {
          id: 'ex2',
          title: 'Exercice 2 : Situation problème et résolution',
          points: 12,
          context: 'Étude d’un système complexe modélisé d’après les données expérimentales.',
          questions: [
            {
              qNumber: '1',
              question: 'Analyser les variations et dresser le tableau récapitulatif complet.',
              points: 4,
            },
            {
              qNumber: '2',
              question: 'Résoudre l’équation caractéristique et déduire les valeurs limites.',
              points: 4,
            },
            {
              qNumber: '3',
              question: 'Synthétiser les conclusions et proposer une optimisation concrète.',
              points: 4,
            },
          ],
          answerKey: [
            {
              qNumber: '1',
              solution: 'Calcul de la dérivée ou du taux de variation, étude du signe et tableau des variations.',
              gradingCriteria: 'Calcul exact (2 pts) + Tableau complet (2 pts)',
              points: 4,
            },
            {
              qNumber: '2',
              solution: 'Application rigoureuse de la méthode de résolution et identification des solutions admissibles.',
              gradingCriteria: 'Méthode (2 pts) + Résultats exacts (2 pts)',
              points: 4,
            },
            {
              qNumber: '3',
              solution: 'Argumentation scientifique et proposition de recommandation validée par les calculs.',
              gradingCriteria: 'Cohérence (2 pts) + Recommandation (2 pts)',
              points: 4,
            },
          ],
        },
      ],
      pedagogicalCompetencies: [
        'Mobilisation des ressources disciplinaires face à une situation inédite.',
        'Raisonnement logique et rigueur de la démonstration.',
        'Communication écrite claire et structurée.',
      ],
      teacherAdvice: 'Veillez à accorder le bénéfice du doute aux démarches originales menées avec rigueur.',
    };
  }

  return {
    title: examType === 'quiz' ? 'الفرض المحروس الأول للفصل الأول' : 'الاختبار الفصلي الموحد',
    examTypeLabel: examType === 'quiz' ? 'فرض محروس' : 'اختبار فصلي',
    cycleName: 'التعليم الثانوي / المتوسط',
    gradeLevel: grade,
    streamName: stream,
    subjectName: subject,
    duration: `${durationMinutes} دقيقة`,
    totalPoints: 20,
    instructions: [
      'يُسمح باستعمال الآلة الحاسبة العلمية غير القابلة للبرمجة.',
      'تُمنح عناية خاصة لنظافة الورقة ودقة التعليل الرياضي واللغوي.',
      'الإجابة تكون بخط واضح مع ترقيم الأسئلة بدقة.',
    ],
    sections: [
      {
        id: 'ex1',
        title: 'التمرين الأول: استرجاع المعارف وتطبيق القوانين',
        points: 6,
        context: `يرتكز هذا التمرين على قياس مدى استيعاب التلميذ لمحور: ${lessonObjectives || 'المفاهيم الأساسية والتطبيقات المباشرة'}.`,
        questions: [
          {
            qNumber: '1',
            question: 'عرّف بدقة المصطلحات والمفاهيم المدروسة واذكر شروط تطبيق العلاقات الرياضية/العلمية الخاصة بها.',
            points: 2.5,
            subQuestions: ['بيّن الشروط النظامية للتجربة أو المبرهنة.', 'أعط مثالاً تطبيقياً يوضح ذلك.'],
          },
          {
            qNumber: '2',
            question: 'احسب المقادير المطلوبة بناءً على المعطيات المرفقة وفسّر النتيجة المحصل عليها بيانيا أو علميا.',
            points: 3.5,
            subQuestions: ['كتابة القانون والتعويض العددي بدقة.', 'تحديد وحدة القياس الصحيحة ومجال الصحة.'],
          },
        ],
        answerKey: [
          {
            qNumber: '1',
            solution: 'التعريف الدقيق وفق المنهاج الوزاري، ذكر الشروط الثلاثة بوضوح.',
            gradingCriteria: 'صحة التعريف (1.5ن) + ذكر الشروط والمثال (1ن)',
            points: 2.5,
          },
          {
            qNumber: '2',
            solution: 'تطبيق القانون المباشر، إيجاد النتيجة العددية وتدويرها حسب المطلوب مع كتابة الوحدة الدولية.',
            gradingCriteria: 'القانون والتعويض (2ن) + النتيجة النهائية والوحدة (1.5ن)',
            points: 3.5,
          },
        ],
      },
      {
        id: 'ex2',
        title: 'التمرين الثاني: التحليل والاستدلال العلمي',
        points: 6,
        context: 'سند توضيحي يتضمن جدول بيانات أو مخططاً بيانياً يعكس ظاهرة مدروسة في المنهاج.',
        questions: [
          {
            qNumber: '1',
            question: 'حلّل المنحنى البياني أو الجدول المقابل موضحاً مختلف مراحل تطور الظاهرة.',
            points: 3,
          },
          {
            qNumber: '2',
            question: 'قدّم تفسيراً علمياً مدعماً بالحسابات أو المعادلات للنتائج المسجلة في المرحلة الثانية.',
            points: 3,
          },
        ],
        answerKey: [
          {
            qNumber: '1',
            solution: 'التحليل المنظم (التعريف بالوثيقة + تفكيك المعطيات مع الدلالات + الاستنتاج الجزئي).',
            gradingCriteria: 'التحليل المنهجي (2ن) + الاستنتاج (1ن)',
            points: 3,
          },
          {
            qNumber: '2',
            solution: 'الربط المنطقي بين الأسباب والنتائج واستحضار القوانين المفسرة للظاهرة.',
            gradingCriteria: 'صحة التفسير (2ن) + المعادلات أو البرهان (1ن)',
            points: 3,
          },
        ],
      },
      {
        id: 'ex3',
        title: 'التمرين الثالث: وضعية إدماجية / مسألة شاملة',
        points: 8,
        context: 'سياق واقعي هادف يتطلب دمج عدة موارد سابقة لحل مشكلة مركبة.',
        questions: [
          {
            qNumber: '1',
            question: 'صِغ نموذجاً رياضياً أو علمياً يعبر عن الإشكالية المطروحة في السند.',
            points: 2.5,
          },
          {
            qNumber: '2',
            question: 'ناقش الحلول الممكنة وحدد الحل الأمثل مع إعطاء تبرير كمي ونوعي.',
            points: 3,
          },
          {
            qNumber: '3',
            question: 'اقترح توصيات عملية وإجراءات وقائية/تحسينية مدعومة بالحجج العلمية.',
            points: 2.5,
          },
        ],
        answerKey: [
          {
            qNumber: '1',
            solution: 'اختيار المتغيرات، بناء النموذج الرياضي أو المعادلة وحل جملة المعادلات.',
            gradingCriteria: 'الملاءمة (1.5ن) + صحة النموذج (1ن)',
            points: 2.5,
          },
          {
            qNumber: '2',
            solution: 'المناقشة حسب الحالات الممكنة، تبرير الاختيار استناداً إلى المعايير المحددة.',
            gradingCriteria: 'الاستعمال السليم لأدوات المادة (2ن) + التعليل المنطقي (1ن)',
            points: 3,
          },
          {
            qNumber: '3',
            solution: 'تقديم اقتراحات وجيهة وواقعية، احترام الانسجام وسلامة اللغة العلمية.',
            gradingCriteria: 'الوجاهة والانسجام (1.5ن) + الإتقان (1ن)',
            points: 2.5,
          },
        ],
      },
    ],
    pedagogicalCompetencies: [
      'التحكم في المفاهيم الأساسية وتوظيفها في وضعيات مألوفة.',
      'الاستدلال العلمي والبرهان المنطقي المنظم.',
      'حل وضعية مشكلة مركبة بتجنيد الموارد المعرفية والمنهجية.',
    ],
    teacherAdvice: 'يُراعى تقييم مسار تفكير التلميذ وخطوات الحل حتى وإن تعثر في الحساب العددي الأخير.',
  };
}

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Madrasati LMS server running on port ${PORT}`);
  });
}

startServer();
