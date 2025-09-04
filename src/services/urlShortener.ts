interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  expiresAt: Date;
  validityMinutes: number;
  clicks: ClickData[];
  isCustomCode: boolean;
}

interface ClickData {
  id: string;
  timestamp: Date;
  source: string;
  location: string;
  userAgent?: string;
}

interface UrlSubmission {
  originalUrl: string;
  validityMinutes: number;
  customShortCode?: string;
}

class UrlShortenerService {
  private readonly STORAGE_KEY = 'shortened-urls';
  private readonly BASE_URL = window.location.origin;

  // Generate random shortcode
  private generateShortCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Validate URL format
  public isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate shortcode format (alphanumeric, 3-20 chars)
  public isValidShortCode(code: string): boolean {
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(code);
  }

  // Check if shortcode exists
  public isShortCodeTaken(code: string): boolean {
    const urls = this.getAllUrls();
    return urls.some(url => url.shortCode === code);
  }

  // Get all stored URLs
  public getAllUrls(): ShortenedUrl[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const urls = JSON.parse(stored);
      return urls.map((url: any) => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiresAt: new Date(url.expiresAt),
        clicks: url.clicks.map((click: any) => ({
          ...click,
          timestamp: new Date(click.timestamp)
        }))
      }));
    } catch {
      return [];
    }
  }

  // Save URLs to localStorage
  private saveUrls(urls: ShortenedUrl[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(urls));
  }

  // Shorten multiple URLs
  public async shortenUrls(submissions: UrlSubmission[]): Promise<{ success: ShortenedUrl[], errors: string[] }> {
    const results: ShortenedUrl[] = [];
    const errors: string[] = [];
    const existingUrls = this.getAllUrls();

    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      
      try {
        // Validate URL
        if (!this.isValidUrl(submission.originalUrl)) {
          errors.push(`URL ${i + 1}: Invalid URL format`);
          continue;
        }

        // Validate custom shortcode if provided
        if (submission.customShortCode) {
          if (!this.isValidShortCode(submission.customShortCode)) {
            errors.push(`URL ${i + 1}: Invalid shortcode format (3-20 alphanumeric characters)`);
            continue;
          }
          
          if (this.isShortCodeTaken(submission.customShortCode)) {
            errors.push(`URL ${i + 1}: Shortcode "${submission.customShortCode}" is already taken`);
            continue;
          }
        }

        // Generate or use custom shortcode
        let shortCode = submission.customShortCode;
        if (!shortCode) {
          // Generate unique shortcode
          do {
            shortCode = this.generateShortCode();
          } while (this.isShortCodeTaken(shortCode));
        }

        // Create shortened URL object
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (submission.validityMinutes * 60 * 1000));
        
        const shortenedUrl: ShortenedUrl = {
          id: crypto.randomUUID(),
          originalUrl: submission.originalUrl,
          shortCode: shortCode!,
          shortUrl: `${this.BASE_URL}/s/${shortCode}`,
          createdAt: now,
          expiresAt,
          validityMinutes: submission.validityMinutes,
          clicks: [],
          isCustomCode: !!submission.customShortCode
        };

        results.push(shortenedUrl);
        existingUrls.push(shortenedUrl);
        
      } catch (error) {
        errors.push(`URL ${i + 1}: Unexpected error occurred`);
      }
    }

    // Save all URLs
    this.saveUrls(existingUrls);
    
    return { success: results, errors };
  }

  // Get URL by shortcode
  public getUrlByShortCode(shortCode: string): ShortenedUrl | null {
    const urls = this.getAllUrls();
    return urls.find(url => url.shortCode === shortCode) || null;
  }

  // Record click and redirect
  public recordClick(shortCode: string): { originalUrl: string | null, error?: string } {
    const urls = this.getAllUrls();
    const urlIndex = urls.findIndex(url => url.shortCode === shortCode);
    
    if (urlIndex === -1) {
      return { originalUrl: null, error: 'Short URL not found' };
    }

    const url = urls[urlIndex];
    
    // Check if expired
    if (new Date() > url.expiresAt) {
      return { originalUrl: null, error: 'Short URL has expired' };
    }

    // Record click
    const clickData: ClickData = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      source: document.referrer || 'Direct',
      location: this.getSimulatedLocation(),
      userAgent: navigator.userAgent
    };

    url.clicks.push(clickData);
    this.saveUrls(urls);

    return { originalUrl: url.originalUrl };
  }

  // Simulate location data (since we can't access real geolocation easily)
  private getSimulatedLocation(): string {
    const locations = [
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
      'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
      'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  // Get statistics
  public getStatistics(): {
    totalUrls: number;
    totalClicks: number;
    activeUrls: number;
    expiredUrls: number;
  } {
    const urls = this.getAllUrls();
    const now = new Date();
    
    const activeUrls = urls.filter(url => url.expiresAt > now).length;
    const expiredUrls = urls.length - activeUrls;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0);

    return {
      totalUrls: urls.length,
      totalClicks,
      activeUrls,
      expiredUrls
    };
  }

  // Clean expired URLs
  public cleanExpiredUrls(): number {
    const urls = this.getAllUrls();
    const now = new Date();
    const activeUrls = urls.filter(url => url.expiresAt > now);
    const removedCount = urls.length - activeUrls.length;
    
    if (removedCount > 0) {
      this.saveUrls(activeUrls);
    }
    
    return removedCount;
  }
}

export const urlShortenerService = new UrlShortenerService();
export type { ShortenedUrl, ClickData, UrlSubmission };