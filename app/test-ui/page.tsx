'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';

export default function TestComponents() {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">UI Components Test Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button styles</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Different badge variants</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 items-center">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>

          {/* Input & Label */}
          <Card>
            <CardHeader>
              <CardTitle>Input & Label</CardTitle>
              <CardDescription>Form input elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-input">Test Input</Label>
                <Input
                  id="test-input"
                  placeholder="Enter something..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={checkboxChecked}
                  id="test-checkbox"
                  onCheckedChange={(checked) => setCheckboxChecked(!!checked)}
                />
                <Label htmlFor="test-checkbox">Test Checkbox</Label>
              </div>
              <p className="text-sm text-gray-500">
                Input value: {inputValue || 'empty'}
              </p>
            </CardContent>
          </Card>

          {/* Card Example */}
          <Card>
            <CardHeader>
              <CardTitle>Card Component</CardTitle>
              <CardDescription>This is a card with header and content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cards are used to group related information in a contained block.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Components */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Component 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Additional component example</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Component 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Another component example</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Component 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Yet another example</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
