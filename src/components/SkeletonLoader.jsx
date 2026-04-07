import React from 'react';
import { motion } from 'framer-motion';

const shimmerVariants = {
  shimmer: {
    backgroundPosition: ['200% 0%', '-200% 0%'],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'linear'
    }
  }
};

const shimmerStyle = {
  backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%)',
  backgroundSize: '200% 100%'
};

export const CardSkeleton = () => (
  <motion.div
    variants={shimmerVariants}
    animate="shimmer"
    style={shimmerStyle}
    className="bg-surface-container/50 p-6 rounded-[2rem] border border-white/5 space-y-4"
  >
    <div className="h-4 bg-white/5 rounded-lg w-3/4"></div>
    <div className="h-8 bg-white/5 rounded-lg w-1/2"></div>
    <div className="h-2 bg-white/5 rounded-lg w-full mt-4"></div>
  </motion.div>
);

export const StatCardSkeleton = () => (
  <motion.div
    variants={shimmerVariants}
    animate="shimmer"
    style={shimmerStyle}
    className="bg-surface-container p-8 rounded-[2rem] border border-white/5 space-y-6"
  >
    <div className="h-3 bg-white/5 rounded w-1/3"></div>
    <div className="h-16 bg-white/5 rounded-xl w-1/2"></div>
  </motion.div>
);

export const MaterialItemSkeleton = () => (
  <motion.div
    variants={shimmerVariants}
    animate="shimmer"
    style={shimmerStyle}
    className="p-4 bg-surface-container/50 rounded-2xl border border-white/5 space-y-3"
  >
    <div className="flex gap-3">
      <div className="w-10 h-10 bg-white/5 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-3/4"></div>
        <div className="h-2 bg-white/5 rounded w-1/2"></div>
      </div>
    </div>
  </motion.div>
);

export const ProfileSkeleton = () => (
  <motion.div
    variants={shimmerVariants}
    animate="shimmer"
    style={shimmerStyle}
    className="space-y-6"
  >
    {/* Avatar and header */}
    <div className="flex gap-6 bg-surface-container/50 p-8 rounded-[2rem] border border-white/5">
      <div className="w-32 h-32 bg-white/5 rounded-2xl flex-shrink-0"></div>
      <div className="flex-1 space-y-3">
        <div className="h-8 bg-white/5 rounded w-1/2"></div>
        <div className="h-4 bg-white/5 rounded w-2/3"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-white/5 rounded-lg w-24"></div>
          <div className="h-6 bg-white/5 rounded-lg w-24"></div>
        </div>
      </div>
    </div>
    
    {/* Form fields */}
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-12 bg-white/5 rounded-xl"></div>
      ))}
    </div>
  </motion.div>
);

export const ChartSkeleton = () => (
  <motion.div
    variants={shimmerVariants}
    animate="shimmer"
    style={shimmerStyle}
    className="bg-surface-container p-6 rounded-[2rem] border border-white/5 space-y-4"
  >
    <div className="h-4 bg-white/5 rounded w-1/3"></div>
    <div className="h-64 bg-white/5 rounded-xl"></div>
    <div className="flex gap-4 justify-center">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-3 bg-white/5 rounded-full w-12"></div>
      ))}
    </div>
  </motion.div>
);

export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <MaterialItemSkeleton key={i} />
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-8 p-8 md:p-10">
    {/* Header */}
    <motion.div
      variants={shimmerVariants}
      animate="shimmer"
      style={shimmerStyle}
      className="h-10 bg-white/5 rounded-lg w-1/2 mb-4"
    ></motion.div>
    
    {/* Content grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <CardSkeleton key={i} />
      ))}
    </div>
    
    {/* Section */}
    <div className="space-y-4">
      <motion.div
        variants={shimmerVariants}
        animate="shimmer"
        style={shimmerStyle}
        className="h-6 bg-white/5 rounded-lg w-1/4"
      ></motion.div>
      <ListSkeleton count={3} />
    </div>
  </div>
);

export const InputSkeleton = ({ width = "w-full" }) => (
  <motion.div
    variants={shimmerVariants}
    animate="shimmer"
    style={shimmerStyle}
    className={`h-12 bg-white/5 rounded-xl ${width}`}
  ></motion.div>
);
