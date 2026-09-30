# Functions

**None found.** A repository-wide search found no scalar or table-valued SQL functions defined or
referenced anywhere in the codebase. All computation (aggregation, filtering, date-range trend building
for the admin dashboard, etc.) happens in application code (see e.g.
[`../../src/modules/dashboard/dashboard.service.ts`](../../src/modules/dashboard/dashboard.service.ts) and
[`../../src/modules/admin/admin.service.ts`](../../src/modules/admin/admin.service.ts) `getDashboardTrends`).

Not verified against a live database connection this session — see [../../README.md](../../README.md).
