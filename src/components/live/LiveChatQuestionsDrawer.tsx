import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  HelpCircle,
  BarChart2,
  FileText,
  Users,
  Send,
  ThumbsUp,
  Pin,
  CheckCircle2,
  Mic,
  MicOff,
  Hand,
  MoreVertical,
  Plus,
  Download,
  Eye,
  Sparkles,
  Award,
  Shield,
} from 'lucide-react';
import type {
  LiveClass,
  LiveParticipant,
  LiveClassMessage,
  LiveQuestion,
  LivePoll,
  LiveMaterial,
} from '../../types';

interface LiveChatQuestionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass;
  isHost: boolean;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
  participants: LiveParticipant[];
  messages: LiveClassMessage[];
  questions: LiveQuestion[];
  polls: LivePoll[];
  onSendMessage: (text: string, isAnnouncement?: boolean) => void;
  onSubmitQuestion: (text: string) => void;
  onUpvoteQuestion: (questionId: string) => void;
  onAnswerQuestion: (questionId: string, answerText: string) => void;
  onVotePoll: (pollId: string, optionId: string) => void;
  onCreatePoll: (question: string, options: string[]) => void;
  onTeacherAction: (targetUserId: string, action: string, value?: any) => void;
}

export const LiveChatQuestionsDrawer: React.FC<LiveChatQuestionsDrawerProps> = ({
  isOpen,
  onClose,
  liveClass,
  isHost,
  currentUserId,
  currentUserName,
  currentUserRole,
  participants,
  messages,
  questions,
  polls,
  onSendMessage,
  onSubmitQuestion,
  onUpvoteQuestion,
  onAnswerQuestion,
  onVotePoll,
  onCreatePoll,
  onTeacherAction,
}) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'QA' | 'POLLS' | 'MATERIALS' | 'ROSTER'>('CHAT');
  const [chatInput, setChatInput] = useState<string>('');
  const [questionInput, setQuestionInput] = useState<string>('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [isCreatingPoll, setIsCreatingPoll] = useState<boolean>(false);
  const [newPollQuestion, setNewPollQuestion] = useState<string>('');
  const [newPollOptions, setNewPollOptions] = useState<string[]>(['Option 1', 'Option 2']);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    onSubmitQuestion(questionInput.trim());
    setQuestionInput('');
  };

  const handleSaveAnswer = (qId: string) => {
    if (!answerInput.trim()) return;
    onAnswerQuestion(qId, answerInput.trim());
    setAnsweringQuestionId(null);
    setAnswerInput('');
  };

  const handleAddPollOption = () => {
    if (newPollOptions.length < 6) {
      setNewPollOptions([...newPollOptions, `Option ${newPollOptions.length + 1}`]);
    }
  };

  const handleSaveNewPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestion.trim() || newPollOptions.some((o) => !o.trim())) return;
    onCreatePoll(newPollQuestion.trim(), newPollOptions);
    setIsCreatingPoll(false);
    setNewPollQuestion('');
    setNewPollOptions(['Option 1', 'Option 2']);
  };

  const raisedHandParticipants = participants.filter((p) => p.isHandRaised);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      className="w-80 md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full z-30 shadow-2xl"
    >
      {/* Navigation Tabs Header */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'CHAT'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('QA')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all relative ${
            activeTab === 'QA'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Q&A</span>
          {questions.filter((q) => q.status === 'PENDING').length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('POLLS')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'POLLS'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Polls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MATERIALS')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'MATERIALS'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Files</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ROSTER')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all relative ${
            activeTab === 'ROSTER'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Roster</span>
          {raisedHandParticipants.length > 0 && (
            <span className="absolute top-1 right-2 px-1 rounded-full text-[9px] font-bold bg-amber-500 text-white">
              {raisedHandParticipants.length}
            </span>
          )}
        </button>
      </div>

      {/* 1. CHAT TAB CONTENT */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Live Chat is Ready</p>
                <p className="text-xs text-slate-400 mt-1">
                  Say hello, participate in discussion, or ask for clarifications.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const isTeacher = msg.senderRole === 'Teacher' || msg.senderRole === 'Super Administrator';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {isMe ? 'You' : msg.senderName}
                      </span>
                      {isTeacher && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                          Teacher
                        </span>
                      )}
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : isTeacher
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 border border-blue-200/60 dark:border-blue-800/60 rounded-tl-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendChat}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to class..."
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. Q&A TAB CONTENT */}
      {activeTab === 'QA' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {questions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No Questions Yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Students can submit questions here. The teacher can review and answer them.
                </p>
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {q.studentName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpvoteQuestion(q.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                        q.upvotes?.includes(currentUserId)
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{q.upvotes?.length || 0}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {q.questionText}
                  </p>

                  {q.answerText && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 mt-2">
                      <div className="flex items-center gap-1 font-bold text-[10px] uppercase text-emerald-700 dark:text-emerald-400 mb-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Teacher Answer
                      </div>
                      <p>{q.answerText}</p>
                    </div>
                  )}

                  {isHost && !q.answerText && answeringQuestionId !== q.id && (
                    <button
                      type="button"
                      onClick={() => setAnsweringQuestionId(q.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 pt-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Reply as Teacher
                    </button>
                  )}

                  {answeringQuestionId === q.id && (
                    <div className="pt-2 space-y-2">
                      <textarea
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        placeholder="Write your explanation or answer..."
                        rows={2}
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveAnswer(q.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                        >
                          Post Answer
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnsweringQuestionId(null)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Ask Question Form */}
          <form
            onSubmit={handleSendQuestion}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={!questionInput.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 3. POLLS TAB CONTENT */}
      {activeTab === 'POLLS' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isHost && !isCreatingPoll && (
            <button
              type="button"
              onClick={() => setIsCreatingPoll(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              Launch New Live Poll
            </button>
          )}

          {/* Create Poll Modal / Form */}
          {isCreatingPoll && (
            <form
              onSubmit={handleSaveNewPoll}
              className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Create Live Quick Poll
              </h4>
              <input
                type="text"
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                placeholder="What is your question?"
                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  Options
                </label>
                {newPollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newPollOptions];
                      updated[idx] = e.target.value;
                      setNewPollOptions(updated);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                ))}
                {newPollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Broadcast Poll
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingPoll(false)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Polls List */}
          {polls.length === 0 && !isCreatingPoll ? (
            <div className="text-center text-slate-400 py-8">
              <BarChart2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No Active Polls</p>
              <p className="text-xs text-slate-400 mt-1">
                Polls launched by the teacher will appear here in real time.
              </p>
            </div>
          ) : (
            polls.map((poll) => {
              const totalVotes = poll.responses?.length || 0;
              const hasVoted = poll.responses?.some((r) => r.userId === currentUserId);

              return (
                <div
                  key={poll.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Live Poll • {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {poll.question}
                  </h4>

                  <div className="space-y-2">
                    {poll.options.map((opt) => {
                      const optVotes = poll.responses?.filter((r) => r.optionId === opt.id).length || 0;
                      const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                      const isSelected = poll.responses?.some(
                        (r) => r.userId === currentUserId && r.optionId === opt.id
                      );

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onVotePoll(poll.id, opt.id)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all relative overflow-hidden ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {/* Progress Bar Background */}
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-blue-100 dark:bg-blue-900/40 transition-all duration-300 z-0"
                            style={{ width: `${percent}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {opt.text}
                            </span>
                            <span className="font-bold text-slate-600 dark:text-slate-400">
                              {percent}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. LESSON MATERIALS TAB */}
      {activeTab === 'MATERIALS' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {(!liveClass.materials || liveClass.materials.length === 0) ? (
            <div className="text-center text-slate-400 py-8">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No Attached Materials</p>
              <p className="text-xs text-slate-400 mt-1">
                Downloadable slide decks and diagrams for this lesson will appear here.
              </p>
            </div>
          ) : (
            liveClass.materials.map((mat) => (
              <div
                key={mat.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {mat.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {mat.type} • {mat.size}
                    </p>
                  </div>
                </div>

                <a
                  href={mat.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. ROSTER & ATTENDANCE TAB */}
      {activeTab === 'ROSTER' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Connected Participants ({participants.length})
            </h4>
            {isHost && (
              <button
                type="button"
                onClick={() => onTeacherAction('all', 'mute-all')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Mute All
              </button>
            )}
          </div>

          {/* Raised Hands Priority Alert */}
          {raisedHandParticipants.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 space-y-2">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Hand className="w-3.5 h-3.5" />
                Hands Raised ({raisedHandParticipants.length})
              </span>
              {raisedHandParticipants.map((p) => (
                <div key={p.userId} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {p.userName}
                  </span>
                  {isHost && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onTeacherAction(p.userId, 'lower-hand')}
                        className="px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold"
                      >
                        Lower
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Participant Rows */}
          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.userId}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                    {p.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {p.userName}
                      </span>
                      {p.userId === currentUserId && (
                        <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {p.isHost ? 'Host Educator' : p.userRole}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.isHandRaised && <Hand className="w-4 h-4 text-amber-500" />}
                  {p.isMuted ? (
                    <MicOff className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Mic className="w-4 h-4 text-emerald-500" />
                  )}

                  {isHost && p.userId !== currentUserId && (
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => onTeacherAction(p.userId, 'mute')}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                        title="Teacher moderation"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
