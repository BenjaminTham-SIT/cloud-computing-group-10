import mysql from 'mysql2/promise';

export const handler = async (event) => {
  const dbConfig = {
    host: 'forum-database.ci6qmqse2nc9.us-east-1.rds.amazonaws.com', 
    user: 'admin',
    password: 'testtest',
    database: 'forum-database',
  };

  let connection;

  try {
    // Parse the JSON request body
    const requestBody = JSON.parse(event.body || '{}');

    // Extract name and description from request
    const { name, description } = requestBody;

    // Validate input
    if (!name || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: name and description' }),
      };
    }

    connection = await mysql.createConnection(dbConfig);

    // Insert a new topic
    const insertQuery = `INSERT INTO topics (name, description) VALUES (?, ?)`;
    const values = [name, description];

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
