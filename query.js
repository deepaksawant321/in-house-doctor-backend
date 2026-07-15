const sql = require('mssql/msnodesqlv8');
const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-GKN0UQE\\SQLEXPRESS;Database=InHouseDoctorDB;Trusted_Connection=yes;'
};

sql.connect(config).then(pool => {
  return pool.request().query("SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS");
}).then(res => {
  console.log(JSON.stringify(res.recordset));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
