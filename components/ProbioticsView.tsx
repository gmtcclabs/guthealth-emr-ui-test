import React from 'react';
import { useStore } from '../storeContext';
import { ProbioticsStatus } from '../types';
import { Pill, CheckCircle, Truck, ShoppingCart } from 'lucide-react';

const ProbioticsView: React.FC = () => {
  const { user, purchaseProbiotics } = useStore();
  
  if (user.probioticsStatus === ProbioticsStatus.NONE) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
        <Pill className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Recommendations Yet</h3>
        <p className="mt-1 text-sm text-gray-500">Your specialist will create your custom protocol after your consultation.</p>
      </div>
    );
  }

  if (user.probioticsStatus === ProbioticsStatus.RECOMMENDED) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-gray-100">
           <h2 className="text-xl font-bold text-gray-900">Your Personalized Protocol</h2>
           <p className="text-gray-600 text-sm mt-1">Based on your consultation, Dr. Chen recommends the following formula.</p>
        </div>
        
        <div className="p-6">
          <div className="flex gap-6 mb-8">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
               <Pill size={32} className="text-primary" />
            </div>
            <div>
               <h3 className="font-bold text-lg">Custom Blend #442</h3>
               <p className="text-sm text-gray-500 mb-2">Daily Synbiotic • 30 Day Supply</p>
               <div className="text-sm text-gray-700 space-y-1">
                 <div>• Lactobacillus Rhamnosus (for sensitivity)</div>
                 <div>• Bifidobacterium Longum (for diversity)</div>
                 <div>• Acacia Fiber Prebiotic</div>
               </div>
               <div className="mt-4 font-bold text-xl text-secondary">HKD 850</div>
            </div>
          </div>
          
          <button 
            onClick={purchaseProbiotics}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} /> Purchase & Ship
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
           {user.probioticsStatus === ProbioticsStatus.SHIPPED ? <Truck size={24} /> : <CheckCircle size={24} />}
        </div>
        <div>
           <h2 className="text-lg font-bold text-gray-900">
             {user.probioticsStatus === ProbioticsStatus.SHIPPED ? "Order Shipped" : "Order Confirmed"}
           </h2>
           <p className="text-sm text-gray-600">
             {user.probioticsStatus === ProbioticsStatus.SHIPPED ? "Your supplements are on the way." : "Your supplements are being prepared."}
           </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
         <div className="flex justify-between text-sm">
           <span className="text-gray-500">Order #</span>
           <span className="font-medium">HK-99212</span>
         </div>
         <div className="flex justify-between text-sm">
           <span className="text-gray-500">Item</span>
           <span className="font-medium">Custom Blend #442</span>
         </div>
         <div className="flex justify-between text-sm">
           <span className="text-gray-500">Status</span>
           <span className={`font-bold ${user.probioticsStatus === ProbioticsStatus.SHIPPED ? 'text-green-600' : 'text-orange-500'}`}>
             {user.probioticsStatus === ProbioticsStatus.SHIPPED ? 'In Transit' : 'Compounding'}
           </span>
         </div>
      </div>
    </div>
  );
};

export default ProbioticsView;