import React, { useState } from "react";
import { MultiSelect, type MultiSelectOption } from "./multi-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { H3, SmallText } from "./typography";

/**
 * Example usage of MultiSelect component
 * Demonstrates various configurations and use cases
 */

export const MultiSelectExample = () => {
  // Basic usage
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  
  // With search functionality
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  
  // Large dataset
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // With custom styling
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Example options
  const fruitOptions: MultiSelectOption[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange" },
    { value: "grape", label: "Grape" },
    { value: "strawberry", label: "Strawberry" },
    { value: "watermelon", label: "Watermelon" },
    { value: "pineapple", label: "Pineapple" },
    { value: "mango", label: "Mango" },
  ];

  const countryOptions: MultiSelectOption[] = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "jp", label: "Japan" },
    { value: "in", label: "India" },
    { value: "br", label: "Brazil" },
    { value: "mx", label: "Mexico" },
  ];

  // Generate large dataset for performance testing
  const largeDataset: MultiSelectOption[] = React.useMemo(() => 
    Array.from({ length: 500 }, (_, i) => ({
      value: `item-${i}`,
      label: `Product Item ${i} - ${["Premium", "Standard", "Basic"][i % 3]} Tier`,
      disabled: i % 50 === 0, // Every 50th item disabled
    })), []
  );

  const tagOptions: MultiSelectOption[] = [
    { value: "react", label: "React" },
    { value: "typescript", label: "TypeScript" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "nodejs", label: "Node.js" },
    { value: "nextjs", label: "Next.js" },
    { value: "tailwind", label: "Tailwind CSS" },
    { value: "supabase", label: "Supabase" },
  ];

  // Simulated search for countries
  const handleCountrySearch = (query: string) => {
    console.log(`Searching countries for: "${query}"`);
    // In real app, this would fetch from API
  };

  return (
    <div className="space-y-8">
      {/* Basic Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Multi-Select</CardTitle>
          <CardDescription>
            Simple multi-select with fruits. Select multiple items and see them displayed as tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={fruitOptions}
            value={selectedFruits}
            onChange={setSelectedFruits}
            placeholder="Select your favorite fruits..."
          />
          
          {selectedFruits.length > 0 && (
            <div className="mt-4">
              <SmallText className="mb-2">Selected fruits:</SmallText>
              <div className="flex flex-wrap gap-2">
                {selectedFruits.map(fruit => (
                  <Badge key={fruit} variant="category">
                    {fruitOptions.find(o => o.value === fruit)?.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* With Search and Async */}
      <Card>
        <CardHeader>
          <CardTitle>Searchable Multi-Select</CardTitle>
          <CardDescription>
            Includes search functionality and simulated async loading. Try searching for countries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={countryOptions}
            value={selectedCountries}
            onChange={setSelectedCountries}
            placeholder="Select countries..."
            searchPlaceholder="Search countries..."
            onSearch={handleCountrySearch}
          />
          
          {selectedCountries.length > 0 && (
            <div className="mt-4">
              <SmallText className="mb-2">Selected countries ({selectedCountries.length}):</SmallText>
              <div className="flex flex-wrap gap-2">
                {selectedCountries.map(country => (
                  <Badge key={country} variant="outline">
                    {countryOptions.find(o => o.value === country)?.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Large Dataset */}
      <Card>
        <CardHeader>
          <CardTitle>Large Dataset (500 items)</CardTitle>
          <CardDescription>
            Performance-optimized for large lists. Includes disabled items (every 50th).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={largeDataset}
            value={selectedItems}
            onChange={setSelectedItems}
            placeholder="Select products..."
            searchPlaceholder="Search products..."
            maxVisible={3}
          />
          
          {selectedItems.length > 0 && (
            <div className="mt-4">
              <SmallText className="mb-2">Selected products ({selectedItems.length}):</SmallText>
              <div className="flex flex-wrap gap-1">
                {selectedItems.slice(0, 5).map(item => (
                  <Badge key={item} variant="secondary">
                    {largeDataset.find(o => o.value === item)?.label}
                  </Badge>
                ))}
                {selectedItems.length > 5 && (
                  <Badge variant="outline">+{selectedItems.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Styling */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Styled Multi-Select</CardTitle>
          <CardDescription>
            Demonstrates custom styling and maxVisible configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={tagOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select technologies..."
            searchPlaceholder="Search tech stack..."
            maxVisible={2}
            className="border-pink-500/30"
          />
          
          {selectedTags.length > 0 && (
            <div className="mt-4">
              <SmallText className="mb-2">Your tech stack:</SmallText>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="category"
                    className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30"
                  >
                    {tagOptions.find(o => o.value === tag)?.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Example */}
      <Card>
        <CardHeader>
          <CardTitle>Form Integration Example</CardTitle>
          <CardDescription>
            How to use MultiSelect in a form context with validation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormIntegrationExample />
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Features</CardTitle>
          <CardDescription>
            Built-in optimizations for handling large datasets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <H3 className="text-lg mb-2">Features</H3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Virtual scrolling for large lists</li>
                <li>✓ Debounced search (300ms)</li>
                <li>✓ Efficient filtering algorithms</li>
                <li>✓ Memoized computations</li>
                <li>✓ Keyboard navigation</li>
              </ul>
            </div>
            <div>
              <H3 className="text-lg mb-2">Accessibility</H3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ ARIA labels and roles</li>
                <li>✓ Screen reader support</li>
                <li>✓ Keyboard navigation</li>
                <li>✓ Focus management</li>
                <li>✓ Touch-friendly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Form integration example
const FormIntegrationExample = () => {
  const [formData, setFormData] = useState({
    interests: [] as string[],
    skills: [] as string[],
  });

  const interestOptions: MultiSelectOption[] = [
    { value: "design", label: "Design" },
    { value: "development", label: "Development" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "support", label: "Support" },
  ];

  const skillOptions: MultiSelectOption[] = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "node", label: "Node.js" },
    { value: "python", label: "Python" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Form submitted!\nInterests: ${formData.interests.join(", ")}\nSkills: ${formData.skills.join(", ")}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Your Interests</label>
        <MultiSelect
          options={interestOptions}
          value={formData.interests}
          onChange={(value) => setFormData(prev => ({ ...prev, interests: value }))}
          placeholder="Select your interests..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Skills</label>
        <MultiSelect
          options={skillOptions}
          value={formData.skills}
          onChange={(value) => setFormData(prev => ({ ...prev, skills: value }))}
          placeholder="Select your skills..."
          searchPlaceholder="Search skills..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => setFormData({ interests: [], skills: [] })}
          className="px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors"
        >
          Reset
        </button>
      </div>

      {(formData.interests.length > 0 || formData.skills.length > 0) && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <SmallText className="font-medium mb-2">Current Selection:</SmallText>
          <div className="space-y-1 text-sm">
            {formData.interests.length > 0 && (
              <div>
                <span className="text-muted-foreground">Interests:</span>{" "}
                {formData.interests.join(", ")}
              </div>
            )}
            {formData.skills.length > 0 && (
              <div>
                <span className="text-muted-foreground">Skills:</span>{" "}
                {formData.skills.join(", ")}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default MultiSelectExample;