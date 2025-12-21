import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MultiSelect, type MultiSelectOption } from "./multi-select";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

describe("MultiSelect Basic Functionality", () => {
  const options: MultiSelectOption[] = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  it("should render and open", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<MultiSelect options={options} value={[]} onChange={onChange} />);
    
    const trigger = screen.getByRole("button", { name: "Select options..." });
    await user.click(trigger);
    
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should select options", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<MultiSelect options={options} value={[]} onChange={onChange} />);
    
    const trigger = screen.getByRole("button", { name: "Select options..." });
    await user.click(trigger);
    
    await user.click(screen.getByText("Option 1"));
    expect(onChange).toHaveBeenCalledWith(["1"]);
  });

  it("should filter options", async () => {
    const user = userEvent.setup();
    
    render(<MultiSelect options={options} value={[]} onChange={vi.fn()} />);
    
    const trigger = screen.getByRole("button", { name: "Select options..." });
    await user.click(trigger);
    
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "Option 1");
    
    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });
    
    // Should not show other options
    expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
  });

  it("should show empty message when no matches", async () => {
    const user = userEvent.setup();
    
    render(<MultiSelect options={options} value={[]} onChange={vi.fn()} />);
    
    const trigger = screen.getByRole("button", { name: "Select options..." });
    await user.click(trigger);
    
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "nonexistent");
    
    await waitFor(() => {
      expect(screen.getByText("No matches found")).toBeInTheDocument();
    });
  });

  it("should handle special characters", async () => {
    const user = userEvent.setup();
    const specialOptions: MultiSelectOption[] = [
      { value: "1", label: "Test (parentheses)" },
      { value: "2", label: "Test [brackets]" },
    ];
    
    render(<MultiSelect options={specialOptions} value={[]} onChange={vi.fn()} />);
    
    const trigger = screen.getByRole("button", { name: "Select options..." });
    await user.click(trigger);
    
    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "(");
    
    await waitFor(() => {
      expect(screen.getByText("Test (parentheses)")).toBeInTheDocument();
    });
  });

  it("should show loading state", async () => {
    const user = userEvent.setup();
    
    render(<MultiSelect options={options} value={[]} onChange={vi.fn()} loading={true} />);
    
    const trigger = screen.getByRole("button", { name: "Select options..." });
    await user.click(trigger);
    
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("should handle all disabled options", async () => {
    const user = userEvent.setup();
    const disabledOptions: MultiSelectOption[] = [
      { value: "1", label: "Option 1", disabled: true },
      { value: "2", label: "Option 2", disabled: true },
    ];
    
    render(<MultiSelect options={disabledOptions} value={[]} onChange={vi.fn()} />);
    
    const trigger = screen.getByRole("button", { name: "Select options..." });
    await user.click(trigger);
    
    // Should show options but they're disabled
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    
    // Check they're marked as disabled
    const option1 = screen.getByText("Option 1").closest("div");
    expect(option1).toHaveAttribute("aria-disabled", "true");
  });
});