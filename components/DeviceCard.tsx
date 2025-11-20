import React from 'react';
import { Device } from '../types';
import { Smartphone, Tv, Calculator, Calendar, Phone, Hash, AlertCircle } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onDelete: (id: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onDelete }) => {
  const isExpired = device.expiry_date ? new Date(device.expiry_date) < new Date() : false;
  const daysRemaining = device.expiry_date 
    ? Math.ceil((new Date(device.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
             <Tv size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{device.brand_name}</h3>
            <p className="text-sm text-gray-500">{device.category || 'Appliance'}</p>
          </div>
        </div>
        {isExpired ? (
          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Expired</span>
        ) : (
          <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">Active</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="space-y-1">
          <p className="text-gray-400 text-xs flex items-center gap-1"><Calendar size={12}/> Purchase Date</p>
          <p className="font-medium text-gray-700">{device.purchase_date || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> Expires On</p>
          <p className={`font-medium ${daysRemaining && daysRemaining < 60 ? 'text-orange-500' : 'text-gray-700'}`}>
            {device.expiry_date || 'N/A'}
          </p>
        </div>
      </div>

      <div className="space-y-2 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 mb-4">
        <div className="flex justify-between">
           <span className="flex items-center gap-1 text-gray-400"><Hash size={12}/> Serial</span>
           <span className="font-mono text-gray-800 select-all">{device.device_serial || 'Unknown'}</span>
        </div>
        <div className="flex justify-between">
           <span className="flex items-center gap-1 text-gray-400"><Phone size={12}/> Helpline</span>
           <a href={`tel:${device.helpline_number}`} className="text-blue-600 hover:underline">{device.helpline_number || 'N/A'}</a>
        </div>
      </div>
      
      {device.free_service_dates && device.free_service_dates.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wider">Free Service Schedule</p>
          <div className="flex flex-wrap gap-2">
            {device.free_service_dates.map((date, idx) => (
              <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded border border-indigo-100">
                {date}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button 
            onClick={() => onDelete(device.id)}
            className="w-full py-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default DeviceCard;
