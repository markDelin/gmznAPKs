import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Package, ShoppingCart, Plus, Edit2, Trash2, 
  Upload, Tag, DollarSign, Box, CheckCircle, Store, User 
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- Interfaces ---
interface SellerAccount {
    id: number;
    username: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image_url: string;
    created_at: string;
}

interface ProductOrder {
    id: number;
    customer_name: string;
    quantity: number;
    total_price: number;
    status: boolean;
    product_name?: string;
    created_at: string;
}

// --- Helper ---
const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Convert to compressed JPEG
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

// --- Product Form Component ---
const ProductForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<Product> | null, onSubmit: (data: Partial<Product>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Product>>(initialData || {
        name: '', description: '', price: 0, stock: 0, category: 'General', image_url: ''
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url') => {
        const file = e.target.files?.[0];
        if (file) {
             const base64 = await convertToBase64(file);
             setFormData({ ...formData, [field]: base64 });
        }
    };

    return (
        <div className="text-left space-y-4">
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Product Name</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="E.g. Router WiFi" />
             </div>
             
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Description</label>
                 <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-white focus:border-[#ff6b44] outline-none h-24"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your product..." />
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Price</label>
                     <input type="number" step="0.01" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} placeholder="0.00" />
                 </div>
                 <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 flex items-center gap-1"><Box className="w-3 h-3" /> Initial Stock</label>
                     <input type="number" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.stock || ''} onChange={e => setFormData({...formData, stock: parseInt(e.target.value, 10)})} placeholder="0" />
                 </div>
             </div>

             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Category</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="E.g. Electronics, Networking" />
             </div>

             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Product Image URL</label>
                 <div className="flex gap-2">
                     <input className="flex-1 bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-white text-sm"
                        value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="Direct Image URL..." />
                     <label className="bg-[#ff6b44] text-white px-4 rounded-xl cursor-pointer hover:bg-[#ff5528] flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5" />
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'image_url')} />
                     </label>
                 </div>
             </div>

             <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
                <button onClick={onCancel} className="px-6 py-2.5 text-gray-400 hover:text-white font-medium transition-colors">Cancel</button>
                <button 
                    onClick={() => onSubmit(formData)} 
                    disabled={!formData.name || !formData.price || formData.stock === undefined}
                    className="px-8 py-2.5 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Save Product
                </button>
            </div>
        </div>
    );
};

