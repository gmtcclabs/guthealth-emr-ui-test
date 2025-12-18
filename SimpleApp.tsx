import React from 'react';

const SimpleApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">GutHealth EMR</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Gut Health Assessment Kit</h3>
          <p className="text-gray-600 mb-4">Comprehensive gut microbiome analysis</p>
          <div className="text-2xl font-bold text-gray-900">$199.00</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Premium Probiotic Supplement</h3>
          <p className="text-gray-600 mb-4">Advanced multi-strain probiotic formula</p>
          <div className="text-2xl font-bold text-gray-900">$49.99</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Health Consultation</h3>
          <p className="text-gray-600 mb-4">One-on-one virtual consultation</p>
          <div className="text-2xl font-bold text-gray-900">$149.00</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
