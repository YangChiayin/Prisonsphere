/**
 * @file database.js
 * @description Establishes and manages a connection to the MongoDB database using Mongoose.
 * @module config/database
 *
 * This module loads the database URI from environment variables and attempts to
 * connect to the MongoDB server. If the connection is successful, it logs the
 * database host and name. If it fails, an error is logged, and the process exits
 * to prevent the application from running without a database connection.
 *
 * @requires mongoose - ODM library for MongoDB
 * @requires dotenv - Loads environment variables from a .env file
 */

const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env file

/**
 * Establishes a connection to the MongoDB database.
 * The connection settings include a 30-second timeout to improve stability.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when the database connection is successful, otherwise exits the process.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Time MongoDB waits before failing connection
      connectTimeoutMS: 30000, // Time to establish an initial connection
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`); // Log the database server host
    console.log(`Using Database: ${conn.connection.name}`); // Log the connected database name
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1); // Terminate application on failure to avoid unexpected behavior
  }
};

// Export the database connection function
module.exports = connectDB;
