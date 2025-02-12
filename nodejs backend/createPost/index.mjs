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

    // Ensure event.body is parsed correctly
    let body;
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid JSON format' }),
        };
      }
    }

    // Validate required fields in the body
    const { user_id, topic_id, name, content } = body;

    if (!user_id || !topic_id || !name || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Define the query to insert a new post
    const query = 'INSERT INTO posts (user_id, topic_id, name, content, created_at) VALUES (?, ?, ?, ?, NOW())';
    const values = [user_id, topic_id, name, content];

    // Execute the insert query
    const [result] = await connection.execute(query, values);

    // Return the response with the ID of the inserted post
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Post created successfully', postId: result.insertId }),
    };
  } catch (error) {
    console.error('Database insertion error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to insert post', details: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
