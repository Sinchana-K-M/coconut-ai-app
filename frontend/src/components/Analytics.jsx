import React, { useState } from 'react';
import { BarChart3, Filter, TrendingUp, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts';

export default function Analytics({ analyticsData, onTimeRangeChange }) {
  const [selectedRange, setSelectedRange] = useState('all');

  const handleRangeSelect = (e) => {
    const val = e.target.value;
    setSelectedRange(val);
    if (onTimeRangeChange) {
      onTimeRangeChange(val);
    }
  };

  if (!analyticsData || analyticsData.total_predictions === 0) {
    return (
      <div className="card">
        <div className="card-title">
          <BarChart3 size={20} />
          <span>Analytics Dashboard</span>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          No prediction history available for the selected time range. Upload an image under <strong>Analyze Coconut</strong> to begin recording analytics.
        </div>
      </div>
    );
  }

  const pieData = analyticsData.distribution || [
    { name: 'HEALTHY', value: analyticsData.healthy_count },
    { name: 'FUNGAL', value: analyticsData.fungal_count },
  ];

  const COLORS = ['#059669', '#dc2626'];
  const timelineData = analyticsData.timeline || [];
  const trends = analyticsData.trends || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar with Time Range Filter */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={22} color="#059669" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Analytics & Time-Series Trends</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#64748b" />
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563' }}>Filter Range:</label>
          <select
            value={selectedRange}
            onChange={handleRangeSelect}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc', fontWeight: 600 }}
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="kpi-grid">
        <div className="stat-card">
          <div className="stat-label">Total Predictions</div>
          <div className="stat-value">{analyticsData.total_predictions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Healthy Ratio</div>
          <div className="stat-value" style={{ color: '#059669' }}>{analyticsData.healthy_pct}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Fungal Ratio</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>{analyticsData.fungal_pct}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Quality Score</div>
          <div className="stat-value" style={{ color: '#059669' }}>{analyticsData.avg_quality_score || 0}/100</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Grade A Count</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{analyticsData.grade_a_count || 0}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Chart 1: Donut Chart */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '15px' }}>Healthy vs Fungal Distribution</div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Predictions Trend Bar Chart */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '15px' }}>Daily Prediction Trends (Healthy vs Fungal)</div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <BarChart data={trends.predictions_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="healthy" name="Healthy" fill="#059669" stackId="a" />
                <Bar dataKey="fungal" name="Fungal" fill="#dc2626" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Chart 3: Quality Score Trend */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '15px' }}>Quality Score Trend Over Time</div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <LineChart data={trends.quality_score_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_quality_score" name="Avg Quality Score" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Confidence Score Trend */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '15px' }}>Model Confidence Trend Over Time</div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <LineChart data={trends.confidence_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={[50, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_confidence" name="Avg Confidence %" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
