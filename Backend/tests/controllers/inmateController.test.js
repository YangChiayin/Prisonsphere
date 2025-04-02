const mockingoose = require("mockingoose");
const mongoose = require("mongoose");
const Inmate = require("../../src/models/Inmate");
const {
  registerInmate,
  getNextInmateID,
  getAllInmates,
  searchInmate,
  getInmateById,
  updateInmate,
  getInmateByIDReport,
} = require("../../src/controllers/inmateController");

// We need to fake request/response objects
const httpMocks = require("node-mocks-http");

jest.mock("../../src/controllers/recentActivityLogController", () => ({
  logRecentActivity: jest.fn(),
}));

describe("registerInmate", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("should return 400 if firstName is missing", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      user: { role: "warden" },
      body: {
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        gender: "Male",
        admissionDate: "2025-03-01",
        sentenceDuration: 12,
        crimeDetails: "Theft",
      },
    });
    const res = httpMocks.createResponse();

    await registerInmate(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/first name/i);
  });

  it("should return 403 if user is not warden", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      user: { role: "visitor" }, // Unauthorized role
      body: {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        gender: "Male",
        admissionDate: "2025-03-01",
        sentenceDuration: 12,
        crimeDetails: "Theft",
      },
    });
    const res = httpMocks.createResponse();

    await registerInmate(req, res);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData().message).toMatch(/access denied/i);
  });
});

describe("Inmate Controller", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("getNextInmateID - should return next ID", async () => {
    mockingoose(Inmate).toReturn(null, "findOne");
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getNextInmateID(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toHaveProperty("nextInmateID");
  });

  it("getAllInmates - should return paginated inmates", async () => {
    mockingoose(Inmate).toReturn([{ inmateID: "INM001" }], "find");
    mockingoose(Inmate).toReturn(1, "countDocuments");
    const req = httpMocks.createRequest({
      query: { page: 1, limit: 10 },
    });
    const res = httpMocks.createResponse();

    await getAllInmates(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.inmates.length).toBeGreaterThan(0);
  });

  it("searchInmate - should return 400 if no query", async () => {
    const req = httpMocks.createRequest({ query: {} });
    const res = httpMocks.createResponse();

    await searchInmate(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/search query/i);
  });

  it("getInmateById - should return 400 for invalid ID", async () => {
    const req = httpMocks.createRequest({ params: { id: "invalid" } });
    const res = httpMocks.createResponse();

    await getInmateById(req, res);

    expect(res.statusCode).toBe(400);
  });

  it("updateInmate - should return 403 if not warden", async () => {
    const req = httpMocks.createRequest({
      method: "PUT",
      user: { role: "visitor" },
      params: { id: new mongoose.Types.ObjectId().toString() },
      body: {},
    });
    const res = httpMocks.createResponse();

    await updateInmate(req, res);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData().message).toMatch(/permission/i);
  });

  it("getInmateByIDReport - should return 404 if inmate not found", async () => {
    mockingoose(Inmate).toReturn(null, "findOne");
    mockingoose(Inmate).toReturn(null, "findById");

    const req = httpMocks.createRequest({
      params: { id: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    await getInmateByIDReport(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/not found/i);
  });
});
