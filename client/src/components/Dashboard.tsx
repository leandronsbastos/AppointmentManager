import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Ticket,
  Clock,
  Target,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

const mockWeeklyData = [
  { day: "Seg", tickets: 45 },
  { day: "Ter", tickets: 52 },
  { day: "Qua", tickets: 48 },
  { day: "Qui", tickets: 61 },
  { day: "Sex", tickets: 43 },
  { day: "Sáb", tickets: 28 },
  { day: "Dom", tickets: 19 },
];

const mockSlaData = [
  { name: "Primeira Resposta", value: 98.2, color: "hsl(var(--chart-2))" },
  { name: "Resolução", value: 87.5, color: "hsl(var(--chart-1))" },
  { name: "Escalonamento", value: 76.3, color: "hsl(var(--destructive))" },
];

export function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: dashboardApi.getMetrics,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="metric-open-tickets">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Tickets Abertos</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {metrics?.openTickets || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-red-600 text-sm">12%</span>
              <span className="text-muted-foreground text-sm ml-2">vs. semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-response-time">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">TME (min)</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {metrics?.avgResponseTime || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm">8%</span>
              <span className="text-muted-foreground text-sm ml-2">vs. semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-sla-compliance">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">SLA Atendido</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {metrics?.slaCompliance || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm">2.1%</span>
              <span className="text-muted-foreground text-sm ml-2">vs. semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-customer-satisfaction">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">CSAT</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {metrics?.customerSatisfaction || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm">0.3</span>
              <span className="text-muted-foreground text-sm ml-2">vs. semana anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume Chart */}
        <Card data-testid="ticket-volume-chart">
          <CardHeader>
            <CardTitle>Volume de Tickets - Última Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="tickets" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SLA Performance */}
        <Card data-testid="sla-performance-chart">
          <CardHeader>
            <CardTitle>Performance SLA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSlaData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-card-foreground">{item.name}</span>
                    <span className={`text-sm font-medium ${
                      item.value >= 95 ? 'text-green-600' : 
                      item.value >= 85 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card data-testid="recent-activity">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">Maria Santos</span> respondeu ao ticket{" "}
                  <span className="text-primary">TK-2024-001</span>
                </p>
                <p className="text-xs text-muted-foreground">há 2 minutos</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                WhatsApp
              </Badge>
            </div>

            <div className="flex items-center space-x-4 py-3 border-b border-border">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-card-foreground">
                  Novo ticket <span className="text-primary">TK-2024-002</span> criado por{" "}
                  <span className="font-medium">Carlos Oliveira</span>
                </p>
                <p className="text-xs text-muted-foreground">há 5 minutos</p>
              </div>
              <Badge variant="destructive">Alta</Badge>
            </div>

            <div className="flex items-center space-x-4 py-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">Ana Costa</span> fechou ticket{" "}
                  <span className="text-primary">TK-2024-000</span>
                </p>
                <p className="text-xs text-muted-foreground">há 8 minutos</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Resolvido
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
