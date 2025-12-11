'use client';

import { useState } from 'react';
import { Filter, Download, Eye, ChevronRight, Calendar, AlertCircle } from 'lucide-react';

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
          <span className="px-3 py-1 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)] text-sm">
            Healthy
          </span>
        );
      case 'watch':
        return (
          <span className="px-3 py-1 rounded-full bg-[var(--color-warning)]/20 text-[var(--color-warning)] text-sm">
            Watch
          </span>
        );
      case 'at-risk':
        return (
          <span className="px-3 py-1 rounded-full bg-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
            At Risk
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter size={20} className="text-[var(--color-text-secondary)]" />
          <h3 className="text-[var(--color-text-primary)]">Filters</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-secondary)]">Squad / Team</label>
            <select className="w-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] px-3 py-2 rounded-lg border border-[var(--color-border)] cursor-pointer">
              <option>All squads</option>
              <option>Squad Alpha</option>
              <option>Squad Beta</option>
              <option>Squad Gamma</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-secondary)]">Time Range</label>
            <select className="w-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] px-3 py-2 rounded-lg border border-[var(--color-border)] cursor-pointer">
              <option>Last 3 months</option>
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-secondary)]">Status</label>
            <select className="w-full bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] px-3 py-2 rounded-lg border border-[var(--color-border)] cursor-pointer">
              <option>All statuses</option>
              <option>Healthy</option>
              <option>Watch</option>
              <option>At Risk</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors">
            Apply Filters
          </button>
          <button className="px-4 py-2 bg-[var(--color-surface-hover)] hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] rounded-lg border border-[var(--color-border)] transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Reports list */}
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-border-hover)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Calendar size={16} />
                  <span className="text-sm">{report.week}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {report.sprint}
                  </span>
                  <h4 className="text-[var(--color-text-primary)]">{report.squad}</h4>
                </div>

                <div>{getStatusBadge(report.status)}</div>

                <p className="text-[var(--color-text-secondary)] flex-1">{report.summary}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors"
                >
                  <Eye size={16} />
                  View
                </button>
                <button className="p-2 hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors">
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selectedReport && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 rounded-xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[var(--color-text-primary)] mb-2">
                Weekly Report Details
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                {reports.find((r) => r.id === selectedReport)?.week} •{' '}
                {reports.find((r) => r.id === selectedReport)?.squad}
              </p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 bg-[var(--color-surface-hover)] hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] rounded-lg border border-[var(--color-border)] transition-colors"
            >
              Close
            </button>
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ChevronRight size={20} className="text-[var(--color-primary)]" />
              <h3 className="text-[var(--color-text-primary)]">Summary</h3>
            </div>
            <p className="text-[var(--color-text-secondary)] pl-7">{reportDetail.summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ChevronRight size={20} className="text-[var(--color-primary)]" />
              <h3 className="text-[var(--color-text-primary)]">Key Metrics</h3>
            </div>
            <div className="grid grid-cols-4 gap-4 pl-7">
              {reportDetail.keyMetrics.map((metric) => (
                <div
                  key={metric.name}
                  className="bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-lg p-4"
                >
                  <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                    {metric.name}
                  </p>
                  <p className="text-xl text-[var(--color-text-primary)] mb-2">
                    {metric.value}
                  </p>
                  <span className="text-xs text-[var(--color-success)]">{metric.change}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Alerts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ChevronRight size={20} className="text-[var(--color-primary)]" />
              <h3 className="text-[var(--color-text-primary)]">Risks & Alerts</h3>
            </div>
            <div className="pl-7 space-y-2">
              {reportDetail.risks.map((risk, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20"
                >
                  <AlertCircle size={18} className="text-[var(--color-success)] mt-0.5" />
                  <p className="text-[var(--color-text-secondary)]">{risk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coaching Tips */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ChevronRight size={20} className="text-[var(--color-primary)]" />
              <h3 className="text-[var(--color-text-primary)]">Suggested Coaching Tips</h3>
            </div>
            <ul className="pl-7 space-y-2">
              {reportDetail.coaching.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-[var(--color-text-secondary)]"
                >
                  <span className="text-[var(--color-primary)] mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}