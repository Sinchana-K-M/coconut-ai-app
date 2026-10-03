import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCard from './components/StatCard';
import ImageUploader from './components/ImageUploader';
import PredictionCard from './components/PredictionCard';
import ProcessingPipeline from './components/ProcessingPipeline';
import GradCAM from './components/GradCAM';
import Analytics from './components/Analytics';
import PredictionHistory from './components/PredictionHistory';
import ModelPerformance from './components/ModelPerformance';
import About from './components/About';
import QualityGrade from './components/QualityGrade';
import LiveCamera from './components/LiveCamera';
import BatchAnalysis from './components/BatchAnalysis';
import PredictionComparison from './components/PredictionComparison';
import ModelComparison from './components/ModelComparison';
import Reports from './components/Reports';
import AuthModal from './components/AuthModal';
import FinancialYieldCard from './components/FinancialYieldCard';
import MoldTreatmentCard from './components/MoldTreatmentCard';

import {
  getHealthStatus,
  predictCoconutImage,
  updateGradCAM,
  getPredictionHistory,
  clearPredictionHistory,
  getAnalyticsSummary,
  getModelInfo,
  downloadHistoryCSV,
  getFungalAlerts
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Grad-CAM controls state
  const [opacity, setOpacity] = useState(0.45);
  const [threshold, setThreshold] = useState(0.40);
  const [colormap, setColormap] = useState('jet');

  // Dashboard & History state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [fungalAlertCount, setFungalAlertCount] = useState(0);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('coconut_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load initial backend state
  const fetchBackendData = async (timeRange = 'all') => {
    try {
      const analytics = await getAnalyticsSummary(timeRange);
      setAnalyticsData(analytics);

      const history = await getPredictionHistory();
      setHistoryRecords(history.history || []);

      const info = await getModelInfo();
      setModelInfo(info);

      const alerts = await getFungalAlerts();
      setFungalAlertCount(alerts.alert_count || 0);
    } catch (err) {
      console.error('Backend connection error:', err);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setErrorMsg(null);

    // Automatically run prediction upon upload
    setIsLoading(true);
    try {
      const result = await predictCoconutImage(file, opacity, threshold, colormap);
      setPredictionResult(result);
      fetchBackendData(); // refresh KPI metrics & history
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to process image prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPredictionResult(null);
    setErrorMsg(null);
  };

  const handleUpdateGradCAMControls = async () => {
    if (!selectedFile || !predictionResult) return;
    setIsLoading(true);
    try {
      const res = await updateGradCAM(selectedFile, predictionResult.raw_score, opacity, threshold, colormap);
      setPredictionResult((prev) => ({
        ...prev,
        gradcam_views: res.gradcam_views,
      }));
    } catch (err) {
      console.error('Grad-CAM update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearPredictionHistory();
      fetchBackendData();
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('coconut_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('coconut_user');
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        <Header
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          fungalAlertCount={fungalAlertCount}
        />

        {/* Top KPI Cards */}
        <div className="kpi-grid">
          <StatCard label="Total Scans" value={analyticsData?.total_predictions || 0} />
          <StatCard label="Healthy Samples" value={analyticsData?.healthy_count || 0} color="#059669" />
          <StatCard label="Fungal Samples" value={analyticsData?.fungal_count || 0} color="#dc2626" />
          <StatCard label="Avg Confidence" value={`${analyticsData?.avg_confidence || 0.0}%`} color="#2563eb" />
          <StatCard label="Model Accuracy" value="92.65%" isAccuracy={true} />
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '14px', borderRadius: '8px', color: '#991b1b', marginBottom: '20px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {isLoading && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: '8px', color: '#15803d', fontWeight: 600, marginBottom: '20px' }}>
            ⏳ Processing MobileNetV2 inference & computing Grad-CAM 4-view visualizer...
          </div>
        )}

        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid-2">
              <ImageUploader
                onFileSelect={handleFileSelect}
                onReset={handleReset}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                isLoading={isLoading}
              />
              <PredictionCard
                result={predictionResult}
                onDownloadCurrentCSV={() => downloadHistoryCSV()}
              />
            </div>

            {predictionResult && (
              <>
                <QualityGrade
                  qualityScore={predictionResult.quality_score}
                  grade={predictionResult.quality_grade}
                  gradeLabel={predictionResult.quality_grade_label}
                  factors={predictionResult.quality_factors}
                />
                <FinancialYieldCard yieldData={predictionResult.yield_analysis} />
                <MoldTreatmentCard moldData={predictionResult.mold_analysis} isFungal={predictionResult.prediction === 'FUNGAL'} />
              </>
            )}

            <GradCAM
              gradcamViews={predictionResult?.gradcam_views}
              opacity={opacity}
              setOpacity={setOpacity}
              threshold={threshold}
              setThreshold={setThreshold}
              colormap={colormap}
              setColormap={setColormap}
              onUpdateGradCAM={handleUpdateGradCAMControls}
              isLoading={isLoading}
            />

            <Analytics analyticsData={analyticsData} onTimeRangeChange={(r) => fetchBackendData(r)} />
          </div>
        )}

        {/* TAB 2: ANALYZE COCONUT */}
        {activeTab === 'analyze' && (
          <div>
            <div className="grid-2">
              <ImageUploader
                onFileSelect={handleFileSelect}
                onReset={handleReset}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                isLoading={isLoading}
              />
              <PredictionCard
                result={predictionResult}
                onDownloadCurrentCSV={() => downloadHistoryCSV()}
              />
            </div>

            {predictionResult && (
              <>
                <QualityGrade
                  qualityScore={predictionResult.quality_score}
                  grade={predictionResult.quality_grade}
                  gradeLabel={predictionResult.quality_grade_label}
                  factors={predictionResult.quality_factors}
                />
                <FinancialYieldCard yieldData={predictionResult.yield_analysis} />
                <MoldTreatmentCard moldData={predictionResult.mold_analysis} isFungal={predictionResult.prediction === 'FUNGAL'} />
              </>
            )}
          </div>
        )}

        {/* TAB 3: LIVE CAMERA */}
        {activeTab === 'livecamera' && (
          <LiveCamera onPredictionComplete={() => fetchBackendData()} />
        )}

        {/* TAB 4: BATCH ANALYSIS */}
        {activeTab === 'batch' && (
          <BatchAnalysis onBatchComplete={() => fetchBackendData()} />
        )}

        {/* TAB 5: IMAGE PROCESSING PIPELINE */}
        {activeTab === 'pipeline' && (
          <ProcessingPipeline pipelineStages={predictionResult?.pipeline_stages} />
        )}

        {/* TAB 6: GRAD-CAM EXPLAINABLE AI */}
        {activeTab === 'gradcam' && (
          <GradCAM
            gradcamViews={predictionResult?.gradcam_views}
            opacity={opacity}
            setOpacity={setOpacity}
            threshold={threshold}
            setThreshold={setThreshold}
            colormap={colormap}
            setColormap={setColormap}
            onUpdateGradCAM={handleUpdateGradCAMControls}
            isLoading={isLoading}
          />
        )}

        {/* TAB 7: STANDALONE QUALITY ASSESSMENT */}
        {activeTab === 'quality' && (
          <div>
            <QualityGrade
              qualityScore={predictionResult?.quality_score || 85.0}
              grade={predictionResult?.quality_grade || 'A'}
              gradeLabel={predictionResult?.quality_grade_label || 'High Quality'}
              factors={predictionResult?.quality_factors || {
                brightness: 92.0,
                contrast: 88.0,
                sharpness: 95.0,
                blur: 94.0,
                color_consistency: 89.0,
                clarity: 91.0
              }}
            />
          </div>
        )}

        {/* TAB 8: PREDICTION COMPARISON */}
        {activeTab === 'compare' && (
          <PredictionComparison historyRecords={historyRecords} />
        )}

        {/* TAB 9: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <Analytics analyticsData={analyticsData} onTimeRangeChange={(r) => fetchBackendData(r)} />
        )}

        {/* TAB 10: PREDICTION HISTORY */}
        {activeTab === 'history' && (
          <PredictionHistory
            historyRecords={historyRecords}
            onClearHistory={handleClearHistory}
          />
        )}

        {/* TAB 11: MODEL COMPARISON */}
        {activeTab === 'modelcomparison' && (
          <ModelComparison />
        )}

        {/* TAB 12: REPORTS MANAGER */}
        {activeTab === 'reports' && (
          <Reports historyRecords={historyRecords} />
        )}

        {/* TAB 13: ABOUT PROJECT */}
        {activeTab === 'about' && (
          <About />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
