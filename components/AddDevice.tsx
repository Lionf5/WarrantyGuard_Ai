import React, { useState, useRef } from 'react';
import { Camera, Check, X, Loader2, ScanLine, Save, RefreshCw, Upload, AlertTriangle, AlertCircle, Smile } from 'lucide-react';
import { extractWarrantyDetails } from '../services/geminiService';
import { saveDevice } from '../services/storageService';
import { Device, ExtractionResponse } from '../types';

interface AddDeviceProps {
  onComplete: () => void;
  onCancel: () => void;
}

const AddDevice: React.FC<AddDeviceProps> = ({ onComplete, onCancel }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<ExtractionResponse> | null>(null);
  const [manualEntry, setManualEntry] = useState<Partial<Device>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions or try uploading a file.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  const handleProcessImage = async () => {
    if (!imagePreview) return;
    setIsProcessing(true);
    setSaveError(null);
    setValidationMsg(null);
    setMissingFields([]);
    
    try {
      const data = await extractWarrantyDetails(imagePreview);
      
      // Check validation first
      if (!data.is_valid_document) {
        setValidationMsg(data.validation_message || "This doesn't look like a valid document.");
        setIsProcessing(false);
        return;
      }

      setExtractedData(data);
      setManualEntry({
        brand_name: data.brand_name,
        device_serial: data.device_serial,
        category: data.category,
        purchase_date: data.purchase_date,
        expiry_date: data.expiry_date,
        warranty_period: data.warranty_period,
        invoice_number: data.invoice_number,
        helpline_number: data.helpline_number,
        free_service_dates: data.free_service_dates
      });

      // Identify missing fields
      const missing: string[] = [];
      if (!data.brand_name) missing.push("Brand Name");
      if (!data.category) missing.push("Category");
      if (!data.purchase_date) missing.push("Purchase Date");
      if (!data.device_serial) missing.push("Serial No.");
      
      if (missing.length > 0) {
        setMissingFields(missing);
      }

    } catch (error) {
      setSaveError("Failed to process image with AI. You can enter details manually.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const newDevice: Omit<Device, 'id' | 'userId'> = {
        brand_name: manualEntry.brand_name || 'Unknown Brand',
        device_serial: manualEntry.device_serial || '',
        warranty_period: manualEntry.warranty_period || '',
        purchase_date: manualEntry.purchase_date || '',
        expiry_date: manualEntry.expiry_date || '',
        free_service_dates: manualEntry.free_service_dates || [],
        helpline_number: manualEntry.helpline_number || '',
        invoice_number: manualEntry.invoice_number || '',
        category: manualEntry.category || 'Appliance',
        createdAt: Date.now()
      };
      
      await saveDevice(newDevice);
      onComplete();
    } catch (error: any) {
      console.error("Failed to save", error);
      let msg = "Failed to save device.";
      if (error.code === 'permission-denied') {
        msg = "Permission denied. Please create the Firestore database in Firebase Console (Build > Firestore Database) and set rules to test mode.";
      } else if (error.message) {
        msg = error.message;
      }
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof Device, value: any) => {
    setManualEntry(prev => ({ ...prev, [key]: value }));
    
    // Remove from missing fields if user starts typing
    if (value && typeof value === 'string' && value.trim().length > 0) {
      const fieldMap: {[key: string]: string} = {
        'brand_name': 'Brand Name',
        'category': 'Category',
        'purchase_date': 'Purchase Date',
        'device_serial': 'Serial No.'
      };
      const label = fieldMap[key];
      if (label) {
        setMissingFields(prev => prev.filter(f => f !== label));
      }
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
            <div className="relative bg-white p-6 rounded-full shadow-lg border border-blue-100">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        </div>
        <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800">Analyzing Document</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">Gemini AI is reading the warranty details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 relative">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Add New Device</h2>
        <button onClick={() => { stopCamera(); onCancel(); }} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="p-6">
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2">
             <span>{saveError}</span>
          </div>
        )}

        {/* Validation Error Message (Funny) */}
        {validationMsg && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
              <Smile size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Whoops!</h3>
            <p className="text-gray-600 max-w-sm">{validationMsg}</p>
            <button 
              onClick={() => { 
                setImagePreview(null); 
                setValidationMsg(null); 
              }}
              className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again with a Real Bill
            </button>
          </div>
        )}

        {/* Initial State: Choose Option */}
        {!imagePreview && !isCameraOpen && !validationMsg && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group h-48"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <h3 className="text-base font-semibold text-gray-700">Upload File</h3>
              <p className="text-gray-400 text-xs mt-1">Select image from gallery</p>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </button>

            <button 
              onClick={startCamera}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group h-48"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <h3 className="text-base font-semibold text-gray-700">Use Camera</h3>
              <p className="text-gray-400 text-xs mt-1">Take a photo now</p>
            </button>
          </div>
        )}

        {/* Camera View */}
        {isCameraOpen && (
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] md:aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center">
               <button 
                onClick={stopCamera}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30"
               >
                 <X size={24} />
               </button>
               <button 
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent hover:bg-white/20 transition-colors"
               >
                 <div className="w-12 h-12 bg-white rounded-full"></div>
               </button>
            </div>
          </div>
        )}

        {/* Image Preview & Action */}
        {imagePreview && !extractedData && !validationMsg && (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              <button 
                onClick={() => setImagePreview(null)} 
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={handleProcessImage}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-200"
                >
                    <ScanLine size={20} />
                    Extract Details
                </button>
            </div>
          </div>
        )}

        {/* Extracted Form */}
        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <Check size={20} />
                  <span className="text-sm font-medium">Details extracted!</span>
                </div>
            </div>

            {missingFields.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100">
                 <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                 <div className="text-sm">
                    <p className="font-semibold mb-1">We couldn't find everything.</p>
                    <p className="text-amber-700">Please fill in the missing details: <strong>{missingFields.join(", ")}</strong>.</p>
                 </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Brand Name {(!manualEntry.brand_name) && <span className="text-red-500">*</span>}</label>
                    <input 
                        type="text" 
                        value={manualEntry.brand_name || ''} 
                        onChange={(e) => handleInputChange('brand_name', e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:ring-2 outline-none ${!manualEntry.brand_name ? 'border-amber-300 bg-amber-50 focus:ring-amber-500' : 'border-gray-200 focus:ring-blue-500'}`}
                        placeholder="e.g., Samsung"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Category {(!manualEntry.category) && <span className="text-red-500">*</span>}</label>
                    <input 
                        type="text" 
                        value={manualEntry.category || ''} 
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:ring-2 outline-none ${!manualEntry.category ? 'border-amber-300 bg-amber-50 focus:ring-amber-500' : 'border-gray-200 focus:ring-blue-500'}`}
                        placeholder="e.g., Refrigerator"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Purchase Date {(!manualEntry.purchase_date) && <span className="text-red-500">*</span>}</label>
                    <input 
                        type="date" 
                        value={manualEntry.purchase_date || ''} 
                        onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:ring-2 outline-none ${!manualEntry.purchase_date ? 'border-amber-300 bg-amber-50 focus:ring-amber-500' : 'border-gray-200 focus:ring-blue-500'}`}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Expiry Date</label>
                    <input 
                        type="date" 
                        value={manualEntry.expiry_date || ''} 
                        onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Serial No. {(!manualEntry.device_serial) && <span className="text-red-500">*</span>}</label>
                    <input 
                        type="text" 
                        value={manualEntry.device_serial || ''} 
                        onChange={(e) => handleInputChange('device_serial', e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:ring-2 outline-none ${!manualEntry.device_serial ? 'border-amber-300 bg-amber-50 focus:ring-amber-500' : 'border-gray-200 focus:ring-blue-500'}`}
                        placeholder="Enter serial number"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Invoice No.</label>
                    <input 
                        type="text" 
                        value={manualEntry.invoice_number || ''} 
                        onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                 <button
                    onClick={() => {
                         setExtractedData(null);
                         setManualEntry({});
                         setSaveError(null);
                         setMissingFields([]);
                    }}
                    className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50"
                 >
                    <RefreshCw size={20} />
                 </button>
                 <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? 'Saving...' : 'Save Device'}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDevice;