import mysql from 'mysql2/promise';

export const handler = async (event) => {
  const dbConfig = {
    host: 'forum-database.ci6qmqse2nc9.us-east-1.rds.amazonaws.com', // Replace with your RDS endpoint
    user: 'admin',
    password: 'testtest',
    database: 'forum-database',
  };

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Ensure the body is correctly parsed
    let body;
    if (event.body) {
      try {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid JSON format' }),
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is missing' }),
      };
    }

    // Extract and validate required fields
    const { user_id, post_id, content } = body;

    if (!user_id || !post_id || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: user_id, post_id, content' }),
      };
    }

    // INSERT query
    const query = 'INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, NOW())';
    const values = [user_id, post_id, content];

    // Execute query
    const [result] = await connection.execute(query, values);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Comment added successfully', commentId: result.insertId }),
    };
  } catch (error) {
    console.error('Database insertion error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to insert comment', details: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
