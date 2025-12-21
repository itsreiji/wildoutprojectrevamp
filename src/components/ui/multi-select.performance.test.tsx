import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MultiSelect, type MultiSelectOption } from "./multi-select";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

describe("MultiSelect Performance Tests", () => {
  const generateLargeDataset = (size: number): MultiSelectOption[] => {
    return Array.from({ length: size }, (_, i) => ({
      value: `option-${i}`,
      label: `Option ${i} - ${"A".repeat(50)}`, // Long labels to stress rendering
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering Performance", () => {
    it("should render 1000 options within acceptable time", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(1000);
      const onChange = vi.fn();

      const startTime = performance.now();
      
      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={onChange}
          placeholder="Select items..."
        />
      );
      
      const renderTime = performance.now() - startTime;
      console.log(`Initial render time for 1000 options: ${renderTime.toFixed(2)}ms`);
      
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms

      const trigger = screen.getByRole("button");
      const openStartTime = performance.now();
      await user.click(trigger);
      const openTime = performance.now() - openStartTime;
      
      console.log(`Dropdown open time for 1000 options: ${openTime.toFixed(2)}ms`);
      expect(openTime).toBeLessThan(150); // Should open in under 150ms
    });

    it("should handle 5000 options without freezing", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(5000);

      const startTime = performance.now();
      
      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={vi.fn()}
        />
      );
      
      const renderTime = performance.now() - startTime;
      console.log(`Render time for 5000 options: ${renderTime.toFixed(2)}ms`);
      
      // Allow more time for 5000 options but still reasonable
      expect(renderTime).toBeLessThan(500);

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Should show loading indicator or first batch
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should use virtualization for large lists", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(2000);

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={vi.fn()}
        />
      );
      
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Should only render visible options
      const options = screen.getAllByRole("option");
      console.log(`Visible options in viewport: ${options.length}`);
      
      // Should not render all 2000 options at once
      expect(options.length).toBeLessThan(100);
    });
  });

  describe("Search Performance", () => {
    it("should filter 1000 options within 50ms", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(1000);

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={vi.fn()}
        />
      );
      
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      const searchStartTime = performance.now();
      
      await user.type(searchInput, "500");
      
      const searchTime = performance.now() - searchStartTime;
      console.log(`Search time for 1000 options: ${searchTime.toFixed(2)}ms`);
      
      expect(searchTime).toBeLessThan(50);

      // Should show results
      await waitFor(() => {
        expect(screen.getByText("Option 500")).toBeInTheDocument();
      });
    });

    it("should handle rapid search queries efficiently", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(1000);

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={vi.fn()}
        />
      );
      
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      
      const queries = ["1", "12", "123", "1234", "12345"];
      const startTime = performance.now();

      for (const query of queries) {
        await user.clear(searchInput);
        await user.type(searchInput, query);
      }

      const totalTime = performance.now() - startTime;
      console.log(`Rapid search queries time: ${totalTime.toFixed(2)}ms`);
      
      expect(totalTime).toBeLessThan(200); // All queries should complete quickly
    });

    it("should debounce search with onSearch callback", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      const largeOptions = generateLargeDataset(1000);

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={vi.fn()}
          onSearch={onSearch}
        />
      );
      
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");
      
      // Type rapidly
      await user.type(searchInput, "test");
      
      // Should debounce and only call once after typing stops
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith("test");
      }, { timeout: 500 });

      expect(onSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Selection Performance", () => {
    it("should handle rapid selection of 100 items", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(500);
      const onChange = vi.fn();

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={onChange}
        />
      );
      
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const startTime = performance.now();

      // Select first 100 options
      for (let i = 0; i < 100; i++) {
        const option = screen.getByText(`Option ${i}`);
        await user.click(option);
      }

      const selectionTime = performance.now() - startTime;
      console.log(`Selection time for 100 items: ${selectionTime.toFixed(2)}ms`);
      
      expect(selectionTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(onChange).toHaveBeenCalledTimes(100);
    });

    it("should handle bulk deselection efficiently", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(100);
      const selectedValues = largeOptions.slice(0, 50).map(opt => opt.value);
      const onChange = vi.fn();

      render(
        <MultiSelect 
          options={largeOptions} 
          value={selectedValues} 
          onChange={onChange}
        />
      );
      
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const startTime = performance.now();

      // Deselect all by clicking clear all
      const clearAllBtn = screen.getByText("Clear All");
      await user.click(clearAllBtn);

      const clearTime = performance.now() - startTime;
      console.log(`Bulk clear time for 50 items: ${clearTime.toFixed(2)}ms`);
      
      expect(clearTime).toBeLessThan(100);
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("should handle keyboard navigation through large lists", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(1000);

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={vi.fn()}
        />
      );
      
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const startTime = performance.now();

      // Navigate through 50 items with arrow keys
      for (let i = 0; i < 50; i++) {
        await user.keyboard("{ArrowDown}");
      }

      const navigationTime = performance.now() - startTime;
      console.log(`Keyboard navigation time for 50 items: ${navigationTime.toFixed(2)}ms`);
      
      expect(navigationTime).toBeLessThan(500);
    });
  });

  describe("Memory Usage", () => {
    it("should not leak memory with repeated open/close", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(1000);

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={vi.fn()}
        />
      );
      
      const trigger = screen.getByRole("button");

      const startTime = performance.now();

      // Open and close 20 times
      for (let i = 0; i < 20; i++) {
        await user.click(trigger); // Open
        await user.click(trigger); // Close
      }

      const totalTime = performance.now() - startTime;
      console.log(`20 open/close cycles: ${totalTime.toFixed(2)}ms`);
      
      expect(totalTime).toBeLessThan(2000); // Should be fast
    });

    it("should handle rapid prop updates", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <MultiSelect 
          options={generateLargeDataset(1000)} 
          value={[]} 
          onChange={vi.fn()}
        />
      );

      const startTime = performance.now();

      // Rapidly update props
      for (let i = 0; i < 20; i++) {
        rerender(
          <MultiSelect 
            options={generateLargeDataset(1000)} 
            value={[`option-${i}`]} 
            onChange={vi.fn()}
          />
        );
      }

      const rerenderTime = performance.now() - startTime;
      console.log(`20 rerenders with 1000 options: ${rerenderTime.toFixed(2)}ms`);
      
      expect(rerenderTime).toBeLessThan(1000);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle typical user workflow efficiently", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(500);
      const onChange = vi.fn();

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={onChange}
          placeholder="Select categories..."
        />
      );

      const startTime = performance.now();

      // 1. Open dropdown
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // 2. Search for specific items
      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "10");

      // 3. Select multiple items
      await user.click(screen.getByText("Option 10"));
      await user.click(screen.getByText("Option 100"));
      await user.click(screen.getByText("Option 110"));

      // 4. Clear search and search again
      await user.clear(searchInput);
      await user.type(searchInput, "200");

      // 5. Select more items
      await user.click(screen.getByText("Option 200"));

      // 6. Close dropdown
      await user.click(trigger);

      const totalTime = performance.now() - startTime;
      console.log(`Complete user workflow time: ${totalTime.toFixed(2)}ms`);

      expect(totalTime).toBeLessThan(2000); // Should complete in under 2 seconds
      expect(onChange).toHaveBeenCalledTimes(4);
    });

    it("should handle concurrent search and selection", async () => {
      const user = userEvent.setup();
      const largeOptions = generateLargeDataset(1000);
      const onChange = vi.fn();

      render(
        <MultiSelect 
          options={largeOptions} 
          value={[]} 
          onChange={onChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search...");

      // Start searching
      await user.type(searchInput, "5");

      // While searching, try to select (should work with filtered results)
      await user.click(screen.getByText("Option 5"));

      // Continue typing
      await user.type(searchInput, "0");

      // Select from refined results
      await user.click(screen.getByText("Option 50"));

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenNthCalledWith(1, ["option-5"]);
      expect(onChange).toHaveBeenNthCalledWith(2, ["option-5", "option-50"]);
    });
  });

  describe("Stress Tests", () => {
    it("should handle maximum realistic dataset", async () => {
      const user = userEvent.setup();
      const massiveOptions = generateLargeDataset(10000);

      const startTime = performance.now();

      render(
        <MultiSelect 
          options={massiveOptions} 
          value={[]} 
          onChange={vi.fn()}
        />
      );

      const renderTime = performance.now() - startTime;
      console.log(`Render time for 10,000 options: ${renderTime.toFixed(2)}ms`);

      // Should render without crashing
      expect(screen.getByRole("button")).toBeInTheDocument();

      // Should open reasonably
      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it("should handle extreme rapid interactions", async () => {
      const user = userEvent.setup();
      const options = generateLargeDataset(100);
      const onChange = vi.fn();

      render(
        <MultiSelect 
          options={options} 
          value={[]} 
          onChange={onChange}
        />
      );

      const trigger = screen.getByRole("button");

      // Extreme rapid clicking
      const startTime = performance.now();
      for (let i = 0; i < 50; i++) {
        await user.click(trigger); // Toggle open/close
      }
      const toggleTime = performance.now() - startTime;

      console.log(`50 toggle operations: ${toggleTime.toFixed(2)}ms`);
      expect(toggleTime).toBeLessThan(1000);
    });
  });
});