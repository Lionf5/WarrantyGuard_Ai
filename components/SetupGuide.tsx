import React from 'react';
import { Shield, Database, Key, ExternalLink, AlertTriangle } from 'lucide-react';

const SetupGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Setup Required</h1>
          </div>
          <p className="text-indigo-100">
            To secure your data, you need to connect your own Google Firebase project.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">1</div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Firebase Project</h3>
              <p className="text-gray-600 mb-4">
                Go to the Firebase Console and create a new project for WarrantyGuard.
              </p>
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:underline"
              >
                Visit Firebase Console <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">2</div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Configuration Keys</h3>
              <ol className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                <li>Click the <strong>Settings (Gear)</strong> icon {'>'} <strong>Project settings</strong>.</li>
                <li>Scroll down to <strong>Your apps</strong>.</li>
                <li>Click the <strong>Web icon (&lt;/&gt;)</strong> to register the app.</li>
                <li>Copy the <code>firebaseConfig</code> object provided.</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">3</div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-1 font-medium text-gray-800">
                    <Key size={16} /> Authentication
                  </div>
                  <p className="text-xs text-gray-500">Enable <strong>Google</strong> and <strong>Email/Password</strong> providers in the Authentication tab.</p>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-1 font-medium text-gray-800">
                    <Database size={16} /> Firestore Database
                  </div>
                  <p className="text-xs text-gray-500">Create a database in <strong>Test Mode</strong> to start storing device info.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
             <AlertTriangle className="text-yellow-600 flex-shrink-0" />
             <div className="text-sm text-yellow-800">
                <strong>Action Needed:</strong> Open <code>services/firebase.ts</code> in the file editor and replace the placeholder values with your copied keys.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;