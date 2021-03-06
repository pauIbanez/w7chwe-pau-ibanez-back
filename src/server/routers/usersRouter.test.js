require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

const connectToDB = require("../../database");
const User = require("../../database/models/User");
const app = require("..");

let mongoServer;

const testUser = {
  name: "slim",
  lastName: "shady",
  avatar: "green_emanem.jpeg",
  username: "emanem",
  password: "whiteBoi",
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const connectionString = mongoServer.getUri();

  await connectToDB(connectionString);
});

beforeEach(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(testUser.password, salt);

  await User.create({
    name: testUser.name,
    lastName: testUser.lastName,
    avatar: testUser.avatar,
    username: testUser.username,
    password: hashedPassword,
  });
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Given users/login endpoint", () => {
  describe("When it's passed a valid user", () => {
    test("Then it should respond with 200 and a token", async () => {
      const {
        body: { token },
      } = await request(app)
        .post("/users/login")
        .send({ username: testUser.username, password: testUser.password })
        .expect(200);

      expect(token).toBeTruthy();
    });
  });

  describe("When it's not passed a username or passwword", () => {
    test("Then it should respond with 400 and the error 'User data not provided'", async () => {
      const expectedError = "User data not provided";

      const {
        body: { error },
      } = await request(app).post("/users/login").expect(400);

      expect(error).toBe(expectedError);
    });
  });

  describe("When it's passed an existent username but an invalid password", () => {
    test("Then it should respond with 401 and the error 'Invalid username or password'", async () => {
      const expectedError = "Invalid username or password";

      const {
        body: { error },
      } = await request(app)
        .post("/users/login")
        .send({ username: testUser.username, password: "invalidPassword" })
        .expect(401);

      expect(error).toBe(expectedError);
    });
  });

  describe("When it's passed an invalid username", () => {
    test("Then it should respond with 401 and the error 'Invalid username or password'", async () => {
      const expectedError = "Invalid username or password";

      const {
        body: { error },
      } = await request(app)
        .post("/users/login")
        .send({ username: "invalidUsername", password: "invalidPassword" })
        .expect(401);

      expect(error).toBe(expectedError);
    });
  });
});
