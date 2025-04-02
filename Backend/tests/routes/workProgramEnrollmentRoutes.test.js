const request = require("supertest");
const express = require("express");
const mockingoose = require("mockingoose");
const mongoose = require("mongoose");

const Inmate = require("../../src/models/Inmate");
const WorkProgram = require("../../src/models/WorkProgram");
const WorkProgramEnrollment = require("../../src/models/WorkProgramEnrollment");

const workProgramRoutes = require("../../src/routes/workProgramEnrollmentRoutes");

// Mock auth middleware
jest.mock("../../src/middleware/authMiddleware", () => ({
  protect: (req, res, next) => {
    req.user = { role: "admin" };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/prisonsphere/work-programs/enrollments", workProgramRoutes);

describe("Work Program Enrollment Routes", () => {
  it("GET /enrollments - return 200 with empty enrollments", async () => {
    mockingoose(WorkProgramEnrollment).toReturn([], "find");
    mockingoose(WorkProgramEnrollment).toReturn(0, "countDocuments");

    const res = await request(app).get(
      "/prisonsphere/work-programs/enrollments"
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.enrollments)).toBe(true);
  });

  it("GET /inmate/:inmateId - return 200 with enrollments", async () => {
    mockingoose(WorkProgramEnrollment).toReturn([], "find");

    const res = await request(app).get(
      `/prisonsphere/work-programs/enrollments/inmate/${new mongoose.Types.ObjectId().toString()}`
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /inmate/:inmateId/latest - return 200 with latest or empty object", async () => {
    mockingoose(WorkProgramEnrollment).toReturn(null, "findOne");

    const res = await request(app).get(
      `/prisonsphere/work-programs/enrollments/inmate/${new mongoose.Types.ObjectId().toString()}/latest`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({});
  });

  it("GET /display-sample - return 404 if no active work program found", async () => {
    mockingoose(WorkProgramEnrollment).toReturn(null, "findOne");

    const res = await request(app).get(
      "/prisonsphere/work-programs/enrollments/display-sample"
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/no active work program found/i);
  });
});
