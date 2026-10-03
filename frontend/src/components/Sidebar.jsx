import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Camera,
  Layers, 
  Workflow,
  Flame, 
  Award,
  GitCompare,
  BarChart3, 
  History, 
  Cpu, 
  FileText,
  Binary,
  Info 
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyze', label: 'Analyze Coconut', icon: Search },
  { id: 'livecamera', label: 'Live Camera', icon: Camera },
  { id: 'batch', label: 'Batch Analysis', icon: Layers },
  { id: 'pipeline', label: 'Image Processing', icon: Workflow },
  { id: 'gradcam', label: 'Grad-CAM', icon: Flame },
  { id: 'quality', label: 'Quality Assessment', icon: Award },
  { id: 'compare', label: 'Prediction Comparison', icon: GitCompare },
  { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
  { id: 'history', label: 'Prediction History', icon: History },
  { id: 'modelcomparison', label: 'Model Comparison', icon: Cpu },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'about', label: 'About Project', icon: Info },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span style={{ fontSize: '32px' }}>🥥</span>
        <div>
          <div className="sidebar-title">Coconut AI</div>
          <div style={{ fontSize: '12px', color: '#a7f3d0' }}>Quality & Fungal System</div>
        </div>
      </div>

      <ul className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div><strong>Model:</strong> MobileNetV2-V2</div>
        <div><strong>Accuracy:</strong> 92.65% (68 Test Img)</div>
      </div>
    </aside>
  );
}
