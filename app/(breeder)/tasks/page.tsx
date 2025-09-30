"use client";

import { useState } from "react";
import { TaskCard } from "@/components/breeder/tasks/TaskCard";
import { TaskDialog } from "@/components/breeder/tasks/TaskDialog";
import { PuppyFeedingGenerator } from "@/components/breeder/tasks/PuppyFeedingGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Search, Clock, AlertTriangle, CheckCircle, Baby } from "lucide-react";
import { Task, TaskType, mockTasks as initialMockTasks, getTaskStatus } from "@/lib/mock-data/tasks";
import { mockAnimals } from "@/data/mockData";
import { mockAnimalProfileDetails } from "@/lib/mock-data/animal-profile-details";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialMockTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPuppyGenerator, setShowPuppyGenerator] = useState(false);

  // Get available animals for task assignment
  const availableAnimals = mockAnimals.map(a => ({ id: a.id, name: a.name }));

  // Get all litters for puppy feeding generator
  const allLitters = Object.values(mockAnimalProfileDetails)
    .flatMap(details => details.litters || []);

  const handleCreateNew = () => {
    setEditingTask(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (newTask: Omit<Task, 'id' | 'completed'>) => {
    if (dialogMode === 'create') {
      const task: Task = {
        ...newTask,
        id: `task-${Date.now()}`,
        completed: false,
      };
      setTasks([...tasks, task]);
    } else if (editingTask) {
      setTasks(
        tasks.map((t) =>
          t.id === editingTask.id ? { ...newTask, id: t.id, completed: t.completed } : t
        )
      );
    }
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleGeneratePuppyTasks = (newTasks: Omit<Task, 'id' | 'completed'>[]) => {
    const tasksWithIds: Task[] = newTasks.map((task, index) => ({
      ...task,
      id: `puppy-task-${Date.now()}-${index}`,
      completed: false,
    }));
    setTasks([...tasks, ...tasksWithIds]);
    setShowPuppyGenerator(false);
  };

  // Filter tasks
  const getFilteredTasks = (taskList: Task[]) => {
    return taskList.filter(task => {
      // Type filter
      const matchesType = filterType === "all" || task.type === filterType;

      // Priority filter
      const priority = task.completed ? 'low' :
        getTaskStatus(task) === 'overdue' ? 'high' :
        'medium';
      const matchesPriority = filterPriority === "all" || priority === filterPriority;

      // Search query
      const matchesSearch = searchQuery === "" ||
        ('animalName' in task && task.animalName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.type === 'event' && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesPriority && matchesSearch;
    });
  };

  // Categorize tasks
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const overdueTasks = pendingTasks.filter(task => getTaskStatus(task) === 'overdue');
  const dueSoonTasks = pendingTasks.filter(task => {
    const taskDate = new Date(task.date);
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    return taskDate >= today && taskDate <= threeDaysLater && getTaskStatus(task) !== 'overdue';
  });

  const taskStats = [
    {
      label: "Total Tasks",
      value: tasks.length,
      icon: CheckSquare,
      color: "text-foreground"
    },
    {
      label: "Pending",
      value: pendingTasks.length,
      icon: Clock,
      color: "text-chart-4"
    },
    {
      label: "Overdue",
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      label: "Completed",
      value: completedTasks.length,
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPuppyGenerator(!showPuppyGenerator)}
              className="hover:bg-primary/10 hover:border-primary shadow-card"
            >
              <Baby className="w-4 h-4 mr-2" />
              Puppy Feeding
            </Button>
            <Button
              onClick={handleCreateNew}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
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
            litters={allLitters}
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
                {getFilteredTasks(pendingTasks).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm">
              Overdue
              <Badge variant="destructive" className="ml-1 text-xs">
                {getFilteredTasks(overdueTasks).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="due-soon" className="text-xs sm:text-sm">
              Due Soon
              <Badge className="ml-1 text-xs bg-chart-4 text-white">
                {getFilteredTasks(dueSoonTasks).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              Completed
              <Badge className="ml-1 text-xs bg-chart-3 text-white">
                {getFilteredTasks(completedTasks).length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {getFilteredTasks(pendingTasks).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {getFilteredTasks(pendingTasks).length === 0 && (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No pending tasks</h3>
                <p className="text-muted-foreground">Great job! All tasks are completed.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {getFilteredTasks(overdueTasks).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {getFilteredTasks(overdueTasks).length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-chart-3 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No overdue tasks</h3>
                <p className="text-muted-foreground">You're staying on top of your schedule!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="due-soon" className="space-y-4">
            {getFilteredTasks(dueSoonTasks).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {getFilteredTasks(dueSoonTasks).length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tasks due soon</h3>
                <p className="text-muted-foreground">You have some breathing room.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {getFilteredTasks(completedTasks).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
            {getFilteredTasks(completedTasks).length === 0 && (
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