import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "./pages/HomePage";

describe("HomePage Component", () => {
  test("renders Forum Topics heading", () => {
    render(<HomePage />);
    expect(screen.getByText(/Forum Topics/i)).toBeInTheDocument();
  });

  test("renders search bar", () => {
    render(<HomePage />);
    expect(screen.getByLabelText(/Search by Title/i)).toBeInTheDocument();
  });

  test("displays error message when not logged in", () => {
    sessionStorage.removeItem("idToken"); // Simulate not logged in
    render(<HomePage />);
    expect(screen.getByText(/You must be logged in to view topics/i)).toBeInTheDocument();
  });

  test("allows typing in search bar", () => {
    render(<HomePage />);
    const input = screen.getByLabelText(/Search by Title/i);
    fireEvent.change(input, { target: { value: "React" } });
    expect(input.value).toBe("React");
  });
});
