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
    <Card className="hover-elevate" data-testid={`card-activity-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${activityColors[type]}`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base" data-testid={`text-activity-title-${id}`}>
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{animalName}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {format(date, 'MMM dd')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}

        {data && Object.keys(data).length > 0 && (
          <div className="mb-3 p-2 bg-muted rounded-md">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="ml-1 text-foreground">{String(value)}</span>
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
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            data-testid={`button-delete-activity-${id}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}