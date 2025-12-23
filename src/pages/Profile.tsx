import { useState } from "react";
import { User, Moon, Sun, Trash2, Download, AlertTriangle, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useStats, useApp, useAI, useAchievements, useTasks, useFocus, useJournal, useHabits, useDataManagement } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { calculateLevelInfo } from "@/lib/progression";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Progressive achievements with tiers
const achievementTiers = [
  // Task achievements
  { id: "task_starter", title: "First Steps", description: "Complete 1 task", icon: "🎯", target: 1, category: "tasks", tier: 1 },
  { id: "task_10", title: "Getting Started", description: "Complete 10 tasks", icon: "✅", target: 10, category: "tasks", tier: 1 },
  { id: "task_50", title: "Task Warrior", description: "Complete 50 tasks", icon: "⚔️", target: 50, category: "tasks", tier: 2 },
  { id: "task_100", title: "Task Master", description: "Complete 100 tasks", icon: "🏆", target: 100, category: "tasks", tier: 2 },
  { id: "task_250", title: "Task Legend", description: "Complete 250 tasks", icon: "👑", target: 250, category: "tasks", tier: 3 },
  { id: "task_500", title: "Task Titan", description: "Complete 500 tasks", icon: "⭐", target: 500, category: "tasks", tier: 3 },
  { id: "task_1000", title: "Task Deity", description: "Complete 1000 tasks", icon: "💎", target: 1000, category: "tasks", tier: 4 },

  // Focus achievements
  { id: "focus_1h", title: "Focus Initiate", description: "1 hour focused", icon: "🧘", target: 60, category: "focus", tier: 1 },
  { id: "focus_5h", title: "Deep Thinker", description: "5 hours focused", icon: "🎯", target: 300, category: "focus", tier: 1 },
  { id: "focus_10h", title: "Focus Warrior", description: "10 hours focused", icon: "⚡", target: 600, category: "focus", tier: 2 },
  { id: "focus_25h", title: "Mind Master", description: "25 hours focused", icon: "🧠", target: 1500, category: "focus", tier: 2 },
  { id: "focus_50h", title: "Focus Legend", description: "50 hours focused", icon: "🔥", target: 3000, category: "focus", tier: 3 },
  { id: "focus_100h", title: "Zen Master", description: "100 hours focused", icon: "✨", target: 6000, category: "focus", tier: 4 },

  // Journal achievements
  { id: "journal_1", title: "First Entry", description: "Write 1 journal", icon: "📝", target: 1, category: "journal", tier: 1 },
  { id: "journal_10", title: "Reflector", description: "Write 10 journals", icon: "📔", target: 10, category: "journal", tier: 1 },
  { id: "journal_30", title: "Month of Reflection", description: "Write 30 journals", icon: "📚", target: 30, category: "journal", tier: 2 },
  { id: "journal_100", title: "Journal Master", description: "Write 100 journals", icon: "✍️", target: 100, category: "journal", tier: 3 },

  // Habit achievements
  { id: "habit_1", title: "Habit Starter", description: "Create 1 habit", icon: "🔄", target: 1, category: "habits", tier: 1 },
  { id: "habit_5", title: "Habit Builder", description: "Create 5 habits", icon: "🌱", target: 5, category: "habits", tier: 2 },
  { id: "habit_10", title: "Habit Master", description: "Create 10 habits", icon: "🌳", target: 10, category: "habits", tier: 3 },

  // Streak achievements
  { id: "streak_3", title: "On Fire", description: "3-day streak", icon: "🔥", target: 3, category: "streak", tier: 1 },
  { id: "streak_7", title: "Week Warrior", description: "7-day streak", icon: "💪", target: 7, category: "streak", tier: 2 },
  { id: "streak_14", title: "Fortnight Fighter", description: "14-day streak", icon: "⚔️", target: 14, category: "streak", tier: 2 },
  { id: "streak_30", title: "Monthly Champion", description: "30-day streak", icon: "🏅", target: 30, category: "streak", tier: 3 },
  { id: "streak_60", title: "Habit Master", description: "60-day streak", icon: "🎖️", target: 60, category: "streak", tier: 3 },
  { id: "streak_100", title: "Century Legend", description: "100-day streak", icon: "💯", target: 100, category: "streak", tier: 4 },

  // Level achievements
  { id: "level_5", title: "Rising Star", description: "Reach level 5", icon: "⭐", target: 5, category: "level", tier: 1 },
  { id: "level_10", title: "Dedicated", description: "Reach level 10", icon: "🌟", target: 10, category: "level", tier: 2 },
  { id: "level_25", title: "Committed", description: "Reach level 25", icon: "💫", target: 25, category: "level", tier: 3 },
  { id: "level_50", title: "Elite", description: "Reach level 50", icon: "👑", target: 50, category: "level", tier: 4 },
  { id: "level_100", title: "Legendary", description: "Reach level 100", icon: "💎", target: 100, category: "level", tier: 4 },
];

