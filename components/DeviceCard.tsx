import React from 'react';
import { Device } from '../types';
import { Smartphone, Tv, Calculator, Calendar, Phone, Hash, AlertCircle, FileText, Clock } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onDelete: (id: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onDelete }) => {
  const today = new Date();
  const expiryDate = device.expiry_date ? new Date(device.expiry_date) : null;
  const isExpired = expiryDate ? expiryDate < today : false;
  
  const daysRemaining = expiryDate 
    ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Determine status color and label
  let statusColor = "bg-green-100 text-green-700";
  let statusLabel = "Active";

  if (isExpired) {
    statusColor = "bg-gray-100 text-gray-600";
    statusLabel = "Expired";
  } else if (daysRemaining !== null && daysRemaining <= 60) {
    statusColor = "bg-orange-100 text-orange-700";
    statusLabel = `Expiring in ${daysRemaining} days`;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-600'}`}>
             <Tv size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1" title={device.brand_name}>{device.brand_name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{device.category || 'Appliance'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="space-y-1">
          <p className="text-gray-400 text-xs flex items-center gap-1"><Calendar size={12}/> Purchase Date</p>
          <p className="font-medium text-gray-700">{device.purchase_date || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-400 text-xs flex items-center gap-1"><Clock size={12}/> Warranty Until</p>
          <p className={`font-medium ${daysRemaining !== null && daysRemaining < 60 && !isExpired ? 'text-orange-600' : 'text-gray-700'}`}>
            {device.expiry_date || 'N/A'}
          </p>
        </div>
      </div>

      <div className="space-y-2 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 mb-4 flex-grow">
        <div className="flex justify-between items-center">
           <span className="flex items-center gap-1 text-gray-400"><Hash size={12}/> Serial</span>
           <span className="font-mono text-gray-800 select-all truncate max-w-[120px]" title={device.device_serial}>{device.device_serial || '—'}</span>
        </div>
        <div className="flex justify-between items-center">
           <span className="flex items-center gap-1 text-gray-400"><FileText size={12}/> Invoice</span>
           <span className="font-mono text-gray-800 select-all truncate max-w-[120px]" title={device.invoice_number}>{device.invoice_number || '—'}</span>
        </div>
        <div className="flex justify-between items-center">
           <span className="flex items-center gap-1 text-gray-400"><Phone size={12}/> Helpline</span>
           {device.helpline_number ? (
             <a href={`tel:${device.helpline_number}`} className="text-indigo-600 hover:underline font-medium">{device.helpline_number}</a>
           ) : (
             <span>—</span>
           )}
        </div>
      </div>
      
      {device.free_service_dates && device.free_service_dates.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wider flex items-center gap-1">
            <Calendar size={10} /> Service Schedule
          </p>
          <div className="flex flex-wrap gap-2">
            {device.free_service_dates.map((date, idx) => {
              const serviceDate = new Date(date);
              const isServicePassed = serviceDate < today;
              return (
                <span 
                  key={idx} 
                  className={`px-2 py-1 text-xs rounded border ${
                    isServicePassed 
                    ? 'bg-gray-100 text-gray-400 border-gray-200' 
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}
                >
                  {date}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-2">
        <button 
            onClick={() => onDelete(device.id)}
            className="w-full py-2 text-red-600 border border-red-100 bg-red-50 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
        >
          Delete Device
        </button>
      </div>
    </div>
  );
};

export default DeviceCard;