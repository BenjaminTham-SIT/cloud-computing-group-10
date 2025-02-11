import mysql from 'mysql2/promise';

export const handler = async (event) => {
  console.log("Event received:", event);  // Log the full event for debugging

  const dbConfig = {
    host: 'forum-database-1.ci6qmqse2nc9.us-east-1.rds.amazonaws.com', // Replace with your RDS endpoint
    user: 'admin',
    password: 'testtest',
    database: 'forum-database',
  };

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Extract parameters from the query string (URL query parameters)
    const { user_id, topic_id, name, content } = event.queryStringParameters || {};

    console.log("Received user_id:", user_id);
    console.log("Received topic_id:", topic_id);
    console.log("Received name:", name);
    console.log("Received content:", content);

    // Validate required fields
    if (!user_id || !topic_id || !name || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields', received: event.queryStringParameters }),
      };
    }

    // Define the query to insert the data into the database
    const query = 'INSERT INTO posts (user_id, topic_id, name, content, created_at) VALUES (?, ?, ?, ?, NOW())';
    const values = [user_id, topic_id, name, content];

    // Execute the query
    const [result] = await connection.execute(query, values);

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
