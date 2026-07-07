import { useState, useEffect, useRef } from "react";
import { CustomerLayout } from "../../components/CustomerLayout";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { useSearchParams, useLocation } from "react-router-dom";
import { SELLER_SIDEBAR, ADMIN_SIDEBAR, WAREHOUSE_SIDEBAR, SHIPPER_SIDEBAR } from "../../constants/sidebar";
import { 
  SendIcon, 
  MessageSquareIcon, 
  SearchIcon,
  ClockIcon,
  UserIcon,
  ShoppingBagIcon,
  XIcon,
  ImageIcon
} from "lucide-react";

export function Chat() {
  const { user, token } = useAuth();
  const { settings } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const contactIdFromUrl = searchParams.get("contactId");
  const orderIdFromUrl = searchParams.get("orderId");
  const [pinnedOrder, setPinnedOrder] = useState<any>(null);

  const getContactDisplayName = (contact: any) => {
    if (!contact) return "";
    if (contact.role === "admin") {
      return settings.siteName || "Cửa hàng";
    }
    return contact.name;
  };

  useEffect(() => {
    if (orderIdFromUrl && token) {
      const fetchPinnedOrder = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderIdFromUrl}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setPinnedOrder(data);
          }
        } catch (err) {
          console.error("Error fetching pinned order:", err);
        }
      };
      fetchPinnedOrder();
    } else {
      setPinnedOrder(null);
    }
  }, [orderIdFromUrl, token]);

  const isDashboard = location.pathname.startsWith("/seller") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/shipper");
  const isWarehouse = user?.role === "warehouse";
  const isShipper = user?.role === "shipper";
  const sidebarItems = location.pathname.startsWith("/admin")
    ? ADMIN_SIDEBAR
    : isWarehouse
      ? WAREHOUSE_SIDEBAR
      : isShipper
        ? SHIPPER_SIDEBAR
        : SELLER_SIDEBAR;
  const dashboardRole = location.pathname.startsWith("/admin")
    ? "Admin"
    : isWarehouse
      ? "Warehouse"
      : isShipper
        ? "Shipper"
        : "Seller";

  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    // Nếu số lượng tin nhắn tăng lên
    if (messages.length > prevMsgCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      const isMe = lastMsg?.sender === user?.id || lastMsg?.sender === (user as any)?._id;
      
      const container = chatContainerRef.current;
      const isNearBottom = container 
        ? container.scrollHeight - container.scrollTop - container.clientHeight < 150 
        : true;

      // Tự động cuộn nếu mình là người gửi HOẶC đang ở gần đáy hộp chat
      if (isMe || isNearBottom) {
        scrollToBottom(prevMsgCountRef.current === 0 ? "auto" : "smooth");
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, user]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const contactList = Array.isArray(data) ? data : [];
      setContacts(contactList);

      // Nếu có contactId từ URL, kiểm tra xem nó có trong list chưa
      if (contactIdFromUrl) {
        const existing = contactList.find((c: any) => c._id === contactIdFromUrl);
        if (existing) {
          setSelectedContact(existing);
        } else {
          // Fetch thông tin contact mới nãy chưa có trong hội thoại
          const resContact = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/contact/${contactIdFromUrl}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resContact.ok) {
            const newContact = await resContact.json();
            setContacts(prev => [newContact, ...prev]);
            setSelectedContact(newContact);
          }
        }
      } else if (!isDashboard) {
        // Khách hàng đi trực tiếp vào Chat mà không có contactId từ URL.
        // Luôn ưu tiên kết nối với người bán mặc định (hoặc người bán hoạt động)
        // để tránh việc bị kẹt chat với tài khoản Admin cũ khi đã có Seller hoạt động.
        try {
          const resDefault = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/default-seller`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resDefault.ok) {
            const defaultSeller = await resDefault.json();
            const existing = contactList.find((c: any) => c._id === defaultSeller._id);
            if (existing) {
              setSelectedContact(existing);
            } else {
              setContacts(prev => [defaultSeller, ...prev]);
              setSelectedContact(defaultSeller);
            }
          } else if (contactList.length > 0) {
            setSelectedContact(contactList[0]);
          }
        } catch (err) {
          console.error("Error fetching default seller:", err);
          if (contactList.length > 0) {
            setSelectedContact(contactList[0]);
          }
        }
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchMessages = async (otherId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${otherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) fetchContacts();
  }, [token, contactIdFromUrl]);

  useEffect(() => {
    let interval: any;
    if (selectedContact && token) {
      fetchMessages(selectedContact._id);
      interval = setInterval(() => fetchMessages(selectedContact._id), 5000);
    }
    return () => clearInterval(interval);
  }, [selectedContact, token]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setImagePreview(data.url);
      } else {
        alert("Tải hình ảnh lên thất bại.");
      }
    } catch (err) {
      console.error("Error uploading message image:", err);
      alert("Đã xảy ra lỗi khi tải hình ảnh lên.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imagePreview) || !selectedContact || !token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          receiverId: selectedContact._id, 
          content: newMessage,
          image: imagePreview || undefined,
          orderId: orderIdFromUrl || undefined 
        })
      });
      if (res.ok) {
        setNewMessage("");
        setImagePreview(null);
        fetchMessages(selectedContact._id);
      }
    } catch (err) { console.error(err); }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatContent = (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/20 overflow-hidden border border-indigo-50 flex h-[700px] max-h-[80vh]">
        {/* Inbox List */}
        {isDashboard && (
          <div className="w-80 border-r border-indigo-50 flex flex-col bg-white">
            <div className="p-8 border-b border-indigo-50">
              <h3 className="text-xl font-black text-gray-900 mb-6">Trò chuyện</h3>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm người nhắn..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-indigo-200">
                  <div className="animate-pulse bg-indigo-50 h-10 w-full rounded-2xl mb-2"></div>
                  <div className="animate-pulse bg-indigo-50 h-10 w-full rounded-2xl mb-2"></div>
                  <div className="animate-pulse bg-indigo-50 h-10 w-full rounded-2xl"></div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <MessageSquareIcon className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm font-bold">Chưa có liên hệ nào</p>
                </div>
              ) : filteredContacts.map(c => (
                <button
                  key={c._id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-[1.25rem] transition-all duration-300 transform ${
                    selectedContact?._id === c._id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' 
                    : 'hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 active:scale-95'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${c.name}&background=random&color=fff&bold=true`} 
                      className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`font-bold truncate ${selectedContact?._id === c._id ? 'text-white' : 'text-gray-900'}`}>
                      {c.name}
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${selectedContact?._id === c._id ? 'text-indigo-200' : 'text-indigo-400 opacity-60'}`}>
                      {c.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat View */}
        <div className="flex-1 flex flex-col bg-gray-50/30">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="px-8 py-6 bg-white border-b border-indigo-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                       src={`https://ui-avatars.com/api/?name=${getContactDisplayName(selectedContact)}&background=6366f1&color=fff&bold=true`} 
                      className="w-11 h-11 rounded-2xl border-2 border-indigo-50 shadow-sm" 
                    />
                    <div className="absolute -top-1 -right-1 p-1 bg-green-500 rounded-lg animate-pulse border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 tracking-tight">{getContactDisplayName(selectedContact)}</p>
                    <p className="text-[10px] text-green-600 font-black uppercase flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                      Đang Trực Tuyến
                    </p>
                  </div>
                </div>
                <button className="p-2.5 text-indigo-400 hover:text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 rounded-xl transition-all">
                  <ClockIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Pinned Order Card */}
              {pinnedOrder && (
                <div className="px-8 py-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <ShoppingBagIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn hàng</span>
                        <span className="font-mono text-sm font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                          #{pinnedOrder._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-semibold max-w-md truncate">
                        Sản phẩm: {pinnedOrder.products?.map((p: any) => `${p.product?.name} (x${p.quantity})`).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng tiền</p>
                      <p className="text-sm font-black text-red-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pinnedOrder.totalAmount || 0)}
                      </p>
                    </div>
                    <button 
                      onClick={() => setPinnedOrder(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                      title="Bỏ ghim"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                    <UserIcon className="h-16 w-16 mb-4" />
                    <p className="font-bold text-center">Bắt đầu cuộc trò chuyện với<br/>{getContactDisplayName(selectedContact)}</p>
                  </div>
                ) : messages.map(m => {
                  const isMe = m.sender === user?.id || m.sender === (user as any)?._id;
                  return (
                    <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-6 py-4 rounded-3xl shadow-sm relative group overflow-hidden ${
                        isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100' 
                        : 'bg-white text-gray-900 rounded-tl-none border border-indigo-50 shadow-sm'
                      }`}>
                        <div className={`absolute top-0 h-full w-1 ${isMe ? 'right-0 bg-white/20' : 'left-0 bg-indigo-100'}`}></div>
                        {m.image && (
                          <img 
                            src={m.image} 
                            alt="Sent attachment" 
                            className="max-w-full rounded-2xl mb-2 object-cover max-h-60 cursor-zoom-in hover:opacity-90 transition-opacity border border-indigo-50"
                            onClick={() => window.open(m.image, "_blank")}
                          />
                        )}
                        {m.content && <p className="text-sm font-medium leading-relaxed">{m.content}</p>}
                        {m.order && (
                          <div className={`mt-2 mb-1 p-2 rounded-xl text-xs flex flex-col ${
                            isMe ? 'bg-indigo-700/50 text-indigo-100' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <div className="flex justify-between font-bold">
                              <span>Đơn hàng #{m.order._id?.slice(-8).toUpperCase()}</span>
                              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.order.totalAmount || 0)}</span>
                            </div>
                            {m.order.products && m.order.products.length > 0 && (
                              <p className="text-[10px] mt-0.5 opacity-90 truncate">
                                {m.order.products.map((p: any) => p.product?.name).join(", ")}
                              </p>
                            )}
                          </div>
                        )}
                        <p className={`text-[9px] mt-2 font-bold tracking-widest ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-8 bg-white border-t border-indigo-50 shadow-inner flex flex-col space-y-4">
                {imagePreview && (
                  <div className="relative w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden border border-indigo-100 shadow-sm group">
                    <img src={imagePreview} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <form 
                  onSubmit={handleSendMessage} 
                  className="flex items-center space-x-4 h-16"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-full px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 rounded-2xl font-bold transition-all flex items-center justify-center disabled:opacity-50"
                    title="Đính kèm hình ảnh"
                  >
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </button>

                  <div className="flex-1 flex items-center bg-gray-50 border-2 border-transparent focus-within:border-indigo-100 focus-within:bg-white rounded-2xl px-6 h-full transition-all shadow-inner overflow-hidden">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Viết tin nhắn cho người bán..."
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-3"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim() && !imagePreview}
                    className="h-full px-8 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center group"
                  >
                    <span className="mr-2">Gửi đi</span>
                    <SendIcon className="h-5 w-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-20 text-center animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 bg-white/80 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-indigo-100 border border-indigo-50">
                <MessageSquareIcon className="h-10 w-10 text-indigo-300" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">Hộp thư hỗ trợ</h4>
              <p className="text-sm mt-4 text-gray-400 max-w-sm font-medium leading-relaxed">
                {isDashboard 
                  ? "Chọn khách hàng trong danh sách bên trái để bắt đầu trả lời tin nhắn."
                  : "Trao đổi với cửa hàng về sản phẩm hoặc đơn hàng của bạn."
                }
              </p>
            </div>
          )}
        </div>
      </div>
  );

  if (isDashboard) {
    return (
      <DashboardLayout
        sidebarItems={sidebarItems}
        title="Hộp thư tin nhắn"
        role={dashboardRole}
      >
        {chatContent}
      </DashboardLayout>
    );
  }

  return (
    <CustomerLayout title="Hộp thư tin nhắn">
      {chatContent}
    </CustomerLayout>
  );
}
