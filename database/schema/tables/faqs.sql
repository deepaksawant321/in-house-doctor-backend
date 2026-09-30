-- Table: dbo.faqs
-- Source: AUTHORITATIVE raw DDL captured verbatim from src/create-cms-tables.ts / src/migrate-services.ts
-- (this table was created via a raw idempotent CREATE TABLE script, not TypeORM sync).
-- Verification: DDL text confirmed from repository script; live column state NOT re-verified this session.
-- Referenced by modules: cms (getFaqs/getAllFaqs/createFaq/updateFaq/deleteFaq).

CREATE TABLE faqs (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    question     NVARCHAR(MAX) NOT NULL,
    answer       NVARCHAR(MAX) NOT NULL,
    isActive     BIT           NOT NULL DEFAULT 1,
    createdDate  DATETIME2     NOT NULL DEFAULT GETDATE()
);

-- Notes: table/column names are lowerCamelCase, unlike every other table in the schema which uses
-- PascalCase (Users, BookingId, etc.) — a distinct, later-added naming convention for CMS content
-- tables (faqs, testimonials). Entity (src/entities/faq.entity.ts) does not extend BaseEntity.
