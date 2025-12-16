
'use client';

import { useEffect, useMemo, useState } from 'react';
import { MarkdownText } from '@/components/ui/markdown-text';
import { Filter, Download, Eye, ChevronRight, Calendar, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { Label } from '@/components/ui/label';
import { HttpService } from '@/lib/service';
import { useProjectStore } from '@/lib/store';
import type { Report } from '@/lib/types';

function stripMarkdown(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, (block) => {
      const inner = block.replace(/^```\w*\n?/, '').replace(/```$/, '');
      return `\n\n${inner.trim()}\n\n`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1 ($2)')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .trim();
}

function toSafeFilenamePart(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

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
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isRisksOpen, setIsRisksOpen] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState<number | null>(null);
  const { currentProject } = useProjectStore();

  const projectName = currentProject?.name;

  const canDownload = useMemo(() => {
    // We can still generate PDFs without a selected project, but the UI is more predictable
    // if we keep the action available only when we have data.
    return reports.length > 0;
  }, [reports.length]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await HttpService.getReports(projectName);
      setReports(data);
      setIsLoading(false);
    };

    load();
  }, [projectName]);


  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  const handleDownloadPdf = async (report: Report) => {
    try {
      setDownloadingReportId(report.id);
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 48;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = 16;

      let y = margin;

      const ensureSpace = (needed: number) => {
        if (y + needed <= pageHeight - margin) return;
        doc.addPage();
        y = margin;
      };

      const writeHeading = (text: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        ensureSpace(24);
        doc.text(text, margin, y);
        y += 24;
      };

      const writeLabelValue = (label: string, value: string) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        ensureSpace(lineHeight);
        doc.text(`${label}:`, margin, y);

        doc.setFont('helvetica', 'normal');
        const labelWidth = doc.getTextWidth(`${label}: `);
        const lines = doc.splitTextToSize(value || '-', maxWidth - labelWidth);
        doc.text(lines, margin + labelWidth, y);
        y += lineHeight * Math.max(1, lines.length);
      };

      const writeParagraph = (text: string) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(text || '-', maxWidth);
        for (const line of lines) {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        }
      };

      writeHeading('Sirius Compass — Weekly Report');
      writeLabelValue('Week', report.week);
      writeLabelValue('Project', report.project);
      writeLabelValue('Repository', report.repository);
      writeLabelValue('Status', report.status);
      writeLabelValue('Generated', report.created_at);
      y += 12;

      writeHeading('Summary');
      writeParagraph(stripMarkdown(report.summary));

      const filename = `report-${toSafeFilenamePart(report.project)}-${toSafeFilenamePart(report.week)}.pdf`;
      doc.save(filename);
      toast.success('PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    const success = await HttpService.deleteReport(reportToDelete.id);
    if (success) {
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
      if (selectedReportId === reportToDelete.id) {
        setSelectedReportId(null);
      }
      toast.success('Report deleted successfully');
    } else {
      toast.error('Failed to delete report');
    }
    setReportToDelete(null);
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
          <div key={report.id} className="contents">
            <Card
              className={`bg-card border-border hover:border-primary/50 transition-all ${selectedReportId === report.id ? 'border-primary ring-1 ring-primary' : ''
                }`}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-muted-foreground min-w-[180px]">
                    <Calendar size={16} />
                    <span className="text-sm">{report.week}</span>
                  </div>

                  <div className="flex flex-col min-w-[160px]">
                    <span className="text-sm text-muted-foreground">{report.repository}</span>
                    <div className="flex items-center gap-2">
                      <h4 className="text-foreground font-medium">{report.project}</h4>
                      <span className="px-1.5 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground text-[10px] font-medium border border-border">
                        Project
                      </span>
                    </div>
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
                    disabled={!canDownload || downloadingReportId === report.id}
                    onClick={() => handleDownloadPdf(report)}
                    aria-label="Download report PDF"
                  >
                    {downloadingReportId === report.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReportToDelete(report);
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detail panel (Inline) */}
            {selectedReportId === report.id && (
              <Card
                className="bg-card border-primary/30 animate-in fade-in slide-in-from-top-2 duration-300 mt-2 ml-4 mr-4"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-foreground mb-2">
                      Report Details
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {report.week} • {report.project} • {report.repository}
                    </p>
                  </div>
                  <Button onClick={() => setSelectedReportId(null)} variant="outline">
                    Close
                  </Button>
                </CardHeader>

                <CardContent className="space-y-8 pt-6">
                  {/* Summary */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                      className="flex items-center gap-2 hover:bg-accent/50 p-1 -ml-1 pr-3 rounded-lg transition-colors"
                    >
                      <ChevronRight
                        size={20}
                        className={`text-primary transition-transform duration-200 ${isSummaryOpen ? 'rotate-90' : ''}`}
                      />
                      <h3 className="text-foreground font-medium">Summary</h3>
                    </button>

                    {isSummaryOpen && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="text-muted-foreground pl-7">
                          <MarkdownText content={report.summary} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risks & Alerts */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsRisksOpen(!isRisksOpen)}
                      className="flex items-center gap-2 hover:bg-accent/50 p-1 -ml-1 pr-3 rounded-lg transition-colors"
                    >
                      <ChevronRight
                        size={20}
                        className={`text-primary transition-transform duration-200 ${isRisksOpen ? 'rotate-90' : ''}`}
                      />
                      <h3 className="text-foreground font-medium">Risks & Alerts</h3>
                    </button>

                    {isRisksOpen && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="pl-7 space-y-2">
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <AlertCircle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
                            <div className="text-muted-foreground text-sm w-full">
                              {report.risk_details ? (
                                <MarkdownText content={report.risk_details} />
                              ) : report.status === 'at-risk' ? (
                                'This report contains risk signals. Use the chat to investigate details.'
                              ) : (
                                'No major risks detected for this report.'
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleDeleteReport}
        title="Delete Report"
        description="Are you sure you want to delete this report? This action cannot be undone."
      />
    </div>
  );
}
