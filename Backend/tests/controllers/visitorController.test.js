const mockingoose = require("mockingoose");
const mongoose = require("mongoose");
const httpMocks = require("node-mocks-http");

const Visitor = require("../../src/models/Visitor");
const Inmate = require("../../src/models/Inmate");

const {
  logVisitor,
  getVisitorsByInmate,
  getVisitorById,
  updateVisitor,
} = require("../../src/controllers/visitorController");

jest.mock("../../src/controllers/recentActivityLogController", () => ({
  logRecentActivity: jest.fn(),
}));

describe("Visitor Controller", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("logVisitor - should return 400 if visitorName is missing", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      params: { inmateId: new mongoose.Types.ObjectId().toString() },
      body: {
        relationshipToInmate: "Brother",
        contactNumber: "1234567890",
        email: "test@example.com",
        visitTimestamp: new Date(),
        durationMinutes: 30,
        purposeOfVisit: "Family Visit",
      },
    });
    const res = httpMocks.createResponse();

    await logVisitor(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/visitor name/i);
  });

  it("getVisitorsByInmate - should return 404 if inmate not found", async () => {
    mockingoose(Inmate).toReturn(null, "findOne");
    mockingoose(Inmate).toReturn(null, "findById");

    const req = httpMocks.createRequest({
      method: "GET",
      params: { inmateId: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    await getVisitorsByInmate(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/inmate not found/i);
  });

  it("getVisitorById - should return 404 if visitor not found", async () => {
    mockingoose(Visitor).toReturn(null, "findOne");
    mockingoose(Visitor).toReturn(null, "findById");

    const req = httpMocks.createRequest({
      method: "GET",
      params: { visitorId: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    await getVisitorById(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/visitor not found/i);
  });

  it("updateVisitor - should return 404 if visitor not found", async () => {
    mockingoose(Visitor).toReturn(null, "findOne");
    mockingoose(Visitor).toReturn(null, "findByIdAndUpdate");

    const req = httpMocks.createRequest({
      method: "PUT",
      params: { visitorId: new mongoose.Types.ObjectId().toString() },
      body: {
        visitorName: "Updated Name",
        purposeOfVisit: "Legal Meeting",
      },
    });
    const res = httpMocks.createResponse();

    await updateVisitor(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toMatch(/visitor not found/i);
  });
});
