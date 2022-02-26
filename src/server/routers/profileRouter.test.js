require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");
const path = require("path");

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
    _id: "621a2cd61c40b29c21eb6e87",
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
          {
            id: "621a2cd61c40b29c21eb6e87",
            name: "user 3",
            lastName: "testUser",
            avatar: "user.png",
            username: "testUser3",
            friends: ["621a2ceb1c40b29c21eb6e8a"],
          },
        ],
      };

      const { body } = await request(app)
        .get(endpoint)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(body).toEqual(expectedResponse);
    });
  });

  describe("When it's called witout a valid token", () => {
    test("Then it should respond with the message: 'Invalid token'", async () => {
      const expectedMessage = "Invalid token";
      const {
        body: { error },
      } = await request(app)
        .get(endpoint)
        .set("Authorization", `Bearer invalidToken`)
        .expect(401);

      expect(error).toBe(expectedMessage);
    });
  });

  describe("When it's called witout a token", () => {
    test("Then it should respond with the message: 'Token missing'", async () => {
      const expectedMessage = "Token missing";
      const {
        body: { error },
      } = await request(app).get(endpoint).expect(401);

      expect(error).toBe(expectedMessage);
    });
  });
});

describe("Given profiles/:id enpoint", () => {
  const endpoint = "/profiles/";
  describe("When it's called with a valid token and a valid id", () => {
    test("Then it should return the populated profile", async () => {
      const expectedResponse = {
        id: "621a2cd61c40b29c21eb6e87",
        name: "user 3",
        lastName: "testUser",
        avatar: "user.png",
        username: "testUser3",
        friends: [
          {
            id: "621a2ceb1c40b29c21eb6e8a",
            name: "user 2",
            lastName: "testUser",
            avatar: "user.png",
            username: "testUser2",
            friends: [],
          },
        ],
      };

      const { body } = await request(app)
        .get(`${endpoint}621a2cd61c40b29c21eb6e87`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(body).toEqual(expectedResponse);
    });
  });

  describe("When it's called with a valid token and an invalid id", () => {
    test("Then it should return an error 'There was an error while getting the user profile, please make sure you input a valid ID'", async () => {
      const expectedResponse = {
        error:
          "There was an error while getting the user profile, please make sure you input a valid ID",
      };

      const { body } = await request(app)
        .get(`${endpoint}dfoaishfgiusgi`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(body).toEqual(expectedResponse);
    });
  });
});

describe("Given profiles/update/:id enpoint", () => {
  const endpoint = "/profiles/update/";
  describe("When it's called with a valid token and a valid id", () => {
    test("Then it should return the patched profile", async () => {
      const expectedResponse = {
        id: "621a2cd61c40b29c21eb6e87",
        name: "Modified user 3",
        lastName: "testUser",
        avatar: expect.stringContaining("favicon.png"),
        username: "testUser3",
        friends: ["621a2ceb1c40b29c21eb6e8a"],
      };
      const file = path.join(__dirname, "../../../testAvatars/favicon.png");

      const { body } = await request(app)
        .patch(`${endpoint}621a2cd61c40b29c21eb6e87`)
        .set("Authorization", `Bearer ${token}`)
        .attach("avatar", file)
        .field("name", "Modified user 3")
        .expect(200);

      expect(body).toEqual(expectedResponse);
    });
  });

  describe("When it's called with a valid token and an invalid id", () => {
    test("Then it should return an error 'There was an error while updating the profile, please make sure you input a valid ID'", async () => {
      const expectedResponse = {
        error:
          "There was an error while updating the profile, please make sure you input a valid ID",
      };

      const { body } = await request(app)
        .patch(`${endpoint}dfoaishfgiusgi`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Modified user 3",
          lastName: "modified user 3 lastname",
        })
        .expect(404);

      expect(body).toEqual(expectedResponse);
    });
  });
});
