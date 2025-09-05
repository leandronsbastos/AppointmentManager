import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Plus, Download, Share, TrendingUp, Clock, Target, Star } from "lucide-react";

const mockWeeklyData = [
  { day: "Seg", tickets: 45, resolved: 38 },
  { day: "Ter", tickets: 52, resolved: 44 },
  { day: "Qua", tickets: 48, resolved: 41 },
  { day: "Qui", tickets: 61, resolved: 52 },
  { day: "Sex", tickets: 43, resolved: 39 },
  { day: "Sáb", tickets: 28, resolved: 25 },
  { day: "Dom", tickets: 19, resolved: 17 },
];

const mockSatisfactionData = [
  { rating: "5", count: 145, color: "hsl(var(--chart-2))" },
  { rating: "4", count: 89, color: "hsl(var(--chart-4))" },
  { rating: "3", count: 23, color: "hsl(var(--chart-1))" },
  { rating: "2", count: 8, color: "hsl(var(--chart-5))" },
  { rating: "1", count: 3, color: "hsl(var(--destructive))" },
];

export function Reports() {
  const [dataset, setDataset] = useState("tickets");
  const [metric, setMetric] = useState("count");
  const [period, setPeriod] = useState("7days");

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: dashboardApi.getMetrics,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-card-foreground">Relatórios e Indicadores</h2>
        <Button data-testid="create-report-button">
          <Plus className="w-4 h-4 mr-2" />
          Criar Relatório
        </Button>
      </div>

      {/* Report Builder */}
      <Card data-testid="report-builder">
        <CardHeader>
          <CardTitle>Construtor de Indicadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Dataset
              </label>
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger data-testid="dataset-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tickets">Tickets</SelectItem>
                  <SelectItem value="messages">Mensagens</SelectItem>
                  <SelectItem value="agents">Atendentes</SelectItem>
                  <SelectItem value="customers">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Métrica
              </label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger data-testid="metric-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Contagem</SelectItem>
                  <SelectItem value="average">Média</SelectItem>
                  <SelectItem value="sum">Soma</SelectItem>
                  <SelectItem value="percentile">Percentil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Período
              </label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger data-testid="period-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" data-testid="preview-report">
              Visualizar
            </Button>
            <Button data-testid="save-report">
              Salvar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Report */}
        <Card data-testid="performance-report">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Relatório de Produtividade</CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" data-testid="download-performance">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="share-performance">
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tickets Resolvidos (Hoje)</span>
                <span className="font-medium text-card-foreground">
                  {metrics?.resolvedToday || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tempo Médio de Resolução</span>
                <span className="font-medium text-card-foreground">2h 15m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">First Contact Resolution</span>
                <span className="font-medium text-green-600">78.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card data-testid="satisfaction-report">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Satisfação do Cliente</CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" data-testid="download-satisfaction">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="share-satisfaction">
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {metrics?.customerSatisfaction || "4.7"}
              </div>
              <div className="flex justify-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Baseado em 268 avaliações
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Ticket Volume */}
        <Card className="lg:col-span-2" data-testid="weekly-volume-chart">
          <CardHeader>
            <CardTitle>Volume de Tickets - Última Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="tickets" fill="hsl(var(--primary))" name="Criados" />
                <Bar dataKey="resolved" fill="hsl(var(--chart-2))" name="Resolvidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CSAT Distribution */}
        <Card className="lg:col-span-2" data-testid="csat-distribution">
          <CardHeader>
            <CardTitle>Distribuição de Satisfação (CSAT)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mockSatisfactionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="count"
                  >
                    {mockSatisfactionData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {mockSatisfactionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.rating} estrelas</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
