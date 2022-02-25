const { notFoundError } = require("./errorHandlers");

describe("Given notFoundError", () => {
  describe("When it's invoked with a res", () => {
    test("Then it should call method status with 404 and methos json with the text 'Resource not found'", () => {
      const expectedCode = 404;
      const expectedMessage = {
        error: "Resource not found",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      notFoundError(null, res);

      expect(res.status).toHaveBeenCalledWith(expectedCode);
      expect(res.json).toHaveBeenCalledWith(expectedMessage);
    });
  });
});
