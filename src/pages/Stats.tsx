import React from 'react';
import Navigation from '@/components/Navigation';
import StatsDashboard from '@/components/StatsDashboard';

const Stats: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        <StatsDashboard />
      </div>
    </div>
  );
};

export default Stats;