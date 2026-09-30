-- Table: dbo.testimonials
-- Source: AUTHORITATIVE raw DDL captured verbatim from src/create-cms-tables.ts.
-- Verification: DDL text confirmed from repository script; live column state NOT re-verified this session.
-- Referenced by modules: cms (getTestimonials/getAllTestimonials/create/update/delete).

CREATE TABLE testimonials (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    name         NVARCHAR(255) NOT NULL,
    role         NVARCHAR(255) NOT NULL,
    quote        NVARCHAR(MAX) NOT NULL,
    rating       FLOAT         NOT NULL DEFAULT 5.0,
    isActive     BIT           NOT NULL DEFAULT 1,
    createdDate  DATETIME2     NOT NULL DEFAULT GETDATE()
);

-- Notes: same lowerCamelCase naming convention as `faqs` (see that file's notes). Entity
-- (src/entities/testimonial.entity.ts) does not extend BaseEntity.
