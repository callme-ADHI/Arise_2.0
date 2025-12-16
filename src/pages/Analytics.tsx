import { useState } from "react";
import { BarChart3, CheckCircle2, Clock, Flame, BookOpen, Target, TrendingUp, TrendingDown, Brain, Zap, Calendar, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useStats, useTasks, useJournal, useFocus, useMood, useHabits } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

const Analytics = () => {
  const stats = useStats();
  const { tasks, completedTasks } = useTasks();
  const { entries } = useJournal();
  const { sessions } = useFocus();
  const { weekMoods, moodLogs } = useMood();
  const { habits } = useHabits();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const avgMood = weekMoods.length > 0 ? (weekMoods.reduce((a, m) => a + m.mood, 0) / weekMoods.length).toFixed(1) : "N/A";

  // Generate last 7/30 days data
  const getDaysArray = (count: number) => Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (count - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const last7Days = getDaysArray(7);
  const last30Days = getDaysArray(30);
  const daysToUse = timeRange === 'week' ? last7Days : timeRange === 'month' ? last30Days : last30Days;

  // Build chart data
  const productivityData = daysToUse.map(date => {
    const dayTasks = tasks.filter(t => t.completedAt?.startsWith(date)).length;
    const dayFocus = sessions.filter(s => s.startedAt.startsWith(date)).reduce((a, s) => a + Math.floor(s.completedDuration / 60), 0);
    const dayMood = moodLogs.find(m => m.date === date)?.mood || 0;
    const dayHabits = habits.filter(h => h.completedDates.includes(date)).length;
    const productivity = Math.min(100, (dayTasks * 10 + dayFocus * 2 + dayHabits * 5));
    return {
      date,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()],
      tasks: dayTasks,
      focus: dayFocus,
      mood: dayMood,
      habits: dayHabits,
      productivity,
    };
  });

  // Focus distribution by mode
  const focusByMode = ['deep', 'pomodoro', 'sprint', 'calm'].map(mode => {
    const modeSessions = sessions.filter(s => s.mode === mode);
    const minutes = modeSessions.reduce((acc, s) => acc + Math.floor(s.completedDuration / 60), 0);
    return { mode: mode.charAt(0).toUpperCase() + mode.slice(1), minutes, sessions: modeSessions.length };
  });

  // Radar chart data for overall performance
  const radarData = [
    { subject: 'Tasks', A: Math.min(100, completedTasks.length * 5) },
    { subject: 'Focus', A: Math.min(100, stats.totalFocusMinutes / 10) },
    { subject: 'Journal', A: Math.min(100, entries.length * 10) },
    { subject: 'Habits', A: Math.min(100, habits.length * 20) },
    { subject: 'Mood', A: parseFloat(avgMood) * 20 || 0 },
    { subject: 'Streak', A: Math.min(100, stats.currentTaskStreak * 10) },
  ];

  // Mood trend data
  const moodTrendData = daysToUse.map(date => {
    const mood = moodLogs.find(m => m.date === date);
    return {
      date,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()],
      mood: mood?.mood || 0,
      energy: mood?.energy || 0,
    };
  });

  // Habit completion heatmap data
  const habitHeatmapData = habits.map(habit => ({
    name: habit.title,
    ...Object.fromEntries(last7Days.map(date => [date, habit.completedDates.includes(date) ? 1 : 0])),
  }));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-arise-success" />Analytics</h1>
          <p className="text-muted-foreground text-sm">Track your progress and insights</p>
        </div>
        <div className="flex bg-secondary rounded-lg p-1">
          {(['week', 'month'] as const).map((range) => (
            <Button key={range} variant={timeRange === range ? 'default' : 'ghost'} size="sm" onClick={() => setTimeRange(range)} className="capitalize">{range}</Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Tasks Done", value: completedTasks.length, icon: CheckCircle2, color: "text-arise-success", change: 12 },
          { label: "Focus Time", value: `${Math.floor(stats.totalFocusMinutes / 60)}h`, icon: Clock, color: "text-primary", change: 8 },
          { label: "Journal", value: entries.length, icon: BookOpen, color: "text-accent", change: 5 },
          { label: "Habits", value: habits.length, icon: Target, color: "text-arise-warning", change: 3 },
          { label: "Avg Mood", value: avgMood, icon: Flame, color: "text-arise-energy", change: 2 },
        ].map((stat) => (
          <Card key={stat.label} className="glass">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                {stat.change > 0 && <span className="text-xs text-arise-success flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" />+{stat.change}%</span>}
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="productivity" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-4 mt-4">
          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">Productivity Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productivityData}>
                    <defs>
                      <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 20% 18%)" />
                    <XAxis dataKey="day" stroke="hsl(220 10% 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220 10% 46%)" fontSize={12} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(224 28% 12%)', border: '1px solid hsl(224 20% 18%)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="productivity" stroke="hsl(262 83% 58%)" strokeWidth={2} fill="url(#colorProd)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base">Tasks Completed</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 20% 18%)" />
                      <XAxis dataKey="day" stroke="hsl(220 10% 46%)" fontSize={12} />
                      <YAxis stroke="hsl(220 10% 46%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(224 28% 12%)', border: '1px solid hsl(224 20% 18%)', borderRadius: '8px' }} />
                      <Bar dataKey="tasks" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base">Focus Minutes</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData}>
                      <defs>
                        <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(172 66% 50%)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(172 66% 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 20% 18%)" />
                      <XAxis dataKey="day" stroke="hsl(220 10% 46%)" fontSize={12} />
                      <YAxis stroke="hsl(220 10% 46%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(224 28% 12%)', border: '1px solid hsl(224 20% 18%)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="focus" stroke="hsl(172 66% 50%)" strokeWidth={2} fill="url(#colorFocus)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base">Focus by Mode</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={focusByMode} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 20% 18%)" />
                      <XAxis type="number" stroke="hsl(220 10% 46%)" fontSize={12} />
                      <YAxis dataKey="mode" type="category" stroke="hsl(220 10% 46%)" fontSize={12} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(224 28% 12%)', border: '1px solid hsl(224 20% 18%)', borderRadius: '8px' }} />
                      <Bar dataKey="minutes" fill="hsl(262 83% 58%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base">Session Statistics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {focusByMode.map((mode) => (
                  <div key={mode.mode}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{mode.mode}</span>
                      <span className="text-muted-foreground">{mode.minutes}m • {mode.sessions} sessions</span>
                    </div>
                    <Progress value={stats.totalFocusMinutes > 0 ? (mode.minutes / stats.totalFocusMinutes) * 100 : 0} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">Focus Intensity Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 20% 18%)" />
                    <XAxis dataKey="day" stroke="hsl(220 10% 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220 10% 46%)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(224 28% 12%)', border: '1px solid hsl(224 20% 18%)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="focus" stroke="hsl(262 83% 58%)" strokeWidth={2} dot={{ fill: 'hsl(262 83% 58%)', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="tasks" stroke="hsl(172 66% 50%)" strokeWidth={2} dot={{ fill: 'hsl(172 66% 50%)', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4 mt-4">
          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">Mood & Energy Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 20% 18%)" />
                    <XAxis dataKey="day" stroke="hsl(220 10% 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220 10% 46%)" fontSize={12} domain={[0, 5]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(224 28% 12%)', border: '1px solid hsl(224 20% 18%)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="mood" stroke="hsl(24 95% 53%)" strokeWidth={3} dot={{ fill: 'hsl(24 95% 53%)', strokeWidth: 0, r: 5 }} />
                    <Line type="monotone" dataKey="energy" stroke="hsl(38 92% 50%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">Mood Insights</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-arise-success/10 border border-arise-success/20">
                  <p className="text-sm font-medium text-arise-success mb-1">Best Days</p>
                  <p className="text-xs text-muted-foreground">Your mood peaks mid-week, especially on Wednesdays and Thursdays.</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">Correlation</p>
                  <p className="text-xs text-muted-foreground">Higher focus time correlates with better mood scores.</p>
                </div>
                <div className="p-4 rounded-lg bg-arise-warning/10 border border-arise-warning/20">
                  <p className="text-sm font-medium text-arise-warning mb-1">Tip</p>
                  <p className="text-xs text-muted-foreground">Journal entries on low-mood days help improve next-day mood.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4 mt-4">
          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">Habit Completion Heatmap</CardTitle></CardHeader>
            <CardContent>
              {habits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No habits tracked yet. Create habits to see analytics!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-muted-foreground pb-2">Habit</th>
                        {last7Days.map(date => (
                          <th key={date} className="text-center text-xs font-medium text-muted-foreground pb-2 px-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(date).getDay()]}
                          </th>
                        ))}
                        <th className="text-right text-sm font-medium text-muted-foreground pb-2">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {habits.map((habit) => {
                        const completed = last7Days.filter(d => habit.completedDates.includes(d)).length;
                        const rate = Math.round((completed / 7) * 100);
                        return (
                          <tr key={habit.id}>
                            <td className="text-sm py-2 pr-4 max-w-[150px] truncate">{habit.title}</td>
                            {last7Days.map(date => {
                              const isCompleted = habit.completedDates.includes(date);
                              // Logic: 
                              // - If completed: use category color (habit.color)
                              // - If NOT completed: use Red (bg-red-500/20 or similar) to signify missed
                              // Note: last7Days usually ends with today.
                              const cellColor = isCompleted
                                ? habit.color
                                : "bg-red-500/20"; // Red for missed

                              return (
                                <td key={date} className="p-1">
                                  <div className={cn("w-6 h-6 rounded transition-all", cellColor)} />
                                </td>
                              );
                            })}
                            <td className={cn("text-right font-medium", rate >= 70 ? "text-arise-success" : rate >= 40 ? "text-arise-warning" : "text-destructive")}>{rate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {habits.slice(0, 3).map((habit) => (
              <Card key={habit.id} className="glass">
                <CardContent className="pt-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", habit.color)}>
                    <Flame className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="font-medium">{habit.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-arise-energy font-bold">{habit.streak} streak</span>
                    <span className="text-muted-foreground">Best: {habit.bestStreak}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base">Performance Radar</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(224 20% 18%)" />
                      <PolarAngleAxis dataKey="subject" stroke="hsl(220 10% 46%)" fontSize={12} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(220 10% 46%)" fontSize={10} />
                      <Radar name="Performance" dataKey="A" stroke="hsl(262 83% 58%)" fill="hsl(262 83% 58%)" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2"><CardTitle className="text-base">All-Time Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-3xl font-bold">{stats.totalTasks}</p>
                    <p className="text-xs text-muted-foreground">Total Tasks</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-3xl font-bold">{Math.floor(stats.totalFocusMinutes / 60)}h</p>
                    <p className="text-xs text-muted-foreground">Focus Time</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-3xl font-bold">{stats.totalJournalEntries}</p>
                    <p className="text-xs text-muted-foreground">Journal Entries</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 text-center">
                    <p className="text-3xl font-bold">Lvl {stats.level}</p>
                    <p className="text-xs text-muted-foreground">{stats.xp} XP</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level Progress</span>
                    <span className="text-muted-foreground">{stats.xp % 100}/100 XP</span>
                  </div>
                  <Progress value={stats.xp % 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />AI Insights</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-arise-success/10 border border-arise-success/20">
                  <TrendingUp className="w-5 h-5 text-arise-success mb-2" />
                  <p className="text-sm font-medium mb-1">Strength</p>
                  <p className="text-xs text-muted-foreground">Your focus sessions are most productive in the morning. Schedule deep work before noon.</p>
                </div>
                <div className="p-4 rounded-lg bg-arise-warning/10 border border-arise-warning/20">
                  <Activity className="w-5 h-5 text-arise-warning mb-2" />
                  <p className="text-sm font-medium mb-1">Opportunity</p>
                  <p className="text-xs text-muted-foreground">Task completion drops on Fridays. Consider lighter workloads or review sessions.</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <Zap className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium mb-1">Recommendation</p>
                  <p className="text-xs text-muted-foreground">Adding a 5-min journal session before focus could boost productivity by 15%.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
