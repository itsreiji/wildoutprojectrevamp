/**
 * DashboardAuditLog Component
 * Displays paginated, filterable audit log entries from audit_log table
 * Columns: timestamp, user_id, table_name, action, changes (summary diff)
 * Filters: table_name (select), action (select), user_id (input)
 * Uses AuditContext for data fetching with RLS enforced server-side
 */

import { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Database, Zap, Edit3, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useAudit } from '../../contexts/AuditContext';
import type { AuditLog } from '../../contexts/AuditContext';

const TABLES = ['events', 'partners', 'gallery_items', 'team_members', 'profiles'] as const;
const ACTIONS = ['INSERT', 'UPDATE', 'DELETE'] as const;

const getActionBadge = (action: string) => {
  switch (action) {
    case 'INSERT': return <StatusBadge status="insert" icon={<Zap className="h-3 w-3" />} />;
    case 'UPDATE': return <StatusBadge status="update" icon={<Edit3 className="h-3 w-3" />} />;
    case 'DELETE': return <StatusBadge status="delete" icon={<Trash2 className="h-3 w-3" />} />;
    default: return <StatusBadge status={action} />;
  }
};

const getChangesSummary = (log: AuditLog): string => {
  if (log.action === 'INSERT') return 'New record created';
  if (log.action === 'DELETE') return 'Record deleted';
  if (log.old_data && log.new_data) {
    const oldKeys = new Set(Object.keys(log.old_data));
    const newKeys = new Set(Object.keys(log.new_data));
    const allKeys = new Set([...oldKeys, ...newKeys]);
    const changedKeys = Array.from(allKeys).filter(key => {
      const oldVal = log.old_data?.[key as keyof typeof log.old_data];
      const newVal = log.new_data?.[key as keyof typeof log.new_data];
      return JSON.stringify(oldVal) !== JSON.stringify(newVal);
    });
    if (changedKeys.length === 0) return 'No fields changed';
    return `${changedKeys.length} fields: ${changedKeys.slice(0, 3).join(', ')}${changedKeys.length > 3 ? '...' : ''}`;
  }
  return `${log.action?.toLowerCase()} performed`;
};

export const DashboardAuditLog = () => {
  const { auditLogs, totalCount, loading, fetchAuditLogs } = useAudit();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<{ table_name?: string; action?: string; user_id?: string }>({});
  const pageCount = Math.ceil(totalCount / pageSize);

  const handleFetch = useCallback(async () => {
    await fetchAuditLogs(pageIndex, pageSize, filters);
  }, [fetchAuditLogs, pageIndex, pageSize, filters]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  const handlePageChange = (newPage: number) => {
    setPageIndex(newPage);
  };

  if (loading && auditLogs.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-8 text-center text-white/60">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-white/20" />
          <p>Loading audit logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
            Audit Log
          </h2>
          <p className="text-white/60">Recent changes across all tables (Admin/Editor access)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={filters.table_name || ''} onValueChange={(v) => setFilters({ ...filters, table_name: v || undefined })}>
            <SelectTrigger className="w-[180px] h-10 bg-white/5 border-white/10 hover:border-white/20 focus-visible:ring-[#E93370] transition-colors">
              <SelectValue placeholder="All tables" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All tables</SelectItem>
              {TABLES.map(table => <SelectItem key={table} value={table}>{table}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.action || ''} onValueChange={(v) => setFilters({ ...filters, action: v || undefined })}>
            <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 hover:border-white/20 focus-visible:ring-[#E93370] transition-colors">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All actions</SelectItem>
              {ACTIONS.map(action => <SelectItem key={action} value={action}>{action}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            className="w-[160px] h-10 bg-white/5 border-white/10 text-white focus-visible:ring-[#E93370] transition-colors"
            placeholder="User ID"
            value={filters.user_id || ''}
            onChange={(e) => setFilters({ ...filters, user_id: e.target.value || undefined })}
          />
          <Button size="sm" variant="outline" className="h-10 border-white/10 hover:bg-white/5" onClick={handleFetch}>
            Filter
          </Button>
        </div>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/90">Timestamp</TableHead>
              <TableHead className="text-white/90">User ID</TableHead>
              <TableHead className="text-white/90">Table</TableHead>
              <TableHead className="text-white/90">Action</TableHead>
              <TableHead className="text-white/90">Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="text-white/80">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell className="text-white/70 font-mono text-xs">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1 text-white/50" />
                    {log.user_id?.slice(0, 8) || 'system'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-white/50" />
                    <span className="font-mono text-white/90">{log.table_name}</span>
                  </div>
                </TableCell>
                <TableCell>{getActionBadge(log.action)}</TableCell>
                <TableCell className="text-white/80 max-w-[300px]">
                  {getChangesSummary(log)}
                </TableCell>
              </TableRow>
            ))}
            {auditLogs.length === 0 && !loading && (
              <TableRow>
                <TableCell className="text-center py-16 text-white/40 h-32" colSpan={5}>
                  No audit logs match the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={pageIndex === 0 ? 'pointer-events-none opacity-50' : ''}
              href="#"
              onClick={() => handlePageChange(Math.max(0, pageIndex - 1))}
            />
          </PaginationItem>
          {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
            const pageNum = pageIndex - 3 + i;
            if (pageNum >= 0 && pageNum < pageCount) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={pageNum === pageIndex}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}
          {pageCount > 7 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
          <PaginationItem>
            <PaginationNext
              className={pageIndex === pageCount - 1 ? 'pointer-events-none opacity-50' : ''}
              href="#"
              onClick={() => handlePageChange(Math.min(pageCount - 1, pageIndex + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};