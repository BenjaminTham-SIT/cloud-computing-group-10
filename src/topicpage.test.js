import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TopicPage from "./pages/TopicPage";

describe("TopicPage Component", () => {
  test("renders topic title", () => {
    render(
      <MemoryRouter>
        <TopicPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Unknown Topic/i)).toBeInTheDocument();
  });

  test("renders Create a New Post form", () => {
    render(
      <MemoryRouter>
        <TopicPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Create a New Post/i)).toBeInTheDocument();
  });

  test("allows typing in post title input", () => {
    render(
      <MemoryRouter>
        <TopicPage />
      </MemoryRouter>
    );
    const input = screen.getByLabelText(/Post Title/i);
    fireEvent.change(input, { target: { value: "New Test Post" } });
    expect(input.value).toBe("New Test Post");
  });
});
