import { expect, it } from "vitest";
import { parseAngle } from "./answers";

it.each([
  ["3.14", 3.14],
  ["pi", Math.PI],
  ["π", Math.PI],
  ["π/2", Math.PI / 2],
  ["2pi", 2 * Math.PI],
  ["180°", Math.PI],
  ["3,1416", 3.1416],
])("reads %s", (raw, expected) => {
  expect(parseAngle(raw)).toBeCloseTo(expected, 6);
});

it.each(["", "abc", "1..2", "pi pi"])("refuses %s", (raw) => {
  expect(parseAngle(raw)).toBeNull();
});
