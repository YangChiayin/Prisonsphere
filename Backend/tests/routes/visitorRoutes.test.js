const request = require("supertest");
const express = require("express");
const mockingoose = require("mockingoose");
const Inmate = require("../../src/models/Inmate");
const Visitor = require("../../src/models/Visitor");

// Import routes
const visitorRoutes = require("../../src/routes/visitorRoutes");

// Mock auth middleware
jest.mock("../../src/middleware/authMiddleware", () => ({
  protect: (req, res, next) => {
    req.user = { role: "admin" }; // default role
    next();
  },
  isWarden: (req, res, next) => {
    if (req.user.role !== "warden") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/prisonsphere/visitors", visitorRoutes);

describe("Visitor Routes", () => {
  it("POST /visitors/:inmateId - return 400 if visitorName is missing", async () => {
    const res = await request(app)
      .post("/prisonsphere/visitors/507f1f77bcf86cd799439011")
      .send({
        relationshipToInmate: "Friend",
        contactNumber: "1234567890",
        email: "test@example.com",
        visitTimestamp: new Date(),
        durationMinutes: 30,
        purposeOfVisit: "Checkup",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/visitor name/i);
  });

  it("GET /visitors/:inmateId - return 404 if inmate not found", async () => {
    mockingoose(Inmate).toReturn(null, "findById");

    const res = await request(app).get(
      "/prisonsphere/visitors/507f1f77bcf86cd799439011"
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/inmate not found/i);
  });

  it("GET /visitors/details/:visitorId - return 404 if visitor not found", async () => {
    mockingoose(Visitor).toReturn(null, "findById");

    const res = await request(app).get(
      "/prisonsphere/visitors/details/507f1f77bcf86cd799439011"
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/visitor not found/i);
  });

  it("PUT /visitors/details/:visitorId - return 403 if user is not warden", async () => {
    // Override role
    const res = await request(app)
      .put("/prisonsphere/visitors/details/507f1f77bcf86cd799439011")
      .set("Authorization", "Bearer fake-token")
      .send({ visitorName: "Updated Visitor" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/access denied/i);
  });
});
