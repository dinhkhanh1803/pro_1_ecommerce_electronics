import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BotIcon,
  ExternalLinkIcon,
  HeadphonesIcon,
  Loader2Icon,
  MessageCircleIcon,
  PlusIcon,
  SendIcon,
  ShoppingBagIcon,
  XIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatVND } from '../utils/format';

interface ChatVariant {
  name: string;
  priceAdd: number;
  stock: number;
}

interface ChatProduct {
  id: string;
  name: string;
  brand?: string;
  price: number;
  basePrice?: number;
  compareAtPrice?: number;
  image?: string;
  stock?: number;
  inStock: boolean;
  category?: string;
  sales?: number;
  defaultVariant?: ChatVariant | null;
}

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  products?: ChatProduct[];
  action?: string;
  contactId?: string;
}

interface ChatbotResponse {
  sessionId?: string;
  reply: string;
  products?: ChatProduct[];
  quickReplies?: string[];
  action?: string;
  contactId?: string;
  requiresLogin?: boolean;
}

const SESSION_KEY = 'shophub_chatbot_session';
const DEFAULT_QUICK_REPLIES = [
  'Laptop dưới 20 triệu',
  'Sản phẩm bán chạy',
  'Có khuyến mãi nào không?',
  'Gặp nhân viên tư vấn',
];

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: 'Chào bạn! Mình có thể tìm sản phẩm theo nhu cầu, lọc theo ngân sách, thêm nhanh vào giỏ và chuyển nhân viên khi bạn cần.',
};

