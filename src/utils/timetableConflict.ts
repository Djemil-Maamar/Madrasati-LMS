import { TimetableSession, TimetableConflict, Teacher, Room, ClassItem } from '../types';

export function detectAllConflicts(
  sessions: TimetableSession[],
  teachers: Teacher[],
  rooms: Room[],
  classes: ClassItem[]
): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];
  const teacherMap = new Map(teachers.map((t) => [t.id, t.name]));
  const roomMap = new Map(rooms.map((r) => [r.id, r.name]));
  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  // Track pairs we've already recorded to avoid duplicate symmetric conflicts
  const seenPairs = new Set<string>();

  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];

      // Check if they are on the same day and time slot
      if (a.day === b.day && a.slotId === b.slotId) {
        const pairKey = `${a.id}-${b.id}`;
        if (seenPairs.has(pairKey)) continue;

        // 1. Teacher conflict
        if (a.teacherId && b.teacherId && a.teacherId === b.teacherId) {
          seenPairs.add(pairKey);
          const teacherName = teacherMap.get(a.teacherId) || a.teacherId;
          const clsA = classMap.get(a.classId) || a.classId;
          const clsB = classMap.get(b.classId) || b.classId;
          conflicts.push({
            id: `conf-tch-${a.id}-${b.id}`,
            type: 'teacher',
            day: a.day,
            slotId: a.slotId,
            sessionA: a,
            sessionB: b,
            message: `تعارض أستاذ: الأستاذ (${teacherName}) مبرمج في نفس الوقت لقسمين: [${clsA}] و [${clsB}]`,
          });
          continue;
        }

        // 2. Room conflict
        if (a.roomId && b.roomId && a.roomId === b.roomId) {
          seenPairs.add(pairKey);
          const roomName = roomMap.get(a.roomId) || a.roomId;
          const clsA = classMap.get(a.classId) || a.classId;
          const clsB = classMap.get(b.classId) || b.classId;
          conflicts.push({
            id: `conf-rm-${a.id}-${b.id}`,
            type: 'room',
            day: a.day,
            slotId: a.slotId,
            sessionA: a,
            sessionB: b,
            message: `تعارض قاعة: القاعة (${roomName}) محجوزة في نفس الوقت لقسمين: [${clsA}] و [${clsB}]`,
          });
          continue;
        }

        // 3. Class conflict
        if (a.classId && b.classId && a.classId === b.classId) {
          seenPairs.add(pairKey);
          const clsName = classMap.get(a.classId) || a.classId;
          conflicts.push({
            id: `conf-cls-${a.id}-${b.id}`,
            type: 'class',
            day: a.day,
            slotId: a.slotId,
            sessionA: a,
            sessionB: b,
            message: `تعارض قسم: للقسم [${clsName}] حصتان مبرمجتان في نفس الفترة الزمنية!`,
          });
        }
      }
    }
  }

  return conflicts;
}

export function validateSingleSession(
  candidate: Omit<TimetableSession, 'id'>,
  allSessions: TimetableSession[],
  editingSessionId?: string,
  teachers: Teacher[] = [],
  rooms: Room[] = [],
  classes: ClassItem[] = []
): { hasConflict: boolean; reason?: string } {
  const teacherMap = new Map(teachers.map((t) => [t.id, t.name]));
  const roomMap = new Map(rooms.map((r) => [r.id, r.name]));
  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  for (const session of allSessions) {
    if (editingSessionId && session.id === editingSessionId) {
      continue;
    }

    if (session.day === candidate.day && session.slotId === candidate.slotId) {
      if (session.teacherId === candidate.teacherId) {
        const tName = teacherMap.get(candidate.teacherId) || 'الأستاذ';
        const otherCls = classMap.get(session.classId) || 'قسم آخر';
        return {
          hasConflict: true,
          reason: `تنبيه: الأستاذ (${tName}) مبرمج مسبقاً في هذا التوقيت مع قسم [${otherCls}]!`,
        };
      }

      if (session.roomId === candidate.roomId) {
        const rName = roomMap.get(candidate.roomId) || 'القاعة';
        const otherCls = classMap.get(session.classId) || 'قسم آخر';
        return {
          hasConflict: true,
          reason: `تنبيه: القاعة (${rName}) محجوزة مسبقاً في هذا التوقيت لقسم [${otherCls}]!`,
        };
      }

      if (session.classId === candidate.classId) {
        const cName = classMap.get(candidate.classId) || 'القسم';
        return {
          hasConflict: true,
          reason: `تنبيه: القسم [${cName}] لديه حصة أخرى مجدولة بالفعل في هذا التوقيت!`,
        };
      }
    }
  }

  return { hasConflict: false };
}
