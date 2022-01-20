import { toPromise, normalizeObject } from "./util";

it("toPromise", () => {
  expect(toPromise<string>(() => "hello world")()).resolves.toBe("hello world");
});

it("normalizeObject", () => {
  expect(normalizeObject({}, "", "")).toStrictEqual({});
  expect(normalizeObject({}, "key", "value")).toStrictEqual({ key: "value" });
  expect(normalizeObject({}, "a.b.c.d", 1234)).toStrictEqual({
    a: {
      b: {
        c: {
          d: 1234
        }
      }
    }
  });
  expect(
    normalizeObject(
      {
        f: true,
        z: 440.056
      },
      "a.b.c.d",
      1234
    )
  ).toStrictEqual({
    a: {
      b: {
        c: {
          d: 1234
        }
      }
    },
    f: true,
    z: 440.056
  });
  expect(
    normalizeObject(
      {
        f: true,
        z: 440.056
      },
      "f",
      { key: 188 }
    )
  ).toStrictEqual({
    f: { key: 188 },
    z: 440.056
  });
  console.log(
    JSON.stringify(
      normalizeObject(
        {
          z: 440.056
        },
        "a[0].b.c[2]",
        "hello world!"
      )
    )
  );
  expect(
    JSON.stringify(
      normalizeObject(
        {
          z: 440.056
        },
        "a[0].b.c[2]",
        "hello world!"
      )
    )
  ).toBe(`{"z":440.056,"a":[{"b":{"c":[null,null,"hello world!"]}}]}`);
});
