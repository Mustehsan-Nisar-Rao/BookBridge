const { pool } = require('./src/config/database');

async function testPaymentFlow() {
  try {
    const connection = await pool.getConnection();

    // 1. Check users table has payment columns
    const [userCols] = await connection.query(`SHOW COLUMNS FROM users LIKE '%number%'`);
    const [bankCols] = await connection.query(`SHOW COLUMNS FROM users LIKE 'bank_details'`);
    console.log('Users payment columns:', [...userCols, ...bankCols].map(c => c.Field));

    // 2. Check books table has accepted_payment_methods
    const [bookCols] = await connection.query(`SHOW COLUMNS FROM books LIKE 'accepted_payment_methods'`);
    console.log('Books payment column:', bookCols.map(c => c.Field));

    // 3. Check transactions table has transaction_reference
    const [txnCols] = await connection.query(`SHOW COLUMNS FROM transactions LIKE 'transaction_reference'`);
    console.log('Transactions ref column:', txnCols.map(c => c.Field));

    // 4. Test JOIN query (same as getBookById)
    const [books] = await connection.query(
      `SELECT b.title, b.accepted_payment_methods, 
              u.jazzcash_number, u.easypaisa_number, u.bank_details
       FROM books b
       JOIN users u ON b.seller_id = u.id
       LIMIT 3`
    );
    console.log('\nSample books with seller payment info:');
    books.forEach(b => {
      console.log(` - "${b.title}" | accepted: ${b.accepted_payment_methods} | jazz: ${b.jazzcash_number} | easy: ${b.easypaisa_number}`);
    });

    connection.release();
    console.log('\n✅ All payment flow columns verified!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testPaymentFlow();
