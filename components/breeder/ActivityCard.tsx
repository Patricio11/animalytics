import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils, Dumbbell, Scissors, Sparkles, Baby, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ActivityCardProps {
  id: string;
  type: 'events' | 'feeding' | 'exercise' | 'grooming' | 'cleaning' | 'puppies';
  animalName: string;
  title: string;
  description?: string;
  date: Date;
  data?: Record<string, string | number | undefined>;
  onEdit?: () => void;
  onDelete?: () => void;
}

const activityIcons = {
  events: Calendar,
  feeding: Utensils,
  exercise: Dumbbell,
  grooming: Scissors,
  cleaning: Sparkles,
  puppies: Baby,
};

const activityColors = {
  events: 'bg-chart-1 text-white',
  feeding: 'bg-chart-3 text-white',
  exercise: 'bg-chart-4 text-white',
  grooming: 'bg-chart-2 text-white',
  cleaning: 'bg-accent text-accent-foreground',
  puppies: 'bg-primary text-primary-foreground',
};

export function ActivityCard({
  id,
  type,
  animalName,
  title,
  description,
  date,
  data,
  onEdit,
  onDelete
}: ActivityCardProps) {
  const IconComponent = activityIcons[type];

  const handleEdit = () => {
    console.log(`Edit activity: ${title}`);
    onEdit?.();
  };

  const handleDelete = () => {
    console.log(`Delete activity: ${title}`);
    onDelete?.();
  };

  return (
    <Card className="group overflow-hidden bg-surface border border-primary/10 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30" data-testid={`card-activity-${id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${activityColors[type]} shadow-md transition-all duration-300 group-hover:scale-105`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300" data-testid={`text-activity-title-${id}`}>
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">{animalName}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shadow-sm border-primary/20 bg-background/95 hover:border-primary/30 transition-all duration-300">
            {format(date, 'MMM dd')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {description && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
        )}

        {data && Object.keys(data).length > 0 && (
          <div className="mb-4 p-3 bg-gradient-subtle/30 rounded-lg border border-primary/10">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-muted-foreground capitalize text-xs font-medium uppercase tracking-wide">{key}</span>
                  <span className="text-foreground font-semibold">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            data-testid={`button-edit-activity-${id}`}
            className="flex-1 shadow-sm hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            <Edit className="w-3 h-3 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            data-testid={`button-delete-activity-${id}`}
            className="hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}