const getOrCreateSessionId = () => {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next =
    window.crypto?.randomUUID?.() ||
    `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(SESSION_KEY, next);
  return next;
};

export function SalesChatbot() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [sessionId, setSessionId] = useState(getOrCreateSessionId);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [quickReplies, setQuickReplies] = useState(DEFAULT_QUICK_REPLIES);
  const [isSending, setIsSending] = useState(false);
  const [isHandoffLoading, setIsHandoffLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isOpen]);

  useEffect(() => {
    let ignore = false;

    const loadHistory = async () => {
      try {
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chatbot/history?sessionId=${encodeURIComponent(sessionId)}`,
          { headers }
        );
        if (!response.ok) return;

        const data = await response.json();
        if (ignore) return;
        if (data.sessionId && data.sessionId !== sessionId) {
          localStorage.setItem(SESSION_KEY, data.sessionId);
          setSessionId(data.sessionId);
        }
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to load chatbot history', error);
      }
    };

    void loadHistory();
    return () => {
      ignore = true;
    };
  }, [sessionId, token]);

  const pushBotMessage = (text: string, extra?: Partial<ChatMessage>) => {
    setMessages((current) => [
      ...current,
      {
        id: `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: 'bot',
        text,
        ...extra,
      },
    ]);
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    if (trimmed === 'Đăng nhập') {
      setIsOpen(false);
      navigate('/login');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setIsSending(true);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: trimmed, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Chatbot request failed');
      }

      const data = (await response.json()) as ChatbotResponse;
      if (data.sessionId && data.sessionId !== sessionId) {
        localStorage.setItem(SESSION_KEY, data.sessionId);
        setSessionId(data.sessionId);
      }

      setQuickReplies(data.quickReplies?.length ? data.quickReplies : DEFAULT_QUICK_REPLIES);
      pushBotMessage(data.reply, {
        products: data.products || [],
        action: data.action,
        contactId: data.contactId,
      });
    } catch (error) {
      console.error(error);
      pushBotMessage('Mình đang gặp lỗi kết nối. Bạn thử lại sau một chút nhé.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(message);
  };

  const handleAddProduct = (product: ChatProduct) => {
    const variantName = product.defaultVariant?.name || 'Default';
    const variantStock = Number(product.defaultVariant?.stock ?? product.stock ?? 0);

    if (!product.inStock || variantStock <= 0) {
      showToast('Sản phẩm này hiện tạm hết hàng.', 'error');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || 'https://via.placeholder.com/500',
      variantName,
      color: variantName,
      size: variantName,
      seller: '',
    });
    showToast('Đã thêm sản phẩm vào giỏ hàng.', 'success');
    pushBotMessage(`Đã thêm "${product.name}" vào giỏ hàng của bạn.`);
  };

  const handleHandoff = async () => {
    if (isHandoffLoading) return;
    setIsHandoffLoading(true);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot/handoff`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          message: message.trim() || 'Khách muốn gặp nhân viên tư vấn',
        }),
      });

      const data = (await response.json()) as ChatbotResponse;
      setQuickReplies(data.quickReplies?.length ? data.quickReplies : DEFAULT_QUICK_REPLIES);

      if (data.requiresLogin || response.status === 401) {
        pushBotMessage(data.reply || 'Bạn cần đăng nhập để gặp nhân viên.', {
          action: 'login_required',
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.reply || 'Cannot hand off chatbot conversation');
      }

      pushBotMessage(data.reply, {
        action: data.action,
        contactId: data.contactId,
      });
      showToast('Đã chuyển cuộc trò chuyện cho nhân viên.', 'success');
    } catch (error) {
      console.error(error);
      pushBotMessage('Mình chưa chuyển được cho nhân viên. Bạn thử lại sau một chút nhé.');
    } finally {
      setIsHandoffLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section className="mb-3 flex h-[min(660px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
          <header className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                <BotIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">Trợ lý bán hàng</h2>
                <p className="truncate text-xs text-slate-300">Tư vấn bằng dữ liệu của shop</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Đóng chatbot"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((item) => (
              <div key={item.id} className={item.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[90%] ${item.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                  <div
                    className={`rounded-lg px-3.5 py-2.5 text-sm leading-5 shadow-sm ${
                      item.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {item.text}
                  </div>

                  {item.action === 'login_required' && (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                    >
                      Đăng nhập
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  {item.action === 'open_chat' && item.contactId && (
                    <Link
                      to={`/chat?contactId=${item.contactId}`}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                    >
                      Mở hộp thư
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  {item.action === 'open_orders' && (
                    <Link
                      to="/orders"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                    >
                      Mở đơn hàng
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  {item.action === 'handoff' && (
                    <button
                      type="button"
                      onClick={handleHandoff}
                      disabled={isHandoffLoading}
                      className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isHandoffLoading ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <HeadphonesIcon className="h-3.5 w-3.5" />}
                      Gặp nhân viên
                    </button>
                  )}

                  {!!item.products?.length && (
                    <div className="w-full space-y-2">
                      {item.products.map((product) => (
                        <div
                          key={product.id}
                          className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
                        >
                          <div className="flex gap-3">
                            <Link
                              to={`/product/${product.id}`}
                              onClick={() => setIsOpen(false)}
                              className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100"
                            >
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <ShoppingBagIcon className="h-6 w-6" />
                                </div>
                              )}
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/product/${product.id}`}
                                onClick={() => setIsOpen(false)}
                                className="line-clamp-2 text-xs font-semibold leading-5 text-slate-900 transition-colors hover:text-indigo-600"
                              >
                                {product.name}
                              </Link>
                              <p className="mt-1 text-sm font-bold text-red-600">{formatVND(product.price)}</p>
                              <p className={`mt-0.5 text-[11px] font-medium ${product.inStock ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {product.inStock ? 'Còn hàng' : 'Tạm hết hàng'}
                                {product.defaultVariant?.name && product.defaultVariant.name !== 'Default'
                                  ? ` · ${product.defaultVariant.name}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Link
                              to={`/product/${product.id}`}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 text-xs font-bold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              Chi tiết
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleAddProduct(product)}
                              disabled={!product.inStock}
                              className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-indigo-600 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              <PlusIcon className="h-3.5 w-3.5" />
                              Thêm
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-500 shadow-sm">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Đang tìm câu trả lời...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => reply.includes('nhân viên') ? void handleHandoff() : void sendMessage(reply)}
                  disabled={isSending || isHandoffLoading}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="mb-3">
              <button
                type="button"
                onClick={handleHandoff}
                disabled={isHandoffLoading}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 text-xs font-bold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isHandoffLoading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <HeadphonesIcon className="h-4 w-4" />}
                Gặp nhân viên tư vấn
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Nhập câu hỏi..."
                className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Gửi tin nhắn"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
        aria-label={isOpen ? 'Thu gọn chatbot' : 'Mở chatbot'}
      >
        {isOpen ? <XIcon className="h-6 w-6" /> : <MessageCircleIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}
