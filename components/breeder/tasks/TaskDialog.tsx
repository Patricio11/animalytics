"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils, Dumbbell, Scissors, Scale, Sparkles, Calendar as CalendarIcon } from "lucide-react";
import { Task, TaskType } from "@/lib/mock-data/tasks";
import { format } from "date-fns";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Omit<Task, 'id' | 'completed'>) => void;
  existingTask?: Task;
  mode?: 'create' | 'edit';
  availableAnimals: { id: string; name: string }[];
}

const taskTypeConfig = {
  feeding: { icon: Utensils, label: 'Feeding', color: 'text-chart-3' },
  exercise: { icon: Dumbbell, label: 'Exercise', color: 'text-chart-4' },
  grooming: { icon: Scissors, label: 'Grooming', color: 'text-chart-2' },
  weight: { icon: Scale, label: 'Weight Check', color: 'text-chart-1' },
  cleaning: { icon: Sparkles, label: 'Cleaning', color: 'text-primary' },
  event: { icon: CalendarIcon, label: 'Event', color: 'text-destructive' },
};

export function TaskDialog({
  open,
  onOpenChange,
  onSave,
  existingTask,
  mode = 'create',
  availableAnimals,
}: TaskDialogProps) {
  const [taskType, setTaskType] = useState<TaskType>('feeding');
  const [animalId, setAnimalId] = useState('');
  const [animalName, setAnimalName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  // Feeding fields
  const [foodType, setFoodType] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'grams' | 'cups'>('grams');
  const [time, setTime] = useState('08:00');

  // Exercise fields
  const [exerciseType, setExerciseType] = useState<'walk' | 'play' | 'training' | 'other'>('walk');
  const [duration, setDuration] = useState('');

  // Grooming fields
  const [groomingType, setGroomingType] = useState<'bath' | 'brush' | 'nails' | 'ears' | 'teeth' | 'full'>('bath');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');

  // Weight fields
  const [weight, setWeight] = useState('');

  // Cleaning fields
  const [area, setArea] = useState<'kennel' | 'whelping-box' | 'yard' | 'shelter' | 'all'>('kennel');
  const [cleaningType, setCleaningType] = useState<'daily' | 'deep-clean' | 'disinfect'>('daily');

  // Event fields
  const [eventType, setEventType] = useState<'vet-visit' | 'worming' | 'heartworm' | 'flea-tick' | 'vaccination' | 'health-check' | 'rugging' | 'pest-management' | 'other'>('vet-visit');
  const [title, setTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [recurring, setRecurring] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingTask && mode === 'edit') {
      setTaskType(existingTask.type);
      setDate(existingTask.date);
      setNotes(existingTask.notes || '');

      if ('animalId' in existingTask) {
        setAnimalId(existingTask.animalId);
        setAnimalName(existingTask.animalName);
      }

      switch (existingTask.type) {
        case 'feeding':
          setFoodType(existingTask.foodType);
          setAmount(existingTask.amount.toString());
          setUnit(existingTask.unit);
          setTime(existingTask.time);
          break;
        case 'exercise':
          setExerciseType(existingTask.exerciseType);
          setDuration(existingTask.duration.toString());
          break;
        case 'grooming':
          setGroomingType(existingTask.groomingType);
          setFrequency(existingTask.frequency);
          break;
        case 'weight':
          setWeight(existingTask.weight?.toString() || '');
          break;
        case 'cleaning':
          setArea(existingTask.area);
          setCleaningType(existingTask.cleaningType);
          setFrequency(existingTask.frequency);
          break;
        case 'event':
          setEventType(existingTask.eventType);
          setTitle(existingTask.title);
          setEventTime(existingTask.time || '');
          setRecurring(existingTask.recurring || false);
          if (existingTask.animalId) {
            setAnimalId(existingTask.animalId);
            setAnimalName(existingTask.animalName || '');
          }
          break;
      }
    }
  }, [existingTask, mode]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        resetForm();
      }, 200);
    }
  }, [open]);

  const resetForm = () => {
    setTaskType('feeding');
    setAnimalId('');
    setAnimalName('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setFoodType('');
    setAmount('');
    setUnit('grams');
    setTime('08:00');
    setExerciseType('walk');
    setDuration('');
    setGroomingType('bath');
    setFrequency('once');
    setWeight('');
    setArea('kennel');
    setCleaningType('daily');
    setEventType('vet-visit');
    setTitle('');
    setEventTime('');
    setRecurring(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) newErrors.date = 'Date is required';

    switch (taskType) {
      case 'feeding':
        if (!animalId) newErrors.animalId = 'Please select an animal';
        if (!foodType) newErrors.foodType = 'Food type is required';
        if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
        if (!time) newErrors.time = 'Time is required';
        break;
      case 'exercise':
        if (!animalId) newErrors.animalId = 'Please select an animal';
        if (!duration || parseInt(duration) <= 0) newErrors.duration = 'Duration must be greater than 0';
        break;
      case 'grooming':
        if (!animalId) newErrors.animalId = 'Please select an animal';
        break;
      case 'weight':
        if (!animalId) newErrors.animalId = 'Please select an animal';
        if (weight && parseFloat(weight) <= 0) newErrors.weight = 'Weight must be greater than 0';
        break;
      case 'cleaning':
        // No animal required for cleaning
        break;
      case 'event':
        if (!title) newErrors.title = 'Event title is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnimalChange = (value: string) => {
    setAnimalId(value);
    const selected = availableAnimals.find(a => a.id === value);
    if (selected) {
      setAnimalName(selected.name);
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    let task: Omit<Task, 'id' | 'completed'>;

    switch (taskType) {
      case 'feeding':
        task = {
          type: 'feeding',
          animalId,
          animalName,
          foodType,
          amount: parseFloat(amount),
          unit,
          time,
          date,
          notes: notes || undefined,
        };
        break;
      case 'exercise':
        task = {
          type: 'exercise',
          animalId,
          animalName,
          exerciseType,
          duration: parseInt(duration),
          date,
          notes: notes || undefined,
        };
        break;
      case 'grooming':
        task = {
          type: 'grooming',
          animalId,
          animalName,
          groomingType,
          frequency,
          date,
          notes: notes || undefined,
        };
        break;
      case 'weight':
        task = {
          type: 'weight',
          animalId,
          animalName,
          weight: weight ? parseFloat(weight) : undefined,
          date,
          notes: notes || undefined,
        };
        break;
      case 'cleaning':
        task = {
          type: 'cleaning',
          area,
          cleaningType,
          frequency,
          date,
          notes: notes || undefined,
        };
        break;
      case 'event':
        task = {
          type: 'event',
          animalId: animalId || undefined,
          animalName: animalName || undefined,
          eventType,
          title,
          time: eventTime || undefined,
          date,
          notes: notes || undefined,
          recurring: recurring || undefined,
        };
        break;
    }

    onSave(task);
    onOpenChange(false);
  };

  const TaskIcon = taskTypeConfig[taskType].icon;
  const needsAnimal = taskType !== 'cleaning' && taskType !== 'event';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TaskIcon className={`w-5 h-5 ${taskTypeConfig[taskType].color}`} />
            {mode === 'edit' ? 'Edit Task' : 'New Task'}
          </DialogTitle>
          <DialogDescription>
            Create or update a task for your animals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Type Selection */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="task-type">
                Task Type <span className="text-destructive">*</span>
              </Label>
              <Select value={taskType} onValueChange={(value: TaskType) => setTaskType(value)}>
                <SelectTrigger id="task-type" className="bg-background border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(taskTypeConfig).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Animal Selection (for most task types) */}
          {(needsAnimal || (taskType === 'event' && animalId)) && (
            <div className="space-y-2">
              <Label htmlFor="animal">
                Animal {needsAnimal && <span className="text-destructive">*</span>}
              </Label>
              <Select value={animalId} onValueChange={handleAnimalChange}>
                <SelectTrigger id="animal" className="bg-background border-primary/20">
                  <SelectValue placeholder="Select animal..." />
                </SelectTrigger>
                <SelectContent>
                  {taskType === 'event' && (
                    <SelectItem value="">None (General event)</SelectItem>
                  )}
                  {availableAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.animalId && <p className="text-sm text-destructive">{errors.animalId}</p>}
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background border-primary/20"
            />
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>

          {/* Task Type Specific Fields */}
          <div className="p-4 rounded-lg bg-surface-secondary border border-primary/10 space-y-4">
            {taskType === 'feeding' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="food-type">
                    Food Type <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="food-type"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    placeholder="e.g., Premium Adult Dog Food"
                    className="bg-background border-primary/20"
                  />
                  {errors.foodType && <p className="text-sm text-destructive">{errors.foodType}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="amount">
                      Amount <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="350"
                      className="bg-background border-primary/20"
                    />
                    {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={unit} onValueChange={(value: 'grams' | 'cups') => setUnit(value)}>
                      <SelectTrigger id="unit" className="bg-background border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grams">Grams</SelectItem>
                        <SelectItem value="cups">Cups</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">
                    Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-background border-primary/20"
                  />
                  {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
                </div>
              </>
            )}

            {taskType === 'exercise' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="exercise-type">Exercise Type</Label>
                  <Select value={exerciseType} onValueChange={(value: any) => setExerciseType(value)}>
                    <SelectTrigger id="exercise-type" className="bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk">Walk</SelectItem>
                      <SelectItem value="play">Play</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration (minutes) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                    className="bg-background border-primary/20"
                  />
                  {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                </div>
              </>
            )}

            {taskType === 'grooming' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="grooming-type">Grooming Type</Label>
                  <Select value={groomingType} onValueChange={(value: any) => setGroomingType(value)}>
                    <SelectTrigger id="grooming-type" className="bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bath">Bath</SelectItem>
                      <SelectItem value="brush">Brush</SelectItem>
                      <SelectItem value="nails">Nail Trim</SelectItem>
                      <SelectItem value="ears">Ear Cleaning</SelectItem>
                      <SelectItem value="teeth">Teeth Cleaning</SelectItem>
                      <SelectItem value="full">Full Grooming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                    <SelectTrigger id="frequency" className="bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {taskType === 'weight' && (
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Leave empty to record later"
                  className="bg-background border-primary/20"
                />
                {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                <p className="text-xs text-muted-foreground">Weight will be recorded when task is completed</p>
              </div>
            )}

            {taskType === 'cleaning' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Select value={area} onValueChange={(value: any) => setArea(value)}>
                    <SelectTrigger id="area" className="bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kennel">Kennel</SelectItem>
                      <SelectItem value="whelping-box">Whelping Box</SelectItem>
                      <SelectItem value="yard">Yard</SelectItem>
                      <SelectItem value="shelter">Shelter</SelectItem>
                      <SelectItem value="all">All Areas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cleaning-type">Cleaning Type</Label>
                  <Select value={cleaningType} onValueChange={(value: any) => setCleaningType(value)}>
                    <SelectTrigger id="cleaning-type" className="bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Clean</SelectItem>
                      <SelectItem value="deep-clean">Deep Clean</SelectItem>
                      <SelectItem value="disinfect">Disinfect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                    <SelectTrigger id="frequency" className="bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {taskType === 'event' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                    <SelectTrigger id="event-type" className="bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vet-visit">Vet Visit</SelectItem>
                      <SelectItem value="worming">Worming</SelectItem>
                      <SelectItem value="heartworm">Heartworm Prevention</SelectItem>
                      <SelectItem value="flea-tick">Flea & Tick Treatment</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="health-check">Health Check</SelectItem>
                      <SelectItem value="rugging">Rugging</SelectItem>
                      <SelectItem value="pest-management">Pest Management</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Event Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Annual Health Check"
                    className="bg-background border-primary/20"
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-time">Time (Optional)</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="bg-background border-primary/20"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-primary/20"
                  />
                  <Label htmlFor="recurring" className="cursor-pointer">
                    Recurring event (monthly)
                  </Label>
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
              className="bg-background border-primary/20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-brand hover:opacity-90 shadow-card"
          >
            {mode === 'edit' ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}