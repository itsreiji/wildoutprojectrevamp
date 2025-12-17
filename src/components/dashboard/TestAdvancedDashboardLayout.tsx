import React from 'react';
import { AdvancedDashboardLayout } from '@/components/dashboard/AdvancedDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Box,
  Flex,
  Text,
  Heading,
  Select,
  Checkbox,
  Badge
} from '@radix-ui/themes';

const TestAdvancedDashboardLayout = () => {
  const rightPanelContent = (
    <Flex direction="column" gap="4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Flex direction="column" gap="3">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select.Root>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">All</Select.Item>
                  <Select.Item value="active">Active</Select.Item>
                  <Select.Item value="inactive">Inactive</Select.Item>
                  <Select.Item value="pending">Pending</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Input id="date-range" type="date" />
            </div>
            <div>
              <Checkbox id="show-completed" />
              <Label htmlFor="show-completed" className="ml-2">Show Completed Items</Label>
            </div>
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Flex direction="column" gap="2">
            <Button variant="outline">Export Data</Button>
            <Button variant="outline">Import Data</Button>
            <Button variant="outline">Refresh</Button>
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Flex direction="column" gap="3">
            <Flex justify="between">
              <Text size="2">User John Doe logged in</Text>
              <Badge color="green">Now</Badge>
            </Flex>
            <Flex justify="between">
              <Text size="2">New event created</Text>
              <Badge color="blue">10 min ago</Badge>
            </Flex>
            <Flex justify="between">
              <Text size="2">Settings updated</Text>
              <Badge color="gray">30 min ago</Badge>
            </Flex>
          </Flex>
        </CardContent>
      </Card>
    </Flex>
  );

  return (
    <AdvancedDashboardLayout rightPanelContent={rightPanelContent}>
      <Flex direction="column" gap="6">
        <Heading size="6" weight="bold">Dashboard Overview</Heading>
        
        <Flex gap="4" wrap="wrap">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Text size="6" weight="bold">1,234</Text>
              <Text size="2" color="gray" className="mt-1 block">+12% from last month</Text>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Text size="6" weight="bold">56</Text>
              <Text size="2" color="gray" className="mt-1 block">+5 from last month</Text>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <Text size="6" weight="bold">$24,567</Text>
              <Text size="2" color="gray" className="mt-1 block">+8% from last month</Text>
            </CardContent>
          </Card>
        </Flex>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Text>John Doe created a new event</Text>
                <Badge color="green">Just now</Badge>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Text>Jane Smith updated profile</Text>
                <Badge color="blue">5 min ago</Badge>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Text>Admin changed system settings</Text>
                <Badge color="gray">10 min ago</Badge>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Text>New gallery item added</Text>
                <Badge color="blue">15 min ago</Badge>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="column" gap="4">
              <Flex justify="between">
                <Text>Hero Section</Text>
                <Button variant="outline">Edit</Button>
              </Flex>
              <Separator />
              <Flex justify="between">
                <Text>About Us Section</Text>
                <Button variant="outline">Edit</Button>
              </Flex>
              <Separator />
              <Flex justify="between">
                <Text>Events Section</Text>
                <Button variant="outline">Edit</Button>
              </Flex>
              <Separator />
              <Flex justify="between">
                <Text>Gallery Section</Text>
                <Button variant="outline">Edit</Button>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </AdvancedDashboardLayout>
  );
};

export default TestAdvancedDashboardLayout;