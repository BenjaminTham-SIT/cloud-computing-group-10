import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PostPage from "./pages/PostPage";

beforeAll(() => {
    const mockSessionStorage = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => (store[key] = value.toString()),
        removeItem: (key) => delete store[key],
        clear: () => (store = {}),
      };
    })();
  
    Object.defineProperty(window, "sessionStorage", {
      value: mockSessionStorage,
    });
  });
  
  beforeEach(() => {
    sessionStorage.setItem("idToken", "mocked-token");
  });

describe("PostPage Component", () => {
  test("renders post title", () => {
    render(
      <MemoryRouter>
        <PostPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Unknown Title/i)).toBeInTheDocument();
  });

  test("renders Add a Comment input", () => {
    render(
      <MemoryRouter>
        <PostPage />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Your comment/i)).toBeInTheDocument();
  });

  test("allows typing in comment input", () => {
    render(
      <MemoryRouter>
        <PostPage />
      </MemoryRouter>
    );
    const input = screen.getByLabelText(/Your comment/i);
    fireEvent.change(input, { target: { value: "This is a test comment." } });
    expect(input.value).toBe("This is a test comment.");
  });
});
