'use client';

import { useState } from 'react';
import { Filter, Download, Eye, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  const reports = [
    {
      id: 1,
      week: 'Week of 2025-12-01',
      sprint: 'Sprint 35',
      squad: 'Squad Alpha',
      status: 'healthy',
      summary: 'Velocity up 12%, cycle time stable',
    },
    {
      id: 2,
      week: 'Week of 2025-11-24',
      sprint: 'Sprint 34',
      squad: 'Squad Alpha',
      status: 'healthy',
      summary: 'Strong sprint completion, no blockers',
    },
    {
      id: 3,
      week: 'Week of 2025-12-01',
      sprint: 'Sprint 35',
      squad: 'Squad Beta',
      status: 'watch',
      summary: 'Review latency increased by 24%',
    },
    {
      id: 4,
      week: 'Week of 2025-11-24',
      sprint: 'Sprint 34',
      squad: 'Squad Beta',
      status: 'at-risk',
      summary: '3 blocked items, velocity down 15%',
    },
    {
      id: 5,
      week: 'Week of 2025-11-17',
      sprint: 'Sprint 33',
      squad: 'Squad Alpha',
      status: 'healthy',
      summary: 'Consistent delivery, improved cycle time',
    },
    {
      id: 6,
      week: 'Week of 2025-11-17',
      sprint: 'Sprint 33',
      squad: 'Squad Beta',
      status: 'watch',
      summary: 'Some delays in code reviews',
    },
  ];

  const reportDetail = {
    summary: 'Squad Alpha maintained excellent performance throughout Sprint 35. The team successfully delivered all committed work with improved efficiency.',
    keyMetrics: [
      { name: 'Velocity', value: '52 points', change: '+12%', status: 'good' },
      { name: 'Cycle Time', value: '2.8 days', change: 'Stable', status: 'good' },
      { name: 'Throughput', value: '31 items', change: '+8%', status: 'good' },
      { name: 'Review Latency', value: '3.2 hours', change: '-15%', status: 'good' },
    ],
    risks: [
      'None identified - all metrics within healthy range',
    ],
    coaching: [
      'Continue current practices - team collaboration is excellent',
      'Consider sharing best practices with Squad Beta for code review process',
      'Monitor capacity as velocity increases to prevent burnout',
    ],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="px-3 py-1 rounded-full bg-chart-2/20 text-chart-2 text-sm">
            Healthy
          </span>
        );
      case 'watch':
        return (
          <span className="px-3 py-1 rounded-full bg-chart-4/20 text-chart-4 text-sm">
            Watch
          </span>
        );
      case 'at-risk':
        return (
          <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm">
            At Risk
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter size={20} className="text-muted-foreground" />
            <h3 className="text-foreground font-medium">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Squad / Team</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select squad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All squads</SelectItem>
                  <SelectItem value="alpha">Squad Alpha</SelectItem>
                  <SelectItem value="beta">Squad Beta</SelectItem>
                  <SelectItem value="gamma">Squad Gamma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Time Range</Label>
              <Select defaultValue="3months">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Status</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button>Apply Filters</Button>
            <Button variant="outline">Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports list */}
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="bg-card border-border hover:border-primary/50 transition-all"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                  <Calendar size={16} />
                  <span className="text-sm">{report.week}</span>
                </div>

                <div className="flex flex-col min-w-[120px]">
                  <span className="text-sm text-muted-foreground">
                    {report.sprint}
                  </span>
                  <h4 className="text-foreground font-medium">{report.squad}</h4>
                </div>

                <div className="min-w-[100px]">{getStatusBadge(report.status)}</div>

                <p className="text-muted-foreground flex-1 truncate">{report.summary}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                  variant={selectedReport === report.id ? "default" : "secondary"}
                  className="gap-2"
                >
                  <Eye size={16} />
                  {selectedReport === report.id ? 'Close' : 'View'}
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Download size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail panel */}
      {selectedReport && (
        <Card className="bg-card border-primary/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-foreground mb-2">
                Weekly Report Details
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {reports.find((r) => r.id === selectedReport)?.week} •{' '}
                {reports.find((r) => r.id === selectedReport)?.squad}
              </p>
            </div>
            <Button
              onClick={() => setSelectedReport(null)}
              variant="outline"
            >
              Close
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-8 pt-6">
            {/* Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ChevronRight size={20} className="text-primary" />
                <h3 className="text-foreground font-medium">Summary</h3>
              </div>
              <p className="text-muted-foreground pl-7">{reportDetail.summary}</p>
            </div>

            {/* Key Metrics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ChevronRight size={20} className="text-primary" />
                <h3 className="text-foreground font-medium">Key Metrics</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pl-7">
                {reportDetail.keyMetrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="bg-muted/50 border border-border rounded-lg p-4"
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      {metric.name}
                    </p>
                    <p className="text-xl text-foreground font-semibold mb-2">
                      {metric.value}
                    </p>
                    <span className="text-xs text-chart-2 font-medium">{metric.change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks & Alerts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ChevronRight size={20} className="text-primary" />
                <h3 className="text-foreground font-medium">Risks & Alerts</h3>
              </div>
              <div className="pl-7 space-y-2">
                {reportDetail.risks.map((risk, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20"
                  >
                    <AlertCircle size={18} className="text-chart-2 mt-0.5" />
                    <p className="text-muted-foreground">{risk}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coaching Tips */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ChevronRight size={20} className="text-primary" />
                <h3 className="text-foreground font-medium">Suggested Coaching Tips</h3>
              </div>
              <ul className="pl-7 space-y-2">
                {reportDetail.coaching.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}