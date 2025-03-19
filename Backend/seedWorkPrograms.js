/**
 * @file seedWorkPrograms.js
 * @description Seeds initial work programs into the database for the PrisonSphere system.
 * @module utils/seedWorkPrograms
 *
 * Features:
 * - Deletes existing records before inserting new ones to avoid duplicates.
 * - Provides predefined work programs to populate the system.
 * - Uses environment variables to securely connect to the database.
 *
 * Usage:
 * - Run this script manually to populate the database with default work programs.
 * - Command: `node seedWorkPrograms.js`
 *
 * @requires mongoose - MongoDB ODM library.
 * @requires dotenv - Loads environment variables.
 * @requires connectDB - Establishes a database connection.
 * @requires WorkProgram - The Work Program model for storing job details.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const WorkProgram = require("../models/WorkProgram");

dotenv.config();
connectDB();

/**
 * Seed Work Programs
 * ------------------
 * - Deletes existing work programs to avoid duplicates.
 * - Inserts predefined work programs into the database.
 */
const seedWorkPrograms = async () => {
  const workPrograms = [
    {
      name: "Kitchen Services",
      description: "Food preparation and kitchen duties.",
    },
    {
      name: "Carpentry Workshop",
      description: "Woodwork and furniture making.",
    },
    { name: "Tailoring Unit", description: "Sewing and garment production." },
    {
      name: "Agricultural Program",
      description: "Farming and crop production.",
    },
    { name: "Laundry Services", description: "Laundry and uniform services." },
    {
      name: "Maintenance Crew",
      description: "Facility maintenance and repair.",
    },
    {
      name: "Cleaning & Sanitation",
      description: "Cleaning and hygiene services.",
    },
    {
      name: "Educational Support",
      description: "Teaching and literacy programs.",
    },
  ];

  try {
    await WorkProgram.deleteMany(); // Clear existing records before seeding
    await WorkProgram.insertMany(workPrograms); // Insert new work programs
    console.log("Work Programs Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding Failed:", error);
    process.exit(1);
  }
};

seedWorkPrograms();
