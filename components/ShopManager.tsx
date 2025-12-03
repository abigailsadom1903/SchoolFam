
import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  ShoppingCart, 
  Tag, 
  Package, 
  Edit2, 
  Trash2, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  X, 
  AlertCircle,
  Clock,
  MapPin,
  History,
  Sparkles,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { UserRole, ShopItem, ShopOrder, CartItem, ShopCategory, User } from '../types';

interface ShopManagerProps {
  userRole: UserRole;
  currentUser: User;
  items: ShopItem[];
  cart: CartItem[];
  orders: ShopOrder[];
  onAddItem: (item: ShopItem) => void;
  onUpdateItem: (item: ShopItem) => void;
  onDeleteItem: (id: string) => void;
  onAddToCart: (item: ShopItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  onUpdateCartQuantity: (itemId: string, quantity: number) => void;
  onCheckout: (order: ShopOrder) => void;
  onUpdateOrderStatus: (orderId: string, status: ShopOrder['status']) => void;
}

const ShopManager: React.FC<ShopManagerProps> = ({
  userRole,
  currentUser,
  items,
  cart,
  orders,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onCheckout,
  onUpdateOrderStatus
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'history' | 'inventory' | 'orders'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Parent: Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // Toast Notification State (Storing item title for message)
  const [toastItem, setToastItem] = useState<string | null>(null);

  // Teacher/Admin: Inventory Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemStock, setItemStock] = useState('');
  const [itemCategory, setItemCategory] = useState<ShopCategory>('uniform');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImage, setItemImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Permission Check
  const isStaff = userRole !== UserRole.PARENT;

  // --- Helpers ---
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const filteredItems = items.filter(i => 
    (selectedCategory === 'all' || i.category === selectedCategory) &&
    i.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (cat: ShopCategory) => {
    switch (cat) {
      case 'uniform': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'club_equipment': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'books': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'merchandise': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddToCartWithToast = (item: ShopItem) => {
    onAddToCart(item);
    setToastItem(item.title);
    
    // Clear toast after 2 seconds
    setTimeout(() => {
      setToastItem(null);
    }, 2500);
  };

  const openItemModal = (item?: ShopItem) => {
    if (item) {
      setEditingItem(item);
      setItemTitle(item.title);
      setItemPrice(item.price.toString());
      setItemStock(item.stock.toString());
      setItemCategory(item.category);
      setItemDesc(item.description);
      setItemImage(item.imageUrl);
    } else {
      setEditingItem(null);
      setItemTitle('');
      setItemPrice('');
      setItemStock('');
      setItemCategory('uniform');
      setItemDesc('');
      setItemImage('');
    }
    setIsItemModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ShopItem = {
      id: editingItem ? editingItem.id : 's_' + Date.now(),
      title: itemTitle,
      price: parseFloat(itemPrice),
      stock: parseInt(itemStock),
      category: itemCategory,
      description: itemDesc,
      imageUrl: itemImage || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400'
    };

    if (editingItem) onUpdateItem(newItem);
    else onAddItem(newItem);

    setIsItemModalOpen(false);
  };

  const handleProcessCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);
    setTimeout(() => {
      const newOrder: ShopOrder = {
        id: 'ord_' + Date.now(),
        parentId: currentUser.id,
        parentName: currentUser.name,
        items: cart,
        total: cartTotal,
        status: 'pending',
        type: 'pickup',
        timestamp: new Date().toISOString()
      };
      onCheckout(newOrder);
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setPaymentSuccess(false);
        setActiveTab('history');
      }, 1500);
    }, 1500);
  };

  // --- Render Functions ---

  const renderStaffView = () => (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'inventory' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Package size={16} /> Inventory
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Truck size={16} /> Order Fulfillment
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Stock Management</h3>
            <button 
              onClick={() => openItemModal()}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Item</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Stock</th>
                <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="p-4 flex items-center gap-3">
                    <img src={item.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <span className="font-bold text-gray-800 text-sm">{item.title}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getCategoryColor(item.category)}`}>
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium">RM{item.price.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-bold ${item.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                         {item.stock}
                       </span>
                       {item.stock < 5 && <AlertCircle size={14} className="text-red-500" />}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => openItemModal(item)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                       <button onClick={() => onDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">#{order.id.slice(-6)}</span>
                  <span className="text-xs text-gray-500">• {new Date(order.timestamp).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{order.parentName}</h3>
                <p className="text-sm text-gray-500 mb-2">
                   {order.items.length} items • Total: RM{order.total.toFixed(2)} • <span className="capitalize font-bold text-primary">{order.type}</span>
                </p>
                <div className="flex gap-2">
                   {order.items.map(i => (
                     <img key={i.id} src={i.imageUrl} className="w-8 h-8 rounded-md object-cover border border-gray-100" title={i.title} />
                   ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                   order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                   order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                   'bg-green-100 text-green-700'
                 }`}>
                   {order.status}
                 </span>
                 
                 {order.status === 'pending' && (
                   <button 
                     onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                     className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
                   >
                     Mark Ready
                   </button>
                 )}
                 {order.status === 'ready' && (
                   <button 
                     onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                     className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                   >
                     Mark Delivered
                   </button>
                 )}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
             <div className="text-center p-8 text-gray-400">No active orders found.</div>
          )}
        </div>
      )}
    </div>
  );

  const renderParentView = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-3 rounded-[1.5rem] border border-gray-100 shadow-sm sticky top-0 z-10">
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
             <button onClick={() => setActiveTab('browse')} className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'browse' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}>Browse Shop</button>
             <button onClick={() => setActiveTab('history')} className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}>My Orders</button>
          </div>
          <button 
            onClick={() => setActiveTab('cart')}
            className="relative p-3 bg-cuteYellow rounded-2xl hover:bg-yellow-100 transition-colors border border-yellow-200"
          >
            <ShoppingCart size={22} className="text-yellow-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
       </div>

       {activeTab === 'browse' && (
         <>
           {/* Filters */}
           <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                 <input 
                   type="text" 
                   value={searchTerm} 
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-[1.5rem] focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all shadow-sm"
                   placeholder="Search items..."
                 />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                 {['all', 'uniform', 'books', 'merchandise', 'club_equipment'].map(cat => (
                   <button
                     key={cat}
                     onClick={() => setSelectedCategory(cat as any)}
                     className={`px-5 py-2.5 rounded-[1rem] text-xs font-extrabold uppercase whitespace-nowrap border transition-all ${
                       selectedCategory === cat 
                         ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200 transform scale-105' 
                         : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                     }`}
                   >
                     {cat.replace('_', ' ')}
                   </button>
                 ))}
              </div>
           </div>

           {/* Grid */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-[2rem] border-4 border-white shadow-lg shadow-indigo-100 overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300 relative">
                   <div className="relative aspect-square bg-gray-50 m-2 rounded-[1.5rem] overflow-hidden">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      
                      {/* Floating Category Badge */}
                      <div className="absolute top-3 left-3">
                         <span className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full shadow-sm border border-white/50 backdrop-blur-sm ${getCategoryColor(item.category)}`}>
                           {item.category.replace('_', ' ')}
                         </span>
                      </div>

                      {item.stock < 5 && (
                        <div className="absolute bottom-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse border-2 border-white">
                          Only {item.stock} left!
                        </div>
                      )}
                   </div>
                   
                   <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                         <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Price</span>
                           <span className="text-xl font-black text-gray-900">RM{item.price.toFixed(2)}</span>
                         </div>
                         <button 
                           onClick={() => handleAddToCartWithToast(item)}
                           disabled={item.stock === 0}
                           className="bg-gray-900 text-white pl-4 pr-5 py-3 rounded-2xl hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-gray-200 active:scale-95 group/btn"
                         >
                           <Plus size={20} className="group-hover/btn:rotate-90 transition-transform" />
                           <span className="font-bold text-sm">Add</span>
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         </>
       )}

       {activeTab === 'cart' && (
         <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
               <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600"><ShoppingBag size={20}/></div>
               <h3 className="font-bold text-lg text-gray-800">Your Cart</h3>
            </div>
            {cart.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={32} className="opacity-20" />
                </div>
                <p className="font-medium">Your cart is empty.</p>
                <button onClick={() => setActiveTab('browse')} className="mt-4 text-primary font-bold hover:underline">Start Shopping</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                     <img src={item.imageUrl} className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border border-gray-100" />
                     <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{item.title}</h4>
                        <p className="text-sm text-gray-500 font-medium">RM{item.price.toFixed(2)} each</p>
                     </div>
                     <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                        <button onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg shadow-sm transition-all font-bold text-gray-600">-</button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg shadow-sm transition-all font-bold text-gray-600">+</button>
                     </div>
                     <button onClick={() => onRemoveFromCart(item.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={20} />
                     </button>
                  </div>
                ))}
                <div className="p-6 bg-gray-50">
                   <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-500 font-bold">Total Amount</span>
                      <span className="text-3xl font-black text-gray-900">RM{cartTotal.toFixed(2)}</span>
                   </div>
                   <button 
                     onClick={() => setIsCheckoutOpen(true)}
                     className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
                   >
                     Proceed to Checkout
                   </button>
                </div>
              </div>
            )}
         </div>
       )}

       {activeTab === 'history' && (
         <div className="space-y-4">
            {orders.filter(o => o.parentId === currentUser.id).length === 0 ? (
               <div className="text-center p-12 text-gray-400 bg-white rounded-[2rem] border border-gray-100">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No past orders found.</p>
               </div>
            ) : (
               orders.filter(o => o.parentId === currentUser.id).map(order => (
                 <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold text-gray-500">#{order.id.slice(-6).toUpperCase()}</span>
                             <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase border ${
                               order.status === 'delivered' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                             }`}>{order.status}</span>
                          </div>
                          <p className="text-xs font-bold text-gray-400">{new Date(order.timestamp).toLocaleString()}</p>
                       </div>
                       <span className="text-xl font-black text-gray-900">RM{order.total.toFixed(2)}</span>
                    </div>
                    <div className="space-y-3">
                       {order.items.map(i => (
                          <div key={i.id} className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-xl">
                             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-gray-400 shadow-sm">{i.quantity}x</div>
                             <span className="font-bold">{i.title}</span>
                          </div>
                       ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                       <span className="flex items-center gap-1 capitalize"><Tag size={14}/> {order.type}</span>
                       {order.status === 'delivered' && <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg"><CheckCircle size={14}/> Completed</span>}
                    </div>
                 </div>
               ))
            )}
         </div>
       )}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-tr from-pink-400 to-purple-500 text-white rounded-[1.2rem] shadow-xl shadow-purple-500/20 rotate-3">
           <ShoppingBag size={28} />
        </div>
        <div>
           <h2 className="text-3xl font-black text-gray-800 tracking-tight">School Shop</h2>
           <p className="text-gray-500 font-medium">Uniforms, Books & Club Gear</p>
        </div>
      </div>

      {isStaff ? renderStaffView() : renderParentView()}

      {/* Cute Toast Notification */}
      {toastItem && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-green-100 text-gray-800 px-6 py-4 rounded-3xl shadow-2xl shadow-green-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-500 bounce-in min-w-[300px]">
          <div className="bg-green-500 rounded-full p-2 text-white shadow-lg shadow-green-500/40">
            <CheckCircle size={20} strokeWidth={3} />
          </div>
          <div>
             <div className="flex items-center gap-1">
               <p className="font-extrabold text-sm text-gray-900">Added to Cart!</p>
               <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
             </div>
             <p className="text-xs text-gray-500 font-bold mt-0.5 truncate max-w-[200px]">{toastItem}</p>
          </div>
        </div>
      )}

      {/* Teacher: Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                 <h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                 <button onClick={() => setIsItemModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} className="text-gray-500"/></button>
              </div>
              <form onSubmit={handleItemSubmit} className="p-6 space-y-4 overflow-y-auto">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Title</label>
                    <input required type="text" value={itemTitle} onChange={e => setItemTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (RM)</label>
                      <input required type="number" step="0.01" value={itemPrice} onChange={e => setItemPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Qty</label>
                      <input required type="number" value={itemStock} onChange={e => setItemStock(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select value={itemCategory} onChange={e => setItemCategory(e.target.value as ShopCategory)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none">
                       <option value="uniform">Uniform</option>
                       <option value="books">Books</option>
                       <option value="merchandise">Merchandise</option>
                       <option value="club_equipment">Club Equipment</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea required rows={2} value={itemDesc} onChange={e => setItemDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
                 </div>
                 
                 {/* Updated Image Input Section */}
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Image</label>
                    
                    {/* Image Preview Area */}
                    <div className="flex flex-col gap-3">
                      {itemImage && (
                        <div className="relative w-full h-48 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group">
                           <img src={itemImage} alt="Preview" className="w-full h-full object-cover" />
                           <button 
                             type="button" 
                             onClick={() => setItemImage('')} 
                             className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors"
                           >
                             <X size={16} />
                           </button>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                         <div className="flex-1">
                            <div className="relative">
                               <input 
                                 type="text" 
                                 value={itemImage} 
                                 onChange={e => setItemImage(e.target.value)} 
                                 className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none" 
                                 placeholder="Paste URL..." 
                               />
                               <div className="absolute left-3 top-3.5 text-gray-400">
                                  <ImageIcon size={18} />
                               </div>
                            </div>
                         </div>
                         <button 
                           type="button"
                           onClick={() => fileInputRef.current?.click()}
                           className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-xl font-bold transition-colors flex items-center gap-2"
                         >
                           <Upload size={18} />
                           <span className="hidden sm:inline">Upload</span>
                         </button>
                         <input 
                           type="file" 
                           ref={fileInputRef} 
                           className="hidden" 
                           accept="image/*"
                           onChange={handleImageUpload}
                         />
                      </div>
                      <p className="text-[10px] text-gray-400">Paste an image URL or upload from your device.</p>
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-2">
                    {editingItem ? 'Update Item' : 'Create Item'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Parent: Checkout Modal */}
      {isCheckoutOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-gray-900 p-6 text-white flex justify-between items-start">
                 <div>
                   <h3 className="text-xl font-bold">Secure Checkout</h3>
                   <p className="text-gray-400 text-sm mt-1">Total to pay: <span className="text-white font-bold">RM{cartTotal.toFixed(2)}</span></p>
                 </div>
                 <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>

              {paymentSuccess ? (
                <div className="p-12 text-center flex flex-col items-center animate-in zoom-in duration-300">
                   <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                     <CheckCircle size={40} />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-800">Order Placed!</h3>
                   <p className="text-gray-500 font-medium mt-2">Thank you for shopping with SchoolFam.</p>
                </div>
              ) : (
                <form onSubmit={handleProcessCheckout} className="p-6 space-y-4">
                   <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start text-xs text-blue-800 mb-4">
                      <MapPin size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">School Pickup Point</p>
                        <p className="mt-1">Please collect your items from the school administrative office.</p>
                      </div>
                   </div>

                   <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1">
                         <CreditCard size={18} /> Payment Details
                      </div>
                      <input 
                        required 
                        type="text" 
                        placeholder="Card Number" 
                        value={cardNumber} 
                        onChange={e => setCardNumber(e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          required 
                          type="text" 
                          placeholder="MM/YY" 
                          value={expiry} 
                          onChange={e => setExpiry(e.target.value)} 
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <input 
                          required 
                          type="text" 
                          placeholder="CVC" 
                          value={cvc} 
                          onChange={e => setCvc(e.target.value)} 
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                   </div>

                   <button 
                     type="submit"
                     disabled={paymentProcessing}
                     className={`w-full py-4 rounded-2xl font-bold text-white transition-all mt-4 ${paymentProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-xl shadow-green-500/30'}`}
                   >
                     {paymentProcessing ? 'Processing...' : `Pay RM${cartTotal.toFixed(2)}`}
                   </button>
                </form>
              )}
           </div>
         </div>
      )}
    </div>
  );
};

export default ShopManager;
