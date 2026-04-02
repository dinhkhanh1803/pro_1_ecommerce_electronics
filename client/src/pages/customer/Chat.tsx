import { useState, useEffect, useRef } from "react";
import { CustomerLayout } from "../../components/CustomerLayout";
import { useAuth } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { 
  SendIcon, 
  MessageSquareIcon, 
  SearchIcon,
  ClockIcon,
  UserIcon
} from "lucide-react";

export function Chat() {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const contactIdFromUrl = searchParams.get("contactId");

  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || !token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ recipientId: selectedContact._id, text: newMessage })
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages(selectedContact._id);
      }
    } catch (err) { console.error(err); }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CustomerLayout title="Hộp thư tin nhắn">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/20 overflow-hidden border border-indigo-50 flex h-[700px] max-h-[80vh]">
        {/* Inbox List */}
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

        {/* Chat View */}
        <div className="flex-1 flex flex-col bg-gray-50/30">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="px-8 py-6 bg-white border-b border-indigo-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${selectedContact.name}&background=6366f1&color=fff&bold=true`} 
                      className="w-11 h-11 rounded-2xl border-2 border-indigo-50 shadow-sm" 
                    />
                    <div className="absolute -top-1 -right-1 p-1 bg-green-500 rounded-lg animate-pulse border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 tracking-tight">{selectedContact.name}</p>
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

              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                    <UserIcon className="h-16 w-16 mb-4" />
                    <p className="font-bold text-center">Bắt đầu cuộc trò chuyện với<br/>{selectedContact.name}</p>
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
                        <p className="text-sm font-medium leading-relaxed">{m.content}</p>
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
              <div className="p-8 bg-white border-t border-indigo-50 shadow-inner">
                <form 
                  onSubmit={handleSendMessage} 
                  className="flex items-center space-x-4 h-16"
                >
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
                    disabled={!newMessage.trim()}
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
                Chọn người bán trong danh sách bên trái để bắt đầu trao đổi về sản phẩm hoặc đơn hàng của bạn.
              </p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}