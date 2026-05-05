import { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Store() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [recentOrders, setRecentOrders] = useState<{name: string, quantity: number, created_at: string, status?: boolean}[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [availableStock, setAvailableStock] = useState<number | null>(null);

  // Marketplace State
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderProcessing, setOrderProcessing] = useState(false);

  const images = [
      '/rj45_premium.png',
      '/rj45_scattered.png',
  ];

  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      
      fetchRecentOrders();
      fetchSettings();
      fetchMarketplaceProducts();

      return () => clearInterval(timer);
  }, [images.length]);

  const fetchMarketplaceProducts = async () => {
      try {
          const res = await fetch('/api/manage-products');
          if (res.ok) {
              setProducts(await res.json());
          }
      } catch (err) {
          console.error("Failed to fetch products", err);
      } finally {
          setLoadingProducts(false);
      }
  };

  const fetchSettings = async () => {
       try {
           const res = await fetch('/api/get-settings');
           if (res.ok) {
               const data = await res.json();
               if (data.rj45_stock !== undefined) {
                   setAvailableStock(parseInt(data.rj45_stock, 10));
               }
           }
       } catch (err) {
           console.error('Failed to fetch settings', err);
       }
  };

  const fetchRecentOrders = async () => {
      try {
          const res = await fetch('/api/get-orders');
          if (res.ok) {
              const data = await res.json();
              setRecentOrders(data);
          }
      } catch (err) {
          console.error("Failed to fetch recent orders", err);
      } finally {
          setLoadingOrders(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;
    
    // Validate even numbers
    if (parseInt(quantity, 10) % 2 !== 0) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    if (availableStock !== null && parseInt(quantity, 10) > availableStock) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
        return;
    }
    
    setStatus('submitting');
    
    try {
      // 1. Submit to the backend database (Neon Postgres) via API Route
      const dbResponse = await fetch('/api/manage-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity: parseInt(quantity, 10) })
      });

      if (!dbResponse.ok) {
        console.warn("Failed to insert into Neon DB");
      }

      // 2. Submit to Netlify Forms (URL-encoded)
      const formData = new URLSearchParams();
      formData.append('form-name', 'rj45-orders');
      formData.append('name', name);
      formData.append('quantity', quantity);

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      setStatus('success');
      
      if (availableStock !== null) {
          setAvailableStock(prev => Math.max(0, prev! - parseInt(quantity, 10)));
      }
      
      fetchRecentOrders(); // Refresh the list after successful order
    } catch (error) {
      console.error("Order error", error);
      setStatus('error');
    }
  };

  const handleProductOrder = async () => {
      if (!selectedProduct || !name || orderQuantity <= 0) return;
      setOrderProcessing(true);

      try {
          const res = await fetch('/api/manage-product-orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  product_id: selectedProduct.id,
                  seller_id: selectedProduct.seller_id,
                  customer_name: name,
                  quantity: orderQuantity,
                  total_price: selectedProduct.price * orderQuantity
              })
          });

          if (res.ok) {
              alert('Order placed successfully!');
              setSelectedProduct(null);
              setName('');
              setOrderQuantity(1);
              fetchMarketplaceProducts(); // Refresh stock
          } else {
              const data = await res.json();
              alert(data.error || 'Failed to place order');
          }
      } catch (error) {
          alert('Network error. Failed to communicate with server.');
      } finally {
          setOrderProcessing(false);
      }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col p-4 relative overflow-hidden bg-slate-950 pb-24">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg mx-auto mt-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden shadow-indigo-500/10">
          
          <div className="h-4 bg-gradient-to-r from-indigo-500 via-sky-500 to-blue-600 relative overflow-hidden flex items-center justify-center" />

          <div className="p-8 md:p-10 pt-12 relative">
            <div className="absolute -top-12 left-0 right-0 flex justify-center w-full">
            </div>

            <div className="w-full aspect-square mb-6 rounded-2xl overflow-hidden shadow-xl border border-white/10 relative group bg-black">
                <AnimatePresence mode="popLayout">
                    <motion.img 
                        key={currentImageIndex}
                        src={images[currentImageIndex]} 
                        alt="Premium RJ45 Connector" 
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="w-full h-full object-cover absolute inset-0"
                    />
                </AnimatePresence>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                    {images.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/30'}`} />
                    ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent z-10 pointer-events-none" />
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Premium Quality</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">RJ45 Connectors</h1>
              <p className="text-slate-400 text-sm mb-3">Fill out the form below to place your order. Networking made flawless.</p>
              <div className="flex justify-center items-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                     <span className="text-emerald-400 font-black text-lg">₱2</span>
                     <span className="text-emerald-500/80 text-xs font-bold uppercase tracking-wider">per piece</span>
                  </div>
                  {availableStock !== null && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl ml-2 text-left">
                         <span className="text-orange-400 font-black text-lg">{availableStock}</span>
                         <span className="text-orange-500/80 text-xs font-bold uppercase tracking-wider text-left leading-tight">in<br/>stock</span>
                      </div>
                  )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h2>
                  <p className="text-slate-400 mb-8 px-4">Your order has been recorded successfully. We will prepare it shortly.</p>
                  <button 
                    onClick={() => {
                      setStatus('idle');
                      setName('');
                      setQuantity('');
                    }}
                    className="px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold rounded-xl transition-all w-full"
                  >
                    Place Another Order
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                    <input 
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm font-medium"
                      readOnly={status === 'submitting'}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Quantity (pcs)</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm font-medium"
                      readOnly={status === 'submitting'}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[10, 50, 100, 500].map(qty => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setQuantity(qty.toString())}
                          className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg transition-colors border border-indigo-500/20"
                        >
                          +{qty}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-2">* Orders must be in even quantities.</p>
                  </div>

                  {quantity && parseInt(quantity, 10) > 0 && (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest">Total Price</span>
                          <span className="text-xl font-black text-emerald-400">
                             ₱{(parseInt(quantity, 10) * 2).toLocaleString()}
                          </span>
                      </div>
                  )}

                  {status === 'error' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-medium">
                      {availableStock !== null && quantity && parseInt(quantity, 10) > availableStock 
                          ? `Cannot order more than ${availableStock} pieces in stock.`
                          : 'Quantity must be an even number, or an error occurred.'}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status === 'submitting' || !name || !quantity}
                    className="w-full relative overflow-hidden group py-4 bg-white hover:bg-slate-100 text-black font-black rounded-xl transition-all disabled:opacity-70 disabled:hover:bg-white mt-4 flex items-center justify-center"
                  >
                    {status === 'submitting' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center gap-2">
                          Submit Order
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Recent Orders Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6"
        >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Recent Orders
            </h3>
            
            {loadingOrders ? (
                <div className="flex justify-center py-6">
                    <div className="ld-rh3" style={{ '--ld-size': '24px' } as React.CSSProperties}><div></div><div></div></div>
                </div>
            ) : recentOrders.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                    No recent orders to show.
                </div>
            ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {recentOrders.map((order, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950/50 border border-white/5 rounded-xl p-3">
                            <div>
                                <p className="text-slate-300 font-medium text-sm">{order.name}</p>
                                <p className="text-[10px] text-slate-500">
                                    {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-indigo-400 font-black">{order.quantity} pcs</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
      </motion.div>

      {/* --- MARKETPLACE SECTION --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mt-20">
          <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-4">Partner Marketplace</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Discover amazing digital products and tools crafted by verified GMZN developers.</p>
          </div>

          {loadingProducts ? (
              <div className="flex justify-center py-20">
                  <div className="ld-rh3"><div></div><div></div></div>
              </div>
          ) : products.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-md">
                  <p className="text-slate-500">No partner products available at the moment.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                      <div key={product.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group hover:border-indigo-500/50 transition-all shadow-xl">
                          <div className="aspect-[4/3] bg-black/50 relative overflow-hidden">
                              {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-800 bg-slate-950">
                                      <span className="font-bold tracking-widest uppercase opacity-50 text-xs">No Image</span>
                                  </div>
                              )}
                              <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                                      {product.category}
                                  </span>
                              </div>
                              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-xs font-bold text-slate-300">By {product.seller_username}</span>
                              </div>
                          </div>
                          <div className="p-6 flex flex-col h-[220px]">
                              <div className="flex justify-between items-start mb-2 gap-4">
                                  <h3 className="font-black text-white text-lg leading-tight line-clamp-2" title={product.name}>{product.name}</h3>
                                  <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shadow-inner">
                                      ₱{product.price}
                                  </span>
                              </div>
                              <p className="text-slate-400 text-xs line-clamp-3 mb-4 flex-1">
                                  {product.description}
                              </p>
                              
                              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                  <span className={`text-xs font-bold uppercase tracking-wider ${product.stock > 0 ? 'text-indigo-400' : 'text-red-400'}`}>
                                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                  </span>
                                  <button 
                                      disabled={product.stock === 0}
                                      onClick={() => {
                                          setSelectedProduct(product);
                                          setOrderQuantity(1);
                                          setName(''); // Reset name field when opening modal
                                      }}
                                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-500/20"
                                  >
                                      Purchase
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* --- PRODUCT ORDER MODAL --- */}
      <AnimatePresence>
          {selectedProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div 
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => !orderProcessing && setSelectedProduct(null)}
                  />
                  <motion.div 
                      className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl overflow-hidden"
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  >
                      {/* Glow Behind Modal */}
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />

                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <h3 className="text-2xl font-black text-white mb-1 leading-tight">{selectedProduct.name}</h3>
                            <p className="text-emerald-400 font-bold">₱{selectedProduct.price} each</p>
                         </div>
                      </div>

                      <div className="space-y-5">
                          <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                              <p className="text-sm text-slate-400 flex justify-between items-center font-medium">
                                  Seller: <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg">{selectedProduct.seller_username}</span>
                              </p>
                              <p className="text-sm text-slate-400 flex justify-between items-center font-medium mt-2">
                                  Available: <span className={`font-bold ${selectedProduct.stock > 0 ? 'text-indigo-400' : 'text-red-400'}`}>{selectedProduct.stock} pcs</span>
                              </p>
                          </div>

                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Your Name</label>
                              <input 
                                  required
                                  type="text"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="Enter your full name"
                                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                  readOnly={orderProcessing}
                              />
                          </div>
                          
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Quantity</label>
                              <div className="flex items-center gap-4">
                                  <input 
                                      type="number" 
                                      min="1" 
                                      max={selectedProduct.stock}
                                      value={orderQuantity}
                                      onChange={(e) => setOrderQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), selectedProduct.stock))}
                                      className="w-24 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none text-center font-black text-lg"
                                      disabled={orderProcessing}
                                  />
                                  <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-right">
                                      <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block mb-0.5 mt-[-2px]">Total</span>
                                      <span className="text-xl font-black text-indigo-400 leading-none block">₱{(selectedProduct.price * orderQuantity).toLocaleString()}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-3 mt-8">
                          <button 
                              disabled={orderProcessing}
                              onClick={() => setSelectedProduct(null)} 
                              className="flex-1 py-3 text-slate-400 hover:text-white font-semibold transition-colors rounded-xl hover:bg-white/5"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleProductOrder}
                              disabled={!name || orderQuantity <= 0 || orderProcessing}
                              className="flex-[2] py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 flex justify-center items-center"
                          >
                              {orderProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
}
