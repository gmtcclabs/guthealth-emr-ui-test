import React, { useState } from 'react';
import { useStore } from '../storeContext';
import { TestStatus, ConsultationStatus, ProbioticsStatus } from '../types';
import { Settings, X, ChevronRight, Package, Truck, UserCheck, Beaker, CheckCircle } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { user, advanceTestStatus, completeConsultation, shipProbiotics, resetSimulation } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 z-50 opacity-50 hover:opacity-100 transition-opacity"
        title="Open Admin Simulation Panel"
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold text-sm flex items-center gap-2">
           <Settings size={16} /> Admin / God Mode
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        
        {/* Test Logistics */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Logistics</h4>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => advanceTestStatus(TestStatus.RECEIVED)}
              disabled={user.testStatus !== TestStatus.ORDERED}
              className="text-xs bg-gray-100 hover:bg-gray-200 border p-2 rounded flex items-center justify-center gap-1 disabled:opacity-30"
            >
              <Package size={12} /> Deliver Kit
            </button>
            <button 
              onClick={() => advanceTestStatus(TestStatus.MAILED)}
              disabled={user.testStatus !== TestStatus.ACTIVATED}
              className="text-xs bg-gray-100 hover:bg-gray-200 border p-2 rounded flex items-center justify-center gap-1 disabled:opacity-30"
            >
              <Truck size={12} /> Mail Sample
            </button>
            <button 
              onClick={() => advanceTestStatus(TestStatus.PROCESSING)}
              disabled={user.testStatus !== TestStatus.MAILED}
              className="text-xs bg-gray-100 hover:bg-gray-200 border p-2 rounded flex items-center justify-center gap-1 disabled:opacity-30"
            >
              <Beaker size={12} /> Process Lab
            </button>
            <button 
              onClick={() => advanceTestStatus(TestStatus.READY)}
              disabled={user.testStatus !== TestStatus.PROCESSING}
              className="text-xs bg-primary text-white border border-primary p-2 rounded flex items-center justify-center gap-1 disabled:opacity-30"
            >
              <CheckCircle size={12} /> Results Ready
            </button>
          </div>
        </div>

        {/* Clinical */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clinical</h4>
          <button 
            onClick={completeConsultation}
            disabled={user.consultationStatus !== ConsultationStatus.SCHEDULED}
            className="w-full text-xs bg-gray-100 hover:bg-gray-200 border p-2 rounded flex items-center justify-center gap-1 disabled:opacity-30"
          >
            <UserCheck size={12} /> Complete Consultation
          </button>
        </div>

        {/* Probiotics */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pharmacy</h4>
          <button 
            onClick={shipProbiotics}
            disabled={user.probioticsStatus !== ProbioticsStatus.PAID}
            className="w-full text-xs bg-gray-100 hover:bg-gray-200 border p-2 rounded flex items-center justify-center gap-1 disabled:opacity-30"
          >
            <Truck size={12} /> Ship Probiotics
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100">
           <button 
            onClick={resetSimulation}
            className="w-full text-xs text-red-600 hover:bg-red-50 border border-red-200 p-2 rounded"
          >
            Reset Entire Simulation
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;