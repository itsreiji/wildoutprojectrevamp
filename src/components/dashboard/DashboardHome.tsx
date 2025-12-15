import {
  Dialog,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Handshake, Image, Users } from "lucide-react";
import { motion } from "motion/react";
import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEvents } from "../../contexts/EventsContext";
import { usePartners } from "../../contexts/PartnersContext";
import { useStaticContent } from "../../contexts/StaticContentContext";
import { useTeam } from "../../contexts/TeamContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
// All event accesses use LandingEvent props

export const DashboardHome = React.memo(() => {
  const { events } = useEvents();
  const { team } = useTeam();
  const { partners } = usePartners();
  const { gallery, hero, getSectionContent } = useStaticContent();

  // Calculate statistics from current data, but sync with Supabase section content
  const stats = useMemo(() => {
    const upcomingEvents = events.filter((e) => e.status === "upcoming").length;
    const ongoingEvents = events.filter((e) => e.status === "ongoing").length;
    const completedEvents = events.filter(
      (e) => e.status === "completed"
    ).length;
    const totalAttendees = events.reduce(
      (sum, e) => sum + (e.attendees ?? 0),
      0
    );
    const totalCapacity = events.reduce((sum, e) => sum + (e.capacity ?? 0), 0);
    const avgAttendanceRate =
      totalCapacity > 0 ? (totalAttendees / totalCapacity) * 100 : 0;

    const currentStats = {
      totalEvents: events.length,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalTeamMembers: team.length,
      activeTeamMembers: team.filter((m) => m.status === "active").length,
      totalGalleryImages: gallery.length,
      totalPartners: partners.length,
      activePartners: partners.filter((p) => p.status === "active").length,
      totalAttendees,
      avgAttendanceRate: Math.round(avgAttendanceRate),
    };

    // If we have section content from Supabase, use it to override stats
    const homeContent = getSectionContent("home");
    if (
      homeContent?.payload &&
      typeof homeContent.payload === "object" &&
      "stats" in homeContent.payload &&
      homeContent.payload.stats
    ) {
      const supabaseStats = homeContent.payload.stats as Record<string, any>;
      return { ...currentStats, ...supabaseStats };
    }

    return currentStats;
  }, [events, team, gallery, partners, getSectionContent]);

  // Event status distribution data
  const eventStatusData = [
    { name: "Upcoming", value: stats.upcomingEvents, color: "#3B82F6" },
    { name: "Ongoing", value: stats.ongoingEvents, color: "#10B981" },
    { name: "Completed", value: stats.completedEvents, color: "#6B7280" },
  ];

  // Event category distribution
  const categoryData = useMemo(() => {
    const categories = events.reduce((acc, event) => {
      const key = event.category ?? "Uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [events]);

  // Monthly events trend from Supabase section content
  const homeSectionContent = getSectionContent("home");
  const monthlyTrendData =
    (
      (homeSectionContent?.payload as Record<string, any>)?.charts as Record<
        string,
        any
      >
    )?.monthlyTrendData ||
    [
      // default
    ];

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add recent events
    events.slice(0, 3).forEach((event) => {
      activities.push({
        type: "event",
        action: "Event created",
        title: event.title,
        time: "Recently",
        icon: Calendar,
      });
    });

    // Add team updates
    if (team.length > 0) {
      activities.push({
        type: "team",
        action: "Team member added",
        title: team[team.length - 1]?.name,
        time: "Recently",
        icon: Users,
      });
    }

    // Add gallery updates
    if (gallery.length > 0) {
      activities.push({
        type: "gallery",
        action: "Photo uploaded",
        title: gallery[0]?.title || "New photo",
        time: "Recently",
        icon: Image,
      });
    }

    return activities.slice(0, 5);
  }, [events, team, gallery]);

  const COLORS = [
    "#E93370",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-home">
      {/* Header */}
      <div data-testid="dashboard-header">
        <h2
          className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent"
          data-testid="dashboard-title"
        >
          Dashboard Overview
        </h2>
        <p className="text-white/60" data-testid="dashboard-subtitle">
          Welcome back! Here's what's happening with your events.
        </p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          data-testid="total-events-card"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-[#E93370]/30 transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium text-white/80"
                data-testid="total-events-title"
              >
                Total Events
              </CardTitle>
              <div
                className="h-4 w-4 text-[#E93370]"
                data-testid="total-events-icon"
              >
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-white"
                data-testid="total-events-count"
              >
                {stats.totalEvents}
              </div>
              <p
                className="text-xs text-white/60"
                data-testid="total-events-description"
              >
                All-time events created
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          data-testid="team-members-card"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-[#3B82F6]/30 transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium text-white/80"
                data-testid="team-members-title"
              >
                Team Members
              </CardTitle>
              <div
                className="h-4 w-4 text-[#3B82F6]"
                data-testid="team-members-icon"
              >
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-white"
                data-testid="team-members-count"
              >
                {stats.totalTeamMembers}
              </div>
              <p
                className="text-xs text-white/60"
                data-testid="team-members-description"
              >
                Total team members
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          data-testid="gallery-photos-card"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-[#10B981]/30 transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium text-white/80"
                data-testid="gallery-photos-title"
              >
                Gallery Photos
              </CardTitle>
              <div
                className="h-4 w-4 text-[#10B981]"
                data-testid="gallery-photos-icon"
              >
                <Image className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-white"
                data-testid="gallery-photos-count"
              >
                {stats.totalGalleryImages}
              </div>
              <p
                className="text-xs text-white/60"
                data-testid="gallery-photos-description"
              >
                Total gallery photos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          data-testid="partners-card"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-[#8B5CF6]/30 transition-all duration-300 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium text-white/80"
                data-testid="partners-title"
              >
                Partners
              </CardTitle>
              <div
                className="h-4 w-4 text-[#8B5CF6]"
                data-testid="partners-icon"
              >
                <Handshake className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-white"
                data-testid="partners-count"
              >
                {stats.totalPartners}
              </div>
              <p
                className="text-xs text-white/60"
                data-testid="partners-description"
              >
                Total partners
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Status Distribution */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          data-testid="event-status-distribution-chart"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle
                className="text-white"
                data-testid="event-status-distribution-title"
              >
                Event Status Distribution
              </CardTitle>
              <CardDescription
                className="text-white/60"
                data-testid="event-status-distribution-description"
              >
                Current state of all events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={eventStatusData}
                      dataKey="value"
                      fill="#8884d8"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      outerRadius={100}
                    >
                      {eventStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "white",
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
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Event Categories</CardTitle>
              <CardDescription className="text-white/60">
                Distribution by event type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={categoryData}>
                    <XAxis
                      dataKey="name"
                      stroke="#ffffff40"
                      tick={{ fill: "#ffffff80" }}
                    />
                    <YAxis stroke="#ffffff40" tick={{ fill: "#ffffff80" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "white",
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
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Events Trend</CardTitle>
              <CardDescription className="text-white/60">
                Monthly performance overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient
                        id="colorEvents"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#E93370"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#E93370"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="#ffffff40"
                      tick={{ fill: "#ffffff80" }}
                    />
                    <YAxis stroke="#ffffff40" tick={{ fill: "#ffffff80" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Area
                      dataKey="events"
                      fill="url(#colorEvents)"
                      fillOpacity={1}
                      stroke="#E93370"
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-white/60">
                Latest platform updates
              </CardDescription>
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
                        <p className="text-sm text-white/90">
                          {activity.action}
                        </p>
                        <p className="text-sm text-white/60 truncate">
                          {activity.title}
                        </p>
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
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Attendance Overview</CardTitle>
            <CardDescription className="text-white/60">
              Total attendees across all events:{" "}
              {stats.totalAttendees.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">
                  Average Attendance Rate
                </span>
                <span className="text-sm text-[#E93370]">
                  {stats.avgAttendanceRate}%
                </span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <DialogDescription className="sr-only">
                    Team member management dialog
                  </DialogDescription>
                </DialogTrigger>
                <Progress className="h-3" value={stats.avgAttendanceRate} />
              </Dialog>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {events.slice(0, 3).map((event) => {
                  const attendees = event.attendees ?? 0;
                  const capacity = event.capacity ?? 0;
                  const rate = capacity > 0 ? (attendees / capacity) * 100 : 0;
                  return (
                    <div
                      key={event.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <p className="text-sm text-white/90 mb-2 truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60">
                          {attendees}/{capacity || "N/A"}
                        </span>
                        <span className="text-xs text-[#E93370]">
                          {Math.round(rate)}%
                        </span>
                      </div>
                      <Progress className="h-2" value={rate} />
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
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.9 }}
      >
        <Card className="bg-gradient-to-br from-[#E93370]/10 to-transparent backdrop-blur-xl border-[#E93370]/20">
          <CardHeader>
            <CardTitle className="text-white">Site Performance</CardTitle>
            <CardDescription className="text-white/60">
              Key metrics from hero section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl text-[#E93370] mb-2">
                  {hero.stats &&
                  typeof hero.stats === "object" &&
                  !Array.isArray(hero.stats) &&
                  "events" in hero.stats
                    ? String(hero.stats.events)
                    : "0"}
                </div>
                <div className="text-sm text-white/60">Events Hosted</div>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl text-[#E93370] mb-2">
                  {hero.stats &&
                  typeof hero.stats === "object" &&
                  !Array.isArray(hero.stats) &&
                  "members" in hero.stats
                    ? String(hero.stats.members)
                    : "0"}
                </div>
                <div className="text-sm text-white/60">Community Members</div>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl text-[#E93370] mb-2">
                  {hero.stats &&
                  typeof hero.stats === "object" &&
                  !Array.isArray(hero.stats) &&
                  "partners" in hero.stats
                    ? String(hero.stats.partners)
                    : "0"}
                </div>
                <div className="text-sm text-white/60">Brand Partners</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

DashboardHome.displayName = "DashboardHome";
