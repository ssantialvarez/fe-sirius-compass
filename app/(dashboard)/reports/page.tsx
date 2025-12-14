'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Download, Eye, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { HttpService } from '@/lib/service';
import { useProjectStore } from '@/lib/store';
import type { Report } from '@/lib/types';

function getStatusBadge(status: string) {
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
      return (
        <span className="px-3 py-1 rounded-full bg-muted/20 text-muted-foreground text-sm">
          Unknown
        </span>
      );
  }
}

export default function Reports() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentProject } = useProjectStore();

  const projectName = currentProject?.name;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await HttpService.getReports(projectName);
      setReports(data);
      setIsLoading(false);
    };

    load();
  }, [projectName]);

  const selectedReport = useMemo(
    () => reports.find((r) => r.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );

  return (
    <div className="space-y-8 p-8">
      {/* Filters (UI placeholder - backend filtering coming next) */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter size={20} className="text-muted-foreground" />
            <h3 className="text-foreground font-medium">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Project</Label>
              <Select defaultValue="current">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">{projectName ?? 'Current project'}</SelectItem>
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
            <Button disabled>Apply Filters</Button>
            <Button variant="outline" disabled>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports list */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading reports...</div>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No reports found. Run an analysis to generate reports.
          </div>
        )}

        {reports.map((report) => (
          <Card
            key={report.id}
            className="bg-card border-border hover:border-primary/50 transition-all"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-2 text-muted-foreground min-w-[180px]">
                  <Calendar size={16} />
                  <span className="text-sm">{report.week}</span>
                </div>

                <div className="flex flex-col min-w-[160px]">
                  <span className="text-sm text-muted-foreground">{report.repository}</span>
                  <h4 className="text-foreground font-medium">{report.project}</h4>
                </div>

                <div className="min-w-[100px]">{getStatusBadge(report.status)}</div>

                <p className="text-muted-foreground flex-1 truncate">{report.summary}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() =>
                    setSelectedReportId(selectedReportId === report.id ? null : report.id)
                  }
                  variant={selectedReportId === report.id ? 'default' : 'secondary'}
                  className="gap-2"
                >
                  <Eye size={16} />
                  {selectedReportId === report.id ? 'Close' : 'View'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  disabled
                >
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
                Report Details
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {selectedReport.week} • {selectedReport.project} • {selectedReport.repository}
              </p>
            </div>
            <Button onClick={() => setSelectedReportId(null)} variant="outline">
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
              <p className="text-muted-foreground pl-7 whitespace-pre-line">
                {selectedReport.summary}
              </p>
            </div>

            {/* Risks & Alerts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ChevronRight size={20} className="text-primary" />
                <h3 className="text-foreground font-medium">Risks & Alerts</h3>
              </div>
              <div className="pl-7 space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                  <AlertCircle size={18} className="text-chart-2 mt-0.5" />
                  <p className="text-muted-foreground">
                    {selectedReport.status === 'at-risk'
                      ? 'This report contains risk signals. Use the chat to investigate details.'
                      : 'No major risks detected for this report.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

