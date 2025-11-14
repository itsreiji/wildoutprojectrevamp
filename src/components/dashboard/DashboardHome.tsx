import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Users,
  Image,
  Handshake,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useContent } from '../../contexts/ContentContext';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const DashboardHome = React.memo(() => {
  const { events, team, gallery, partners, hero } = useContent();

  // Calculate statistics
  const stats = useMemo(() => {
    const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
    const ongoingEvents = events.filter((e) => e.status === 'ongoing').length;
    const completedEvents = events.filter((e) => e.status === 'completed').length;
    const totalAttendees = events.reduce((sum, e) => sum + (e.attendees ?? 0), 0);
    const totalCapacity = events.reduce((sum, e) => sum + (e.capacity ?? 0), 0);
    const avgAttendanceRate = totalCapacity > 0 ? (totalAttendees / totalCapacity) * 100 : 0;

    return {
      totalEvents: events.length,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalTeamMembers: team.length,
      activeTeamMembers: team.filter((m) => m.status === 'active').length,
      totalGalleryImages: gallery.length,
      totalPartners: partners.length,
      activePartners: partners.filter((p) => p.status === 'active').length,
      totalAttendees,
      avgAttendanceRate: Math.round(avgAttendanceRate),
    };
  }, [events, team, gallery, partners]);

  // Event status distribution data
  const eventStatusData = [
    { name: 'Upcoming', value: stats.upcomingEvents, color: '#3B82F6' },
    { name: 'Ongoing', value: stats.ongoingEvents, color: '#10B981' },
    { name: 'Completed', value: stats.completedEvents, color: '#6B7280' },
  ];

  // Event category distribution
  const categoryData = useMemo(() => {
    const categories = events.reduce((acc, event) => {
      const key = event.category ?? 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [events]);

  // Monthly events trend (mock data - in production, would be based on actual dates)
  const monthlyTrendData = [
    { month: 'Jan', events: 12, attendees: 450 },
    { month: 'Feb', events: 15, attendees: 580 },
    { month: 'Mar', events: 18, attendees: 720 },
    { month: 'Apr', events: 22, attendees: 890 },
    { month: 'May', events: 25, attendees: 1050 },
    { month: 'Jun', events: 20, attendees: 820 },
  ];

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add recent events
    events.slice(0, 3).forEach((event) => {
      activities.push({
        type: 'event',
        action: 'Event created',
        title: event.title,
        time: 'Recently',
        icon: Calendar,
      });
    });

    // Add team updates
    if (team.length > 0) {
      activities.push({
        type: 'team',
        action: 'Team member added',
        title: team[team.length - 1]?.name,
        time: 'Recently',
        icon: Users,
      });
    }

    // Add gallery updates
    if (gallery.length > 0) {
      activities.push({
        type: 'gallery',
        action: 'Photo uploaded',
        title: gallery[0]?.caption || 'New photo',
        time: 'Recently',
        icon: Image,
      });
    }

    return activities.slice(0, 5);
  }, [events, team, gallery]);

  const COLORS = ['#E93370', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <p className="text-white/60">Welcome back! Here's what's happening with your platform</p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-[#E93370]/20 to-transparent backdrop-blur-xl border-[#E93370]/30 hover:border-[#E93370]/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Events</p>
                  <h3 className="text-3xl text-white">{stats.totalEvents}</h3>
                  <div className="flex items-center mt-2 text-xs text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>{stats.upcomingEvents} upcoming</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#E93370]/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[#E93370]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/20 to-transparent backdrop-blur-xl border-blue-500/30 hover:border-blue-500/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Team Members</p>
                  <h3 className="text-3xl text-white">{stats.totalTeamMembers}</h3>
                  <div className="flex items-center mt-2 text-xs text-blue-400">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>{stats.activeTeamMembers} active</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-transparent backdrop-blur-xl border-purple-500/30 hover:border-purple-500/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Gallery Photos</p>
                  <h3 className="text-3xl text-white">{stats.totalGalleryImages}</h3>
                  <div className="flex items-center mt-2 text-xs text-purple-400">
                    <Eye className="h-3 w-3 mr-1" />
                    <span>Public collection</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Image className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-transparent backdrop-blur-xl border-green-500/30 hover:border-green-500/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Partners</p>
                  <h3 className="text-3xl text-white">{stats.totalPartners}</h3>
                  <div className="flex items-center mt-2 text-xs text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>{stats.activePartners} active</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Handshake className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Event Status Distribution</CardTitle>
              <CardDescription className="text-white/60">Current state of all events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Event Categories</CardTitle>
              <CardDescription className="text-white/60">Distribution by event type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis
                      dataKey="name"
                      stroke="#ffffff40"
                      tick={{ fill: '#ffffff80' }}
                    />
                    <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff80' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Bar dataKey="value" fill="#E93370" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Events Trend</CardTitle>
              <CardDescription className="text-white/60">Monthly performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E93370" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E93370" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="#ffffff40"
                      tick={{ fill: '#ffffff80' }}
                    />
                    <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff80' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="events"
                      stroke="#E93370"
                      fillOpacity={1}
                      fill="url(#colorEvents)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-white/60">Latest platform updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#E93370]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-[#E93370]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90">{activity.action}</p>
                        <p className="text-sm text-white/60 truncate">{activity.title}</p>
                        <p className="text-xs text-white/40 mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Attendance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Attendance Overview</CardTitle>
            <CardDescription className="text-white/60">
              Total attendees across all events: {stats.totalAttendees.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Average Attendance Rate</span>
                <span className="text-sm text-[#E93370]">{stats.avgAttendanceRate}%</span>
              </div>
              <Progress value={stats.avgAttendanceRate} className="h-3" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {events.slice(0, 3).map((event) => {
                  const attendees = event.attendees ?? 0;
                  const capacity = event.capacity ?? 0;
                  const rate = capacity > 0 ? (attendees / capacity) * 100 : 0;
                  return (
                    <div key={event.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm text-white/90 mb-2 truncate">{event.title}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60">
                          {attendees}/{capacity || 'N/A'}
                        </span>
                        <span className="text-xs text-[#E93370]">{Math.round(rate)}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
      >
        <Card className="bg-gradient-to-br from-[#E93370]/10 to-transparent backdrop-blur-xl border-[#E93370]/20">
          <CardHeader>
            <CardTitle className="text-white">Site Performance</CardTitle>
            <CardDescription className="text-white/60">Key metrics from hero section</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl text-[#E93370] mb-2">{hero.stats.events}</div>
                <div className="text-sm text-white/60">Events Hosted</div>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl text-[#E93370] mb-2">{hero.stats.members}</div>
                <div className="text-sm text-white/60">Community Members</div>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl text-[#E93370] mb-2">{hero.stats.partners}</div>
                <div className="text-sm text-white/60">Brand Partners</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

DashboardHome.displayName = 'DashboardHome';
