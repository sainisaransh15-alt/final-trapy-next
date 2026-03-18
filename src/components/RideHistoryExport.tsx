'use client';
import { useState } from 'react';
import { Download, FileText, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface BookingExport {
  id: string;
  created_at: string;
  seats_booked: number;
  total_price: number;
  platform_fee: number;
  status: string;
  rides: {
    origin: string;
    destination: string;
    departure_time: string;
    price_per_seat: number;
  } | null;
}

export function RideHistoryExport() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '3months' | '6months' | '1year' | 'custom'>('3months');
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '3months':
        return subMonths(now, 3);
      case '6months':
        return subMonths(now, 6);
      case '1year':
        return subMonths(now, 12);
      case 'custom':
        return startDate || subMonths(now, 3);
      default:
        return null;
    }
  };

  const handleExport = async () => {
    if (!user) return;

    setExporting(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          id,
          created_at,
          seats_booked,
          total_price,
          platform_fee,
          status,
          rides (
            origin,
            destination,
            departure_time,
            price_per_seat
          )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false });

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('created_at', dateFilter.toISOString());
      }
      if (dateRange === 'custom' && endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'No Data',
          description: 'No bookings found for the selected period.',
          variant: 'destructive',
        });
        return;
      }

      if (exportType === 'csv') {
        exportToCSV(data as BookingExport[]);
      } else {
        exportToPDF(data as BookingExport[]);
      }

      toast({
        title: 'Export Complete',
        description: `Your ride history has been downloaded as ${exportType.toUpperCase()}.`,
      });
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export ride history',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = (data: BookingExport[]) => {
    const headers = ['Date', 'Origin', 'Destination', 'Seats', 'Price', 'Platform Fee', 'Net Amount', 'Status'];
    const rows = data.map(booking => [
      format(new Date(booking.created_at), 'yyyy-MM-dd'),
      booking.rides?.origin || 'N/A',
      booking.rides?.destination || 'N/A',
      booking.seats_booked,
      `₹${booking.total_price}`,
      `₹${booking.platform_fee}`,
      `₹${booking.total_price - booking.platform_fee}`,
      booking.status || 'N/A',
    ]);

    // Add summary
    const totalSpent = data.reduce((sum, b) => sum + b.total_price, 0);
    const totalFees = data.reduce((sum, b) => sum + b.platform_fee, 0);
    rows.push([]);
    rows.push(['Summary']);
    rows.push(['Total Bookings', data.length.toString()]);
    rows.push(['Total Spent', `₹${totalSpent}`]);
    rows.push(['Total Fees', `₹${totalFees}`]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    downloadFile(csvContent, `trapy-ride-history-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  };

  const exportToPDF = (data: BookingExport[]) => {
    // Generate HTML for PDF
    const totalSpent = data.reduce((sum, b) => sum + b.total_price, 0);
    const totalFees = data.reduce((sum, b) => sum + b.platform_fee, 0);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trapy Ride History</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #4F46E5; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .summary { margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .summary p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>🚗 Trapy Ride History</h1>
        <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
        
        <table>
          <tr>
            <th>Date</th>
            <th>Route</th>
            <th>Seats</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
          ${data.map(booking => `
            <tr>
              <td>${format(new Date(booking.created_at), 'MMM d, yyyy')}</td>
              <td>${booking.rides?.origin || 'N/A'} → ${booking.rides?.destination || 'N/A'}</td>
              <td>${booking.seats_booked}</td>
              <td>₹${booking.total_price}</td>
              <td>${booking.status || 'N/A'}</td>
            </tr>
          `).join('')}
        </table>
        
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Bookings:</strong> ${data.length}</p>
          <p><strong>Total Spent:</strong> ₹${totalSpent}</p>
          <p><strong>Platform Fees:</strong> ₹${totalFees}</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Ride History
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label className="mb-2 block">Export Format</Label>
            <Select value={exportType} onValueChange={(v) => setExportType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="pdf">PDF (Printable)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Date Range</Label>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last 1 Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      {startDate ? format(startDate, 'MMM d, yyyy') : 'Start'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="mb-2 block text-sm">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      {endDate ? format(endDate, 'MMM d, yyyy') : 'End'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            {exportType === 'csv' ? (
              <p>CSV files can be opened in Excel, Google Sheets, or any spreadsheet app.</p>
            ) : (
              <p>PDF will open in a new window for printing or saving.</p>
            )}
          </div>

          <Button onClick={handleExport} disabled={exporting} className="w-full">
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export {exportType.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
