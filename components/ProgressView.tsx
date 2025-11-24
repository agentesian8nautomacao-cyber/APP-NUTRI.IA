
import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Calendar, TrendingUp, Activity, Footprints, Droplets } from 'lucide-react';

const data7Days = [
  { name: 'Seg', kcal: 1800, weight: 70.5 },
  { name: 'Ter', kcal: 1750, weight: 70.4 },
  { name: 'Qua', kcal: 1900, weight: 70.3 },
  { name: 'Qui', kcal: 1780, weight: 70.2 },
  { name: 'Sex', kcal: 1850, weight: 70.0 },
  { name: 'Sáb', kcal: 2100, weight: 70.1 },
  { name: 'Dom', kcal: 1950, weight: 69.9 },
];

const data30Days = [
  { name: 'S1', kcal: 1820, weight: 71.0 },
  { name: 'S2', kcal: 1780, weight: 70.8 },
  { name: 'S3', kcal: 1850, weight: 70.2 },
  { name: 'S4', kcal: 1900, weight: 69.9 },
];

const ProgressView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const data = timeRange === '7d' ? data7Days : data30Days;

  return (
    <div className="p-6 pb-28 max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-serif font-bold text-[#1A4D2E] flex items-center gap-2">
          <TrendingUp className="text-[#4F6F52]" /> Progresso
        </h2>
        <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white text-[#1A4D2E] border-none shadow-sm rounded-xl p-3 text-sm outline-none font-medium cursor-pointer hover:bg-gray-50"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </select>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A4D2E] text-[#F5F1E8] p-5 rounded-[2rem] shadow-lg">
          <div className="flex items-center gap-2 opacity-80 mb-2">
            <Activity size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Média Kcal</span>
          </div>
          <div className="text-3xl font-serif">{timeRange === '7d' ? '1,850' : '1,810'}</div>
          <div className="text-xs mt-1 opacity-60">kcal/dia</div>
        </div>
        <div className="bg-white text-[#1A4D2E] p-5 rounded-[2rem] shadow-md">
          <div className="flex items-center gap-2 opacity-60 mb-2 text-[#4F6F52]">
            <Footprints size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Passos</span>
          </div>
          <div className="text-3xl font-serif">{timeRange === '7d' ? '8,432' : '9,102'}</div>
          <div className="text-xs mt-1 text-[#4F6F52]">média diária</div>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-[#1A4D2E]/5">
        <h3 className="text-[#1A4D2E] font-serif text-xl mb-6 flex items-center gap-2">
           <Activity size={20} className="text-[#4F6F52]"/> Peso (kg)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A4D2E" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#1A4D2E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A4D2E', borderRadius: '12px', color: '#fff', border: 'none', padding: '10px 15px' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: '#1A4D2E', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="weight" stroke="#1A4D2E" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-[#1A4D2E]/5">
        <h3 className="text-[#1A4D2E] font-serif text-xl mb-6 flex items-center gap-2">
           <Calendar size={20} className="text-[#4F6F52]"/> Ingestão Calórica
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F6F52" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4F6F52" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#4F6F52', borderRadius: '12px', color: '#fff', border: 'none', padding: '10px 15px' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: '#4F6F52', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="kcal" stroke="#4F6F52" strokeWidth={3} fillOpacity={1} fill="url(#colorKcal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
