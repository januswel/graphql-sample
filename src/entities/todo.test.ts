import { isAbandoned } from "./todo.js";

describe("Todo", () => {
  describe("isAbandoned", () => {
    it("should be abandoned if it is not completed and updated more than 2 weeks ago", () => {
      const todo = {
        id: "foo",
        title: "test",
        isCompleted: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      };

      expect(isAbandoned(todo)).toBe(true);
    });
    it("should not be abandoned if it is not completed and updated less than 2 weeks ago", () => {
      const todo = {
        id: "foo",
        title: "test",
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isAbandoned(todo)).toBe(false);
    });
    it("should not be abandoned if it is completed", () => {
      const todo = {
        id: "foo",
        title: "test",
        isCompleted: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      };

      expect(isAbandoned(todo)).toBe(false);
    });
  });
});
