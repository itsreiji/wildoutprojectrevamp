import React from 'react';
import { useContent } from '../contexts/ContentContext';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Database, TestTube } from 'lucide-react';

/**
 * Component for toggling between real Supabase data and dummy data
 * Useful for development and testing to see how the app looks with data
 */
export const DummyDataToggle: React.FC = () => {
  const { useDummyData, setUseDummyData, loading, events, partners, team, gallery } = useContent();

  const handleToggle = (checked: boolean) => {
    setUseDummyData(checked);
  };

  const dataCounts = {
    events: events.length,
    partners: partners.length,
    team: team.length,
    gallery: gallery.length,
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {useDummyData ? <TestTube className="h-5 w-5" /> : <Database className="h-5 w-5" />}
          Data Source Toggle
        </CardTitle>
        <CardDescription>
          Switch between real Supabase data and dummy data for development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dummy-data-toggle" className="text-sm font-medium">
            Use Dummy Data
          </Label>
          <Switch
            id="dummy-data-toggle"
            checked={useDummyData}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>

        <div className="text-sm text-muted-foreground">
          {useDummyData ? (
            <div className="space-y-1">
              <p>🔧 Currently using <strong>dummy data</strong> for development</p>
              <p>This data is stored locally and won't affect your production database</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p>🗄️ Currently using <strong>real Supabase data</strong></p>
              <p>Data is fetched from your live database</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">
            <p>⏳ Loading data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted p-2 rounded">
              <div className="font-medium">{dataCounts.events}</div>
              <div className="text-muted-foreground">Events</div>
            </div>
            <div className="bg-muted p-2 rounded">
              <div className="font-medium">{dataCounts.partners}</div>
              <div className="text-muted-foreground">Partners</div>
            </div>
            <div className="bg-muted p-2 rounded">
              <div className="font-medium">{dataCounts.team}</div>
              <div className="text-muted-foreground">Team</div>
            </div>
            <div className="bg-muted p-2 rounded">
              <div className="font-medium">{dataCounts.gallery}</div>
              <div className="text-muted-foreground">Gallery</div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>To seed your database with dummy data:</strong></p>
          <code className="block bg-muted p-2 rounded text-xs">
            import &#123; seedDatabase &#125; from './utils/seedDatabase';<br/>
            seedDatabase(&#123; clearExisting: true &#125;);
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default DummyDataToggle;
