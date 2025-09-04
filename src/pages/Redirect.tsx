import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { urlShortenerService } from '@/services/urlShortener';
import { logger } from '@/services/logger';
import { GradientCard } from '@/components/ui/gradient-card';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  Home,
  Loader2
} from 'lucide-react';

const Redirect: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [redirectState, setRedirectState] = useState<{
    status: 'loading' | 'redirecting' | 'error' | 'expired';
    originalUrl?: string;
    error?: string;
  }>({ status: 'loading' });

  useEffect(() => {
    if (!shortCode) {
      setRedirectState({
        status: 'error',
        error: 'Invalid short URL'
      });
      return;
    }

    logger.info('Redirect attempt started', { shortCode }, 'Redirect');

    // Small delay to show loading state
    const timer = setTimeout(() => {
      const result = urlShortenerService.recordClick(shortCode);
      
      if (result.originalUrl) {
        setRedirectState({
          status: 'redirecting',
          originalUrl: result.originalUrl
        });
        
        logger.info('Redirect successful', { 
          shortCode, 
          originalUrl: result.originalUrl 
        }, 'Redirect');

        // Redirect after a brief moment
        setTimeout(() => {
          window.location.href = result.originalUrl!;
        }, 1500);
      } else {
        const isExpired = result.error?.includes('expired');
        setRedirectState({
          status: isExpired ? 'expired' : 'error',
          error: result.error || 'Unknown error'
        });
        
        logger.warn('Redirect failed', { 
          shortCode, 
          error: result.error 
        }, 'Redirect');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [shortCode]);

  if (redirectState.status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center p-4">
        <GradientCard variant="accent" className="p-8 text-center max-w-md">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Processing Link</h2>
              <p className="text-muted-foreground">
                Verifying and preparing your redirect...
              </p>
            </div>
          </div>
        </GradientCard>
      </div>
    );
  }

  if (redirectState.status === 'redirecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center p-4">
        <GradientCard variant="primary" className="p-8 text-center max-w-md">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-primary-foreground">
                Redirecting...
              </h2>
              <p className="text-primary-foreground/80 mb-4">
                Taking you to your destination
              </p>
              <div className="p-3 bg-primary-foreground/10 rounded-lg">
                <code className="text-sm text-primary-foreground break-all">
                  {redirectState.originalUrl}
                </code>
              </div>
            </div>
          </div>
        </GradientCard>
      </div>
    );
  }

  if (redirectState.status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center p-4">
        <GradientCard className="p-8 text-center max-w-md">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-warning/20 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Link Expired</h2>
              <p className="text-muted-foreground mb-4">
                This shortened URL has expired and is no longer valid.
              </p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <code className="text-sm break-all">/{shortCode}</code>
              </div>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-primary">
                <a href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Create New Short URL
                </a>
              </Button>
            </div>
          </div>
        </GradientCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center p-4">
      <GradientCard className="p-8 text-center max-w-md">
        <div className="space-y-6">
          <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Link Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {redirectState.error || 'The shortened URL you\'re looking for doesn\'t exist.'}
            </p>
            {shortCode && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <code className="text-sm break-all">/{shortCode}</code>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-primary">
              <a href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to URL Shortener
              </a>
            </Button>
          </div>
        </div>
      </GradientCard>
    </div>
  );
};

export default Redirect;