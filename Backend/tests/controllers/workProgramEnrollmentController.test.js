const mockingoose = require("mockingoose");
const mongoose = require("mongoose");
const httpMocks = require("node-mocks-http");

const Inmate = require("../../src/models/Inmate");
const WorkProgram = require("../../src/models/WorkProgram");
const WorkProgramEnrollment = require("../../src/models/WorkProgramEnrollment");
const BehavioralLog = require("../../src/models/BehaviorLog");
const ActivityLog = require("../../src/models/ActivityLog");

const {
  assignInmateToWorkProgram,
  getAllWorkProgramEnrollments,
  getWorkProgramEnrollmentByInmate,
  getLatestCompletedWorkProgram,
  getWorkProgramSampleDisplay,
} = require("../../src/controllers/workProgramEnrollmentController");

describe("Work Program Enrollment Controller", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("getAllWorkProgramEnrollments - should return paginated enrollments", async () => {
    mockingoose(WorkProgramEnrollment).toReturn([], "find");
    mockingoose(WorkProgramEnrollment).toReturn(0, "countDocuments");

    const req = httpMocks.createRequest({
      method: "GET",
      query: { page: 1, limit: 10, status: "all" },
    });
    const res = httpMocks.createResponse();

    await getAllWorkProgramEnrollments(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.enrollments).toEqual([]);
  });

  it("getWorkProgramEnrollmentByInmate - should return array of active enrollments", async () => {
    mockingoose(WorkProgramEnrollment).toReturn([], "find");

    const req = httpMocks.createRequest({
      method: "GET",
      params: { inmateId: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    await getWorkProgramEnrollmentByInmate(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res._getJSONData())).toBe(true);
  });

  it("getLatestCompletedWorkProgram - should return empty object if none found", async () => {
    mockingoose(WorkProgramEnrollment).toReturn(null, "findOne");

    const req = httpMocks.createRequest({
      method: "GET",
      params: { inmateId: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    await getLatestCompletedWorkProgram(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({});
  });

  it("getWorkProgramSampleDisplay - should return 404 if no active program found", async () => {
    mockingoose(WorkProgramEnrollment).toReturn(null, "findOne");

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getWorkProgramSampleDisplay(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/no active work program found/i);
  });
});
