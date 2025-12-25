import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const Finance: React.FC = () => {
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_profit: 0 });
  const { t } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getTransactionSummary();
        setSummary(data);
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  const data = [
    { name: t('income'), value: summary.total_income },
    { name: t('expense'), value: summary.total_expense },
  ];
  const COLORS = ['#22c55e', '#ef4444']; // Green, Red

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">{t('finance')}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 p-4 rounded-xl border border-green-200 text-center">
            <span className="block text-green-800 text-sm">{t('totalIncome')}</span>
            <span className="block text-2xl font-bold text-green-700">₹{summary.total_income}</span>
        </div>
        <div className="bg-red-100 p-4 rounded-xl border border-red-200 text-center">
            <span className="block text-red-800 text-sm">{t('totalExpense')}</span>
            <span className="block text-2xl font-bold text-red-700">₹{summary.total_expense}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border h-80">
        <h3 className="text-center font-bold text-gray-500 mb-2">Report</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-center">
          <span className="block text-blue-800 mb-1">{t('netProfit')}</span>
          <span className="text-4xl font-bold text-blue-700">₹{summary.net_profit}</span>
      </div>
    </div>
  );
};

export default Finance;
