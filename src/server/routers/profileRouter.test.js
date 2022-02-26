require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

const connectToDB = require("../../database");
const User = require("../../database/models/User");
const app = require("..");

let mongoServer;
let token;

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

  await User.create({
    _id: "621a2ceb1c40b29c21eb6e8a",
    name: "user 2",
    lastName: "testUser",
    avatar: "user.png",
    username: "testUser2",
    password: hashedPassword,
  });

  await User.create({
    name: "user 3",
    lastName: "testUser",
    avatar: "user.png",
    username: "testUser3",
    friends: ["621a2ceb1c40b29c21eb6e8a"],
    password: hashedPassword,
  });

  const { body } = await request(app)
    .post("/users/login")
    .send({ username: testUser.username, password: testUser.password })
    .expect(200);

  token = body.token;
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Given profiles/list enpoint", () => {
  const endpoint = "/profiles/list";
  describe("When it's called with a valid token", () => {
    test("Then it should return a list of all the profiles without the password", async () => {
      const expectedResponse = {
        profiles: [
          expect.objectContaining({
            name: testUser.name,
            lastName: testUser.lastName,
            avatar: testUser.avatar,
            username: testUser.username,
            friends: [],
          }),
          {
            name: "user 2",
            lastName: "testUser",
            avatar: "user.png",
            username: "testUser2",
            friends: [],
            id: "621a2ceb1c40b29c21eb6e8a",
          },
          expect.objectContaining({
            name: "user 3",
            lastName: "testUser",
            avatar: "user.png",
            username: "testUser3",
            friends: ["621a2ceb1c40b29c21eb6e8a"],
          }),
        ],
      };

      const { body } = await request(app).get(endpoint).expect(200);

      expect(body).toEqual(expectedResponse);
    });
  });
});