const request = require("supertest");
const express = require("express");
const mockingoose = require("mockingoose");
const Parole = require("../../src/models/Parole");
const Inmate = require("../../src/models/Inmate");

const paroleRoutes = require("../../src/routes/paroleRoutes");

// Mock middleware
jest.mock("../../src/middleware/authMiddleware", () => ({
  protect: (req, res, next) => {
    req.user = { role: "admin" }; // simulate default user
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
app.use("/prisonsphere/paroles", paroleRoutes);

describe("Parole Routes", () => {
  it("POST /paroles - return 403 if not warden", async () => {
    const res = await request(app).post("/prisonsphere/paroles").send({
      inmate: "507f1f77bcf86cd799439011",
      hearingDate: new Date(),
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/access denied/i);
  });

  it("GET /paroles - should return 200 with list", async () => {
    mockingoose(Inmate).toReturn([], "find");
    const res = await request(app).get("/prisonsphere/paroles?search=none");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("paroles");
  });

  it("GET /paroles/upcoming - should return 200", async () => {
    mockingoose(Parole).toReturn([], "find");

    const res = await request(app).get("/prisonsphere/paroles/upcoming");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /paroles/:id - return 404 if not found", async () => {
    mockingoose(Parole).toReturn(null, "findById");

    const res = await request(app).get(
      "/prisonsphere/paroles/507f1f77bcf86cd799439011"
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("GET /paroles/inmate/:inmateId - return 200 with history array", async () => {
    mockingoose(Parole).toReturn([], "find");

    const res = await request(app).get(
      "/prisonsphere/paroles/inmate/507f1f77bcf86cd799439011"
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("PUT /paroles/:id - return 403 if user not warden", async () => {
    const res = await request(app)
      .put("/prisonsphere/paroles/507f1f77bcf86cd799439011")
      .send({ status: "Approved" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/access denied/i);
  });
});
