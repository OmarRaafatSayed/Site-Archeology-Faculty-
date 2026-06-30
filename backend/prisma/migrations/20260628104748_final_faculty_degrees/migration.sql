/*
  Warnings:

  - The values [doctor,professor_doctor] on the enum `FacultyDegree` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FacultyDegree_new" AS ENUM ('demonstrator', 'assistant_lecturer', 'lecturer', 'assistant_professor', 'professor');
ALTER TABLE "faculty_members" ALTER COLUMN "degree" TYPE "FacultyDegree_new" USING ("degree"::text::"FacultyDegree_new");
ALTER TYPE "FacultyDegree" RENAME TO "FacultyDegree_old";
ALTER TYPE "FacultyDegree_new" RENAME TO "FacultyDegree";
DROP TYPE "FacultyDegree_old";
COMMIT;
