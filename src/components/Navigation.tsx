import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GradientCard } from '@/components/ui/gradient-card';
import { Link2, BarChart3, Home } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Shortener',
      icon: Link2,
      description: 'Create short URLs'
    },
    {
      path: '/stats',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View statistics'
    }
  ];

  return (
    <GradientCard variant="accent" className="p-4 mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">URL Shortener</h1>
            <p className="text-sm text-muted-foreground">Create and manage short links</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={
                  isActive 
                    ? "bg-gradient-primary text-primary-foreground shadow-elegant" 
                    : "hover:bg-primary/10"
                }
              >
                <Link to={item.path} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </GradientCard>
  );
};

export default Navigation;