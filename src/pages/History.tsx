import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Calendar } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface Sale {
  id: string;
  total: number;
  items: any[];
  created_at: string;
}

type Period = 'daily' | 'weekly' | 'monthly';

function History() {
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [period, setPeriod] = useState<Period>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, [period]);

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'daily':
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case 'weekly':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case 'monthly':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
    }
  };

  const fetchSales = async () => {
    const { start, end } = getDateRange();
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load sales history');
      return;
    }

    setSales(data || []);
    setLoading(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const { start, end } = getDateRange();

    // Add title
    doc.setFontSize(20);
    doc.text('Sales Report', 20, 20);

    // Add period info
    doc.setFontSize(12);
    doc.text(`Period: ${format(start, 'PP')} - ${format(end, 'PP')}`, 20, 30);

    // Add total
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    doc.text(
      `Total Sales: ${new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
      }).format(total)}`,
      20,
      40
    );

    // Add sales table
    let y = 60;
    doc.setFontSize(10);
    sales.forEach((sale) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(format(new Date(sale.created_at), 'Pp'), 20, y);
      doc.text(
        new Intl.NumberFormat('cs-CZ', {
          style: 'currency',
          currency: 'CZK',
        }).format(sale.total),
        120,
        y
      );
      y += 10;
    });

    doc.save(`sales-report-${period}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t(p)}
            </button>
          ))}
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          {t('export')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sales</h3>
          <p className="mt-1 text-sm text-gray-500">
            No sales data available for this period.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(sale.created_at), 'Pp')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {sale.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {new Intl.NumberFormat('cs-CZ', {
                      style: 'currency',
                      currency: 'CZK',
                    }).format(sale.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;