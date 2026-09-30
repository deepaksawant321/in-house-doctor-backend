-- Table: dbo.StaticPages
-- Source of truth: src/entities/static-page.entity.ts (TypeORM).
-- Referenced by modules: cms (getPageBySlug/getAllPages/create/update/delete, exposed via
-- GET/POST/PUT/DELETE /cms/pages*).
-- Live status: CREATED 2026-09-29 (previously missing — see ../../migrations/pending-migrations.md
-- section 1a). /cms/pages* endpoints are unblocked as of this migration.

CREATE TABLE dbo.StaticPages (
    PageId           INT IDENTITY(1,1) NOT NULL,
    Title            NVARCHAR(255) NOT NULL,
    Slug             NVARCHAR(255) NOT NULL,
    HtmlContent      NVARCHAR(MAX) NOT NULL,
    SeoTitle         NVARCHAR(255) NULL,
    SeoDescription   NVARCHAR(500) NULL,
    IsPublished      BIT           NOT NULL CONSTRAINT DF_StaticPages_IsPublished DEFAULT (1),
    CONSTRAINT PK_StaticPages PRIMARY KEY (PageId),
    CONSTRAINT UQ_StaticPages_Slug UNIQUE (Slug)
);

-- Notes: no CreatedDate/audit column by design. Public read path (getPageBySlug) filters on
-- IsPublished = 1; admin CMS endpoints do not filter by IsPublished. Table is empty of content rows
-- immediately after creation — seed or author pages through the admin CMS UI.
