-- ================================================================
-- Full-Text Search Indexes — من SRS القسم 6.1
-- يُشغَّل مرة واحدة على قاعدة البيانات بعد prisma migrate dev
-- ================================================================

-- ─── News ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_news_published
  ON news(published_at)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_news_category
  ON news(category);

CREATE INDEX IF NOT EXISTS idx_news_fts_ar
  ON news
  USING GIN(to_tsvector('arabic', title_ar || ' ' || COALESCE(body_ar, '')));

-- ─── Faculty Members ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_faculty_department
  ON faculty_members(department_id);

CREATE INDEX IF NOT EXISTS idx_faculty_fts_ar
  ON faculty_members
  USING GIN(to_tsvector('arabic', name_ar || ' ' || COALESCE(bio_ar, '')));

-- ─── Publications ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_publications_faculty
  ON publications(faculty_id);

CREATE INDEX IF NOT EXISTS idx_publications_year
  ON publications(publish_year);

CREATE INDEX IF NOT EXISTS idx_publications_fts_ar
  ON publications
  USING GIN(to_tsvector('arabic', title_ar || ' ' || COALESCE(abstract_ar, '')));

-- ─── Courses ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_courses_program
  ON courses(program_id);

CREATE INDEX IF NOT EXISTS idx_courses_department
  ON courses(department_id);

CREATE INDEX IF NOT EXISTS idx_courses_fts_ar
  ON courses
  USING GIN(to_tsvector('arabic', name_ar || ' ' || COALESCE(description_ar, '')));

-- ─── Exam Results ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_results_student
  ON exam_results(student_id);

CREATE INDEX IF NOT EXISTS idx_results_published
  ON exam_results(is_published)
  WHERE is_published = true;

-- ─── Conferences ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conferences_status
  ON conferences(status);

CREATE INDEX IF NOT EXISTS idx_conferences_fts_ar
  ON conferences
  USING GIN(to_tsvector('arabic', title_ar || ' ' || COALESCE(theme_ar, '')));

-- ─── Library Books ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_library_type
  ON library_books(library_type);

CREATE INDEX IF NOT EXISTS idx_library_department
  ON library_books(department_id);

-- ─── Conference Registrations ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conf_reg_conference
  ON conference_registrations(conference_id);

CREATE INDEX IF NOT EXISTS idx_conf_reg_status
  ON conference_registrations(status);

-- ─── Audit Logs ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_user
  ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_created
  ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_entity
  ON audit_logs(entity_type, created_at DESC);
