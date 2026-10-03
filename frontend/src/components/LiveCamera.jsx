import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, RefreshCw, Sparkles, AlertCircle, CheckCircle2, Video } from 'lucide-react';
import PredictionCard from './PredictionCard';
import QualityGrade from './QualityGrade';
import FinancialYieldCard from './FinancialYieldCard';
import MoldTreatmentCard from './MoldTreatmentCard';
import GradCAM from './GradCAM';
import { predictCoconutImage, updateGradCAM, downloadHistoryCSV } from '../api';

export default function LiveCamera({ onPredictionComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const [capturedImage, setCapturedImage] = useState(null); // base64 preview
  const [capturedFile, setCapturedFile] = useState(null);   // File object for upload
  const [predictionResult, setPredictionResult] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);

  // Grad-CAM controls
  const [opacity, setOpacity] = useState(0.45);
  const [threshold, setThreshold] = useState(0.40);
  const [colormap, setColormap] = useState('jet');

  // Enumerate video devices
  const getCameraDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.warn('Unable to enumerate camera devices:', err);
    }
  };

  useEffect(() => {
    getCameraDevices();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (deviceIdToUse = selectedDeviceId) => {
    setErrorMsg(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: deviceIdToUse
          ? { deviceId: { exact: deviceIdToUse } }
          : { facingMode: 'environment' }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Re-enumerate to get labeled camera names after permission granted
      await getCameraDevices();
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera access was denied. Please allow camera permission in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera device detected on this system.');
      } else {
        setErrorMsg(`Camera initialization error: ${err.message || 'Unable to access media stream.'}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleDeviceChange = (e) => {
    const newDeviceId = e.target.value;
    setSelectedDeviceId(newDeviceId);
    if (isCameraActive) {
      startCamera(newDeviceId);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);

    canvas.toBlob((blob) => {
      if (blob) {
        const nowStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const file = new File([blob], `camera_capture_${nowStr}.jpg`, { type: 'image/jpeg' });
        setCapturedFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setPredictionResult(null);
    if (!isCameraActive) {
      startCamera();
    }
  };

  const handleAnalyzeCapturedImage = async () => {
    if (!capturedFile) return;

    setIsLoading(true);
    setLoadingStep(1);
    setErrorMsg(null);

    try {
      const stepTimer1 = setTimeout(() => setLoadingStep(2), 300);
      const stepTimer2 = setTimeout(() => setLoadingStep(3), 600);
      const stepTimer3 = setTimeout(() => setLoadingStep(4), 900);

      const result = await predictCoconutImage(capturedFile, opacity, threshold, colormap);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setPredictionResult(result);

      if (onPredictionComplete) {
        onPredictionComplete();
      }
    } catch (err) {
      console.error('Camera image analysis error:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to analyze captured camera image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGradCAMControls = async () => {
    if (!capturedFile || !predictionResult) return;
    setIsLoading(true);
    try {
      const res = await updateGradCAM(capturedFile, predictionResult.raw_score, opacity, threshold, colormap);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Video size={28} color="#a7f3d0" />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>LIVE CAMERA ANALYSIS</h2>
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#a7f3d0' }}>
          Real-Time WebCam & Mobile Camera Capture • MobileNetV2 Inference • Image Quality Grading • Grad-CAM
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '14px', borderRadius: '8px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Camera Controls Bar */}
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {!isCameraActive ? (
              <button className="btn btn-primary" onClick={() => startCamera()}>
                <Camera size={18} />
                <span>Start Camera</span>
              </button>
            ) : (
              <button className="btn btn-secondary" style={{ backgroundColor: '#ef4444', color: '#ffffff' }} onClick={stopCamera}>
                <CameraOff size={18} />
                <span>Stop Camera</span>
              </button>
            )}

            {isCameraActive && !capturedImage && (
              <button className="btn btn-primary" style={{ backgroundColor: '#2563eb' }} onClick={captureImage}>
                <Sparkles size={18} />
                <span>Capture Image</span>
              </button>
            )}

            {capturedImage && (
              <button className="btn btn-secondary" onClick={handleRetake}>
                <RefreshCw size={18} />
                <span>Retake Photo</span>
              </button>
            )}
          </div>

          {/* Camera Selection Dropdown if multiple devices */}
          {devices.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>Switch Camera:</label>
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#f8fafc' }}
              >
                {devices.map((device, idx) => (
                  <option key={device.deviceId || idx} value={device.deviceId}>
                    {device.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Indicator */}
          <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: isCameraActive ? '#059669' : '#64748b' }}>
            <span style={{ height: '10px', width: '10px', borderRadius: '50%', backgroundColor: isCameraActive ? '#10b981' : '#94a3b8', display: 'inline-block' }} />
            {isCameraActive ? 'LIVE STREAM ACTIVE' : 'CAMERA OFF'}
          </div>
        </div>
      </div>

      {/* Camera Live View / Captured Preview Grid */}
      <div className="grid-2">
        {/* Left: Video / Capture Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card-title" style={{ width: '100%', marginBottom: '12px' }}>
            <span>Live Camera Feed</span>
          </div>

          {!capturedImage ? (
            <div style={{ position: 'relative', width: '100%', maxWidth: '520px', aspectRatio: '4/3', backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: isCameraActive ? 'block' : 'none' }}
              />

              {!isCameraActive && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                  <Camera size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Camera is currently turned off</div>
                  <div style={{ fontSize: '12.5px', marginTop: '6px', color: '#64748b' }}>Click "Start Camera" above to activate live feed</div>
                </div>
              )}

              {/* Target Box Overlay */}
              {isCameraActive && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ border: '2px dashed rgba(255,255,255,0.85)', borderRadius: '16px', width: '70%', height: '70%', boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                      Place Coconut Here
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Captured Preview */
            <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Captured Coconut Image</div>
              <img
                src={capturedImage}
                alt="Captured Coconut"
                style={{ width: '100%', height: 'auto', borderRadius: '12px', border: '2px solid #059669', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <div style={{ marginTop: '14px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={handleRetake} disabled={isLoading}>
                  <RefreshCw size={16} />
                  <span>Retake</span>
                </button>
                <button className="btn btn-primary" onClick={handleAnalyzeCapturedImage} disabled={isLoading} style={{ backgroundColor: '#059669' }}>
                  <Sparkles size={16} />
                  <span>{isLoading ? 'Analyzing...' : 'Analyze Image'}</span>
                </button>
              </div>
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
            💡 Tip: Place the coconut inside the target frame with clear lighting for accurate MobileNetV2 assessment.
          </div>
        </div>

        {/* Right: Results or Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLoading && (
            <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '24px' }}>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#15803d', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} className="spin" />
                <span>Analyzing Coconut Image...</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: loadingStep >= 1 ? 700 : 400, color: loadingStep >= 1 ? '#047857' : '#94a3b8' }}>
                  {loadingStep >= 1 ? '✓' : '○'} Stage 1: Processing video capture frame...
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: loadingStep >= 2 ? 700 : 400, color: loadingStep >= 2 ? '#047857' : '#94a3b8' }}>
                  {loadingStep >= 2 ? '✓' : '○'} Stage 2: Running MobileNetV2 CNN classification...
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: loadingStep >= 3 ? 700 : 400, color: loadingStep >= 3 ? '#047857' : '#94a3b8' }}>
                  {loadingStep >= 3 ? '✓' : '○'} Stage 3: Calculating visual quality score & Grade A/B/C...
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: loadingStep >= 4 ? 700 : 400, color: loadingStep >= 4 ? '#047857' : '#94a3b8' }}>
                  {loadingStep >= 4 ? '✓' : '○'} Stage 4: Generating 4-view Grad-CAM visual heatmaps...
                </div>
              </div>
            </div>
          )}

          <PredictionCard
            result={predictionResult}
            onDownloadCurrentCSV={() => downloadHistoryCSV()}
          />
        </div>
      </div>

      {/* Quality Grade Breakdown */}
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

      {/* Grad-CAM Explainable AI Visualizer */}
      {predictionResult && (
        <GradCAM
          gradcamViews={predictionResult.gradcam_views}
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
    </div>
  );
}
