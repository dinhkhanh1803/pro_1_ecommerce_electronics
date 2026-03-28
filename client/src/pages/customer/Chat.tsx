import React, { useEffect, useState, useRef } from 'react';
import { CustomerLayout } from '../../components/CustomerLayout';
import {
  SendIcon,
  PaperclipIcon,
  ImagePlusIcon,
  MoreVerticalIcon,
  SearchIcon } from
'lucide-react';
// Mock Data
const MOCK_CONVERSATIONS = [
{
  id: '1',
  shopName: 'TechGadgets Official',
  avatar:
  'https://ui-avatars.com/api/?name=Tech+Gadgets&background=6366f1&color=fff',
  lastMessage: 'Your order has been shipped!',
  time: '10:30 AM',
  unread: 2,
  online: true
},
{
  id: '2',
  shopName: 'Fashion Boutique',
  avatar:
  'https://ui-avatars.com/api/?name=Fashion+Boutique&background=ec4899&color=fff',
  lastMessage: 'Yes, we have size M in stock.',
  time: 'Yesterday',
  unread: 0,
  online: false
},
{
  id: '3',
  shopName: 'Home Essentials',
  avatar:
  'https://ui-avatars.com/api/?name=Home+Essentials&background=10b981&color=fff',
  lastMessage: 'Thank you for your purchase.',
  time: 'Oct 24',
  unread: 0,
  online: true
}];

const MOCK_MESSAGES = [
{
  id: '1',
  senderId: 'user',
  text: 'Hi, is this item still available?',
  time: '10:00 AM'
},
{
  id: '2',
  senderId: 'shop',
  text: 'Hello! Yes, it is currently in stock.',
  time: '10:05 AM'
},
{
  id: '3',
  senderId: 'user',
  text: 'Great, I just placed an order. When will it be shipped?',
  time: '10:15 AM'
},
{
  id: '4',
  senderId: 'shop',
  text: 'Thank you! We usually process orders within 24 hours.',
  time: '10:20 AM'
},
{
  id: '5',
  senderId: 'shop',
  text: 'Your order has been shipped!',
  time: '10:30 AM'
}];

export function Chat() {
  const [activeConversationId, setActiveConversationId] = useState(
    MOCK_CONVERSATIONS[0].id
  );
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConversation = MOCK_CONVERSATIONS.find(
    (c) => c.id === activeConversationId
  );
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      senderId: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };
  const filteredConversations = MOCK_CONVERSATIONS.filter((c) =>
  c.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <CustomerLayout title="Messages">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex h-[600px]">
        {/* Sidebar - Conversations List */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col shrink-0">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
              
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) =>
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`w-full flex items-start p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${activeConversationId === conv.id ? 'bg-indigo-50/50' : ''}`}>
              
                <div className="relative shrink-0">
                  <img
                  src={conv.avatar}
                  alt={conv.shopName}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                
                  {conv.online &&
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                }
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                      {conv.shopName}
                    </h4>
                    <span className="text-xs text-gray-500 shrink-0">
                      {conv.time}
                    </span>
                  </div>
                  <p
                  className={`text-sm truncate ${conv.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 &&
              <div className="ml-2 shrink-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                      {conv.unread}
                    </span>
                  </div>
              }
              </button>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-gray-50">
          {activeConversation ?
          <>
              {/* Chat Header */}
              <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center">
                  <img
                  src={activeConversation.avatar}
                  alt={activeConversation.shopName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {activeConversation.shopName}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center">
                      {activeConversation.online ?
                    <>
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>{' '}
                          Online
                        </> :

                    'Offline'
                    }
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVerticalIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => {
                const isUser = msg.senderId === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    
                      <div
                      className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
                      
                        <div
                        className={`px-4 py-2 rounded-2xl ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'}`}>
                        
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <p
                        className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        
                          {msg.time}
                        </p>
                      </div>
                    </div>);

              })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-200 p-4 shrink-0">
                <form
                onSubmit={handleSendMessage}
                className="flex items-end space-x-2">
                
                  <div className="flex space-x-1 pb-2">
                    <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                    
                      <PaperclipIcon className="h-5 w-5" />
                    </button>
                    <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                    
                      <ImagePlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none max-h-32 min-h-[44px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }} />
                  
                  </div>
                  <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                  
                    <SendIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </> :

          <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SearchIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p>Select a conversation to start chatting</p>
            </div>
          }
        </div>
      </div>
    </CustomerLayout>);

}