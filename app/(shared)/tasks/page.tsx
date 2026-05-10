"use client";

import { useState, useMemo, useEffect } from "react";
import { TaskCard } from "@/components/breeder/tasks/TaskCard";
import { TaskDialog } from "@/components/breeder/tasks/TaskDialog";
import { TaskViewModal } from "@/components/breeder/tasks/TaskViewModal";
import { PuppyFeedingGenerator } from "@/components/breeder/tasks/PuppyFeedingGenerator";
import { TasksHero } from "@/components/breeder/tasks/TasksHero";
import { TasksEmptyState } from "@/components/breeder/tasks/TasksEmptyState";
import { AnimatedCount } from "@/components/breeder/tasks/AnimatedCount";
import { TasksCalendar } from "@/components/breeder/tasks/TasksCalendar";
import { TasksDaySheet } from "@/components/breeder/tasks/TasksDaySheet";
import { TasksViewToggle, type TasksView } from "@/components/breeder/tasks/TasksViewToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { CheckSquare, Plus, Search, Clock, AlertTriangle, CheckCircle, Baby, Loader2, AlertCircle as AlertCircleIcon, Droplet, Sun } from "lucide-react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useCompleteTask } from "@/lib/api/queries/tasks";
import { useAnimals } from "@/lib/api/queries/animals";
import { useAuth } from "@/lib/auth/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchParams, useRouter } from "next/navigation";
import { fireConfetti, fireBigCelebration } from "@/lib/utils/confetti";
import { isToday, format, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | undefined>();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPuppyGenerator, setShowPuppyGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [view, setView] = useState<TasksView>("calendar");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDaySheet, setShowDaySheet] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewingTask, setViewingTask] = useState<any | undefined>();
  const [showTaskView, setShowTaskView] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch tasks and animals from API
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError } = useTasks();
  const { data: animalsData } = useAnimals();

  // Check for progesterone filter + view from URL
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'progesterone') {
      setActiveTab('progesterone');
      setFilterType('event');
    }
    const v = searchParams.get('view');
    if (v === 'calendar' || v === 'list') setView(v);
  }, [searchParams]);

  // Reflect view changes back into the URL so refresh keeps the chosen mode
  // Calendar is the default, so only `?view=list` is added explicitly.
  const handleViewChange = (next: TasksView) => {
    setView(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'list') params.set('view', 'list');
    else params.delete('view');
    const qs = params.toString();
    router.replace(`/tasks${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  // Drag-to-reschedule handler — uses the existing PATCH route via updateTask
  const handleTaskMoved = async (taskId: string, newDate: Date) => {
    const newDateStr = format(newDate, 'yyyy-MM-dd');
    const isOnWeekend = newDate.getDay() === 0 || newDate.getDay() === 6;

    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: { dueDate: newDateStr },
      });
      toast({
        title: 'Task rescheduled',
        description: `Moved to ${format(newDate, 'EEEE, MMM d')}${isOnWeekend ? ' (weekend)' : ''}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to reschedule',
        description: 'Please try again.',
      });
    }
  };

  // Open the day sheet for a specific calendar cell
  const handleSelectDay = (date: Date) => {
    setSelectedDay(date);
    setShowDaySheet(true);
  };

  // Tasks for the selected day (sheet uses unfiltered list since user clicked a specific date)
  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDay || !tasksData) return [];
    return tasksData.filter((t: any) => t.dueDate && isSameDay(new Date(t.dueDate), selectedDay));
  }, [selectedDay, tasksData]);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();

  // Get available animals for task assignment
  const availableAnimals = animalsData?.map((a: any) => ({ id: a.id, name: a.name })) || [];

  const handleCreateNew = () => {
    setEditingTask(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleView = (task: any) => {
    setViewingTask(task);
    setShowTaskView(true);
  };

  const handleSave = async (newTask: any) => {
    try {
      // Transform task data to match API schema
      const taskData: any = {};
      let title = '';
      
      // Build title and taskData based on task type
      switch (newTask.type) {
        case 'feeding':
          title = `Feeding - ${newTask.foodType}`;
          taskData.foodType = newTask.foodType;
          taskData.amount = newTask.amount;
          taskData.unit = newTask.unit;
          taskData.time = newTask.time;
          break;
        case 'exercise':
          title = `Exercise - ${newTask.exerciseType}`;
          taskData.exerciseType = newTask.exerciseType;
          taskData.duration = newTask.duration;
          break;
        case 'grooming':
          title = `Grooming - ${newTask.groomingType}`;
          taskData.groomingType = newTask.groomingType;
          taskData.frequency = newTask.frequency;
          break;
        case 'weight':
          title = 'Weight Check';
          taskData.weight = newTask.weight;
          taskData.weightUnit = 'kg';
          break;
        case 'cleaning':
          title = `Cleaning - ${newTask.area}`;
          taskData.area = newTask.area;
          taskData.cleaningType = newTask.cleaningType;
          taskData.frequency = newTask.frequency;
          break;
        case 'event':
          title = newTask.title || 'Event';
          taskData.eventType = newTask.eventType;
          taskData.time = newTask.time;
          break;
      }
      
      const apiTask = {
        type: newTask.type,
        title,
        description: newTask.notes,
        dueDate: newTask.date,
        dueTime: newTask.time,
        animalId: newTask.animalId,
        notes: newTask.notes,
        taskData,
        isRecurring: newTask.recurring,
      };
      
      if (dialogMode === 'create') {
        await createTaskMutation.mutateAsync(apiTask);
      } else if (editingTask) {
        await updateTaskMutation.mutateAsync({
          id: editingTask.id,
          data: apiTask,
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = (taskId: string | { id: string }) => {
    const id = typeof taskId === 'string' ? taskId : taskId.id;
    setTaskToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTaskMutation.mutateAsync(taskToDelete);
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string | { id: string }) => {
    const id = typeof taskId === 'string' ? taskId : taskId.id;

    // Was this task incomplete before? (so we only celebrate transitions to "complete")
    const beforeTask = (tasksData || []).find((t: any) => t.id === id);
    const wasIncomplete = beforeTask && !beforeTask.completedAt;

    try {
      await completeTaskMutation.mutateAsync(id);

      if (wasIncomplete) {
        // Was this the last incomplete task for today? Big celebration. Otherwise small burst.
        const remainingToday = categorizedTasks.today.filter((t: any) => t.id !== id).length;
        if (categorizedTasks.today.length > 0 && remainingToday === 0) {
          fireBigCelebration();
        } else {
          fireConfetti();
        }
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleGeneratePuppyTasks = async (newTasks: any[]) => {
    try {
      for (const task of newTasks) {
        await createTaskMutation.mutateAsync(task);
      }
      setShowPuppyGenerator(false);
    } catch (error) {
      console.error('Failed to generate puppy tasks:', error);
    }
  };

  // Filter and categorize tasks
  const filteredTasks = useMemo(() => {
    if (!tasksData) return [];

    return tasksData.filter((task: any) => {
      // Type filter
      const matchesType = filterType === "all" || task.type === filterType;

      // Priority filter
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;

      // Search filter
      const matchesSearch = searchQuery
        ? task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.animal?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchesType && matchesPriority && matchesSearch;
    });
  }, [tasksData, filterType, filterPriority, searchQuery]);

  // Helper to check if task is progesterone test
  const isProgesteroneTask = (task: any) => {
    try {
      const taskData = typeof task.taskData === 'string' 
        ? JSON.parse(task.taskData) 
        : task.taskData;
      return taskData?.eventType === 'progesterone_test';
    } catch {
      return false;
    }
  };

  // Categorize tasks by status
  const categorizedTasks = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Filter progesterone tasks
    const progesteroneTasks = filteredTasks.filter((t: any) => isProgesteroneTask(t));

    // Today = anything due today (incomplete) + anything overdue (still actionable today)
    const todayTasks = filteredTasks.filter((t: any) => {
      if (t.completedAt) return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return isToday(due) || due <= now;
    });

    return {
      today: todayTasks,
      pending: filteredTasks.filter((t: any) => !t.completedAt && new Date(t.dueDate) > now),
      overdue: filteredTasks.filter((t: any) => !t.completedAt && new Date(t.dueDate) <= now),
      dueSoon: filteredTasks.filter((t: any) => !t.completedAt && new Date(t.dueDate) <= threeDaysFromNow && new Date(t.dueDate) > now),
      completed: filteredTasks.filter((t: any) => t.completedAt),
      progesterone: progesteroneTasks.filter((t: any) => !t.completedAt),
    };
  }, [filteredTasks]);

  // Task counts for tabs
  const taskCounts = {
    pending: categorizedTasks.pending.length,
    overdue: categorizedTasks.overdue.length,
    dueSoon: categorizedTasks.dueSoon.length,
    completed: categorizedTasks.completed.length,
  };

  // Transform task for display
  const transformTask = (task: any) => ({
    ...task, // Keep all original task data
    id: task.id,
    title: task.title || `${task.type || 'Task'}`,
    description: task.notes || "",
    dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
    priority: (task.priority || 'medium') as "high" | "medium" | "low",
    category: task.type || 'misc',
    animalId: task.animalId, // Include animalId for edit
    animalName: task.animal?.name || "N/A",
    completed: !!task.completedAt,
    type: task.type || 'misc',
    taskData: task.taskData || {},
    date: task.dueDate,
    notes: task.notes,
    // Flatten common task data properties
    foodType: task.taskData?.foodType,
    amount: task.taskData?.amount,
    unit: task.taskData?.unit,
    time: task.taskData?.time || task.dueTime,
    exerciseType: task.taskData?.exerciseType,
    duration: task.taskData?.duration,
    groomingType: task.taskData?.groomingType,
    frequency: task.recurringPattern,
    weight: task.taskData?.weight,
    weightUnit: task.taskData?.unit,
    area: task.taskData?.area,
    cleaningType: task.taskData?.cleaningType,
    eventType: task.taskData?.eventType,
    recurring: !!task.recurringPattern,
  });

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Manage your breeding program tasks and reminders</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* <Button
              variant="outline"
              onClick={() => setShowPuppyGenerator(!showPuppyGenerator)}
              className="hover:bg-primary/10 hover:border-primary shadow-card w-full sm:w-auto"
            >
              <Baby className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Puppy Feeding</span>
              <span className="sm:hidden">Puppy Feed</span>
            </Button> */}
            <Button
              onClick={handleCreateNew}
              className="bg-gradient-brand hover:opacity-90 shadow-card w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Hero — greeting, streak, weekly chart */}
        <TasksHero
          tasks={tasksData || []}
          userName={user?.name}
          overdueCount={taskCounts.overdue}
        />

        {/* Puppy Feeding Generator */}
        {showPuppyGenerator && (
          <PuppyFeedingGenerator
            onGenerateTasks={handleGeneratePuppyTasks}
          />
        )}

        {/* View toggle — list vs calendar */}
        <div className="flex justify-end">
          <TasksViewToggle value={view} onChange={handleViewChange} />
        </div>

        {/* Filters */}
        <Card className="shadow-card bg-surface border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks by animal or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-primary/20 focus:border-primary"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[160px] bg-background border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="feeding">Feeding</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="grooming">Grooming</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[160px] bg-background border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content — calendar or list */}
        {view === 'calendar' ? (
          <TasksCalendar
            tasks={filteredTasks}
            onSelectDay={handleSelectDay}
            onTaskMoved={handleTaskMoved}
          />
        ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-6 bg-surface shadow-card h-auto p-1 gap-1 justify-start sm:justify-center">
            <TabsTrigger value="today" className="text-xs sm:text-sm whitespace-nowrap shrink-0 sm:shrink">
              <Sun className="w-3 h-3 mr-1" />
              Today
              <Badge className="ml-1 text-xs bg-gradient-brand text-white border-0 min-w-[1.5rem]">
                <AnimatedCount value={categorizedTasks.today.length} />
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm whitespace-nowrap shrink-0 sm:shrink">
              Pending
              <Badge variant="secondary" className="ml-1 text-xs min-w-[1.5rem]">
                <AnimatedCount value={categorizedTasks.pending.length} />
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="progesterone" className="text-xs sm:text-sm whitespace-nowrap shrink-0 sm:shrink">
              <Droplet className="w-3 h-3 mr-1" />
              Tests
              <Badge className="ml-1 text-xs bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 min-w-[1.5rem]">
                <AnimatedCount value={categorizedTasks.progesterone.length} />
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm whitespace-nowrap shrink-0 sm:shrink">
              Overdue
              <Badge variant="destructive" className="ml-1 text-xs min-w-[1.5rem]">
                <AnimatedCount value={categorizedTasks.overdue.length} />
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="due-soon" className="text-xs sm:text-sm whitespace-nowrap shrink-0 sm:shrink">
              Due Soon
              <Badge className="ml-1 text-xs bg-chart-4 text-white min-w-[1.5rem]">
                <AnimatedCount value={categorizedTasks.dueSoon.length} />
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm whitespace-nowrap shrink-0 sm:shrink">
              Completed
              <Badge className="ml-1 text-xs bg-chart-3 text-white min-w-[1.5rem]">
                <AnimatedCount value={categorizedTasks.completed.length} />
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {categorizedTasks.today.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onView={handleView}
              />
            ))}
            {categorizedTasks.today.length === 0 && (
              <TasksEmptyState kind="today" onCreateTask={handleCreateNew} />
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {categorizedTasks.pending.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onView={handleView}
              />
            ))}
            {categorizedTasks.pending.length === 0 && (
              <TasksEmptyState kind="pending" onCreateTask={handleCreateNew} />
            )}
          </TabsContent>

          <TabsContent value="progesterone" className="space-y-4">
            {categorizedTasks.progesterone.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onView={handleView}
              />
            ))}
            {categorizedTasks.progesterone.length === 0 && <TasksEmptyState kind="tests" />}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {categorizedTasks.overdue.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onView={handleView}
              />
            ))}
            {categorizedTasks.overdue.length === 0 && <TasksEmptyState kind="overdue" />}
          </TabsContent>

          <TabsContent value="due-soon" className="space-y-4">
            {categorizedTasks.dueSoon.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onView={handleView}
              />
            ))}
            {categorizedTasks.dueSoon.length === 0 && <TasksEmptyState kind="due-soon" />}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {categorizedTasks.completed.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onView={handleView}
              />
            ))}
            {categorizedTasks.completed.length === 0 && <TasksEmptyState kind="completed" />}
          </TabsContent>
        </Tabs>
        )}
      </div>

      {/* Day detail sheet — opened by clicking a day in calendar view */}
      <TasksDaySheet
        open={showDaySheet}
        onOpenChange={setShowDaySheet}
        date={selectedDay}
        tasks={tasksForSelectedDay}
        transformTask={transformTask}
        onEdit={(task) => {
          setShowDaySheet(false);
          handleEdit(task);
        }}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
        onView={(task) => {
          setShowDaySheet(false);
          handleView(task);
        }}
        onCreateTask={(date) => {
          setShowDaySheet(false);
          // Pre-fill the create dialog with the selected date
          setEditingTask({ dueDate: format(date, 'yyyy-MM-dd') });
          setDialogMode('create');
          setDialogOpen(true);
        }}
      />

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        existingTask={editingTask}
        mode={dialogMode}
        availableAnimals={availableAnimals}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* View Task Modal */}
      <TaskViewModal
        open={showTaskView}
        onOpenChange={setShowTaskView}
        task={viewingTask}
        onEdit={(task) => {
          setShowTaskView(false);
          handleEdit(task);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Task"
        itemName={taskToDelete ? tasksData?.find((t: any) => t.id === taskToDelete)?.title : undefined}
        description="Are you sure you want to delete this task? This action cannot be undone."
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
}