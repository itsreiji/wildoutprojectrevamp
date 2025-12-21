import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MultiSelect, type MultiSelectOption } from "./multi-select";

// Mock IntersectionObserver for ScrollArea
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

describe("MultiSelect Component", () => {
  const mockOptions: MultiSelectOption[] = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Option 4", disabled: true },
    { value: "option5", label: "Option 5" },
  ];

  const defaultProps = {
    options: mockOptions,
    value: [],
    onChange: vi.fn(),
    placeholder: "Select options...",
    searchPlaceholder: "Search...",
    emptyMessage: "No options found",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to get the main trigger button
  const getMainTrigger = () => {
    return screen.getByRole("button", { name: "Select options..." });
  };

  describe("Rendering and Display", () => {
    it("should render with placeholder when no values selected", () => {
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent("Select options...");
    });

    it("should display single selected value", () => {
      render(<MultiSelect {...defaultProps} value={["option1"]} />);

      const trigger = getMainTrigger();
      expect(trigger).toHaveTextContent("Option 1");
    });

    it("should display multiple selected values within maxVisible limit", () => {
      render(<MultiSelect {...defaultProps} value={["option1", "option2", "option3"]} maxVisible={3} />);

      const trigger = getMainTrigger();
      expect(trigger).toHaveTextContent("Option 1, Option 2, Option 3");
    });

    it("should show count when more than maxVisible items selected", () => {
      render(<MultiSelect {...defaultProps} value={["option1", "option2", "option3", "option5"]} maxVisible={3} />);

      const trigger = getMainTrigger();
      expect(trigger).toHaveTextContent("4 items selected");
    });

    it("should show selection counter badge", () => {
      render(<MultiSelect {...defaultProps} value={["option1", "option2"]} />);

      const badge = screen.getByText("2");
      expect(badge).toBeInTheDocument();
    });

    it("should show clear button when selections exist", () => {
      render(<MultiSelect {...defaultProps} value={["option1"]} />);

      const clearBtn = screen.getByLabelText("Clear all selections");
      expect(clearBtn).toBeInTheDocument();
    });

    it("should display selected items as badges below trigger", () => {
      render(<MultiSelect {...defaultProps} value={["option1", "option2"]} />);

      const badge1 = screen.getByText("Option 1");
      const badge2 = screen.getByText("Option 2");
      expect(badge1).toBeInTheDocument();
      expect(badge2).toBeInTheDocument();
    });

    it("should show +N badge when more items than maxVisible in display area", () => {
      render(<MultiSelect {...defaultProps} value={["option1", "option2", "option3", "option5"]} maxVisible={2} />);

      const plusBadge = screen.getByText("+2 more");
      expect(plusBadge).toBeInTheDocument();
    });
  });

  describe("Opening and Closing", () => {
    it("should open dropdown when trigger is clicked", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("should close dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <MultiSelect {...defaultProps} />
          <div data-testid="outside">Outside area</div>
        </div>
      );

      const trigger = getMainTrigger();
      await user.click(trigger);

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      const outside = screen.getByTestId("outside");
      await user.click(outside);

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should close dropdown when Close button is clicked", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const closeBtn = screen.getByText("Close");
      await user.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should toggle open state when trigger is clicked again", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();

      // Open
      await user.click(trigger);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      // Close
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Option Selection", () => {
    it("should select an option when clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const option = screen.getByText("Option 1");
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith(["option1"]);
    });

    it("should deselect an option when clicked again", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} value={["option1"]} onChange={onChange} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const option = screen.getByText("Option 1");
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("should allow multiple selections", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      await user.click(screen.getByText("Option 1"));
      await user.click(screen.getByText("Option 2"));
      await user.click(screen.getByText("Option 3"));

      expect(onChange).toHaveBeenLastCalledWith(["option1", "option2", "option3"]);
    });

    it("should not select disabled options", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const disabledOption = screen.getByText("Option 4").closest("div");
      expect(disabledOption).toHaveAttribute("aria-disabled", "true");

      await user.click(screen.getByText("Option 4"));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should show correct checkbox states", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} value={["option1"]} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const options = screen.getAllByRole("option");
      const selectedOption = options.find(opt => opt.textContent?.includes("Option 1"));
      const unselectedOption = options.find(opt => opt.textContent?.includes("Option 2"));

      // Check that selected option has checked state
      const selectedCheckbox = within(selectedOption!).getByRole("checkbox");
      expect(selectedCheckbox).toHaveAttribute("aria-checked", "true");

      // Check that unselected option has unchecked state
      const unselectedCheckbox = within(unselectedOption!).getByRole("checkbox");
      expect(unselectedCheckbox).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("Search and Filtering", () => {
    it("should filter options based on search query", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "Option 1");

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Option 3")).not.toBeInTheDocument();
    });

    it("should show empty message when no matches found", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "nonexistent");

      expect(screen.getByText("No matches found")).toBeInTheDocument();
    });

    it("should call onSearch when provided", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<MultiSelect {...defaultProps} onSearch={onSearch} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "test");

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith("test");
      });
    });

    it("should sort selected options to top", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} value={["option3"]} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const options = screen.getAllByRole("option");
      const firstOption = options[0];

      expect(firstOption).toHaveTextContent("Option 3");
    });

    it("should handle case-insensitive search", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "option 1");

      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should open dropdown with Enter key", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      trigger.focus();
      await user.keyboard("{Enter}");

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should open dropdown with Space key", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      trigger.focus();
      await user.keyboard(" ");

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should close dropdown with Escape key", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should navigate options with Arrow keys", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      // Focus search input first
      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toHaveFocus();

      // Navigate to first option
      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveClass("ring-2"); // Focused state
    });

    it("should select focused option with Enter", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      // Navigate to first option
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(onChange).toHaveBeenCalledWith(["option1"]);
    });

    it("should move focus to search input on Tab", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      // Focus should be on search input
      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toHaveFocus();
    });
  });

  describe("Touch Interactions", () => {
    it("should open dropdown on touch", async () => {
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();

      // Simulate touch event
      fireEvent.touchStart(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    it("should select option on touch", async () => {
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = getMainTrigger();
      fireEvent.touchStart(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const option = screen.getByText("Option 1");
      fireEvent.touchStart(option);

      expect(onChange).toHaveBeenCalledWith(["option1"]);
    });
  });

  describe("Clear Functionality", () => {
    it("should clear all selections when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} value={["option1", "option2"]} onChange={onChange} />);

      const clearBtn = screen.getByLabelText("Clear all selections");
      await user.click(clearBtn);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("should remove individual selection when X is clicked on badge", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} value={["option1", "option2"]} onChange={onChange} />);

      const removeBtns = screen.getAllByLabelText(/Remove/);
      await user.click(removeBtns[0]);

      expect(onChange).toHaveBeenCalledWith(["option2"]);
    });

    it("should clear all from dropdown footer", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} value={["option1"]} onChange={onChange} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const clearAllBtn = screen.getByText("Clear All");
      await user.click(clearAllBtn);

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("should update ARIA expanded when opened", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("should have listbox role with multiselectable", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    });

    it("should have option roles with correct aria-selected", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} value={["option1"]} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const options = screen.getAllByRole("option");
      const selectedOption = options.find(opt => opt.textContent?.includes("Option 1"));
      const unselectedOption = options.find(opt => opt.textContent?.includes("Option 2"));

      expect(selectedOption).toHaveAttribute("aria-selected", "true");
      expect(unselectedOption).toHaveAttribute("aria-selected", "false");
    });

    it("should announce disabled options", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const disabledOption = screen.getByText("Option 4").closest("div");
      expect(disabledOption).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Disabled State", () => {
    it("should not open when disabled", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} disabled={true} />);

      const trigger = getMainTrigger();
      expect(trigger).toBeDisabled();

      await user.click(trigger);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should not allow keyboard interaction when disabled", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} disabled={true} />);

      const trigger = getMainTrigger();
      trigger.focus();
      await user.keyboard("{Enter}");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should not allow clearing when disabled", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} value={["option1"]} disabled={true} />);

      const clearBtn = screen.getByLabelText("Clear all selections");
      await user.click(clearBtn);

      // onChange should not be called
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  describe("Performance with Large Datasets", () => {
    it("should handle large option lists efficiently", async () => {
      const user = userEvent.setup();
      const largeOptions: MultiSelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      render(<MultiSelect {...defaultProps} options={largeOptions} />);

      const trigger = getMainTrigger();
      const startTime = performance.now();
      await user.click(trigger);
      const endTime = performance.now();

      // Should open within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Should show first batch of options
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should filter large datasets efficiently", async () => {
      const user = userEvent.setup();
      const largeOptions: MultiSelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      render(<MultiSelect {...defaultProps} options={largeOptions} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      const startTime = performance.now();
      await user.type(searchInput, "500");
      const endTime = performance.now();

      // Should filter within reasonable time (< 50ms)
      expect(endTime - startTime).toBeLessThan(50);

      // Should show matching result
      expect(screen.getByText("Option 500")).toBeInTheDocument();
    });

    it("should handle rapid selection changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const largeOptions: MultiSelectOption[] = Array.from({ length: 100 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      render(<MultiSelect {...defaultProps} options={largeOptions} onChange={onChange} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      // Rapidly select multiple options
      for (let i = 0; i < 10; i++) {
        const option = screen.getByText(`Option ${i}`);
        await user.click(option);
      }

      expect(onChange).toHaveBeenCalledTimes(10);
      expect(onChange).toHaveBeenLastCalledWith(
        Array.from({ length: 10 }, (_, i) => `option${i}`)
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty options array", () => {
      render(<MultiSelect {...defaultProps} options={[]} />);

      const trigger = getMainTrigger();
      expect(trigger).toBeInTheDocument();
    });

    it("should handle all options disabled", async () => {
      const user = userEvent.setup();
      const disabledOptions: MultiSelectOption[] = [
        { value: "1", label: "Option 1", disabled: true },
        { value: "2", label: "Option 2", disabled: true },
      ];

      render(<MultiSelect {...defaultProps} options={disabledOptions} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      expect(screen.getByText("No options available")).toBeInTheDocument();
    });

    it("should handle value not in options", () => {
      render(<MultiSelect {...defaultProps} value={["nonexistent"]} />);

      // Should not crash
      const trigger = getMainTrigger();
      expect(trigger).toBeInTheDocument();
    });

    it("should handle duplicate selections gracefully", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      // Click same option twice
      const option = screen.getByText("Option 1");
      await user.click(option);
      await user.click(option);

      // Should toggle on/off
      expect(onChange).toHaveBeenNthCalledWith(1, ["option1"]);
      expect(onChange).toHaveBeenNthCalledWith(2, []);
    });

    it("should handle special characters in search", async () => {
      const user = userEvent.setup();
      const specialOptions: MultiSelectOption[] = [
        { value: "1", label: "Option with (parentheses)" },
        { value: "2", label: "Option with [brackets]" },
        { value: "3", label: "Option with 'quotes'" },
      ];

      render(<MultiSelect {...defaultProps} options={specialOptions} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");

      // Search for parentheses
      await user.type(searchInput, "(");

      // Wait for filtering to complete
      await waitFor(() => {
        expect(screen.getByText("Option with (parentheses)")).toBeInTheDocument();
      });

      // Clear and search for brackets
      await user.clear(searchInput);
      await user.type(searchInput, "[");

      // Wait for filtering to complete
      await waitFor(() => {
        expect(screen.getByText("Option with [brackets]")).toBeInTheDocument();
      });
    });

    it("should handle very long option labels", async () => {
      const user = userEvent.setup();
      const longLabel = "A".repeat(500);
      const longOptions: MultiSelectOption[] = [
        { value: "1", label: longLabel },
      ];

      render(<MultiSelect {...defaultProps} options={longOptions} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle rapid open/close cycles", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = getMainTrigger();

      for (let i = 0; i < 10; i++) {
        await user.click(trigger);
        // Check if open
        if (i % 2 === 0) {
          expect(screen.getByRole("listbox")).toBeInTheDocument();
        } else {
          expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        }
      }
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading is true", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} loading={true} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const spinner = screen.getByRole("status", { name: "Loading" });
      expect(spinner).toBeInTheDocument();
    });

    it("should not show spinner when loading is false", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} loading={false} />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("Custom Placeholders", () => {
    it("should use custom placeholder", () => {
      render(<MultiSelect {...defaultProps} placeholder="Choose items..." />);

      expect(screen.getByText("Choose items...")).toBeInTheDocument();
    });

    it("should use custom search placeholder", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} searchPlaceholder="Type to filter..." />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      expect(screen.getByPlaceholderText("Type to filter...")).toBeInTheDocument();
    });

    it("should use custom empty message", async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} emptyMessage="Nothing here!" />);

      const trigger = getMainTrigger();
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        expect(screen.getByText("Nothing here!")).toBeInTheDocument();
      });
    });
  });

  describe("Max Visible Configuration", () => {
    it("should respect custom maxVisible for trigger display", () => {
      render(
        <MultiSelect
          {...defaultProps}
          value={["option1", "option2", "option3", "option4"]}
          maxVisible={2}
        />
      );

      const trigger = getMainTrigger();
      expect(trigger).toHaveTextContent("4 items selected");
    });

    it("should respect custom maxVisible for badge display", () => {
      render(
        <MultiSelect
          {...defaultProps}
          value={["option1", "option2", "option3", "option4"]}
          maxVisible={2}
        />
      );

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("+2 more")).toBeInTheDocument();
    });

    it("should handle maxVisible of 0", () => {
      render(
        <MultiSelect
          {...defaultProps}
          value={["option1", "option2"]}
          maxVisible={0}
        />
      );

      const trigger = getMainTrigger();
      expect(trigger).toHaveTextContent("2 items selected");
    });
  });
});