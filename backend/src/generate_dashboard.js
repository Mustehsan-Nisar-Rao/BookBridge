const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function generateDashboard() {
  const connection = await pool.getConnection();
  const data = {};

  try {
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    for (const table of tableNames) {
      const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 100`);
      data[table] = rows;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BookBridge | Project Dataset Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --bg: #0f172a;
            --card-bg: #1e293b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: #334155;
            --accent: #8b5cf6;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            background-color: var(--bg); 
            color: var(--text-main);
            line-height: 1.6;
            overflow-x: hidden;
        }

        .container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }

        header {
            margin-bottom: 60px;
            text-align: center;
            animation: fadeInDown 0.8s ease-out;
        }

        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .subtitle {
            color: var(--text-muted);
            font-size: 1.1rem;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .dashboard-grid {
            display: grid;
            gap: 30px;
        }

        .table-card {
            background-color: var(--card-bg);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid var(--border);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease;
        }

        .table-card:hover {
            transform: translateY(-5px);
            border-color: var(--accent);
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border);
        }

        .table-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.8rem;
            font-weight: 600;
            color: var(--accent);
            text-transform: capitalize;
        }

        .badge {
            background: rgba(139, 92, 246, 0.1);
            color: var(--accent);
            padding: 5px 15px;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .table-container {
            overflow-x: auto;
            max-height: 500px;
            overflow-y: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        th {
            background-color: rgba(15, 23, 42, 0.5);
            padding: 15px;
            color: var(--text-muted);
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid var(--border);
            font-size: 0.9rem;
            white-space: nowrap;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        tr:hover {
            background-color: rgba(255, 255, 255, 0.03);
        }

        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

        .empty-state {
            padding: 40px;
            text-align: center;
            color: var(--text-muted);
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Dataset Explorer</h1>
            <p class="subtitle">Live Project Data Visualization</p>
        </header>

        <div class="dashboard-grid">
            ${Object.entries(data).map(([tableName, rows]) => `
                <div class="table-card">
                    <div class="table-header">
                        <h2 class="table-title">${tableName}</h2>
                        <span class="badge">${rows.length} Records</span>
                    </div>
                    <div class="table-container">
                        ${rows.length > 0 ? `
                            <table>
                                <thead>
                                    <tr>
                                        ${Object.keys(rows[0]).map(key => `<th>${key}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows.map(row => `
                                        <tr>
                                            ${Object.values(row).map(val => `<td>${val === null ? '<em>null</em>' : String(val).replace(/</g, '&lt;')}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<div class="empty-state">No data available in this table.</div>'}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;

    const htmlPath = path.join(__dirname, '../dataset_dashboard.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`\n✅ Dashboard Generated: ${htmlPath}`);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Failed to generate dashboard:', error.message);
    process.exit(1);
  }
}

generateDashboard();
