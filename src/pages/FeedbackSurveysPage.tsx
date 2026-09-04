import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  BarChart3,
  CheckCircle2,
  Users,
  Send,
  Star,
} from 'lucide-react';
import { getSchoolSurveys, createSchoolSurvey, submitSurveyResponse } from '../services/communicationApi';
import type { SchoolSurvey } from '../types';

export const FeedbackSurveysPage: React.FC = () => {
  const [surveys, setSurveys] = useState<SchoolSurvey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<SchoolSurvey | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<SchoolSurvey['targetAudience']>('Parents');

  // Answers State
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [choiceVal, setChoiceVal] = useState<string>('Yes, fully');
  const [textVal, setTextVal] = useState<string>('');

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await getSchoolSurveys();
      setSurveys(data);
      if (data.length > 0 && !selectedSurvey) {
        setSelectedSurvey(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createSchoolSurvey({
        title,
        description,
        targetAudience,
      });

      setShowModal(false);
      setTitle('');
      setDescription('');
      await loadSurveys();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;

    try {
      const answers = [
        { questionId: 'q1', answerValue: ratingVal },
        { questionId: 'q2', answerValue: choiceVal },
        { questionId: 'q3', answerValue: textVal },
      ];

      await submitSurveyResponse(selectedSurvey.id, 'usr-parent-1', 'Parent', answers);
      alert('Survey feedback response recorded anonymously!');
      await loadSurveys();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" /> Parent Feedback, Surveys & Community Polls
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish parent satisfaction surveys, academic feedback forms & real-time satisfaction analytics.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" /> Create New Survey
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Survey List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Active Surveys</h3>
          {surveys.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSurvey(s)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedSurvey?.id === s.id
                  ? 'bg-purple-600/10 border-purple-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="truncate">{s.title}</span>
                <span className="text-[10px] text-purple-400 font-mono">{s.targetAudience}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.description}</p>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
                <span>Responses: {s.responsesCount}</span>
                <span>Expires: {s.expiryDate}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Survey Response Form + Results */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {selectedSurvey ? (
            <>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-[10px] border border-purple-500/20">
                  Target: {selectedSurvey.targetAudience}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedSurvey.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedSurvey.description}</p>
              </div>

              {/* Questionnaire */}
              <form onSubmit={handleSubmitAnswers} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Answer Survey Questions
                </h4>

                <div>
                  <label className="text-slate-300 font-bold block mb-2">
                    1. How satisfied are you with school-parent communication via SchoolSoul?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingVal(star)}
                        className={`p-2 rounded-xl text-xs font-bold ${
                          ratingVal >= star ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-2">
                    2. Is your child receiving adequate support for CBC continuous assessments?
                  </label>
                  <select
                    value={choiceVal}
                    onChange={(e) => setChoiceVal(e.target.value)}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    <option value="Yes, fully">Yes, fully satisfied</option>
                    <option value="Somewhat">Somewhat satisfied</option>
                    <option value="No, needs improvement">No, needs improvement</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-2">
                    3. Additional feedback or suggestions for school leadership:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Write your feedback here..."
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Anonymous Feedback
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">Select a survey to respond or view results.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Create Community Survey</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Survey Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., School Canteen & Nutrition Survey"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                >
                  <option value="Parents">Parents</option>
                  <option value="Teachers">Teachers</option>
                  <option value="Students">Students</option>
                  <option value="All">All School Community</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold"
                >
                  Publish Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
