-- CreateEnum
CREATE TYPE "QADocumentType" AS ENUM ('report', 'policy', 'accreditation', 'meeting_minutes', 'improvement_plan', 'other');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('bookstore', 'youth_care', 'training', 'cultural', 'sports', 'clubs', 'other');

-- CreateEnum
CREATE TYPE "ExcavationStatus" AS ENUM ('active', 'completed', 'on_hold', 'seasonal');

-- CreateEnum
CREATE TYPE "CommunityProjectStatus" AS ENUM ('planning', 'ongoing', 'completed', 'on_hold');

-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('mou', 'partnership', 'exchange_program', 'research_collaboration', 'other');

-- CreateEnum
CREATE TYPE "LinkCategory" AS ENUM ('academic_system', 'library', 'social_media', 'external_resource', 'other');

-- CreateTable
CREATE TABLE "quality_board_members" (
    "id" UUID NOT NULL,
    "faculty_id" UUID,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "position_ar" VARCHAR(255) NOT NULL,
    "position_en" VARCHAR(255),
    "email" VARCHAR(255),
    "photo_url" VARCHAR(500),
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_documents" (
    "id" UUID NOT NULL,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "description_ar" TEXT,
    "description_en" TEXT,
    "document_type" "QADocumentType" NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "publish_year" INTEGER,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "quality_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_services" (
    "id" UUID NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "description_ar" TEXT,
    "description_en" TEXT,
    "icon_name" VARCHAR(100),
    "cover_image_url" VARCHAR(500),
    "external_url" VARCHAR(500),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_events" (
    "id" UUID NOT NULL,
    "service_id" UUID,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "description_ar" TEXT,
    "description_en" TEXT,
    "event_date" DATE NOT NULL,
    "location" VARCHAR(255),
    "cover_image_url" VARCHAR(500),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excavation_sites" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "description_ar" TEXT,
    "description_en" TEXT,
    "department_id" UUID,
    "location" VARCHAR(500),
    "start_year" INTEGER,
    "status" "ExcavationStatus" NOT NULL DEFAULT 'active',
    "cover_image_url" VARCHAR(500),
    "external_url" VARCHAR(500),
    "team_leader_ar" VARCHAR(255),
    "team_leader_en" VARCHAR(255),
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "excavation_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excavation_seasons" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "season_year" INTEGER NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "report_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "excavation_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excavation_findings" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "description_ar" TEXT,
    "description_en" TEXT,
    "discovery_year" INTEGER,
    "image_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "excavation_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excavation_gallery" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "caption_ar" VARCHAR(500),
    "caption_en" VARCHAR(500),
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "excavation_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_projects" (
    "id" UUID NOT NULL,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "description_ar" TEXT,
    "description_en" TEXT,
    "status" "CommunityProjectStatus" NOT NULL DEFAULT 'planning',
    "start_date" DATE,
    "end_date" DATE,
    "cover_image_url" VARCHAR(500),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "community_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_programs" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "description_ar" TEXT,
    "description_en" TEXT,
    "program_type" VARCHAR(100) NOT NULL,
    "duration_years" INTEGER,
    "credit_hours" INTEGER,
    "admission_info_ar" TEXT,
    "admission_info_en" TEXT,
    "external_url" VARCHAR(500),
    "brochure_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "special_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "international_agreements" (
    "id" UUID NOT NULL,
    "title_ar" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500),
    "partner_name_ar" VARCHAR(500) NOT NULL,
    "partner_name_en" VARCHAR(500),
    "country" VARCHAR(100),
    "agreement_type" "AgreementType" NOT NULL,
    "sign_date" DATE,
    "expiry_date" DATE,
    "description_ar" TEXT,
    "description_en" TEXT,
    "document_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "international_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_centers" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "description_ar" TEXT,
    "description_en" TEXT,
    "location" VARCHAR(255),
    "director_name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "external_url" VARCHAR(500),
    "cover_image_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "research_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_links" (
    "id" UUID NOT NULL,
    "category" "LinkCategory" NOT NULL,
    "name_ar" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "url" VARCHAR(500) NOT NULL,
    "icon_name" VARCHAR(100),
    "open_new_tab" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "external_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quality_board_members_faculty_id_key" ON "quality_board_members"("faculty_id");

-- CreateIndex
CREATE UNIQUE INDEX "excavation_sites_slug_key" ON "excavation_sites"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "special_programs_slug_key" ON "special_programs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "research_centers_slug_key" ON "research_centers"("slug");

-- AddForeignKey
ALTER TABLE "quality_board_members" ADD CONSTRAINT "quality_board_members_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excavation_sites" ADD CONSTRAINT "excavation_sites_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excavation_seasons" ADD CONSTRAINT "excavation_seasons_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "excavation_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excavation_findings" ADD CONSTRAINT "excavation_findings_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "excavation_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excavation_gallery" ADD CONSTRAINT "excavation_gallery_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "excavation_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
