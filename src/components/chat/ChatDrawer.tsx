import React from 'react';
import { useChat, ChatMessage } from './useChat';
import { ChatDrawerHeader } from './ChatDrawerHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatQuickTemplates } from './ChatQuickTemplates';

export type { ChatMessage };

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const {
    activeRole,
    roleConfig,
    messages,
    inputText,
    setInputText,
    loading,
    sending,
    displayedProducts,
    selectedProduct,
    setSelectedProduct,
    messagesEndRef,
    handleSendMessage,
    handleClearHistory,
    handleQuickTemplate,
  } = useChat(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity font-sans text-black">
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 mac-window rounded-none border-l-2 border-black flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ChatDrawerHeader
          activeRole={activeRole}
          roleShortLabel={roleConfig.shortLabel}
          onClose={onClose}
          onClearHistory={handleClearHistory}
        />

        <ChatMessageList
          loading={loading}
          messages={messages}
          activeRole={activeRole}
          messagesEndRef={messagesEndRef}
        />

        <ChatQuickTemplates
          activeRole={activeRole}
          roleShortLabel={roleConfig.shortLabel}
          displayedProducts={displayedProducts}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          inputText={inputText}
          setInputText={setInputText}
          sending={sending}
          onQuickTemplate={handleQuickTemplate}
          onSend={() => handleSendMessage()}
        />
      </div>
    </div>
  );
};
