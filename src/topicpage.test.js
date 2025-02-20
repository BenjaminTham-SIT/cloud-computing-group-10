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
    "eyJraWQiOiJWV0JSZkpsTURHbkQ0aXhyczN6VnJzOGprWGtsalpHY0ZMZ1ZZM0FNNUhFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiOTNlMzQ2OC1jMGMxLTcwZTQtOTM5ZC1iOTUyNWRhMTY0ZmIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC0yLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC0yX3I0TFljeWtIVyIsImNvZ25pdG86dXNlcm5hbWUiOiJiZW4yIiwib3JpZ2luX2p0aSI6IjhiNTA4NDU0LTNkNDItNGFjNC1iM2E0LTk1MDNmMTdjMDFkYSIsImF1ZCI6IjFhYjdwM3U2N2VncjJiZmNtNTk4MDZuaG1sIiwiZXZlbnRfaWQiOiIxZGQ5ZWE0MS02YTU1LTQzZjAtOGM4Mi0wN2RjYjVlNGYxN2MiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc0MDA0NzExNCwiZXhwIjoxNzQwMDUwNzE0LCJpYXQiOjE3NDAwNDcxMTQsImp0aSI6IjBlMTM2NDgyLTYwMzgtNGI3Yi05ZjI4LWRlYjNhZjIzYTRkZiIsImVtYWlsIjoiYmVuamFtaW4udGhhbXl1YmluQGdtYWlsLmNvbSJ9.hn0qNFmzzTlGyyLFwSSmImms92ICuWHAPdsAS8M1k0SinxuotCiy5f-7HXv49qCxzF6h1aAsk2j3FSJCKZo98UDyVz52G986GxDNnGdRes_MX0okBHrbRRn7EAyfagBarYDjH6SggYecKQt74sYcNqc0osZLxt0-Lc-MqEV6KfVidIEoXGS3-QcBOtrOkltPGvsc6v8WvWzQImXyH6oWxSeZ89ZcAJCP5dLI_W7UeGTNHI09DaYSk1vLQjLPH9mZB8Lp4bfeG9Nhwtw7ICxRgUmeeLIryssEeJOdac_8rSs2n-CHb8AKcKMyRd7cL_9SfKKZlUSeMWYxlmpDNDSCxA" +
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
