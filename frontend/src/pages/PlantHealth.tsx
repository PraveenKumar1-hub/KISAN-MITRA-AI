import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { analyzePlantHealth, fetchModelInfo } from '../services/plantHealthService';
import type { PlantHealthAnalysisResponse, ModelMetadata } from '../types/plantHealth';
import {
  UploadCloud,
  FileImage,
  X,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  Activity,
  AlertCircle,
  AlertTriangle,
  Cpu
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['image/jpeg', 'image/jpg', 'image/png'];

export default function PlantHealth() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<PlantHealthAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelMetadata | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchModelInfo()
      .then((info) => setModelInfo(info))
      .catch((err) => console.error('Failed to load model metadata:', err));
  }, []);

  const validateFile = (file: File): boolean => {
    if (!file) return false;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = extension && ['jpg', 'jpeg', 'png'].includes(extension);
    const isMimeValid = ALLOWED_EXTENSIONS.includes(file.type.toLowerCase());

    if (!isMimeValid && !isExtensionValid) {
      toast.error('Please upload a JPG, JPEG, or PNG image.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Image size must be less than 5 MB.');
      return false;
    }

    if (file.size === 0) {
      toast.error('The selected file is empty. Please choose a valid image.');
      return false;
    }

    return true;
  };

  const handleFileSelection = (file: File) => {
    if (!validateFile(file)) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResponse(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResponse(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzePlantHealth(selectedFile);
      setResponse(data);
      if (data.model_info) {
        setModelInfo(data.model_info);
      }
      toast.success('Image verified and evaluated successfully.');
    } catch (err: unknown) {
      const anyErr = err as { response?: { status?: number; data?: { detail?: string } } };
      let message =
        anyErr.response?.data?.detail ||
        'Unable to process plant image. Please verify the file and try again.';
      if (anyErr.response?.status === 401) {
        message = 'Your session has expired or requires authentication. Please log in again.';
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Plant Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Upload a crop leaf image to analyze plant health and detect diseases.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start shadow-2xs">
          <Activity className="w-4 h-4 text-rose-600" />
          <span className="text-xs font-semibold text-slate-700">Computer Vision Pipeline</span>
        </div>
      </div>

      {/* 2. Main Upload / Analysis Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="hidden"
          id="crop-leaf-input"
        />

        {/* State A: Upload Area */}
        {!selectedFile && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50/60'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-800">
              Drag and drop your crop leaf image here
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              or click to browse your local device
            </p>

            <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors">
              <FileImage className="w-4 h-4" />
              <span>Browse Image</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <span>Supported formats: JPG, JPEG, PNG</span>
              <span>&bull;</span>
              <span>Max file size: 5 MB</span>
            </div>
          </div>
        )}

        {/* State B: Image Selected -> Preview & Actions */}
        {selectedFile && previewUrl && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl border border-slate-200 bg-slate-50/40">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
                <img
                  src={previewUrl}
                  alt="Crop Leaf Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3 text-center md:text-left">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Selected Image
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5 truncate max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type || 'image'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 inline-flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 pt-1">
                  Ensure the leaf is well lit, in focus, and occupies the center of the frame.
                </p>
              </div>
            </div>

            {/* Analyze Action Bar */}
            {!response && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  id="analyze-plant-health-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-70 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing image...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Plant Health</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* State C: Processing State */}
        {loading && (
          <div className="mt-6 p-6 rounded-xl border border-slate-200 bg-slate-50/60 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="text-sm font-bold text-slate-800">Analyzing image...</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Validating image integrity, normalizing dimensions (224x224 RGB), and running computer vision pipeline.
            </p>
          </div>
        )}

        {/* State D: Model Unavailable State */}
        {response && response.status === 'model_unavailable' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 space-y-4">
              <div className="flex items-start space-x-3 pb-4 border-b border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Image uploaded & validated successfully.
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Plant disease detection model is currently unavailable.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  No trained machine learning weights binary is installed in the repository yet. Kisan Mitra AI strictly avoids fabricating fake diagnoses or random confidence percentages.
                </p>
              </div>

              {response.image_details && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Verified Image Parameters
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Status</span>
                      <span className="text-xs font-semibold text-emerald-700 flex items-center mt-0.5">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Valid Image
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Format</span>
                      <span className="text-xs font-semibold text-slate-800 mt-0.5">
                        {response.image_details.format}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Dimensions</span>
                      <span className="text-xs font-semibold text-slate-800 mt-0.5">
                        {response.image_details.width} &times; {response.image_details.height} px
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Processed Size</span>
                      <span className="text-xs font-semibold text-slate-800 mt-0.5">
                        {response.image_details.size_kb} KB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Analyze Another Leaf
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State E: Low Confidence State */}
        {response && response.status === 'low_confidence' && response.result && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Low-Confidence Result
                </h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Confidence: {(response.result.confidence * 100).toFixed(1)}%
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {response.result.recommendation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white rounded-lg border border-amber-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Potential Plant</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{response.result.plant}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-amber-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Candidate Condition</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{response.result.disease}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Upload Clearer Image
              </button>
            </div>
          </div>
        )}

        {/* State F: Successful Prediction State (Real Model Inference) */}
        {response && response.status === 'success' && response.result && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Plant Health Analysis
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {response.result.disease}
                </h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Confidence: {(response.result.confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500 block">Host Plant:</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {response.result.plant}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500 block">Severity:</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {response.result.advisory?.severity || 'Moderate'}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500 block">Status:</span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                  Verified Detection
                </span>
              </div>
            </div>

            {/* Advisory Section */}
            {response.result.advisory && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Agronomic Advisory & Management
                </h4>

                {response.result.advisory.symptoms && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-slate-800 block">Symptoms:</span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {response.result.advisory.symptoms}
                    </p>
                  </div>
                )}

                {response.result.advisory.prevention && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-slate-800 block">Prevention:</span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {response.result.advisory.prevention}
                    </p>
                  </div>
                )}

                {response.result.advisory.general_management && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-slate-800 block">Field Management:</span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {response.result.advisory.general_management}
                    </p>
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-primary-50/70 border border-primary-100 space-y-1">
                  <span className="text-xs font-bold text-primary-900 block">Treatment Guidance:</span>
                  <p className="text-xs text-primary-800 leading-relaxed">
                    {response.result.advisory.treatment_guidance ||
                      'Detailed treatment guidance is not available yet. Please consult a local agricultural expert.'}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Analyze Another Image
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-900">Upload error</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Model Information Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Detection Model
            </h4>
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              modelInfo?.model_available
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {modelInfo?.model_available ? 'Model Online' : 'Model Offline'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-400 block">Model Status</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {modelInfo?.model_available ? 'Available' : 'Currently unavailable'}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-400 block">Architecture</span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate" title={modelInfo?.model_type}>
              {modelInfo?.model_type || 'Convolutional Network'}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-400 block">Confidence Threshold</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {modelInfo ? `${(modelInfo.confidence_threshold * 100).toFixed(0)}%` : '65%'}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-400 block">Supported Formats</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {modelInfo?.supported_formats.join(', ') || 'JPG, JPEG, PNG'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Guidelines & Photography Tips */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Crop Photography Best Practices
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800 block">Optimal Lighting</span>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Photograph the leaf in natural daylight without direct heavy glare or deep shadows.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800 block">Close Focus</span>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Keep the camera 10–15 cm away, focusing directly on the leaf surface or lesion.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800 block">Single Leaf</span>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Avoid capturing multiple overlapping leaves or excessive background soil/weeds.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Professional Information Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 flex items-start space-x-3 text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-slate-500">
          Plant health analysis processes images in temporary memory and discards them immediately after feature extraction to protect farmer data privacy. No images are permanently stored.
        </p>
      </div>
    </div>
  );
}
