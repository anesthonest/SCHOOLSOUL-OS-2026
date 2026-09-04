import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  Search,
  CheckCheck,
  ShieldAlert,
  User,
  Plus,
  Play,
  Pause,
  FileText,
  Volume2,
  File,
} from 'lucide-react';
import {
  getConversations,
  getMessagesByConversation,
  sendDirectMessage,
  createConversation,
} from '../services/communicationApi';
import type { MessageConversation, DirectMessage } from '../types';

export const DirectMessagingPage: React.FC = () => {
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<MessageConversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const convs = await getConversations();
      setConversations(convs);
      if (convs.length > 0 && !selectedConv) {
        setSelectedConv(convs[0]);
        loadMessages(convs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await getMessagesByConversation(convId);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConv = (conv: MessageConversation) => {
    setSelectedConv(conv);
    loadMessages(conv.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || !selectedConv) return;

    try {
      const text = attachedFile ? `${inputText ? inputText + ' ' : ''}[Attachment: ${attachedFile.name} (${attachedFile.size})]` : inputText;
      const newMsg = await sendDirectMessage({
        conversationId: selectedConv.id,
        senderId: 'usr-current',
        senderName: 'Tr. Sarah Akello',
        senderRole: 'Teacher',
        messageText: text,
      });

      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setAttachedFile(null);
      loadConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
    }
  };

  const handleToggleVoicePlay = (msgId: string) => {
    if (playingMsgId === msgId) {
      setPlayingMsgId(null);
    } else {
      setPlayingMsgId(msgId);
      setTimeout(() => {
        setPlayingMsgId(null);
      }, 5000);
    }
  };

  const handleSendVoiceNote = async () => {
    if (!selectedConv) return;
    try {
      const newMsg = await sendDirectMessage({
        conversationId: selectedConv.id,
        senderId: 'usr-current',
        senderName: 'Tr. Sarah Akello',
        senderRole: 'Teacher',
        messageText: '🎙️ Voice Note (14s)',
        isVoiceNote: true,
        voiceDurationSec: 14,
      });

      setMessages((prev) => [...prev, newMsg]);
      setIsRecording(false);
      loadConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const conv = await createConversation({
        title: newTitle,
        conversationType: 'Direct',
        participantNames: ['Tr. Sarah Akello', 'Mugisha David'],
      });

      setShowNewModal(false);
      setNewTitle('');
      await loadConversations();
      setSelectedConv(conv);
      loadMessages(conv.id);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" /> School Messaging Engine & Teacher-Parent Threads
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Direct & broadcast messaging between leadership, teachers, parents, and support staff.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Start New Conversation
        </button>
      </div>

      {/* Main Grid: Sidebar + Chat Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[620px]">
        {/* Left: Conversation List */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col h-full space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                  selectedConv?.id === conv.id
                    ? 'bg-blue-600/10 border-blue-500/40 text-white'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate max-w-[180px]">{conv.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-1">{conv.lastMessageText}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col h-full">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedConv.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Participants: {selectedConv.participantNames.join(', ')}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                  {selectedConv.conversationType}
                </span>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 my-2">
                {messages.map((msg) => {
                  const isMe = msg.senderId === 'usr-current';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-300">{msg.senderName}</span>
                        <span>({msg.senderRole})</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {msg.isVoiceNote ? (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleVoicePlay(msg.id)}
                              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition"
                            >
                              {playingMsgId === msg.id ? (
                                <Pause className="w-4 h-4 fill-current text-amber-300" />
                              ) : (
                                <Play className="w-4 h-4 fill-current" />
                              )}
                            </button>
                            <div className="flex-1 space-y-1">
                              <div className="h-1.5 bg-white/30 rounded-full w-28 overflow-hidden">
                                <div
                                  className={`h-full bg-white transition-all duration-300 ${
                                    playingMsgId === msg.id ? 'w-full animate-pulse' : 'w-2/3'
                                  }`}
                                />
                              </div>
                              <span className="text-[10px] text-white/80 block font-mono">
                                {playingMsgId === msg.id ? 'Playing...' : '0:14 / 0:14'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          msg.messageText
                        )}
                      </div>

                      <span className="text-[9px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && <CheckCheck className="w-3 h-3 text-sky-400" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Attached file preview chip */}
              {attachedFile && (
                <div className="px-3 py-1.5 mb-2 rounded-xl bg-blue-950/60 border border-blue-800 text-xs text-blue-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <File className="w-3.5 h-3.5 text-blue-400" />
                    <strong>{attachedFile.name}</strong> ({attachedFile.size})
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-rose-400 hover:text-rose-300 font-bold ml-2 text-sm"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx"
              />

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Send Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
                  title="Attach File (PDF, Document, Photo)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type message to parent or staff..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 text-white text-xs px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a conversation thread to view messages.
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-white">Start New Conversation Thread</h3>
            <form onSubmit={handleCreateNewConversation} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Thread Title / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior 2 Physics Parent Inquiry"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Create Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
