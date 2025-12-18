import React, { useState, useEffect } from 'react';
import { useStore } from '../storeContext';
import { PurchaseOption } from '../types';
import { getProducts, ShopifyProduct } from '../services/shopifyService';
import { Check, ArrowRight, ShieldCheck, Zap, Star, Search, Activity, ArrowUpCircle, Flame, CheckCircle, MapPin, Mail, PlayCircle, Mic, Users, Microscope, Youtube, Plus, Minus } from 'lucide-react';

interface StorePageProps {
  onNavigateToEmr: () => void;
}

const StorePage: React.FC<StorePageProps> = ({ onNavigateToEmr }) => {
  const { buyItem } = useStore();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch from our Worker API instead of external service
        const response = await fetch('/api/products');
        const products = await response.json();
        setProducts(products);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBuy = async (product: any) => {
    try {
      const response = await fetch('/api/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: product.variants[0].id,
          quantity: 1
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Redirect to Shopify checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
      // Fallback to direct Shopify store
      const fallbackUrl = `https://testing-1234563457896534798625436789983.myshopify.com/cart/${product.variants[0].id}:1`;
      window.location.href = fallbackUrl;
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I collect my sample? Is it difficult?",
      answer: "Not at all. Your Gut Discovery Kit comes with a specialized, non-invasive collection tube. You only need a tiny amount of sample (about the size of a grain of rice). It takes less than 5 minutes in the privacy of your own home."
    },
    {
      question: "How long does it take to get results?",
      answer: "Once you mail back your sample using the pre-paid envelope, it takes approximately 3-4 weeks for our lab to complete the 16S rRNA sequencing and analysis. You will receive a notification as soon as your report is ready in the portal."
    },
    {
      question: "What is the difference between Option A and Option B?",
      answer: "Option A is a 'Discovery' path designed to give you data and a baseline. Option B is our 'Action' path (recommended). Option B includes the test PLUS a 20-minute 1-on-1 consultation to explain the data and a complimentary BRT check to verify your personalized supplement protocol."
    },
    {
      question: "What happens during the 20-min Personalized Consultation?",
      answer: "Our specialist will walk you through your microbiome report, highlighting key imbalances and diversity scores. We will then translate this complex data into a simple, actionable lifestyle and supplement plan tailored to your goals."
    },
    {
      question: "What is the Complimentary BRT Check?",
      answer: "Included with Option B (or the Consultation Upgrade), this is a 20-minute in-center session. We use German bio-resonance technology to verify your results and specifically test your compatibility with the recommended probiotic strains to ensure the solution is perfectly suited to your body."
    },
    {
      question: "Do I have to buy the probiotics separately?",
      answer: "Yes. Because every gut is unique, we do not bundle generic probiotics. After your consultation, your specialist will prescribe a custom blend or specific strains. You can purchase this personalized protocol directly from your portal."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-offWhite font-sans">
      {/* Hero Section - Light Theme */}
      <div className="bg-brand-light text-brand-blue pt-24 pb-48 px-4 relative overflow-hidden">
        {/* Abstract Background Shapes - Subtle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-luminous/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-brand-blue/10 text-brand-blue px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm">
             <Microscope size={16} /> Research-Driven Precision Wellness
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight text-brand-black">
            Deciphering your <span className="text-brand-blue">microbiome</span> to illuminate your health.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            We operate at the intersection of microbiology and functional wellness. Start with the gut to build your tailor-made roadmap.
          </p>
        </div>
      </div>

      {/* Pricing Section (Overlapping Hero) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 pb-20">
        {loading && <p className="text-center text-gray-600">Loading products...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {products.map((product, index) => (
              <div key={product.id} className={`bg-white rounded-2xl shadow-lg border ${index === 1 ? 'border-brand-blue ring-2 ring-brand-blue ring-opacity-50' : 'border-gray-100'} p-8 flex flex-col hover:border-brand-blue/30 transition-all group h-full relative`}>
                
                {/* Most Popular Badge for Option B */}
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-brand-blue text-white px-4 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-brand-light rounded-lg text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <Search size={24} />
                  </div>
                  <span className="text-sm font-bold text-gray-500">
                    Option {index === 0 ? 'A' : 'B'}
                  </span>
                </div>
                
                <div className="text-2xl font-bold text-brand-black mb-2">{product.title}</div>
                
                {index === 0 && (
                  <div className="text-lg text-gray-600 mb-4 font-medium">Understand Your Body</div>
                )}
                
                {index === 1 && (
                  <>
                    <div className="text-lg text-gray-600 mb-2 font-medium">Complete Action Plan + 1-on-1 Strategy Call</div>
                    <div className="text-sm text-gray-500 mb-4">(92% of customers choose this path)</div>
                  </>
                )}
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
                
                {/* Pricing */}
                <div className="mb-6">
                  {product.variants[0]?.compare_at_price && index === 1 && (
                    <>
                      <div className="text-lg text-gray-400 line-through mb-1">
                        HKD {product.variants[0].compare_at_price}
                      </div>
                      <div className="text-4xl font-bold text-brand-black mb-2">
                        HKD {product.variants[0].price}
                      </div>
                      <div className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full inline-block">
                        Year End Special Offer
                      </div>
                    </>
                  )}
                  {(!product.variants[0]?.compare_at_price || index === 0) && (
                    <div className="text-4xl font-bold text-brand-black">
                      HKD {product.variants[0]?.price}
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="mb-8 space-y-3 flex-grow">
                  {index === 0 && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">At-home microbiome collection kit</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Advanced 16S rRNA lab analysis from a clinically-trusted laboratory</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Personalized GMT Microbiome Report</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Upgrade to Option B (Complete Action Plan) anytime</span>
                      </div>
                    </>
                  )}
                  
                  {index === 1 && (
                    <>
                      <div className="text-sm font-bold text-gray-700 mb-2">Everything in Gut Discovery Kit</div>
                      <div className="text-sm text-gray-600 mb-4">Kit + Lab Analysis + Report</div>
                      <div className="text-sm font-bold text-gray-700 mb-2">PLUS</div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">20-min Personalized Consultation (Video/Phone)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Complimentary 20-min BRT Check</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 italic">
                        We use German bio-resonance technology to verify your results and confirm your personalized probiotic protocol to ensure the best solution for your body.
                      </div>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={() => handleBuy(product)}
                  className={`w-full py-4 px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                    index === 1 
                      ? 'bg-brand-blue text-white hover:bg-brand-blue/90' 
                      : 'border-2 border-brand-blue text-brand-blue hover:bg-brand-light'
                  }`}
                >
                  {index === 0 ? `Get My Gut Report – HKD ${product.variants[0]?.price}` : 'Yes! I want the Complete Action Plan'}
                  {index === 1 && product.variants[0]?.compare_at_price && (
                    <span className="text-sm">(Save HKD {(parseFloat(product.variants[0].compare_at_price) - parseFloat(product.variants[0].price)).toFixed(0)})</span>
                  )}
                  <ArrowRight size={18} />
                </button>
                
                {index === 1 && (
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Includes priority shipping & processing
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Science & Team Section */}
      <div className="bg-brand-light py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
                Scientific Leadership
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-black">
                Agile, research-driven, and moving with science.
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                At GMTCC Insight, we don't just test; we investigate. Our methods are rooted in the latest marine microbial biology and functional wellness research.
              </p>
              
              <div className="bg-white p-6 rounded-xl border-l-4 border-brand-blue shadow-sm">
                <h3 className="text-xl font-bold text-brand-black mb-2">Dr. Sanjay Nagarkar</h3>
                <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Chief Science Officer • HKU Marine Microbial Biology</p>
                <p className="text-gray-600 mb-4">
                  "Our mission is to translate complex microbiome data into actionable health strategies."
                </p>
                <button className="text-brand-blue font-bold flex items-center gap-2 hover:underline">
                  <PlayCircle size={20} /> Watch Dr. Sanjay's Latest Interview
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                 <button className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-gray-800 transition">
                    <Mic size={16} /> Listen to Podcast
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                    <Youtube size={16} /> Watch on YouTube
                 </button>
              </div>
            </div>
            
            <div className="flex-1">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-blue h-48 rounded-2xl flex items-center justify-center text-brand-luminous p-4 text-center">
                     <div>
                       <Activity size={32} className="mx-auto mb-2" />
                       <span className="font-bold">Functional Wellness</span>
                     </div>
                  </div>
                  <div className="bg-white h-48 rounded-2xl flex items-center justify-center text-brand-black p-4 text-center border border-gray-100">
                     <div>
                       <Microscope size={32} className="mx-auto mb-2 text-brand-blue" />
                       <span className="font-bold">Microbiology</span>
                     </div>
                  </div>
                  <div className="bg-white h-48 rounded-2xl flex items-center justify-center text-brand-black p-4 text-center border border-gray-100">
                     <div>
                       <Users size={32} className="mx-auto mb-2 text-brand-blue" />
                       <span className="font-bold">Personalized Care</span>
                     </div>
                  </div>
                  <div className="bg-brand-luminous h-48 rounded-2xl flex items-center justify-center text-brand-black p-4 text-center">
                     <div>
                       <Zap size={32} className="mx-auto mb-2" />
                       <span className="font-bold">Actionable Data</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-brand-black mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className={`font-bold text-lg ${openFaqIndex === index ? 'text-brand-blue' : 'text-gray-800'}`}>
                    {faq.question}
                  </span>
                  {openFaqIndex === index ? (
                    <Minus className="text-brand-blue flex-shrink-0" />
                  ) : (
                    <Plus className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-fade-in bg-gray-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners / B2B Section */}
      <div className="bg-brand-offWhite py-16 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">Trusted by our Clinical & Wellness Partners</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Mock Partner Logos using text/icons for now */}
             <div className="flex items-center gap-2 text-xl font-bold text-gray-600"><Activity /> WellnessPro</div>
             <div className="flex items-center gap-2 text-xl font-bold text-gray-600"><Users /> FamilyClinic</div>
             <div className="flex items-center gap-2 text-xl font-bold text-gray-600"><Microscope /> BioLab HK</div>
             <div className="flex items-center gap-2 text-xl font-bold text-gray-600"><Zap /> VitalityCenter</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-brand-blue text-white py-12 px-4 border-t border-brand-luminous/20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-brand-luminous">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 24L20 8L28 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="22" r="4" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-wide">GMTCC Insight</span>
            </div>
            <p className="text-gray-300 max-w-sm">
              Curating tailor-made wellness roadmaps through advanced microbiome science.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-brand-luminous mb-4 uppercase text-xs tracking-widest">Contact</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-start gap-3">
                 <MapPin size={16} className="mt-1 flex-shrink-0" />
                 <span>6/F Chung Fung Commercial Building,<br/>12 Canton Road, Tsim Sha Tsui,<br/>Hong Kong</span>
              </div>
              <div className="flex items-center gap-3">
                 <Mail size={16} flex-shrink-0 />
                 <a href="mailto:gmtcc@gmtccinsight.com" className="hover:text-white transition">gmtcc@gmtccinsight.com</a>
              </div>
            </div>
          </div>

          <div>
             <h4 className="font-bold text-brand-luminous mb-4 uppercase text-xs tracking-widest">Quick Links</h4>
             <ul className="space-y-2 text-gray-300 text-sm">
               <li><a href="#" className="hover:text-white">Our Science</a></li>
               <li><a href="#" className="hover:text-white">For Practitioners (B2B)</a></li>
               <li><a href="#" className="hover:text-white">Terms of Service</a></li>
               <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} GMTCC Insight. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default StorePage;