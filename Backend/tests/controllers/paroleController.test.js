const mockingoose = require("mockingoose");
const mongoose = require("mongoose");
const httpMocks = require("node-mocks-http");

const Inmate = require("../../src/models/Inmate");
const Parole = require("../../src/models/Parole");

const {
  submitParoleApplication,
  getAllParoleApplications,
  getUpcomingParoles,
  getParoleById,
  getParoleHistoryByInmate,
  updateParoleStatus,
} = require("../../src/controllers/paroleController");

describe("Parole Controller", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("submitParoleApplication - should return 404 if inmate not found", async () => {
    mockingoose(Inmate).toReturn(null, "findById");

    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        inmate: new mongoose.Types.ObjectId().toString(),
        hearingDate: new Date(),
      },
    });
    const res = httpMocks.createResponse();

    await submitParoleApplication(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/inmate not found/i);
  });

  it("getAllParoleApplications - should return empty array if no search match", async () => {
    mockingoose(Inmate).toReturn([], "find");

    const req = httpMocks.createRequest({
      method: "GET",
      query: { search: "nonexistent" },
    });
    const res = httpMocks.createResponse();

    await getAllParoleApplications(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.paroles).toEqual([]);
  });

  it("getUpcomingParoles - should return 200 and upcoming list", async () => {
    mockingoose(Parole).toReturn([], "find");

    const req = httpMocks.createRequest({ method: "GET" });
    const res = httpMocks.createResponse();

    await getUpcomingParoles(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res._getJSONData())).toBe(true);
  });

  it("getParoleById - should return 404 if parole not found", async () => {
    mockingoose(Parole).toReturn(null, "findById");

    const req = httpMocks.createRequest({
      method: "GET",
      params: { id: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    await getParoleById(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/not found/i);
  });

  it("getParoleHistoryByInmate - should return 200 with empty history", async () => {
    mockingoose(Parole).toReturn([], "find");

    const req = httpMocks.createRequest({
      method: "GET",
      params: { inmateId: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    await getParoleHistoryByInmate(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res._getJSONData())).toBe(true);
  });

  it("updateParoleStatus - should return 400 if invalid status", async () => {
    const req = httpMocks.createRequest({
      method: "PUT",
      params: { id: new mongoose.Types.ObjectId().toString() },
      body: { status: "InvalidStatus" },
    });
    const res = httpMocks.createResponse();

    await updateParoleStatus(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/invalid parole status/i);
  });
});
