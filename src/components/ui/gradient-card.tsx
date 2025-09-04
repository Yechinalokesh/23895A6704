import { cn } from "@/lib/utils";
import { Card } from "./card";

interface GradientCardProps extends React.ComponentProps<typeof Card> {
  variant?: 'default' | 'primary' | 'accent';
  glow?: boolean;
}

export function GradientCard({ 
  className, 
  variant = 'default', 
  glow = false,
  children, 
  ...props 
}: GradientCardProps) {
  return (
    <Card
      className={cn(
        "relative transition-all duration-300",
        {
          'bg-gradient-primary text-primary-foreground shadow-elegant': variant === 'primary',
          'bg-gradient-accent shadow-card': variant === 'accent',
          'bg-card shadow-card hover:shadow-elegant': variant === 'default',
          'hover:shadow-glow': glow
        },
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}