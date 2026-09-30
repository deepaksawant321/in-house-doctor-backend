# Stored Procedures

**None found.** This application does not use stored procedures. All data access goes through TypeORM
repositories/query builder (`src/modules/*/*.service.ts`) or a small number of raw ad hoc DDL/DML scripts
at the repository root (see [../migrations/history.md](../migrations/history.md)). A repository-wide
search for `CREATE PROCEDURE`, `usp_`, `EXEC`, and `EXECUTE` found no procedure definitions or calls.

Not verified against a live database connection this session — if the live database happens to contain
procedures that predate this codebase and are unused by it, they would not show up here. See
[../README.md](../README.md) for the `sys.procedures` introspection query prepared for when DB access is
confirmed.
