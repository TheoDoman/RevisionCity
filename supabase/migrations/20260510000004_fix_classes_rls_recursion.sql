-- ============================================================
-- Fix infinite recursion in classes / class_memberships RLS.
-- Root cause: classes_select_own_or_member did EXISTS on
-- class_memberships, and memberships_select_own did EXISTS on
-- classes. Postgres detects this and refuses with 42P17.
--
-- Resolution: simplify. All real reads happen via service-role
-- API routes (which bypass RLS), so the policies only need to
-- protect against direct anon-key client access. Each policy
-- now scopes to its own table only.
-- ============================================================

DROP POLICY IF EXISTS "classes_select_own_or_member" ON classes;
DROP POLICY IF EXISTS "memberships_select_own"       ON class_memberships;
DROP POLICY IF EXISTS "memberships_delete_teacher"   ON class_memberships;

-- Classes: visible to the teacher who owns them.
CREATE POLICY "classes_select_own"
  ON classes FOR SELECT
  USING (teacher_user_id = auth.uid()::text);

-- Memberships: visible to the student themselves.
-- (Teacher access uses service-role via /api/classes/[id], which bypasses RLS.)
CREATE POLICY "memberships_select_own"
  ON class_memberships FOR SELECT
  USING (student_user_id = auth.uid()::text);

-- A student can soft-leave their own class (set removed_at on their own row).
CREATE POLICY "memberships_update_self"
  ON class_memberships FOR UPDATE
  USING (student_user_id = auth.uid()::text)
  WITH CHECK (student_user_id = auth.uid()::text);
