const User = require("../../database/models/User");
const { listProfiles } = require("./profileControllers");

jest.mock("../../database/models/User");

describe("Given listProfiles", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("When it's intanciated with function next and the database fails to load profiles", () => {
    test("Then it should call next with the error 'There was an error while getting the user profiles'", async () => {
      const expectedError = {
        message: "There was an error while getting the user profiles",
      };

      const next = jest.fn();

      User.find = jest.fn().mockReturnThis();
      User.select = jest.fn().mockRejectedValue();

      await listProfiles(null, null, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
