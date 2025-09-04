import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GradientCard } from '@/components/ui/gradient-card';
import { Badge } from '@/components/ui/badge';
import { urlShortenerService, type ShortenedUrl } from '@/services/urlShortener';
import { logger } from '@/services/logger';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  ExternalLink, 
  Clock, 
  MousePointer, 
  Calendar,
  Trash2,
  BarChart3,
  Link2
} from 'lucide-react';
import { format, isAfter } from 'date-fns';

const UrlList: React.FC = () => {
  const { toast } = useToast();
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = () => {
    try {
      const allUrls = urlShortenerService.getAllUrls();
      // Sort by creation date (newest first)
      const sortedUrls = allUrls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setUrls(sortedUrls);
      logger.info(`Loaded ${allUrls.length} URLs`, undefined, 'UrlList');
    } catch (error) {
      logger.error('Failed to load URLs', { error }, 'UrlList');
      toast({
        title: "Error",
        description: "Failed to load URLs",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        variant: "default"
      });
      logger.info('Text copied to clipboard', { text: label }, 'UrlList');
    } catch (error) {
      logger.error('Failed to copy to clipboard', { error }, 'UrlList');
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const openOriginalUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    logger.info('Opened original URL', { url }, 'UrlList');
  };

  const cleanExpired = () => {
    const removedCount = urlShortenerService.cleanExpiredUrls();
    loadUrls();
    
    if (removedCount > 0) {
      toast({
        title: "Cleanup Complete",
        description: `${removedCount} expired URL(s) removed`,
        variant: "default"
      });
      logger.info('Expired URLs cleaned', { removedCount }, 'UrlList');
    } else {
      toast({
        title: "No Cleanup Needed",
        description: "No expired URLs found",
        variant: "default"
      });
    }
  };

  const isExpired = (expiresAt: Date) => {
    return isAfter(new Date(), expiresAt);
  };

  if (urls.length === 0) {
    return (
      <GradientCard variant="accent" className="text-center p-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
            <Link2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No URLs Yet</h3>
          <p className="text-muted-foreground">
            Shortened URLs will appear here with their statistics and management options.
          </p>
        </div>
      </GradientCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Shortened URLs
          </h3>
          <p className="text-sm text-muted-foreground">
            {urls.length} URL(s) • {urls.filter(url => !isExpired(url.expiresAt)).length} active
          </p>
        </div>
        
        <Button
          onClick={cleanExpired}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clean Expired
        </Button>
      </div>

      <div className="grid gap-4">
        {urls.map((url) => {
          const expired = isExpired(url.expiresAt);
          
          return (
            <GradientCard 
              key={url.id} 
              className={`p-4 transition-all duration-300 ${
                expired ? 'opacity-60 border-destructive/20' : 'hover:shadow-elegant'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium truncate">
                        {url.originalUrl}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOriginalUrl(url.originalUrl)}
                        className="flex-shrink-0 p-1 h-auto"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {url.shortUrl}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(url.shortUrl, 'Short URL')}
                        className="p-1 h-auto"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={expired ? "destructive" : "default"}>
                        <Clock className="w-3 h-3 mr-1" />
                        {expired ? 'Expired' : 'Active'}
                      </Badge>
                      
                      <Badge variant="outline">
                        <MousePointer className="w-3 h-3 mr-1" />
                        {url.clicks.length} clicks
                      </Badge>
                      
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created {format(url.createdAt, 'MMM d, yyyy')}
                      </Badge>
                      
                      {url.isCustomCode && (
                        <Badge variant="secondary">
                          Custom Code
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gradient-secondary/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{url.clicks.length}</div>
                    <div className="text-xs text-muted-foreground">Total Clicks</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold">{url.validityMinutes}</div>
                    <div className="text-xs text-muted-foreground">Minutes Valid</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {format(url.expiresAt, 'MMM d')}
                    </div>
                    <div className="text-xs text-muted-foreground">Expires On</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {url.clicks.length > 0 
                        ? format(url.clicks[url.clicks.length - 1].timestamp, 'MMM d')
                        : 'Never'
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Last Click</div>
                  </div>
                </div>

                {url.clicks.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Recent Clicks</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {url.clicks.slice(-3).reverse().map((click) => (
                        <div
                          key={click.id}
                          className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded"
                        >
                          <span>{format(click.timestamp, 'MMM d, h:mm a')}</span>
                          <span className="text-muted-foreground">{click.location}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GradientCard>
          );
        })}
      </div>
    </div>
  );
};

export default UrlList;