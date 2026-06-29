import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import App from "./App.jsx";
import { supabase } from "./lib/supabase";

function createThenable(result) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    update: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then(resolve, reject) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  return builder;
}

function createChannel() {
  const channel = {
    on: vi.fn(() => channel),
    subscribe: vi.fn(),
  };
  return channel;
}

vi.mock("./lib/supabase", () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === "clients") {
        return createThenable({
          data: [{
            id: "1",
            thread_id: "jordan-blake",
            name: "Jordan Blake",
            avatar: "JB",
            goal: "Fat Loss",
            phase: "Cut",
            accent_color: "#FF4D00",
            weight: 89.4,
            start_weight: 102,
            target_weight: 78,
            body_fat: 24.1,
            start_body_fat: 31,
            target_body_fat: 15,
            week_num: 8,
            total_weeks: 16,
            compliance: 91,
            streak: 12,
          }],
          error: null,
        });
      }

      return createThenable({ data: [], error: null });
    }),
    channel: vi.fn(() => createChannel()),
    removeChannel: vi.fn(),
  },
}));

describe("App integration smoke tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders client list after loading clients from Supabase", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Jordan Blake")).toBeInTheDocument();
    });
  });

  it("shows roster heading on initial clients view", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText("CLIENTS").length).toBeGreaterThan(0);
    });
  });

  it("sets up realtime subscriptions for core tables", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Jordan Blake")).toBeInTheDocument();
    });

    expect(supabase.channel).toHaveBeenCalled();
    expect(supabase.channel.mock.results[0].value.subscribe).toHaveBeenCalled();
  });
});
