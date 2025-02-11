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
    const [rows] = await connection.execute('SELECT * FROM topics');
    // const databaseName = 'forumdb'; // Change this to your desired name
    // await connection.execute(CREATE DATABASE IF NOT EXISTS ${databaseName});


    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected!', data: rows}),
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