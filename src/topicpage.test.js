import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TopicPage from "./pages/TopicPage";

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
  const fakeToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    btoa(JSON.stringify({ sub: "test-sub" })) +
    ".signature";
  sessionStorage.setItem("idToken", fakeToken);
});

describe("TopicPage Component", () => {
  test("renders topic title", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TopicPage />
      </MemoryRouter>
    );
    // Wait for the spinner to disappear and the text to be rendered
    await waitFor(() => {
      expect(screen.getByText(/Unknown Topic/i)).toBeInTheDocument();
    });
  });

  test("renders Create a New Post form", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TopicPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Create a New Post/i)).toBeInTheDocument();
    });
  });

  test("allows typing in post title input", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TopicPage />
      </MemoryRouter>
    );
    // Wait for the form to be rendered
    const input = await screen.findByLabelText(/Post Title/i);
    fireEvent.change(input, { target: { value: "New Test Post" } });
    expect(input.value).toBe("New Test Post");
  });
});
