const { notFoundError, errorHandler } = require("./errorHandlers");

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

describe("Given errorHandler", () => {
  describe("When it's invoked with an err withour code and message 'test error'", () => {
    test("Then it should call method status with 500 and methos json with the text 'test error'", () => {
      const expectedCode = 500;
      const expectedMessage = {
        error: "test error",
      };
      const err = {
        message: "test error",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      errorHandler(err, null, res);

      expect(res.status).toHaveBeenCalledWith(expectedCode);
      expect(res.json).toHaveBeenCalledWith(expectedMessage);
    });
  });
});
