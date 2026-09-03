import { describe, expect, it } from "vitest";
import { csvCell, oneDecimal, percent } from "./api";

describe("CSV export safety", () => {
  it("quotes values and blocks spreadsheet formulas", () => {
    expect(csvCell("normal,value")).toBe('"normal,value"');
    expect(csvCell('=WEBSERVICE("https://example.invalid")')).toBe(
      '"\'=WEBSERVICE(""https://example.invalid"")"',
    );
    expect(csvCell("@SUM(A1:A2)")).toBe('"\'@SUM(A1:A2)"');
  });
});

describe("numeric formatting", () => {
  it("formats decimals and probability percentages to exactly one place", () => {
    expect(oneDecimal(99.74)).toBe("99.7");
    expect(oneDecimal(42)).toBe("42.0");
    expect(percent(0.9436)).toBe("94.4");
    expect(percent(91.44)).toBe("91.4");
  });
});
