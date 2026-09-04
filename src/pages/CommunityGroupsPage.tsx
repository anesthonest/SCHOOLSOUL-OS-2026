import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Heart,
  Plus,
  ShieldCheck,
  Send,
  UserCheck,
} from 'lucide-react';
import {
  getCommunityGroups,
  getGroupPosts,
  createGroupPost,
} from '../services/communicationApi';
import type { CommunityGroupItem, GroupPostItem } from '../types';

export const CommunityGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<CommunityGroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroupItem | null>(null);
  const [posts, setPosts] = useState<GroupPostItem[]>([]);
  const [postText, setPostText] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getCommunityGroups();
      setGroups(data);
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0]);
        loadPosts(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPosts = async (groupId: string) => {
    try {
      const data = await getGroupPosts(groupId);
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectGroup = (g: CommunityGroupItem) => {
    setSelectedGroup(g);
    loadPosts(g.id);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !selectedGroup) return;

    try {
      const newPost = await createGroupPost(
        selectedGroup.id,
        'usr-parent-1',
        'Mr. Mugisha David',
        'Parent',
        postText
      );

      setPosts((prev) => [newPost, ...prev]);
      setPostText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" /> Moderated School Community Groups & PTA Feed
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Collaborative spaces for PTA committees, class parents, alumni & sports clubs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Community Forums</h3>
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => handleSelectGroup(g)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedGroup?.id === g.id
                  ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="truncate">{g.groupName}</span>
                <span className="text-[10px] text-indigo-400 font-mono">{g.category}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{g.description}</p>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
                <span>Moderator: {g.moderatorName}</span>
                <span>{g.memberCount} Members</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Group Feed */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          {selectedGroup ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedGroup.groupName}</h3>
                  <p className="text-xs text-slate-400">{selectedGroup.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                  {selectedGroup.memberCount} Members
                </span>
              </div>

              {/* Post Composer */}
              <form onSubmit={handleCreatePost} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <textarea
                  rows={3}
                  placeholder={`Share update or idea with ${selectedGroup.groupName}...`}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Post to Group
                  </button>
                </div>
              </form>

              {/* Feed Posts */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{post.authorName}</span>
                        <span className="text-[10px] text-indigo-400 font-bold">({post.authorRole})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-200 leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <button className="flex items-center gap-1 hover:text-rose-400">
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> {post.likesCount} Likes
                      </button>
                      <button className="flex items-center gap-1 hover:text-indigo-400">
                        <MessageSquare className="w-3.5 h-3.5" /> {post.commentsCount} Comments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">Select a community group to view discussion feed.</div>
          )}
        </div>
      </div>
    </div>
  );
};
