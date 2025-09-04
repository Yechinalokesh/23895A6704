import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GradientCard } from '@/components/ui/gradient-card';
import { urlShortenerService, type UrlSubmission } from '@/services/urlShortener';
import { logger } from '@/services/logger';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, LinkIcon, Timer, Hash } from 'lucide-react';

interface UrlFormData extends UrlSubmission {
  id: string;
}

const UrlShortenerForm: React.FC = () => {
  const { toast } = useToast();
  const [forms, setForms] = useState<UrlFormData[]>([
    {
      id: crypto.randomUUID(),
      originalUrl: '',
      validityMinutes: 30,
      customShortCode: ''
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addForm = () => {
    if (forms.length < 5) {
      const newForm: UrlFormData = {
        id: crypto.randomUUID(),
        originalUrl: '',
        validityMinutes: 30,
        customShortCode: ''
      };
      setForms([...forms, newForm]);
      logger.info(`Added new URL form (${forms.length + 1}/5)`, undefined, 'UrlShortenerForm');
    }
  };

  const removeForm = (id: string) => {
    if (forms.length > 1) {
      setForms(forms.filter(form => form.id !== id));
      logger.info(`Removed URL form (${forms.length - 1} remaining)`, undefined, 'UrlShortenerForm');
    }
  };

  const updateForm = (id: string, field: keyof UrlFormData, value: string | number) => {
    setForms(forms.map(form => 
      form.id === id ? { ...form, [field]: value } : form
    ));
  };

  const validateForm = (form: UrlFormData): string | null => {
    if (!form.originalUrl.trim()) {
      return 'URL is required';
    }

    if (!urlShortenerService.isValidUrl(form.originalUrl)) {
      return 'Invalid URL format';
    }

    if (form.validityMinutes < 1 || form.validityMinutes > 525600) { // Max 1 year
      return 'Validity must be between 1 minute and 1 year';
    }

    if (form.customShortCode && !urlShortenerService.isValidShortCode(form.customShortCode)) {
      return 'Custom shortcode must be 3-20 alphanumeric characters';
    }

    if (form.customShortCode && urlShortenerService.isShortCodeTaken(form.customShortCode)) {
      return `Shortcode "${form.customShortCode}" is already taken`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      logger.info('Starting URL shortening process', { count: forms.length }, 'UrlShortenerForm');

      // Validate all forms
      const validationErrors: string[] = [];
      forms.forEach((form, index) => {
        const error = validateForm(form);
        if (error) {
          validationErrors.push(`Form ${index + 1}: ${error}`);
        }
      });

      if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
          toast({
            title: "Validation Error",
            description: error,
            variant: "destructive"
          });
        });
        logger.warn('Validation failed', { errors: validationErrors }, 'UrlShortenerForm');
        return;
      }

      // Submit valid forms
      const submissions: UrlSubmission[] = forms.map(form => ({
        originalUrl: form.originalUrl,
        validityMinutes: form.validityMinutes,
        customShortCode: form.customShortCode || undefined
      }));

      const result = await urlShortenerService.shortenUrls(submissions);

      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          toast({
            title: "Error",
            description: error,
            variant: "destructive"
          });
        });
      }

      if (result.success.length > 0) {
        toast({
          title: "Success!",
          description: `${result.success.length} URL(s) shortened successfully`,
          variant: "default"
        });

        logger.info('URLs shortened successfully', { 
          count: result.success.length,
          shortCodes: result.success.map(url => url.shortCode)
        }, 'UrlShortenerForm');

        // Reset forms
        setForms([{
          id: crypto.randomUUID(),
          originalUrl: '',
          validityMinutes: 30,
          customShortCode: ''
        }]);
      }

    } catch (error) {
      logger.error('Failed to shorten URLs', { error }, 'UrlShortenerForm');
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientCard className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full text-primary-foreground text-sm font-medium">
            <LinkIcon className="w-4 h-4" />
            URL Shortener
          </div>
          <h2 className="text-2xl font-bold">Shorten Multiple URLs</h2>
          <p className="text-muted-foreground">
            Add up to 5 URLs with custom settings
          </p>
        </div>

        <div className="space-y-4">
          {forms.map((form, index) => (
            <div
              key={form.id}
              className="p-4 border border-border rounded-lg space-y-4 bg-gradient-secondary/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  URL #{index + 1}
                </span>
                {forms.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeForm(form.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor={`url-${form.id}`} className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Original URL
                  </Label>
                  <Input
                    id={`url-${form.id}`}
                    type="url"
                    placeholder="https://example.com"
                    value={form.originalUrl}
                    onChange={(e) => updateForm(form.id, 'originalUrl', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`validity-${form.id}`} className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Validity (minutes)
                    </Label>
                    <Input
                      id={`validity-${form.id}`}
                      type="number"
                      min="1"
                      max="525600"
                      value={form.validityMinutes}
                      onChange={(e) => updateForm(form.id, 'validityMinutes', parseInt(e.target.value) || 30)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`shortcode-${form.id}`} className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Custom Shortcode (optional)
                    </Label>
                    <Input
                      id={`shortcode-${form.id}`}
                      type="text"
                      placeholder="my-link"
                      pattern="[a-zA-Z0-9]{3,20}"
                      value={form.customShortCode}
                      onChange={(e) => updateForm(form.id, 'customShortCode', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {forms.length < 5 && (
            <Button
              type="button"
              variant="outline"
              onClick={addForm}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another URL
            </Button>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-elegant hover:shadow-glow flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Shortening...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Shorten URLs
              </div>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• URLs will be valid for the specified time period</p>
          <p>• Custom shortcodes must be unique and 3-20 characters</p>
          <p>• All data is stored locally in your browser</p>
        </div>
      </form>
    </GradientCard>
  );
};

export default UrlShortenerForm;