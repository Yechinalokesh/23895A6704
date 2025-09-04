import React, { useState, useEffect } from 'react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { urlShortenerService, type ShortenedUrl } from '@/services/urlShortener';
import { logger } from '@/services/logger';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  MousePointer, 
  Globe, 
  Calendar,
  RefreshCw,
  Activity
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

const StatsDashboard: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
    expiredUrls: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const allUrls = urlShortenerService.getAllUrls();
      setUrls(allUrls);
      
      const statistics = urlShortenerService.getStatistics();
      setStats(statistics);
      
      logger.info('Statistics dashboard loaded', statistics, 'StatsDashboard');
    } catch (error) {
      logger.error('Failed to load statistics', { error }, 'StatsDashboard');
    }
  };

  const getRecentClicks = () => {
    const sevenDaysAgo = subDays(new Date(), 7);
    return urls.flatMap(url => 
      url.clicks.filter(click => isAfter(click.timestamp, sevenDaysAgo))
    ).length;
  };

  const getMostClickedUrls = () => {
    return urls
      .filter(url => url.clicks.length > 0)
      .sort((a, b) => b.clicks.length - a.clicks.length)
      .slice(0, 5);
  };

  const getTopLocations = () => {
    const locationCount: { [key: string]: number } = {};
    
    urls.forEach(url => {
      url.clicks.forEach(click => {
        locationCount[click.location] = (locationCount[click.location] || 0) + 1;
      });
    });

    return Object.entries(locationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getClicksLast7Days = () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date,
        clicks: 0
      };
    });

    urls.forEach(url => {
      url.clicks.forEach(click => {
        const clickDate = new Date(click.timestamp);
        const dayIndex = days.findIndex(day => 
          format(day.date, 'yyyy-MM-dd') === format(clickDate, 'yyyy-MM-dd')
        );
        if (dayIndex !== -1) {
          days[dayIndex].clicks++;
        }
      });
    });

    return days;
  };

  const mostClickedUrls = getMostClickedUrls();
  const topLocations = getTopLocations();
  const weeklyClicks = getClicksLast7Days();
  const recentClicksCount = getRecentClicks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Comprehensive statistics for your shortened URLs
          </p>
        </div>
        
        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientCard variant="primary" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-foreground/20 rounded-full">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Total URLs</p>
              <p className="text-2xl font-bold text-primary-foreground">{stats.totalUrls}</p>
            </div>
          </div>
        </GradientCard>

        <GradientCard variant="accent" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <MousePointer className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Clicks</p>
              <p className="text-2xl font-bold">{stats.totalClicks}</p>
            </div>
          </div>
        </GradientCard>

        <GradientCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/20 rounded-full">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Active URLs</p>
              <p className="text-2xl font-bold text-success">{stats.activeUrls}</p>
            </div>
          </div>
        </GradientCard>

        <GradientCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/20 rounded-full">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Expired URLs</p>
              <p className="text-2xl font-bold text-warning">{stats.expiredUrls}</p>
            </div>
          </div>
        </GradientCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <GradientCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Last 7 Days Activity</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total clicks this week</span>
                <Badge variant="outline">{recentClicksCount}</Badge>
              </div>
              
              <div className="space-y-2">
                {weeklyClicks.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-12">
                      {format(day.date, 'MMM d')}
                    </span>
                    <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-primary h-full transition-all duration-300"
                        style={{ 
                          width: `${recentClicksCount > 0 ? (day.clicks / recentClicksCount) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8">{day.clicks}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Top Locations */}
        <GradientCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Top Locations</h3>
            </div>
            
            {topLocations.length > 0 ? (
              <div className="space-y-3">
                {topLocations.map(([location, count], index) => (
                  <div key={location} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <span className="flex-1 text-sm">{location}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No click data available</p>
              </div>
            )}
          </div>
        </GradientCard>
      </div>

      {/* Most Clicked URLs */}
      <GradientCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Top Performing URLs</h3>
          </div>
          
          {mostClickedUrls.length > 0 ? (
            <div className="space-y-3">
              {mostClickedUrls.map((url, index) => (
                <div 
                  key={url.id} 
                  className="flex items-center gap-4 p-3 bg-gradient-secondary/30 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{url.originalUrl}</p>
                    <p className="text-xs text-muted-foreground">
                      <code>{url.shortCode}</code> • Created {format(url.createdAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">{url.clicks.length}</div>
                    <div className="text-xs text-muted-foreground">clicks</div>
                  </div>
                  
                  {url.clicks.length > 0 && (
                    <div className="text-right">
                      <div className="text-sm">
                        {format(url.clicks[url.clicks.length - 1].timestamp, 'MMM d')}
                      </div>
                      <div className="text-xs text-muted-foreground">last click</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No URLs with clicks yet</p>
            </div>
          )}
        </div>
      </GradientCard>
    </div>
  );
};

export default StatsDashboard;