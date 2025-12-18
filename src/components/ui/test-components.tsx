"use client";

import React, { useState } from "react";
import {
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Button
} from './index';

export default function TestComponents() {
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">UI Components Test</h1>

      {/* Input Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Input Component</CardTitle>
          <CardDescription>Test input with dark mode support</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            className="w-full"
            placeholder="Enter text here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <p className="mt-2 text-sm text-muted-foreground">Current value: {inputValue}</p>
        </CardContent>
      </Card>

      {/* Select Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Component</CardTitle>
          <CardDescription>Test select dropdown</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-2 text-sm text-muted-foreground">Selected: {selectValue}</p>
        </CardContent>
      </Card>

      {/* Checkbox Test */}
          <Card className="mb-6">
        <CardHeader>
          <CardTitle>Checkbox Component</CardTitle>
          <CardDescription>Test checkbox with form integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={checkboxValue}
                  id="test-checkbox"
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    setCheckboxValue(checked === "indeterminate" ? true : checked)
                  }
            />
            <FormLabel htmlFor="test-checkbox">Accept terms and conditions</FormLabel>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Checked: {checkboxValue ? "Yes" : "No"}</p>
        </CardContent>
      </Card>

      {/* Form Test */}
          <Card className="mb-6">
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Test form with React Hook Form integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" />
              </FormControl>
              <FormDescription>Enter your email address</FormDescription>
              <FormMessage />
            </FormItem>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dialog Component</CardTitle>
          <CardDescription>Test dialog with accessibility</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Dialog</DialogTitle>
                <DialogDescription>
                  This dialog tests keyboard navigation and accessibility features.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Dialog content goes here. You can close this dialog by:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Clicking the close button</li>
                  <li>Pressing the Escape key</li>
                  <li>Clicking outside the dialog</li>
                </ul>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Dark Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Test</CardTitle>
          <CardDescription>Verify dark mode is working</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This page should adapt to your system theme preference. Try changing your OS theme or browser theme setting.
          </p>
          <p className="text-xs text-muted-foreground">
            Current theme: Check if components use CSS variables that change with dark mode.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
