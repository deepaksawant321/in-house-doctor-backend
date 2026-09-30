-- Table: dbo.CmsBlocks
-- Source: reconstructed from src/entities/cms-block.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: cms (blocks: getActiveBlocks/getAllBlocks/create/update/delete).

CREATE TABLE dbo.CmsBlocks (
    BlockId            INT IDENTITY(1,1) NOT NULL,
    Title              NVARCHAR(255) NOT NULL,
    BlockType          VARCHAR(50)   NOT NULL CONSTRAINT DF_CmsBlocks_BlockType DEFAULT ('Section'), -- 'Hero' | 'Section' | 'Banner'
    Content            NVARCHAR(MAX) NULL,
    ImageUrl           NVARCHAR(500) NULL,
    CallToActionText   NVARCHAR(100) NULL,
    CallToActionLink   NVARCHAR(500) NULL,
    IsActive           BIT           NOT NULL CONSTRAINT DF_CmsBlocks_IsActive DEFAULT (1),
    SortOrder          INT           NOT NULL CONSTRAINT DF_CmsBlocks_SortOrder DEFAULT (0),
    CONSTRAINT PK_CmsBlocks PRIMARY KEY (BlockId)
);

-- Notes: no CreatedDate/audit column on this entity (unlike most other PascalCase tables). BlockType
-- values are defined by the CmsBlockType enum in cms-block.entity.ts (Hero, Section, Banner).
