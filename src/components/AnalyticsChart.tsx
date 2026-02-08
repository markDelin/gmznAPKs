
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'framer-motion';

interface AnalyticsProps {
    orders: any[];
}

export const AnalyticsChart = ({ orders }: AnalyticsProps) => {
    // 1. Process Data for Sales over Time
    const salesData = orders.reduce((acc: any[], order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        const existing = acc.find(i => i.date === date);
        if (existing) {
            existing.sales += 1;
            // Assuming we have price in order, or we count quantity
            existing.quantity += (order.quantity || 1);
        } else {
            acc.push({ date, sales: 1, quantity: order.quantity || 1 });
        }
        return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Process Data for Top Products
    const productData = orders.reduce((acc: any[], order) => {
        const existing = acc.find(i => i.name === order.product_name);
        if (existing) {
            existing.count += (order.quantity || 1);
        } else {
            acc.push({ name: order.product_name, count: order.quantity || 1 });
        }
        return acc;
    }, []).sort((a: any, b: any) => b.count - a.count).slice(0, 5); // Top 5

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 p-6 rounded-xl shadow-lg"
            >
                <h3 className="text-white font-bold mb-4">Sales Trend</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                            <YAxis stroke="#94a3b8" tick={{fontSize: 12}} allowDecimals={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#818cf8' }}
                            />
                            <Line type="monotone" dataKey="quantity" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900 border border-white/10 p-6 rounded-xl shadow-lg"
            >
                <h3 className="text-white font-bold mb-4">Top Products</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" stroke="#94a3b8" hide />
                            <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 11}} />
                            <Tooltip 
                                cursor={{fill: '#1e293b'}}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};
