import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
describe("SentinelFlow shell", () => {
  it("renders the landing promise and primary action", () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /See the Threats/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Launch SOC Console/i }),
    ).toBeInTheDocument();
  });
  it("renders an accessible login form", () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });
});
