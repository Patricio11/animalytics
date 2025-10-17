"use client";

import { useState, useMemo } from "react";
import { TaskCard } from "@/components/breeder/tasks/TaskCard";
import { TaskDialog } from "@/components/breeder/tasks/TaskDialog";
import { PuppyFeedingGenerator } from "@/components/breeder/tasks/PuppyFeedingGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Search, Clock, AlertTriangle, CheckCircle, Baby, Loader2, AlertCircle as AlertCircleIcon } from "lucide-react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useCompleteTask } from "@/lib/api/queries/tasks";
import { useAnimals } from "@/lib/api/queries/animals";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Task } from "@/lib/mock-data/tasks";

export default function TasksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | undefined>();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPuppyGenerator, setShowPuppyGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch tasks and animals from API
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError } = useTasks();
  const { data: animalsData } = useAnimals();
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

  const handleSave = async (newTask: any) => {
    try {
      if (dialogMode === 'create') {
        await createTaskMutation.mutateAsync(newTask);
      } else if (editingTask) {
        await updateTaskMutation.mutateAsync({
          id: editingTask.id,
          ...newTask,
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async (taskId: string | { id: string }) => {
    const id = typeof taskId === 'string' ? taskId : taskId.id;
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleToggleComplete = async (taskId: string | { id: string }) => {
    const id = typeof taskId === 'string' ? taskId : taskId.id;
    try {
      await completeTaskMutation.mutateAsync(id);
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

  // Categorize tasks by status
  const categorizedTasks = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    return {
      pending: filteredTasks.filter((t: any) => !t.completedAt && new Date(t.dueDate) > now),
      overdue: filteredTasks.filter((t: any) => !t.completedAt && new Date(t.dueDate) <= now),
      dueSoon: filteredTasks.filter((t: any) => !t.completedAt && new Date(t.dueDate) <= threeDaysFromNow && new Date(t.dueDate) > now),
      completed: filteredTasks.filter((t: any) => t.completedAt),
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
    id: task.id,
    title: task.title || `${task.type} task`,
    description: task.notes || "",
    dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
    priority: task.priority as "high" | "medium" | "low",
    category: task.type,
    animalName: task.animal?.name || "N/A",
    completed: !!task.completedAt,
    type: task.type,
    taskData: task.taskData || {},
    date: task.dueDate,
    notes: task.notes,
  });

  const taskStats = [
    {
      label: "Total Tasks",
      value: tasksData?.length || 0,
      icon: CheckSquare,
      color: "text-foreground"
    },
    {
      label: "Pending",
      value: taskCounts.pending,
      icon: Clock,
      color: "text-chart-4"
    },
    {
      label: "Overdue",
      value: taskCounts.overdue,
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      label: "Completed",
      value: taskCounts.completed,
      icon: CheckCircle,
      color: "text-chart-3"
    }
  ];

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
            <Button
              variant="outline"
              onClick={() => setShowPuppyGenerator(!showPuppyGenerator)}
              className="hover:bg-primary/10 hover:border-primary shadow-card w-full sm:w-auto"
            >
              <Baby className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Puppy Feeding</span>
              <span className="sm:hidden">Puppy Feed</span>
            </Button>
            <Button
              onClick={handleCreateNew}
              className="bg-gradient-brand hover:opacity-90 shadow-card w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {taskStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover-elevate shadow-card bg-surface border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color} p-2 rounded-lg bg-gradient-subtle`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Puppy Feeding Generator */}
        {showPuppyGenerator && (
          <PuppyFeedingGenerator
            litters={[]}
            onGenerateTasks={handleGeneratePuppyTasks}
          />
        )}

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

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-surface shadow-card">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending
              <Badge variant="secondary" className="ml-1 text-xs">
                {categorizedTasks.pending.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm">
              Overdue
              <Badge variant="destructive" className="ml-1 text-xs">
                {categorizedTasks.overdue.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="due-soon" className="text-xs sm:text-sm">
              Due Soon
              <Badge className="ml-1 text-xs bg-chart-4 text-white">
                {categorizedTasks.dueSoon.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              Completed
              <Badge className="ml-1 text-xs bg-chart-3 text-white">
                {categorizedTasks.completed.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {categorizedTasks.pending.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as unknown as Task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {categorizedTasks.pending.length === 0 && (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No pending tasks</h3>
                <p className="text-muted-foreground">Great job! All tasks are completed.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {categorizedTasks.overdue.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as unknown as Task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {categorizedTasks.overdue.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-chart-3 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No overdue tasks</h3>
                <p className="text-muted-foreground">You&apos;re staying on top of your schedule!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="due-soon" className="space-y-4">
            {categorizedTasks.dueSoon.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as unknown as Task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {categorizedTasks.dueSoon.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tasks due soon</h3>
                <p className="text-muted-foreground">You have some breathing room.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {categorizedTasks.completed.map((task: any) => (
              <TaskCard
                key={task.id}
                task={transformTask(task) as unknown as Task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {categorizedTasks.completed.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No completed tasks</h3>
                <p className="text-muted-foreground">Completed tasks will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        existingTask={editingTask}
        mode={dialogMode}
        availableAnimals={availableAnimals}
      />
    </div>
  );
}