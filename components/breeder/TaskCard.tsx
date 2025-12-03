import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, AlertTriangle, CheckCircle, Calendar, Eye, Pencil } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'breeding' | 'health' | 'feeding' | 'exercise' | 'grooming' | 'general';
  animalName?: string;
  animal?: any; // Animal object with photo
  completed: boolean;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onView?: () => void;
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
  animal,
  completed,
  onToggleComplete,
  onEdit,
  onView
}: TaskCardProps) {

  const isOverdue = !completed && isBefore(dueDate, new Date());
  const isDueSoon = !completed && isAfter(dueDate, new Date()) && isBefore(dueDate, addDays(new Date(), 3));

  const handleView = () => {
    onView?.();
  };

  const handleEdit = () => {
    onEdit?.();
  };

  return (
    <Card
      className={`group overflow-hidden bg-surface border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        completed ? 'opacity-75 border-primary/20' : 'border-primary/10 hover:border-primary/30'
      } ${isOverdue ? 'border-destructive/40 shadow-destructive/20' : ''}`}
      data-testid={`card-task-${id}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className={`font-semibold text-lg text-foreground transition-colors duration-300 group-hover:text-primary ${completed ? 'line-through' : ''}`} data-testid={`text-task-title-${id}`}>
                {title}
              </h3>
              <div className="flex gap-2 flex-shrink-0">
                <Badge className={`${priorityColors[priority]} shadow-md border border-white/20 transition-all duration-300 group-hover:scale-105`} variant="secondary">
                  {priority}
                </Badge>
                <Badge className={`${categoryColors[category]} shadow-md border border-white/20 transition-all duration-300 group-hover:scale-105`} variant="secondary">
                  {category}
                </Badge>
              </div>
            </div>
            {animalName && animalName !== 'N/A' && (() => {
              // Get profile photo from animal_photos table (category='profile') or fallback
              const profilePhoto = animal?.photos?.find((p: any) => p.category === 'profile');
              const imageUrl = profilePhoto?.fileUrl || 
                               animal?.photos?.[0]?.fileUrl || 
                               animal?.profileImageUrl;
              
              return (
                <div className="flex items-center gap-2 mt-3">
                  <Avatar className="h-8 w-8 border border-primary/30">
                    <AvatarImage 
                      src={imageUrl} 
                      alt={animalName} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {animalName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground font-medium">{animalName}</span>
                </div>
              );
            })()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {description && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {completed ? (
              <div className="flex items-center gap-2 text-chart-3 bg-chart-3/10 px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Completed</span>
              </div>
            ) : isOverdue ? (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Overdue</span>
              </div>
            ) : isDueSoon ? (
              <div className="flex items-center gap-2 text-chart-4 bg-chart-4/10 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Due soon</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Due {format(dueDate, 'MMM dd')}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!completed && onToggleComplete && (
              <Button
                size="sm"
                variant="default"
                onClick={onToggleComplete}
                data-testid={`button-complete-task-${id}`}
                className="bg-chart-3 hover:bg-chart-3/90 text-white transition-all duration-300"
                title="Mark as complete"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleView}
              data-testid={`button-view-task-${id}`}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              data-testid={`button-edit-task-${id}`}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
              title="Edit task"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}