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

    // Extract and validate the required fields
    const { comment_id, user_id, post_id, content } = body;

    if (!comment_id || !user_id || !post_id || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: comment_id, user_id, post_id, content' }),
      };
    }

    // Define the UPDATE query
    const query = 'UPDATE comments SET user_id = ?, post_id = ?, content = ? WHERE comment_id = ?';
    const values = [user_id, post_id, content, comment_id];

    // Execute the UPDATE query
    const [result] = await connection.execute(query, values);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Comment not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Comment updated successfully' }),
    };
  } catch (error) {
    console.error('Database update error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update comment', details: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
