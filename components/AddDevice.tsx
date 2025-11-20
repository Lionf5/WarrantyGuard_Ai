import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Loader2, ScanLine, Save } from 'lucide-react';
import { extractWarrantyDetails } from '../services/geminiService';
import { saveDevice } from '../services/storageService';
import { Device, ExtractionResponse } from '../types';

interface AddDeviceProps {
  onComplete: () => void;
  onCancel: () => void;
}

const AddDevice: React.FC<AddDeviceProps> = ({ onComplete, onCancel }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<ExtractionResponse> | null>(null);
  const [manualEntry, setManualEntry] = useState<Partial<Device>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleProcessImage = async () => {
    if (!imagePreview) return;
    setIsProcessing(true);
    try {
      const data = await extractWarrantyDetails(imagePreview);
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
    } catch (error) {
      alert("Failed to process image. Please try again or enter details manually.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Removed 'id' generation and 'createdAt', handled by backend/service
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
    } catch (error) {
      console.error("Failed to save", error);
      alert("Failed to save device. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof Device, value: any) => {
    setManualEntry(prev => ({ ...prev, [key]: value }));
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Add New Device</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="p-6">
        {!imagePreview && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-700">Scan Bill or Warranty</h3>
            <p className="text-gray-400 text-sm mt-2">Tap to capture or upload image</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        )}

        {imagePreview && !extractedData && (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              <button 
                onClick={() => setImagePreview(null)} 
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
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

        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <Check size={20} />
                <span className="text-sm font-medium">Details extracted successfully! Review below.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Brand Name</label>
                    <input 
                        type="text" 
                        value={manualEntry.brand_name || ''} 
                        onChange={(e) => handleInputChange('brand_name', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
                    <input 
                        type="text" 
                        value={manualEntry.category || ''} 
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Purchase Date</label>
                    <input 
                        type="date" 
                        value={manualEntry.purchase_date || ''} 
                        onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                    <label className="text-xs font-medium text-gray-500 uppercase">Serial No.</label>
                    <input 
                        type="text" 
                        value={manualEntry.device_serial || ''} 
                        onChange={(e) => handleInputChange('device_serial', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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

            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
            >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSaving ? 'Saving...' : 'Save Device'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDevice;