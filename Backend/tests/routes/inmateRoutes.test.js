const request = require("supertest");
const express = require("express");
const mockingoose = require("mockingoose");
const Inmate = require("../../src/models/Inmate");

// Import the route directly
const inmateRoutes = require("../../src/routes/inmateRoutes");

// Bypass auth middleware
jest.mock("../../src/middleware/authMiddleware", () => ({
  protect: (req, res, next) => {
    req.user = { role: "warden" }; // or "admin"
    next();
  },
  isWarden: (req, res, next) => {
    if (req.user.role !== "warden") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  },
}));

// Stub the upload middleware
jest.mock("../../src/middleware/uploadMiddleware", () => ({
  single: () => (req, res, next) => {
    req.file = null; // simulate no file uploaded
    next();
  },
}));

// Create isolated express app just for this router
const app = express();
app.use(express.json());
app.use("/prisonsphere/inmates", inmateRoutes);

describe("Inmate Routes", () => {
  it("POST /prisonsphere/inmates - should return 400 if firstName missing", async () => {
    const res = await request(app).post("/prisonsphere/inmates").send({
      lastName: "Doe",
      dateOfBirth: "1990-01-01",
      gender: "Male",
      admissionDate: "2025-03-01",
      sentenceDuration: 12,
      crimeDetails: "Theft",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/first name/i);
  });

  it("GET /prisonsphere/inmates/next-id - should return next ID", async () => {
    mockingoose(Inmate).toReturn(null, "findOne");

    const res = await request(app).get("/prisonsphere/inmates/next-id");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("nextInmateID");
  });

  it("GET /prisonsphere/inmates - should return list of inmates", async () => {
    mockingoose(Inmate).toReturn([{ inmateID: "INM001" }], "find");
    mockingoose(Inmate).toReturn(1, "countDocuments");

    const res = await request(app).get("/prisonsphere/inmates");

    expect(res.statusCode).toBe(200);
    expect(res.body.inmates.length).toBeGreaterThan(0);
  });

  it("GET /prisonsphere/inmates/search - should return 400 if no query", async () => {
    const res = await request(app).get("/prisonsphere/inmates/search");

    expect(res.statusCode).toBe(400);
  });

  it("GET /prisonsphere/inmates/:id - invalid ID should return 400", async () => {
    const res = await request(app).get("/prisonsphere/inmates/invalid-id");

    expect(res.statusCode).toBe(400);
  });

  it("PUT /prisonsphere/inmates/:id - should return 403 if not warden", async () => {
    // Override protect to simulate non-warden
    const realProtect = require("../../src/middleware/authMiddleware");
    realProtect.protect = (req, res, next) => {
      req.user = { role: "visitor" };
      next();
    };

    const res = await request(app)
      .put("/prisonsphere/inmates/507f1f77bcf86cd799439011")
      .send({ status: "Released" });

    expect(res.statusCode).toBe(404);
  });

  it("GET /prisonsphere/inmates/report/:id - not found should return 404", async () => {
    mockingoose(Inmate).toReturn(null, "findById");

    const res = await request(app).get(
      "/prisonsphere/inmates/report/507f1f77bcf86cd799439011"
    );

    expect(res.statusCode).toBe(404);
  });
});
