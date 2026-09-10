import React from 'react';
import { ChatMessage } from './useChat';
import { UserRole } from '../../context/RoleContext';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface ChatMessageListProps {
  loading: boolean;
  messages: ChatMessage[];
  activeRole: UserRole;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  loading,
  messages,
  activeRole,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 p-3 overflow-y-auto space-y-3 mac-pinstripe-bg">
      {loading ? (
        <div className="flex items-center justify-center h-full text-black font-bold gap-2 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-black" />
          <span>Memuat riwayat chat...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-black text-center p-6 space-y-2">
          <MessageSquare className="w-10 h-10 text-gray-600" />
          <p className="text-xs font-black uppercase">Belum ada percakapan</p>
          <p className="text-[10px] text-gray-700 font-semibold">
            Gunakan template cepat di bawah atau ketik pesan untuk berkomunikasi.
          </p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMine = msg.senderRole === activeRole;
          const formattedTime = new Date(msg.createdAt).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-1`}>
              <div className="flex items-center gap-1.5 text-[9px] text-black font-bold px-1 uppercase">
                <span className="mac-badge mac-badge-indigo">
                  {msg.senderRole === 'KASIR' ? 'Toko Depan' : msg.senderRole === 'GUDANG' ? 'Gudang' : 'Admin'}
                </span>
                <span>{msg.senderName}</span>
                <span>•</span>
                <span className="text-gray-700">{formattedTime}</span>
              </div>

              <div
                className={`max-w-[85%] mac-card p-2.5 text-xs font-semibold leading-snug ${
                  isMine
                    ? 'bg-gradient-to-b from-[#ffffff] to-[#d0d0d0] text-black border-2 border-black'
                    : 'bg-white text-black border-2 border-gray-600'
                } ${msg.isQuickMsg ? 'border-l-4 border-l-yellow-500' : ''}`}
              >
                {msg.message}
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
