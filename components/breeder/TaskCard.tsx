import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'breeding' | 'health' | 'feeding' | 'exercise' | 'grooming' | 'general';
  animalName?: string;
  completed: boolean;
  onToggleComplete?: () => void;
  onEdit?: () => void;
}

const priorityColors = {
  low: 'bg-chart-3 text-white',
  medium: 'bg-chart-4 text-white',
  high: 'bg-destructive text-destructive-foreground',
};

const categoryColors = {
  breeding: 'bg-primary text-primary-foreground',
  health: 'bg-destructive text-destructive-foreground',
  feeding: 'bg-chart-3 text-white',
  exercise: 'bg-chart-4 text-white',
  grooming: 'bg-chart-2 text-white',
  general: 'bg-muted text-muted-foreground',
};

export function TaskCard({
  id,
  title,
  description,
  dueDate,
  priority,
  category,
  animalName,
  completed,
  onToggleComplete,
  onEdit
}: TaskCardProps) {

  const isOverdue = !completed && isBefore(dueDate, new Date());
  const isDueSoon = !completed && isAfter(dueDate, new Date()) && isBefore(dueDate, addDays(new Date(), 3));

  const handleToggleComplete = (checked: boolean) => {
    console.log(`Task ${checked ? 'completed' : 'uncompleted'}: ${title}`);
    onToggleComplete?.();
  };

  const handleEdit = () => {
    console.log(`Edit task: ${title}`);
    onEdit?.();
  };

  return (
    <Card
      className={`hover-elevate ${completed ? 'opacity-75' : ''} ${isOverdue ? 'border-destructive' : ''}`}
      data-testid={`card-task-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={completed}
            onCheckedChange={handleToggleComplete}
            data-testid={`checkbox-task-${id}`}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium text-foreground ${completed ? 'line-through' : ''}`} data-testid={`text-task-title-${id}`}>
                {title}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
                <Badge className={priorityColors[priority]} variant="secondary">
                  {priority}
                </Badge>
                <Badge className={categoryColors[category]} variant="secondary">
                  {category}
                </Badge>
              </div>
            </div>
            {animalName && (
              <p className="text-sm text-muted-foreground mt-1">{animalName}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {completed ? (
              <div className="flex items-center gap-1 text-chart-3">
                <CheckCircle className="w-3 h-3" />
                <span>Completed</span>
              </div>
            ) : isOverdue ? (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="w-3 h-3" />
                <span>Overdue</span>
              </div>
            ) : isDueSoon ? (
              <div className="flex items-center gap-1 text-chart-4">
                <Clock className="w-3 h-3" />
                <span>Due soon</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Due {format(dueDate, 'MMM dd')}</span>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            data-testid={`button-edit-task-${id}`}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}