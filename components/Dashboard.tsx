import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ShieldCheck, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { calculateStats } from '../services/storageService';
import { Device } from '../types';

interface DashboardProps {
  devices: Device[];
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ devices, loading }) => {
  const stats = calculateStats(devices);
  
  // Prepare data for chart
  const chartData = [
    { name: 'Active', value: stats.active },
    { name: 'Expired', value: stats.total - stats.active },
  ];
  
  const COLORS = ['#4f46e5', '#94a3b8'];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Active</p>
            <h2 className="text-2xl font-bold text-gray-800">{stats.active}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Expiring Soon</p>
            <h2 className="text-2xl font-bold text-gray-800">{stats.expiringSoon}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Tracked</p>
            <h2 className="text-2xl font-bold text-gray-800">{stats.total}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Warranty Status</h3>
          {stats.total === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400 pb-10">
              No devices added yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Expirations</h3>
          <div className="space-y-4">
            {devices
              .filter(d => d.expiry_date && new Date(d.expiry_date) > new Date())
              .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
              .slice(0, 3)
              .map(device => (
                <div key={device.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{device.brand_name} {device.category}</p>
                      <p className="text-xs text-gray-500">Ends: {device.expiry_date}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100">
                    {Math.ceil((new Date(device.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
            ))}
            {stats.total === 0 && <p className="text-gray-400 text-sm text-center py-8">No upcoming expirations</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;