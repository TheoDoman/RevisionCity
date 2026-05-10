-- ============================================================
-- Teacher mode: classes + memberships
-- A "class" is owned by one teacher (clerk user id) and has
-- many student members (also clerk user ids). Role itself
-- (teacher vs student) lives in Clerk publicMetadata, not DB.
-- ============================================================

CREATE TABLE IF NOT EXISTS classes (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id   text        NOT NULL,
  name              text        NOT NULL,
  -- 6-char alphanumeric, uppercase, unique. Generated app-side.
  join_code         text        NOT NULL UNIQUE,
  archived_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS classes_teacher_idx   ON classes (teacher_user_id);
CREATE INDEX IF NOT EXISTS classes_join_code_idx ON classes (join_code);

CREATE TABLE IF NOT EXISTS class_memberships (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id          uuid        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_user_id   text        NOT NULL,
  joined_at         timestamptz NOT NULL DEFAULT now(),
  removed_at        timestamptz,
  UNIQUE (class_id, student_user_id)
);

CREATE INDEX IF NOT EXISTS class_memberships_class_idx   ON class_memberships (class_id);
CREATE INDEX IF NOT EXISTS class_memberships_student_idx ON class_memberships (student_user_id);

-- ── RLS ────────────────────────────────────────────────────
-- All actual access goes through service-role API routes (which bypass RLS),
-- but enable RLS so direct anon access from clients gets sane defaults.

ALTER TABLE classes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "classes_select_own_or_member" ON classes;
DROP POLICY IF EXISTS "classes_insert_teacher"       ON classes;
DROP POLICY IF EXISTS "classes_update_teacher"       ON classes;
DROP POLICY IF EXISTS "memberships_select_own"       ON class_memberships;
DROP POLICY IF EXISTS "memberships_insert_self"      ON class_memberships;
DROP POLICY IF EXISTS "memberships_delete_teacher"   ON class_memberships;

-- A teacher can read any class they own; a student can read any class they belong to.
CREATE POLICY "classes_select_own_or_member"
  ON classes FOR SELECT
  USING (
    teacher_user_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM class_memberships cm
      WHERE cm.class_id = classes.id
        AND cm.student_user_id = auth.uid()::text
        AND cm.removed_at IS NULL
    )
  );

CREATE POLICY "classes_insert_teacher"
  ON classes FOR INSERT
  WITH CHECK (teacher_user_id = auth.uid()::text);

CREATE POLICY "classes_update_teacher"
  ON classes FOR UPDATE
  USING (teacher_user_id = auth.uid()::text)
  WITH CHECK (teacher_user_id = auth.uid()::text);

-- Memberships: a student sees their own; a teacher sees memberships in their classes.
CREATE POLICY "memberships_select_own"
  ON class_memberships FOR SELECT
  USING (
    student_user_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_memberships.class_id
        AND c.teacher_user_id = auth.uid()::text
    )
  );

CREATE POLICY "memberships_insert_self"
  ON class_memberships FOR INSERT
  WITH CHECK (student_user_id = auth.uid()::text);

-- Only teachers can soft-delete (mark removed_at) memberships in their classes.
CREATE POLICY "memberships_delete_teacher"
  ON class_memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_memberships.class_id
        AND c.teacher_user_id = auth.uid()::text
    )
  );

-- ── Grants ─────────────────────────────────────────────────
GRANT ALL                                ON classes           TO service_role;
GRANT SELECT, INSERT, UPDATE             ON classes           TO authenticated;
GRANT ALL                                ON class_memberships TO service_role;
GRANT SELECT, INSERT, UPDATE             ON class_memberships TO authenticated;
