import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import HomePage from "@/app/(marketing)/page";
import { Button } from "@/components/ui/button";
import { StudioShell } from "@/components/workspace/studio-shell";
import { productStatus } from "@/lib/product-status";

test("home page offers build and import without claiming export is live", () => {
  render(<HomePage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /build and update your cv by talking/i }),
  ).toBeDefined();
  expect(screen.getByRole("link", { name: "Build my CV" })).toBeDefined();
  expect(screen.getByRole("link", { name: "Import an existing CV" })).toBeDefined();
  expect(screen.getByText(/export a pdf/i)).toBeDefined();
});

test("disabled buttons stay disabled", () => {
  render(<Button disabled>Start dictation</Button>);
  expect(screen.getByRole("button", { name: "Start dictation" })).toHaveProperty(
    "disabled",
    true,
  );
});

test("studio voice stays off and sections can be reordered by dragging", () => {
  render(<StudioShell />);
  expect(screen.getByRole("button", { name: "Start dictation" })).toHaveProperty(
    "disabled",
    true,
  );
  expect(screen.getByRole("button", { name: "Export PDF" })).toHaveProperty(
    "disabled",
    false,
  );
  expect(screen.getByRole("button", { name: "Reorder Summary" })).toBeDefined();
  expect(screen.queryByRole("button", { name: "Up" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Down" })).toBeNull();
  expect(screen.getByText(productStatus.voice)).toBeDefined();
  expect(screen.getByText("This browser")).toBeDefined();
});

test("unavailable features explain themselves", () => {
  expect(productStatus.voice.length).toBeGreaterThan(20);
  expect(productStatus.export.length).toBeGreaterThan(20);
  expect(productStatus.account.toLowerCase()).toContain("browser");
});
