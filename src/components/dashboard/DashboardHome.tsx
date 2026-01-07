import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Users,
  Image as ImageIcon,
  Handshake,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

// --- Sub-Components ---

const StatBlock = ({ label, value, subValue, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    <div className="p-6 relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors ${color.replace('from-', 'text-').split(' ')[0]}`}>
          <Icon size={24} />
        </div>
        {subValue && (
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-emerald-400">
            <TrendingUp size={12} />
            {subValue}
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
      <p className="text-white/40 text-sm font-medium uppercase tracking-wider">{label}</p>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: delay + 0.3, duration: 1 }}
        className={`h-full bg-gradient-to-r ${color}`}
      />
    </div>
  </motion.div>
);

const ActivityItem = ({ icon: Icon, title, time, type }: any) => (
  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform ${
      type === 'event' ? 'text-blue-400' : type === 'team' ? 'text-purple-400' : 'text-pink-400'
    }`}>
      <Icon size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{title}</h4>
      <p className="text-xs text-white/40 flex items-center gap-2">
        <Clock size={10} />
        {time}
      </p>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowUpRight size={16} className="text-white/40" />
    </div>
  </div>
);

// --- Main Component ---

export const DashboardHome = React.memo(() => {
  const { events, team, gallery, partners } = useContent();

  // Calculate statistics
  const stats = useMemo(() => {
    const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
    const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);
    const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
    const avgAttendanceRate = totalCapacity > 0 ? (totalAttendees / totalCapacity) * 100 : 0;

    return {
      totalEvents: events.length,
      upcomingEvents,
      totalTeamMembers: team.length,
      totalGalleryImages: gallery.length,
      totalPartners: partners.length,
      totalAttendees,
      avgAttendanceRate: Math.round(avgAttendanceRate),
    };
  }, [events, team, gallery, partners]);

  // Mock data for charts
  const activityData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 550 },
    { name: 'Thu', value: 450 },
    { name: 'Fri', value: 650 },
    { name: 'Sat', value: 800 },
    { name: 'Sun', value: 700 },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2"
          >
            SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E93370] to-purple-500">OVERVIEW</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 font-mono text-sm"
          >
            :: REAL-TIME MONITORING ACTIVE ::
          </motion.p>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-[#E93370] hover:bg-[#D61E5C] text-white rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_-5px_#E93370] transition-all flex items-center gap-2"
        >
          <Zap size={18} fill="currentColor" />
          QUICK ACTION
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBlock
          label="Total Events"
          value={stats.totalEvents}
          subValue={`+${stats.upcomingEvents} Upcoming`}
          icon={Calendar}
          color="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <StatBlock
          label="Total Attendees"
          value={stats.totalAttendees.toLocaleString()}
          subValue={`${stats.avgAttendanceRate}% Cap.`}
          icon={Users}
          color="from-[#E93370] to-purple-500"
          delay={0.2}
        />
        <StatBlock
          label="Media Assets"
          value={stats.totalGalleryImages}
          icon={ImageIcon}
          color="from-amber-400 to-orange-500"
          delay={0.3}
        />
        <StatBlock
          label="Active Partners"
          value={stats.totalPartners}
          icon={Handshake}
          color="from-emerald-400 to-green-500"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden isolate"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Activity size={120} />
          </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Engagement Metrics</h2>
              <p className="text-white/40 text-sm">Weekly attendee engagement overview</p>
            </div>
            <div className="flex gap-2">
               {['D', 'W', 'M', 'Y'].map((period, i) => (
                  <button 
                     key={period} 
                     className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${i === 1 ? 'bg-[#E93370] text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                     {period}
                  </button>
               ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E93370" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E93370" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#E93370" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" />
              Live Feed
            </h2>
            <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {events.slice(0, 3).map((event, i) => (
              <ActivityItem
                key={`event-${i}`}
                icon={Calendar}
                title={`New Event: ${event.title}`}
                time="2 hours ago"
                type="event"
              />
            ))}
            {team.length > 0 && (
               <ActivityItem
                  icon={Users}
                  title={`Welcome ${team[team.length - 1].name}`}
                  time="5 hours ago"
                  type="team"
               />
            )}
            <ActivityItem
               icon={ImageIcon}
               title="Gallery updated with 12 new photos"
               time="1 day ago"
               type="gallery"
            />
             <ActivityItem
               icon={Handshake}
               title="New partnership inquiry"
               time="2 days ago"
               type="partner"
            />
          </div>
          
          <button className="w-full mt-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-sm font-medium transition-colors">
            View All Activity
          </button>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Server Status: Online', 'Database: Healthy', 'API Latency: 24ms', 'Last Backup: 1h ago'].map((status, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.8 + (i * 0.1) }}
               className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs font-mono text-white/40 flex items-center justify-center gap-2"
             >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {status}
             </motion.div>
          ))}
      </div>
    </div>
  );
});

DashboardHome.displayName = 'DashboardHome';
