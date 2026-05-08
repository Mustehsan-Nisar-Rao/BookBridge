const mysql = require('mysql2/promise');
async function run() {
  const c = await mysql.createConnection({host:'localhost',user:'root',password:'mubashir2468',database:'bookbridge'});
  try {
    const [rows] = await c.query('SELECT * FROM admin_logs');
    console.log(rows);
  } catch(e) {
    console.error(e);
  } finally {
    await c.end();
  }
}
run();
