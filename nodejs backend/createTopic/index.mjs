import mysql from 'mysql2/promise';

export const handler = async (event) => {
  const dbConfig = {
    host: 'forum-database-1.ci6qmqse2nc9.us-east-1.rds.amazonaws.com', // Replace with your RDS endpoint
    user: 'admin',
    password: 'testtest',
    database: 'forum-database',
  };

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // TODO: Check if user is admin 

    // Execute a query: Insert a new topic
    const insertQuery = `INSERT INTO topics (name, description) VALUES (?, ?)`;
    const values = ['cars', 'talk about cars here'];

    const [result] = await connection.execute(insertQuery, values);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Topic inserted successfully!', insertId: result.insertId }),
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database connection failed' }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
