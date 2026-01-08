import React from 'react';
import { motion } from 'motion/react';
import { Skeleton } from './ui/skeleton';

interface TeamSkeletonProps {
  count?: number;
  variant?: 'landing' | 'dashboard';
}

/**
 * TeamSkeleton component displays loading placeholders for team members
 * Follows best practices:
 * - Matches exact layout and dimensions of final components
 * - Uses subtle pulsating animation (animate-pulse)
 * - Progressive loading (container → image → text → contact)
 * - Grayscale placeholders that represent actual content structure
 */
export const TeamSkeleton: React.FC<TeamSkeletonProps> = ({
  count = 8,
  variant = 'landing'
}) => {
  const isDashboard = variant === 'dashboard';

  // Generate skeleton cards
  const skeletons = Array.from({ length: count }).map((_, index) => {
    if (isDashboard) {
      // Dashboard variant - EXACT match for DashboardTeam card
      // Card: bg-white/5 border border-white/10 rounded-2xl p-6
      // Avatar: w-24 h-24 rounded-full with border
      // Name: text-xl font-bold
      // Role: text-sm with icon
      // ID: text-[10px] font-mono
      // Bio: text-sm line-clamp-2 h-10
      // Contact: flex gap-3 with icons
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="group relative bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          {/* Action buttons placeholder - top right, hidden until hover */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Skeleton className="h-8 w-8 rounded-lg animate-pulse" />
            <Skeleton className="h-8 w-8 rounded-lg animate-pulse" />
          </div>

          {/* Content container */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar - w-24 h-24 rounded-full with border-2 */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E93370]/20 mb-4 bg-black/50">
              <Skeleton className="w-full h-full rounded-full animate-pulse" />
            </div>

            {/* Name - text-xl font-bold text-white */}
            <Skeleton className="h-6 w-32 mb-2 rounded animate-pulse" />

            {/* Role - flex items-center gap-2 text-sm */}
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4 rounded animate-pulse" />
              <Skeleton className="h-4 w-20 rounded animate-pulse" />
            </div>

            {/* ID - text-[10px] font-mono */}
            <Skeleton className="h-3 w-16 mb-4 rounded animate-pulse" />

            {/* Bio - text-sm line-clamp-2 h-10 */}
            <Skeleton className="h-10 w-full rounded mb-6 animate-pulse" />

            {/* Contact icons - flex gap-3 with border-t */}
            <div className="flex items-center gap-3 w-full justify-center border-t border-white/10 pt-4">
              <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
              <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
      );
    } else {
      // Landing variant - EXACT match for TeamSection card
      // Container: group (no background, just wrapper)
      // Card: relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20
      // Photo: aspect-[3/4] with gradient overlay
      // Content: p-6 space-y-4
      // Name: text-xl font-bold
      // Role: text-sm text-[#E93370]
      // Bio: text-white/60 text-sm leading-relaxed
      // Contact: space-y-2 with links
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="group"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-[#E93370]/50 transition-all duration-300 h-full">
            {/* Photo - aspect-[3/4] with gradient overlay */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <Skeleton className="w-full h-full animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
            </div>

            {/* Bio & Contact - p-6 space-y-4 */}
            <div className="p-6 space-y-4">
              {/* Name + Role */}
              <div>
                <Skeleton className="h-6 w-3/4 mb-1 rounded animate-pulse" />
                <Skeleton className="h-4 w-1/2 rounded animate-pulse" />
              </div>

              {/* Bio - text-sm leading-relaxed */}
              <Skeleton className="h-12 w-full rounded animate-pulse" />

              {/* Contact links - space-y-2 */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded animate-pulse" />
                <Skeleton className="h-4 w-3/4 rounded animate-pulse" />
              </div>
            </div>

            {/* Hover effect placeholder - border-2 opacity-0 */}
            <div className="absolute inset-0 border-2 border-[#E93370] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
          </div>
        </motion.div>
      );
    }
  });

  if (isDashboard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletons}
    </div>
  );
};

TeamSkeleton.displayName = 'TeamSkeleton';
