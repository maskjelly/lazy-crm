import React from 'react';

const SkeletonItem = () => (
  <div className="bg-accent bg-opacity-20 rounded-lg p-4 mb-4">
    <div className="h-5 bg-accent bg-opacity-30 rounded w-3/4 mb-2"></div>
    <div className="space-y-2">
      <div className="h-4 bg-accent bg-opacity-30 rounded w-1/4"></div>
      <div className="h-4 bg-accent bg-opacity-30 rounded w-1/3"></div>
      <div className="h-4 bg-accent bg-opacity-30 rounded w-1/4"></div>
    </div>
  </div>
);

export const ProjectsSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(3)].map((_, index) => (
      <SkeletonItem key={index} />
    ))}
  </div>
);