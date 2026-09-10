import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface SalesAreaChartProps {
  salesChart: Array<{ date: string; revenue: number }> | undefined;
  formatCurrency: (val: number) => string;
}

export const SalesAreaChart: React.FC<SalesAreaChartProps> = ({ salesChart, formatCurrency }) => {
  return (
    <div className="lg:col-span-2 mac-window p-0 flex flex-col justify-between">
      <div className="mac-window-header">
        <h3 className="text-xs font-black uppercase text-black">Grafik Penjualan 7 Hari Terakhir</h3>
      </div>

      <div className="p-4 bg-white">
        <div className="h-72 w-full animate-chart-draw">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={salesChart ? salesChart.length : 0}
              data={salesChart || []}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc" vertical={false} />
              <XAxis dataKey="date" stroke="#000000" fontSize={10} tickLine={false} />
              <YAxis stroke="#000000" fontSize={10} tickLine={false} tickFormatter={(v) => `Rp${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#e8e8e8',
                  borderColor: '#000000',
                  borderWidth: '2px',
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Omset']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#000000"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                isAnimationActive={true}
                animationBegin={200}
                animationDuration={3800}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
