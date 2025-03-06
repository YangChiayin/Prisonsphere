/**
 * @file manageUsers.js
 * @description Command-line script for managing user accounts in the PrisonSphere Prison Management System.
 * @module utils/manageUsers
 *
 * This script allows IT administrators to manage user credentials securely without a frontend interface.
 *
 * Features:
 * - Create new users with role-based access control (Warden or Admin).
 * - Update user passwords securely.
 * - Delete users from the database.
 * - List all registered users.
 *
 * Usage:
 * - Create a new user:  `node manageUsers.js create <username> <password> <role>`
 * - Update user password: `node manageUsers.js update <username> <newPassword>`
 * - Delete a user: `node manageUsers.js delete <username>`
 * - List all users: `node manageUsers.js list`
 *
 * @requires bcryptjs - Library for password hashing.
 * @requires dotenv - Loads environment variables.
 * @requires mongoose - MongoDB ODM library.
 * @requires User - The User model for managing authentication.
 * @requires connectDB - Establishes a database connection.
 *
 * @author Faruq A. Atanda (github.com/adeunusual)
 * @date 6th Feb, 2025.
 */
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./src/models/User");
const connectDB = require("./src/config/db");

dotenv.config();

/**
 * Initialize Database Connection
 * ------------------------------
 * - Ensures the database is connected before executing any user management commands.
 * - Calls the appropriate function based on the provided command-line arguments.
 */
const init = async () => {
  await connectDB();
  console.log("Database Connected Successfully for User Management!");

  /**
   * Create a New User
   * -----------------
   * - Adds a new user with a hashed password.
   * - Prevents duplicate usernames.
   *
   * @param {String} username - The unique username for the new user.
   * @param {String} password - The plain-text password to be hashed.
   * @param {String} role - The role assigned to the user (warden/admin).
   */
  const createUser = async (username, password, role) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`User "${username}" already exists.`);
      process.exit();
    }

    await User.create({ username, password, role });

    console.log(`User "${username}" created successfully.`);
    process.exit();
  };

  /**
   * Update User Password
   * --------------------
   * - Updates an existing user's password securely.
   * - Automatically hashes the new password before saving.
   *
   * @param {String} username - The username of the account to update.
   * @param {String} newPassword - The new password to set.
   */
  const updateUserPassword = async (username, newPassword) => {
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`User "${username}" not found.`);
      process.exit();
    }

    user.password = newPassword;
    await user.save(); // The pre-save hook will hash password before update

    console.log(`Password for "${username}" updated successfully.`);
    process.exit();
  };

  /**
   * Delete a User
   * -------------
   * - Removes a user from the database.
   *
   * @param {String} username - The username of the user to be deleted.
   */
  const deleteUser = async (username) => {
    const user = await User.findOneAndDelete({ username });
    if (!user) {
      console.log(`User "${username}" not found.`);
      process.exit();
    }

    console.log(`User "${username}" deleted successfully.`);
    process.exit();
  };

  /**
   * List All Users
   * --------------
   * - Displays all registered users along with their roles.
   */
  const listUsers = async () => {
    const users = await User.find();
    console.log("List of Users:");
    users.forEach((user) => {
      console.log(`- ${user.username} (${user.role})`);
    });
    process.exit();
  };

  // Command-line arguments handling
  const command = process.argv[2]; // Command: create, update, delete, list
  const username = process.argv[3]; // Username
  const passwordOrRole = process.argv[4]; // Password (for create/update) or Role (for create)
  const role = process.argv[5]; // Role (for create)

  // **Process user management commands**
  if (command === "create") {
    if (!username || !passwordOrRole || !role) {
      console.log(
        "Usage: node manageUsers.js create <username> <password> <role>"
      );
      process.exit();
    }
    createUser(username, passwordOrRole, role);
  } else if (command === "update") {
    if (!username || !passwordOrRole) {
      console.log("Usage: node manageUsers.js update <username> <newPassword>");
      process.exit();
    }
    updateUserPassword(username, passwordOrRole);
  } else if (command === "delete") {
    if (!username) {
      console.log("Usage: node manageUsers.js delete <username>");
      process.exit();
    }
    deleteUser(username);
  } else if (command === "list") {
    listUsers();
  } else {
    console.log("Invalid command. Use: create, update, delete, or list.");
    process.exit();
  }
};

init();
