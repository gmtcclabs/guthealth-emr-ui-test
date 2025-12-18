import React, { useState } from 'react';
import { useStore } from '../storeContext';
import { ConsultationStatus, BrtStatus } from '../types';
import { Lock, CreditCard, Calendar, CheckCircle, ArrowRight, Star } from 'lucide-react';

interface ConsultationSchedulerProps {
  hasPurchasedConsultation: boolean;
  onUpgrade: () => void;
}

const ConsultationScheduler: React.FC<ConsultationSchedulerProps> = ({ hasPurchasedConsultation, onUpgrade }) => {
  const { scheduleConsultation, scheduleBrt, skipBrt, user } = useStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBrtDate, setSelectedBrtDate] = useState<string | null>(null);
  const [showBrtBooking, setShowBrtBooking] = useState(false);

  const dates = [
    { day: 'Mon', date: 'Oct 23', slots: ['09:00 AM', '02:00 PM'] },
    { day: 'Tue', date: 'Oct 24', slots: ['11:00 AM', '04:00 PM'] },
    { day: 'Wed', date: 'Oct 25', slots: ['10:00 AM', '01:00 PM'] },
  ];

  // If upgrade needed
  if (!hasPurchasedConsultation) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Clinical Care</h2>
          <p className="text-gray-600 mb-4">
            Turn your results into a personalized plan. Upgrade now to book your expert consultation.
          </p>
          <ul className="space-y-2 mb-6 text-sm text-gray-500">
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary"/> 20-minute Deep Dive Video Call</li>
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-primary"/> Custom Probiotics Prescription</li>
            <li className="flex items-center gap-2"><Star size={14} className="text-accent" fill="#E9C46A"/> Complimentary In-Center BRT Session</li>
          </ul>
        </div>
        <div className="flex-shrink-0 bg-gray-50 p-6 rounded-xl border border-gray-200 text-center w-full md:w-64">
           <div className="text-gray-500 text-sm mb-1">Consultation Upgrade</div>
           <div className="text-3xl font-bold text-secondary mb-4">HKD 1,200</div>
           <button 
            onClick={onUpgrade}
            className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
           >
             <CreditCard size={16} /> Upgrade Now
           </button>
        </div>
      </div>
    );
  }

  // 1. Consultation Scheduled View
  if (user.consultationStatus === ConsultationStatus.SCHEDULED || user.consultationStatus === ConsultationStatus.COMPLETED) {
    // Check if we need to show BRT booking option
    const showBrtOption = user.brtStatus === BrtStatus.OPTIONAL;
    
    return (
      <div className="space-y-6">
        {/* Confirmed Consultation Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation Confirmed</h2>
          <p className="text-gray-600 mb-6">You are booked with Dr. Sarah Chen.</p>
          <div className="inline-block bg-gray-50 px-6 py-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Time</div>
            <div className="text-lg font-bold text-secondary">
               {user.consultationDate?.toDateString()} at {user.consultationDate?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>

        {/* BRT Section */}
        {showBrtOption && !showBrtBooking && (
          <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                 <Star size={18} fill="currentColor" className="text-purple-300" />
                 Complimentary BRT Session
               </h3>
               <p className="text-sm text-purple-800 mt-1 max-w-lg">
                 Your plan includes a free Bio-Resonance Therapy session at our center to jumpstart your gut healing.
               </p>
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={skipBrt}
                 className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
               >
                 Maybe Later
               </button>
               <button 
                 onClick={() => setShowBrtBooking(true)}
                 className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 shadow-sm"
               >
                 Book Session
               </button>
             </div>
          </div>
        )}

        {/* BRT Scheduling UI */}
        {showBrtOption && showBrtBooking && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 animate-fade-in">
             <h3 className="font-bold text-gray-900 mb-4">Select a time for your BRT Session</h3>
             <div className="grid grid-cols-3 gap-2 mb-4">
                {['10:00 AM', '02:00 PM', '04:00 PM'].map(slot => (
                   <button
                    key={slot}
                    onClick={() => setSelectedBrtDate(`Oct 28 ${slot}`)}
                    className={`text-sm py-2 rounded border ${selectedBrtDate === `Oct 28 ${slot}` ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:border-purple-300'}`}
                   >
                     Oct 28, {slot}
                   </button>
                ))}
             </div>
             <div className="flex justify-end gap-2">
                <button onClick={() => setShowBrtBooking(false)} className="px-4 py-2 text-sm">Cancel</button>
                <button 
                  onClick={() => selectedBrtDate && scheduleBrt(new Date())}
                  disabled={!selectedBrtDate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  Confirm BRT Booking
                </button>
             </div>
           </div>
        )}

        {user.brtStatus === BrtStatus.SCHEDULED && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center gap-3">
             <CheckCircle size={20} className="text-purple-600" />
             <div>
                <div className="font-bold text-purple-900">BRT Session Scheduled</div>
                <div className="text-xs text-purple-700">See you at the center on {user.brtDate?.toLocaleDateString()}.</div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Scheduling View
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
        <Calendar className="text-primary" /> Schedule Your Consultation
      </h2>
      <p className="text-sm text-gray-600 mb-6">Select a time for your 20-minute video call with a specialist.</p>
      
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {dates.map((d) => (
          <div key={d.date} className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
            <div className="font-bold text-gray-900 mb-1">{d.day}</div>
            <div className="text-sm text-gray-500 mb-3">{d.date}</div>
            <div className="space-y-2">
              {d.slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedDate(`${d.date} ${slot}`)}
                  className={`w-full text-sm py-2 px-3 rounded border transition-colors ${
                    selectedDate === `${d.date} ${slot}`
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6">
        <button
          disabled={!selectedDate}
          onClick={() => selectedDate && scheduleConsultation(new Date())}
          className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 ${
            selectedDate 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Confirm Booking <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ConsultationScheduler;