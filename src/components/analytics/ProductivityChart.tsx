import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { day: "Mon", productivity: 65, tasks: 8, focus: 2.5 },
  { day: "Tue", productivity: 78, tasks: 12, focus: 3.5 },
  { day: "Wed", productivity: 72, tasks: 10, focus: 3 },
  { day: "Thu", productivity: 85, tasks: 14, focus: 4 },
  { day: "Fri", productivity: 68, tasks: 9, focus: 2.5 },
  { day: "Sat", productivity: 55, tasks: 5, focus: 1.5 },
  { day: "Sun", productivity: 60, tasks: 6, focus: 2 },
];

const ProductivityChart = () => {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Productivity Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 20%)" />
              <XAxis
                dataKey="day"
                stroke="hsl(220 10% 46%)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(220 10% 46%)"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(224 28% 12%)",
                  border: "1px solid hsl(224 20% 18%)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(220 20% 95%)" }}
              />
              <Area
                type="monotone"
                dataKey="productivity"
                stroke="hsl(262 83% 58%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProductivity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityChart;
