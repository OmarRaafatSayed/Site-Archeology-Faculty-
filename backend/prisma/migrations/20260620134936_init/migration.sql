-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'faculty', 'content_manager', 'admin');

-- CreateEnum
CREATE TYPE "FacultyDegree" AS ENUM ('assistant_lecturer', 'lecturer', 'assistant_professor', 'professor');

-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('undergraduate', 'masters', 'doctorate');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('active', 'graduated', 'suspended', 'transferred');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('general', 'academic', 'student', 'conference', 'research');

-- CreateEnum
CREATE TYPE "ConferenceStatus" AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "RegStatus" AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "LibraryType" AS ENUM ('egyptology', 'islamic', 'conservation', 'postgraduate');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "university_id" VARCHAR(20),
    "username" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "accent_color" VARCHAR(7) DEFAULT '#6B7280',
    "cover_image_url" VARCHAR(500),
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_members" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "department_id" UUID NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "degree" "FacultyDegree" NOT NULL,
    "specialization_ar" VARCHAR(500),
    "specialization_en" VARCHAR(500),
    "email" VARCHAR(255),
    "bio_ar" TEXT,
    "bio_en" TEXT,
    "photo_url" VARCHAR(500),
    "admin_role" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "faculty_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "level" "ProgramLevel" NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "credit_hours" INTEGER,
    "duration_years" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "program_id" UUID,
    "department_id" UUID NOT NULL,
    "faculty_id" UUID,
    "code" VARCHAR(20) NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "credit_hours" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "prerequisite_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "university_id" VARCHAR(20) NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "department_id" UUID NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "enrollment_year" INTEGER NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "semester" INTEGER NOT NULL,
    "academic_year" VARCHAR(9) NOT NULL,
    "grade" DECIMAL(5,2),
    "grade_letter" VARCHAR(2),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_schedules" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "faculty_id" UUID,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "location" VARCHAR(255),
    "semester" INTEGER NOT NULL,
    "academic_year" VARCHAR(9) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_schedules" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "exam_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "location" VARCHAR(255),
    "exam_type" VARCHAR(50),
    "semester" INTEGER NOT NULL,
    "academic_year" VARCHAR(9) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" UUID NOT NULL,
    "author_id" UUID,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "body_ar" TEXT NOT NULL,
    "body_en" TEXT,
    "cover_image" VARCHAR(500),
    "category" "NewsCategory" NOT NULL DEFAULT 'general',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "content_ar" TEXT,
    "content_en" TEXT,
    "meta_description_ar" VARCHAR(500),
    "meta_description_en" VARCHAR(500),
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "title_ar" VARCHAR(1000) NOT NULL,
    "title_en" VARCHAR(1000),
    "abstract_ar" TEXT,
    "abstract_en" TEXT,
    "journal_name" VARCHAR(500),
    "publish_year" INTEGER,
    "doi" VARCHAR(255),
    "file_url" VARCHAR(500),
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conferences" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "number" INTEGER NOT NULL,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "theme_ar" VARCHAR(500),
    "theme_en" VARCHAR(500),
    "start_date" DATE,
    "end_date" DATE,
    "banner_ar_url" VARCHAR(500),
    "banner_en_url" VARCHAR(500),
    "status" "ConferenceStatus" NOT NULL DEFAULT 'upcoming',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conference_registrations" (
    "id" UUID NOT NULL,
    "conference_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "institution" VARCHAR(500),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "participation_type" VARCHAR(50),
    "paper_title" VARCHAR(1000),
    "abstract" TEXT,
    "registration_code" VARCHAR(20),
    "status" "RegStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conference_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_books" (
    "id" UUID NOT NULL,
    "library_type" "LibraryType" NOT NULL,
    "title_ar" VARCHAR(1000) NOT NULL,
    "title_en" VARCHAR(1000),
    "author_ar" VARCHAR(500),
    "author_en" VARCHAR(500),
    "publisher" VARCHAR(500),
    "publish_year" INTEGER,
    "isbn" VARCHAR(20),
    "copies_count" INTEGER NOT NULL DEFAULT 1,
    "department_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_materials" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "faculty_id" UUID,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "file_url" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(20),
    "file_size" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_university_id_key" ON "users"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_members_user_id_key" ON "faculty_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_university_id_key" ON "students"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_student_id_course_id_semester_academic_year_key" ON "exam_results"("student_id", "course_id", "semester", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "conferences_slug_key" ON "conferences"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "conference_registrations_registration_code_key" ON "conference_registrations"("registration_code");

-- AddForeignKey
ALTER TABLE "faculty_members" ADD CONSTRAINT "faculty_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_members" ADD CONSTRAINT "faculty_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conference_registrations" ADD CONSTRAINT "conference_registrations_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_books" ADD CONSTRAINT "library_books_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
