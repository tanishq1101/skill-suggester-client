import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import App from "./App.jsx";

jest.mock("axios", () => {
  const mockAxios = {
    create: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  };
  mockAxios.create.mockReturnValue(mockAxios);
  return mockAxios;
});

// Mock recharts to avoid canvas/DOM issues in JSDOM
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

const MOCK_RESPONSE = {
  data: {
    input: { industry: "Technology", specialization: "AI/ML Engineer" },
    outlook: "Positive",
    growth: "14.5%",
    demandLevel: "High",
    topSkills: ["Rust", "PyTorch"],
    trends: ["AI Agent Ecosystems"],
    salaryData: [{ role: "AI/ML Engineer", min: 140000, median: 160000, max: 310000 }],
    matchedSkills: ["Python"],
    recommendedSkills: [{ name: "Rust", category: "Technology", reason: "Highly relevant" }],
    meta: { source: "Global Job Market Index (Simulated)", lastUpdated: "2026-01-05" },
  },
};

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders form on initial load", () => {
    render(<App />);
    expect(screen.getByText("Future-Proof Your Career")).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analyze/i })).toBeInTheDocument();
  });

  test("shows loading state on submit", async () => {
    axios.post.mockReturnValue(new Promise(() => {})); // never resolves
    axios.get.mockResolvedValue({ data: [] });
    render(<App />);

    await userEvent.selectOptions(screen.getByLabelText(/industry/i), "Technology");
    await userEvent.selectOptions(screen.getByLabelText(/specialization/i), "AI/ML Engineer");

    const input = screen.getByPlaceholderText(/type a skill/i);
    await userEvent.type(input, "Python{Enter}");
    await userEvent.click(screen.getByRole("button", { name: /analyze/i }));

    expect(screen.getByText("Analyzing market data…")).toBeInTheDocument();
  });

  test("displays results on successful API response", async () => {
    axios.post.mockResolvedValue(MOCK_RESPONSE);
    axios.get.mockResolvedValue({ data: [] });
    render(<App />);

    await userEvent.selectOptions(screen.getByLabelText(/industry/i), "Technology");
    await userEvent.selectOptions(screen.getByLabelText(/specialization/i), "AI/ML Engineer");

    const input = screen.getByPlaceholderText(/type a skill/i);
    await userEvent.type(input, "Python{Enter}");
    await userEvent.click(screen.getByRole("button", { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByText("Positive")).toBeInTheDocument();
    });

    expect(screen.getByText("14.5%")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  test("displays error banner on API failure", async () => {
    axios.post.mockRejectedValue({ response: { data: { error: "Server error" } } });
    axios.get.mockResolvedValue({ data: [] });
    render(<App />);

    await userEvent.selectOptions(screen.getByLabelText(/industry/i), "Technology");
    await userEvent.selectOptions(screen.getByLabelText(/specialization/i), "AI/ML Engineer");

    const input = screen.getByPlaceholderText(/type a skill/i);
    await userEvent.type(input, "Python{Enter}");
    await userEvent.click(screen.getByRole("button", { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/server error/i);
  });
});