// --- Main Seller Dashboard Component ---
export default function SellerDashboard() {
    const navigate = useNavigate();
    const [seller, setSeller] = useState<SellerAccount | null>(null);
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
    const [isLoading, setIsLoading] = useState(true);

    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<ProductOrder[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('sellerData');
        if (!stored) {
            navigate('/seller/login');
        } else {
            setSeller(JSON.parse(stored));
        }
    }, [navigate]);

    useEffect(() => {
        if (seller) {
            if (activeTab === 'products') fetchProducts();
            if (activeTab === 'orders') fetchOrders();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seller, activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('sellerData');
        navigate('/seller/login');
    };

    // --- API Fetchers ---
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/manage-products?sellerId=${seller?.id}`, {
                headers: { 'x-seller-id': seller?.id.toString() || '' }
            });
            if (res.ok) {
                setProducts(await res.json());
            } else if (res.status === 401) {
                handleLogout();
            }
        } catch (error) {
            console.error('Fetch products error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/manage-product-orders', {
                headers: { 'x-seller-id': seller?.id.toString() || '' }
            });
            if (res.ok) {
                setOrders(await res.json());
            } else if (res.status === 401) {
                handleLogout();
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Action Handlers ---
    const apiAction = async (url: string, method: string, body: unknown, onSuccess: () => void, successMessage: string) => {
        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'x-seller-id': seller?.id.toString() || ''
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                if (successMessage) {
                    await MySwal.fire({
                        icon: 'success', title: 'Success!', text: successMessage, background: '#1a1a1a',
                        color: '#fff', confirmButtonColor: '#ff6b44', timer: 1500, timerProgressBar: true
                    });
                }
                onSuccess();
            } else {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${res.status}`);
            }
        } catch (error: any) {
             if (successMessage) {
                 MySwal.fire({ icon: 'error', title: 'Failed', text: error.message || 'Something went wrong.', background: '#1a1a1a', color: '#fff' });
             }
        }
    };

    const confirmDelete = async (action: () => void) => {
        const result = await MySwal.fire({
            title: 'Delete this item?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b44',
            cancelButtonColor: '#333',
            confirmButtonText: 'Yes, delete it!',
            background: '#1a1a1a',
            color: '#fff'
        });
        if (result.isConfirmed) action();
    };

    const openProductModal = (product: Partial<Product> | null) => {
        MySwal.fire({
            title: '', padding: 0, showConfirmButton: false, background: 'transparent',
            html: (
                <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-2xl w-[90vw] md:w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b44]/10 rounded-full blur-[80px] pointer-events-none" />
                    
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
                        {product ? <Edit2 className="w-6 h-6 text-[#ff6b44]" /> : <Plus className="w-6 h-6 text-[#ff6b44]" />}
                        {product ? 'Edit Product Template' : 'Add New Product'}
                    </h3>
                    
                    <div className="relative z-10">
                        <ProductForm 
                            initialData={product} 
                            onCancel={() => Swal.close()} 
                            onSubmit={data => {
                                apiAction(
                                    '/api/manage-products', 
                                    product?.id ? 'PUT' : 'POST', 
                                    {...data, id: product?.id}, 
                                    () => { Swal.close(); fetchProducts(); }, 
                                    product?.id ? 'Product updated successfully!' : 'Product added to marketplace!'
                                );
                            }} 
                        />
                    </div>
                </div>
            )
        });
    };

    if (!seller) return null; // Wait for redirect check

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-gray-200">
            {/* Header */}
            <header className="fixed top-0 w-full bg-[#1a1a1a]/80 backdrop-blur-xl border-b border-white/5 z-40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#ff6b44] to-[#ff4010] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Store className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-white text-lg leading-tight">Vendor Portal</h1>
                            <p className="text-xs text-[#ff6b44] font-bold">@{seller.username}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <main className="pt-28 pb-12 max-w-7xl mx-auto px-6">
                
                {/* Tabs & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex bg-[#1a1a1a] p-1.5 rounded-2xl border border-white/5 inline-flex">
                        <button 
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'products' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Package className="w-4 h-4" /> My Products
                        </button>
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ShoppingCart className="w-4 h-4" /> Orders
                            {orders.filter(o => !o.status).length > 0 && (
                                <span className="ml-1 bg-white text-[#ff6b44] text-[10px] px-1.5 py-0.5 rounded-full">{orders.filter(o => !o.status).length}</span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'products' && (
                        <button 
                            onClick={() => openProductModal(null)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {isLoading ? (
                         <div className="flex justify-center py-20">
                             <div className="ld-rh3"><div></div><div></div></div>
                         </div>
                    ) : (
                        <>
                            {/* --- PRODUCTS DIRECTORY --- */}
                            {activeTab === 'products' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.length === 0 ? (
                                        <div className="col-span-full py-20 text-center bg-[#1a1a1a] rounded-3xl border border-white/5">
                                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                            <h3 className="text-xl font-bold text-white mb-2">No products yet</h3>
                                            <p className="text-gray-500 text-sm">Create your first product listing to start selling.</p>
                                        </div>
                                    ) : (
                                        products.map(product => (
                                            <div key={product.id} className="bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/5 group hover:border-[#ff6b44]/30 transition-all flex flex-col">
                                                <div className="aspect-[4/3] bg-black/50 relative overflow-hidden">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                            <Package className="w-12 h-12" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3 flex gap-2">
                                                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-white/10">
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-2 gap-4">
                                                        <h3 className="font-black text-white text-lg truncate" title={product.name}>{product.name}</h3>
                                                        <span className="font-bold text-[#ff6b44]">₱{product.price}</span>
                                                    </div>
                                                    <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">
                                                        {product.description || 'No description provided.'}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                            <Box className="w-3.5 h-3.5" />
                                                            {product.stock} in stock
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => openProductModal(product)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => confirmDelete(() => apiAction('/api/manage-products', 'DELETE', {id: product.id}, fetchProducts, 'Product Deleted!'))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* --- ORDERS TRACKER --- */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    {orders.length === 0 ? (
                                        <div className="py-20 text-center bg-[#1a1a1a] rounded-3xl border border-white/5">
                                            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                            <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                                            <p className="text-gray-500 text-sm">When customers buy your products, they will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {orders.map(order => (
                                                <div key={order.id} className={`bg-[#1a1a1a] p-6 rounded-3xl border transition-all relative overflow-hidden group ${order.status ? 'border-emerald-500/20 opacity-75' : 'border-white/10 hover:border-[#ff6b44]/30'}`}>
                                                    
                                                    {/* Glow accent */}
                                                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none transition-colors ${order.status ? 'bg-emerald-500/10' : 'bg-[#ff6b44]/10 group-hover:bg-[#ff6b44]/20'}`} />

                                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <User className="w-4 h-4 text-gray-500" />
                                                                <h4 className="font-bold text-white leading-none">{order.customer_name}</h4>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-6">
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${order.status ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                                            {order.status ? 'Fulfilled' : 'Pending'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3 relative z-10">
                                                        <div className="bg-[#0f0f0f] p-3 rounded-xl border border-white/5">
                                                            <p className="text-xs text-gray-500 mb-1">Product</p>
                                                            <p className="font-bold text-sm text-gray-200 truncate" title={order.product_name || `Product`}>
                                                                {order.product_name || <span className="text-red-400 italic">Deleted Product</span>}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <div className="bg-[#0f0f0f] p-3 rounded-xl border border-white/5 flex-1">
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Qty</p>
                                                                <p className="font-black text-white text-lg leading-none">{order.quantity}</p>
                                                            </div>
                                                            <div className="bg-[#0f0f0f] p-3 rounded-xl border border-white/5 flex-1 items-end flex justify-between flex-col items-start">
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Total</p>
                                                                <p className="font-black text-[#ff6b44] text-lg leading-none">₱{order.total_price}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex gap-2 relative z-10">
                                                        <button 
                                                            onClick={async () => {
                                                                await apiAction('/api/manage-product-orders', 'PUT', {id: order.id, status: !order.status}, fetchOrders, '');
                                                            }}
                                                            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all border ${order.status ? 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700 hover:text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            {order.status ? 'Revert to Pending' : 'Mark Fulfilled'}
                                                        </button>
                                                        <button 
                                                            onClick={() => confirmDelete(() => apiAction('/api/manage-product-orders', 'DELETE', {id: order.id}, fetchOrders, 'Order Deleted'))}
                                                            className="px-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors flex items-center justify-center"
                                                            title="Delete Order Record"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
