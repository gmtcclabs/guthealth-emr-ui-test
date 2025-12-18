import React, { useState, useEffect } from 'react';
import { useStore } from '../storeContext';
import { TestStatus, ConsultationStatus, PurchaseOption, BrtStatus, ProbioticsStatus } from '../types';
import { Package, Thermometer, TestTube, FileText, Calendar, Truck, ArrowRight, Lock, Play, AlertCircle, CheckCircle, Pill, ClipboardCheck, Sparkles, UserCheck } from 'lucide-react';
import ResultsView from './ResultsView';
import ConsultationScheduler from './ConsultationScheduler';
import ProbioticsView from './ProbioticsView';
import AdminPanel from './AdminPanel';

const EmrDashboard: React.FC = () => {
  const { user, advanceTestStatus, buyItem, completeQuestionnaire } = useStore();
  const [activeTab, setActiveTab] = useState<'timeline' | 'results' | 'consultation' | 'probiotics'>('timeline');

  // Helper to determine active view based on status
  const isResultsReady = user.testStatus === TestStatus.READY;
  const hasConsultation = user.consultationStatus !== ConsultationStatus.NONE;
  
  // Handlers for simulation buttons
  const handleActivateKit = () => advanceTestStatus(TestStatus.ACTIVATED);

  // Upgrade flow
  const handleUpgrade = () => {
    if (confirm("Redirecting to Shopify Checkout...\n\nCharge HKD 1,200 for Consultation Upgrade?")) {
      buyItem(PurchaseOption.UPGRADE);
      setActiveTab('consultation');
    }
  };

  // Step Status Helper
  const getStepState = (stepIndex: number) => {
    // Current Progress Logic
    let isComplete = false;
    let isActive = false;

    // Step 0: Ordered (Always true if we are in dashboard)
    if (stepIndex === 0) {
      isComplete = true;
    }
    
    // Step 1: Kit Received
    if (stepIndex === 1) {
      if (user.testStatus !== TestStatus.ORDERED) isComplete = true;
      if (user.testStatus === TestStatus.ORDERED) isActive = true; // Wait for receive
      if (user.testStatus === TestStatus.RECEIVED) isActive = true; // Wait for activate
    }

    // Step 2: Mailed
    if (stepIndex === 2) {
      if (user.testStatus === TestStatus.MAILED || user.testStatus === TestStatus.PROCESSING || user.testStatus === TestStatus.READY) isComplete = true;
      if (user.testStatus === TestStatus.ACTIVATED) isActive = true;
    }

    // Step 3: Processing
    if (stepIndex === 3) {
      if (user.testStatus === TestStatus.READY) isComplete = true;
      if (user.testStatus === TestStatus.PROCESSING) isActive = true;
    }

    // Step 4: Results Ready
    if (stepIndex === 4) {
      if (user.testStatus === TestStatus.READY) isComplete = true; // It's a milestone, stays complete/active
      if (user.testStatus === TestStatus.PROCESSING) isActive = false; // Waiting
    }

    // Step 5: Schedule Consultation
    if (stepIndex === 5) {
      if (user.consultationStatus === ConsultationStatus.SCHEDULED || user.consultationStatus === ConsultationStatus.COMPLETED) isComplete = true;
      if (user.testStatus === TestStatus.READY && user.consultationStatus !== ConsultationStatus.SCHEDULED && user.consultationStatus !== ConsultationStatus.COMPLETED) isActive = true;
    }

    // Step 6: BRT
    if (stepIndex === 6) {
      if (user.brtStatus === BrtStatus.SCHEDULED || user.brtStatus === BrtStatus.COMPLETED || user.brtStatus === BrtStatus.SKIPPED) isComplete = true;
      if (user.consultationStatus === ConsultationStatus.SCHEDULED && user.brtStatus === BrtStatus.OPTIONAL) isActive = true;
    }

    // Step 7: Protocol
    if (stepIndex === 7) {
      if (user.probioticsStatus !== ProbioticsStatus.NONE) isComplete = true;
      if (user.consultationStatus === ConsultationStatus.COMPLETED) isActive = true;
    }

    return { isComplete, isActive };
  };

  const renderTimelineStep = (index: number, icon: React.ReactNode, title: string, subtitle: string, action?: React.ReactNode) => {
    const { isComplete, isActive } = getStepState(index);
    const isFuture = !isComplete && !isActive;

    return (
      <div className="relative pl-20 pb-10 last:pb-0">
        {/* Connector Line */}
        <div className={`absolute left-8 top-2 bottom-0 w-0.5 ${isFuture ? 'bg-gray-100' : 'bg-brand-blue/20'}`}></div>
        
        {/* Status Dot */}
        <div className={`absolute left-5 w-6 h-6 rounded-full border-4 z-10 transition-colors duration-300
          ${isComplete ? 'border-brand-blue bg-brand-blue' : ''}
          ${isActive ? 'border-brand-blue bg-white animate-pulse' : ''}
          ${isFuture ? 'border-gray-200 bg-gray-50' : ''}
        `}>
          {isComplete && <CheckCircle size={14} className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />}
        </div>

        <div className={`flex flex-col transition-opacity duration-300 ${isFuture ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg ${isActive ? 'text-brand-blue' : 'text-gray-900'}`}>{title}</span>
            {isActive && <span className="bg-brand-blue/10 text-brand-blue text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Current Step</span>}
          </div>
          <span className="text-sm text-gray-500 mt-1 max-w-xl leading-relaxed">{subtitle}</span>
          
          {/* Action Area */}
          {(isActive || isComplete) && action && (
            <div className="mt-4 animate-fade-in">
              {action}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTimeline = () => (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-brand-black mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
          <Truck className="text-brand-blue" /> Your Journey Status
        </h2>
        
        <div className="relative">
          {/* Absolute connecting line fix for full height */}
          <div className="absolute left-8 top-2 bottom-6 w-0.5 bg-gray-100 -z-0"></div>

          {/* 1. Order Placed */}
          {renderTimelineStep(0, <Package />, "Order Placed", "Your kit is on its way.")}

          {/* 2. Kit Received */}
          {renderTimelineStep(1, <Package />, "Kit Received", "Collect your stool sample at home.", (
             user.testStatus === TestStatus.RECEIVED && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 max-w-sm">
                <label className="block text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Action Required</label>
                <div className="flex gap-2">
                  <input type="text" defaultValue="GUT-HK-88219" className="flex-1 text-sm border-blue-200 rounded-lg shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue/20 p-2 text-gray-600" disabled />
                  <button onClick={handleActivateKit} className="bg-brand-blue text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-blue/90 font-semibold shadow-sm">
                    Activate Kit
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">Scan the QR code on your tube to find your ID.</p>
              </div>
            )
          ))}

          {/* 3. Sample Returned */}
          {renderTimelineStep(2, <Truck />, "Sample Returned & Kit Confirmed", "GMTCC will review your sample & details and prepare for lab processing.")}

          {/* 4. Lab Processing */}
          {renderTimelineStep(3, <TestTube />, "Lab Processing", "Our scientists are sequencing your microbiome.", (
             user.testStatus === TestStatus.PROCESSING && (
               <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                 Sequencing in progress...
               </div>
             )
          ))}

          {/* 5. Results Ready */}
          {renderTimelineStep(4, <FileText />, "Results Ready", "Your insights are available in the Results tab.", (
             user.testStatus === TestStatus.READY && (
               <button 
                onClick={() => setActiveTab('results')} 
                className="text-white bg-brand-blue hover:bg-brand-blue/90 px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-brand-blue/20 inline-flex items-center gap-2 transition-all"
               >
                 View My Results <ArrowRight size={16} />
               </button>
             )
          ))}

          {/* 6. Schedule Consultation */}
          {renderTimelineStep(5, <UserCheck />, "Schedule Your Consultation", "Book your 1-on-1 session with a specialist.", (
             user.testStatus === TestStatus.READY && user.consultationStatus !== ConsultationStatus.SCHEDULED && user.consultationStatus !== ConsultationStatus.COMPLETED && (
               <button 
                onClick={() => setActiveTab('consultation')} 
                className="text-brand-black bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-lg text-sm font-bold inline-flex items-center gap-2 transition-all"
               >
                 <Calendar size={16} /> Book Appointment
               </button>
             )
          ))}

          {/* 7. BRT Session */}
          {renderTimelineStep(6, <Sparkles />, "Schedule Complimentary BRT Check", "Bio-resonance verification of your results.", (
             user.consultationStatus === ConsultationStatus.SCHEDULED && user.brtStatus === BrtStatus.OPTIONAL && (
                <button 
                  onClick={() => setActiveTab('consultation')}
                  className="text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-5 py-2.5 rounded-lg text-sm font-bold inline-flex items-center gap-2 transition-all"
                >
                  <Sparkles size={16} /> Book Free Session
                </button>
             )
          ))}

          {/* 8. Protocol Confirmed */}
          {renderTimelineStep(7, <ClipboardCheck />, "Protocol Confirmed", "Your personalized probiotic and supplement protocol is confirmed and ready to start your journey.", (
              user.probioticsStatus !== ProbioticsStatus.NONE && (
                 <button 
                  onClick={() => setActiveTab('probiotics')}
                  className="text-white bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg text-sm font-bold shadow-md inline-flex items-center gap-2 transition-all"
                 >
                   <Pill size={16} /> Order Supplements
                 </button>
              )
          ))}

        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Admin Panel */}
      <AdminPanel />

      {/* Action Required Banner for Questionnaire */}
      {user.questionnaireStatus && !user.questionnaireStatus.completed && user.testStatus !== TestStatus.NONE && (
         <div className="mb-6 bg-brand-luminous/20 border border-brand-luminous rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
               <div className="bg-brand-luminous p-2 rounded-full text-brand-blue">
                 <ClipboardCheck size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-brand-black">Pending Action: Health Questionnaire</h3>
                  <p className="text-sm text-gray-700">Please complete your intake form to help Dr. Chen prepare for your consultation.</p>
               </div>
            </div>
            <button 
              onClick={completeQuestionnaire}
              className="whitespace-nowrap bg-brand-blue text-white px-5 py-2 rounded-lg font-bold hover:bg-brand-blue/90 shadow-sm"
            >
              Fill Out Now
            </button>
         </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Your Health Journey</h1>
          <p className="text-gray-500">Manage your kit, view results, and connect with specialists.</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package size={16} /> Status
          </button>
          <button
            onClick={() => isResultsReady && setActiveTab('results')}
            disabled={!isResultsReady}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'results'
                ? 'border-brand-blue text-brand-blue'
                : !isResultsReady 
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TestTube size={16} /> Results
            {!isResultsReady && <Lock size={12} className="ml-1" />}
          </button>
          
          {/* Consultation Tab - Logic: Enabled if purchased OR if ready to upgrade */}
          <button
            onClick={() => setActiveTab('consultation')}
            disabled={!hasConsultation && !isResultsReady}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'consultation'
                ? 'border-brand-blue text-brand-blue'
                : (!hasConsultation && !isResultsReady)
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar size={16} /> Consultation
            {(!hasConsultation && !isResultsReady) && <Lock size={12} className="ml-1" />}
          </button>

           <button
            onClick={() => setActiveTab('probiotics')}
            disabled={user.consultationStatus !== ConsultationStatus.COMPLETED}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'probiotics'
                ? 'border-brand-blue text-brand-blue'
                : user.consultationStatus !== ConsultationStatus.COMPLETED
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Pill size={16} /> Probiotics
            {user.consultationStatus !== ConsultationStatus.COMPLETED && <Lock size={12} className="ml-1" />}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'timeline' && renderTimeline()}
        {activeTab === 'results' && (
          <ResultsView 
            onScheduleClick={() => setActiveTab('consultation')} 
            onUpgrade={handleUpgrade}
          />
        )}
        {activeTab === 'consultation' && (
          <ConsultationScheduler 
            hasPurchasedConsultation={hasConsultation}
            onUpgrade={handleUpgrade}
          />
        )}
        {activeTab === 'probiotics' && (
          <ProbioticsView />
        )}
      </div>
    </div>
  );
};

export default EmrDashboard;