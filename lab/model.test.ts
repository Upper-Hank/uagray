import { expect, it } from "vitest";
import { filterTasks, initialTasks, readTasks } from "./model";

it("restores a valid workspace, including an intentionally empty one", () => {
  const tasks = initialTasks();
  tasks[0].title = "新的工作项";
  tasks[0].comments.push({ id: "comment", text: "保留讨论", author: "林乔" });
  expect(readTasks(JSON.stringify(tasks))).toEqual(tasks);
  expect(readTasks("[]")).toEqual([]);
});
it("rejects corrupted or incompatible stored tasks", () => {
  expect(readTasks("invalid")).toEqual(initialTasks());
  expect(
    readTasks(JSON.stringify([{ ...initialTasks()[0], status: "unknown" }])),
  ).toEqual(initialTasks());
  expect(
    readTasks(JSON.stringify([initialTasks()[0], initialTasks()[0]])),
  ).toEqual(initialTasks());
});
it("combines project scope, text search, status and owner filters", () => {
  const tasks = initialTasks();
  const found = filterTasks(
    tasks,
    "project",
    "portal",
    "ATL-102",
    "progress",
    "chen",
  );
  expect(found.map((task) => task.id)).toEqual([102]);
  expect(
    filterTasks(tasks, "project", "mobile", "ATL-102", "all", "all"),
  ).toEqual([]);
  expect(
    filterTasks(tasks, "mine", "portal", "", "all", "all").every(
      (task) => task.assignee === "lin",
    ),
  ).toBe(true);
  expect(
    filterTasks(tasks, "all", "portal", "移动端", "all", "all").some(
      (task) => task.project === "mobile",
    ),
  ).toBe(true);
});