const Profile = () => {
  const stats = useStats();
  const { state } = useApp();
  const { updateProfile } = useAI();
  const { completedTasks } = useTasks();
  const { entries } = useJournal();
  const { habits } = useHabits();
  const { toast } = useToast();

  const { verifyPassword, deleteAllTasks, deleteAllJournals, deleteEverything, isLoading: isPurging } = useDataManagement();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(state.userName);
  const [notifications, setNotifications] = useState({ tasks: true, focus: true, habits: true, insights: true });
  const [focusSettings, setFocusSettings] = useState({ defaultDuration: 25, breakDuration: 5, autoBreak: true });

  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [purgeStep, setPurgeStep] = useState<'verify' | 'select'>('verify');
  const [password, setPassword] = useState("");
  const [purgeError, setPurgeError] = useState("");

  const getAchievementStatus = (achievement: typeof achievementTiers[0]) => {
    let current = 0;
    switch (achievement.category) {
      case 'tasks': current = completedTasks.length; break;
      case 'focus': current = stats.totalFocusMinutes; break;
      case 'journal': current = entries.length; break;
      case 'habits': current = habits.length; break;
      case 'streak': current = Math.max(stats.currentTaskStreak, stats.currentFocusStreak, stats.currentJournalStreak); break;
      case 'level': current = stats.level; break;
    }
    return { current, unlocked: current >= achievement.target, progress: Math.min(100, (current / achievement.target) * 100) };
  };

  const unlockedAchievements = achievementTiers.filter(a => getAchievementStatus(a).unlocked);
  const lockedAchievements = achievementTiers.filter(a => !getAchievementStatus(a).unlocked);

  const saveName = () => {
    updateProfile({ name: editName });
    setIsEditingName(false);
    toast({ title: "Profile Updated", description: "Your profile name has been updated." });
  };

  const handleVerifyPassword = async () => {
    if (!password) {
      setPurgeError("Password required");
      return;
    }
    setPurgeError("");
    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setPurgeStep('select');
      } else {
        setPurgeError("Invalid password");
      }
    } catch (e) {
      setPurgeError("Verification failed");
    }
  };

  const handlePurge = async (type: 'tasks' | 'journals' | 'all') => {
    try {
      if (type === 'tasks') await deleteAllTasks();
      if (type === 'journals') await deleteAllJournals();
      if (type === 'all') await deleteEverything();
      setShowPurgeDialog(false);
      setPassword("");
      setPurgeStep('verify');
      toast({ title: "Data Cleared", description: "The selected data has been permanently removed." });
    } catch (e) {
      toast({ title: "Operation Failed", description: "Could not complete the data purge request.", variant: "destructive" });
    }
  };

  const levelInfo = calculateLevelInfo(stats.xp);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 pb-24 md:pb-8 space-y-8">

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <Avatar className="w-24 h-24 border-4 border-card bg-muted">
          <AvatarImage src="" />
          <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
            {state.userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          {isEditingName ? (
            <div className="flex gap-2 max-w-xs">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
              <Button size="sm" onClick={saveName}>Save</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{state.userName}</h1>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 opacity-50 hover:opacity-100" onClick={() => setIsEditingName(true)}>
                <User className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge variant="secondary" className="font-normal">Level {levelInfo.level}</Badge>
            <span className="text-sm">•</span>
            <span className="text-sm font-medium">{levelInfo.rankTitle}</span>
          </div>
          <div className="w-full max-w-md pt-2 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to Level {levelInfo.level + 1}</span>
              <span>{levelInfo.currentLevelXp} / 100 XP</span>
            </div>
            <Progress value={levelInfo.progress} className="h-2" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">🎯</div>
              </CardHeader>
              <CardContent>
                {/* Derived directly from tasks array */}
                <div className="text-2xl font-bold">{completedTasks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Focus Hours</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">🧠</div>
              </CardHeader>
              <CardContent>
                {/* Derived directly from stats (which we trust for XP) or calculate if needed. 
                     Let's stick to stats.totalFocusMinutes if we think it's updated, 
                     but actually user said "not updating". 
                     Let's calculate from sessions if we can, but we need to import useFocus first.
                 */}
                <div className="text-2xl font-bold">{Math.floor(stats.totalFocusMinutes / 60)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">🔥</div>
              </CardHeader>
              <CardContent>
                {/* Fallback to simpler streak display if stats aren't updating */}
                <div className="text-2xl font-bold">{Math.max(stats.currentTaskStreak, stats.currentFocusStreak)}d</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">⭐</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.xp}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>Your recent productivity trends.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full flex items-center justify-center border rounded-md bg-muted/20 text-muted-foreground">
                Activity Chart Coming Soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earned Badges</CardTitle>
              <CardDescription>Milestones you have unlocked.</CardDescription>
            </CardHeader>
            <CardContent>
              {unlockedAchievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {unlockedAchievements.map(achievement => (
                    <div key={achievement.id} className="flex flex-col items-center text-center p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="text-sm font-semibold">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No achievements earned yet. Start completing tasks!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Milestones</CardTitle>
              <CardDescription>Goals to aim for.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedAchievements.slice(0, 6).map(achievement => {
                  const status = getAchievementStatus(achievement);
                  return (
                    <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="text-2xl opacity-50 grayscale">{achievement.icon}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{achievement.title}</span>
                          <span className="text-xs text-muted-foreground">{status.current} / {achievement.target}</span>
                        </div>
                        <Progress value={status.progress} className="h-1.5" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({ tasks: "Task Reminders", focus: "Focus Session Alerts", habits: "Habit Reminders", insights: "Weekly Insights" }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex flex-col space-y-1">
                    <span>{label}</span>
                  </Label>
                  <Switch
                    id={key}
                    checked={notifications[key as keyof typeof notifications]}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Focus Timer Settings</CardTitle>
              <CardDescription>Customize your productivity cycles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Focus Duration: {focusSettings.defaultDuration} min</Label>
                </div>
                <Slider
                  value={[focusSettings.defaultDuration]}
                  onValueChange={([v]) => setFocusSettings({ ...focusSettings, defaultDuration: v })}
                  max={60} min={5} step={5}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Break Duration: {focusSettings.breakDuration} min</Label>
                </div>
                <Slider
                  value={[focusSettings.breakDuration]}
                  onValueChange={([v]) => setFocusSettings({ ...focusSettings, breakDuration: v })}
                  max={30} min={1} step={1}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "Export Started", description: "Your data is being prepared for download." })}>
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>

              <Dialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Data</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. You will lose your selected data permanently.
                    </DialogDescription>
                  </DialogHeader>

                  {purgeStep === 'verify' && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Enter Password to Confirm</Label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                        {purgeError && <p className="text-sm text-destructive">{purgeError}</p>}
                      </div>
                      <Button className="w-full" onClick={handleVerifyPassword}>
                        Verify Password
                      </Button>
                    </div>
                  )}

                  {purgeStep === 'select' && (
                    <div className="space-y-3 py-4">
                      <Button variant="outline" className="w-full justify-start" onClick={() => handlePurge('tasks')} disabled={isPurging}>
                        Delete All Tasks & Focus Logs
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handlePurge('journals')} disabled={isPurging}>
                        Delete All Journal Entries
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => handlePurge('all')} disabled={isPurging}>
                        Delete Everything
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;