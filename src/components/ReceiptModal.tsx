import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Printer } from 'lucide-react';

interface OrderDetails {
    items: { name: string; quantity: number; price: number }[];
    total: number;
    transaction_fee: number;
    date: string;
}

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    referenceCode: string;
    orderDetails: OrderDetails;
    buyerName: string;
    buyerPhone: string;
}

export const ReceiptModal = ({ isOpen, onClose, referenceCode, orderDetails, buyerName, buyerPhone }: ReceiptModalProps) => {
    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none"
                    id="receipt-content"
                >
                    {/* Header */}
                    <div className="bg-[#CE0E2D] p-6 text-center text-white relative">
                        <div className="absolute top-4 right-4 print:hidden">
                             <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <X className="w-5 h-5"/>
                             </button>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Check className="w-6 h-6 text-[#CE0E2D] stroke-[3]" />
                        </div>
                        <h2 className="text-xl font-bold">Payment Successful</h2>
                        <p className="text-white/80 text-sm">Thank you for your purchase!</p>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-6 bg-slate-50">
                        {/* Reference Code */}
                        <div className="text-center mb-6">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Reference Code</p>
                            <p className="text-lg font-mono font-bold text-slate-800 break-all">{referenceCode}</p>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-200">
                                <span className="text-slate-500">Date</span>
                                <span className="font-medium text-slate-700">{new Date(orderDetails.date).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-200">
                                <span className="text-slate-500">Billed To</span>
                                <div className="text-right">
                                    <p className="font-medium text-slate-700">{buyerName}</p>
                                    <p className="text-xs text-slate-500">{buyerPhone}</p>
                                </div>
                            </div>
                            
                            {/* Items */}
                            <div className="py-2 border-b border-slate-200">
                                <p className="text-slate-500 mb-2">Order Summary</p>
                                {orderDetails.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between mb-1 last:mb-0">
                                        <span className="text-slate-700">{item.name} <span className="text-xs text-slate-400">x{item.quantity}</span></span>
                                        <span className="font-medium text-slate-700">
                                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="pt-2">
                                <div className="flex justify-between mb-1 text-slate-500 text-xs">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(orderDetails.total - orderDetails.transaction_fee)}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-slate-500 text-xs">
                                    <span>Transaction Fee</span>
                                    <span>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(orderDetails.transaction_fee)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#CE0E2D]/5 p-3 rounded-lg border border-[#CE0E2D]/10">
                                    <span className="font-bold text-[#CE0E2D]">Total Paid</span>
                                    <span className="text-xl font-bold text-[#CE0E2D]">
                                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(orderDetails.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-slate-100 print:hidden">
                        <button 
                             onClick={handlePrint}
                             className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 mb-2"
                        >
                            <Printer className="w-4 h-4"/> Print Receipt
                        </button>
                        <p className="text-center text-[10px] text-slate-400">
                            A copy has been sent to your email.
                        </p>
                    </div>
                </motion.div>

                {/* Print Styles */}
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #receipt-content, #receipt-content * {
                            visibility: visible;
                        }
                        #receipt-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            box-shadow: none !important;
                        }
                    }
                `}</style>
            </div>
        </AnimatePresence>
    );
};
