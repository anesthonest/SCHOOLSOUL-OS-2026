import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  ShoppingBag,
  Video,
  Trophy,
  Briefcase,
  Bot,
  ShieldCheck,
  BarChart3,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  Sparkles,
  FileText,
  Download,
  DollarSign,
  Heart,
  Eye,
  Tag,
  ThumbsUp,
  Share2,
  Lock,
  Wifi,
  WifiOff,
  Star,
  Zap,
  Filter,
  ArrowRight,
  Code,
  Layers,
  Award,
  BookOpen,
  Calendar,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';

// Types for Vision 11 Module
export interface InnovationFeedPost {
  id: string;
  studentName: string;
  studentGrade: string;
  avatarUrl?: string;
  title: string;
  content: string;
  category: 'STEM' | 'Robotics' | 'Agriculture' | 'ICT & Software' | 'Arts & Crafts' | 'Business';
  mediaType?: 'image' | 'video' | 'document' | 'code';
  mediaUrl?: string;
  codeSnippet?: string;
  likes: number;
  commentsCount: number;
  isVerifiedByTeacher: boolean;
  teacherVerifier?: string;
  timestamp: string;
  isOfflineDraft?: boolean;
}

export interface StudentProject {
  id: string;
  title: string;
  studentName: string;
  grade: string;
  category: string;
  problemSolved: string;
  objectives: string;
  skillsUsed: string[];
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Published' | 'Archived';
  progressPercent: number;
  repoUrl?: string;
  teacherFeedback?: string;
  awards: string[];
  createdAt: string;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  sellerName: string;
  sellerGrade: string;
  category: 'Artwork' | 'Crafts' | 'Arts & Crafts' | 'Agriculture' | 'Software' | 'Electronics' | '3D Prints' | 'Books';
  priceUGX: number;
  quantityAvailable: number;
  description: string;
  approvalStatus: 'Pending Review' | 'Approved' | 'Rejected';
  approvedBy?: string;
  imageUrl: string;
}

export interface ServiceListing {
  id: string;
  title: string;
  studentName: string;
  category: 'Graphic Design' | 'Programming' | 'Tutoring' | 'Video Editing' | 'Music Lessons';
  hourlyRateUGX: number;
  description: string;
  approvalStatus: 'Approved' | 'Pending';
  bookingsCount: number;
}

export interface Competition {
  id: string;
  title: string;
  category: string;
  deadline: string;
  prizePoolUGX: number;
  participantsCount: number;
  status: 'Open for Submissions' | 'Judging' | 'Completed';
  organizer: string;
  description: string;
}

export interface BusinessPlan {
  id: string;
  title?: string;
  ventureName: string;
  studentFounder: string;
  concept: string;
  targetMarket: string;
  estimatedCostUGX: number;
  expectedMonthlyRevenueUGX: number;
  teacherMentor: string;
  stage: 'Idea' | 'Prototyping' | 'Early Sales' | 'Scaling';
}

export const Vision11StudentInnovationHubPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const { isOnline } = useSync();

  const isTeacherOrAdmin = ['Headteacher', 'Deputy Headteacher', 'Administrator', 'Teacher', 'ICT Administrator'].includes(activeRole || '');

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    | 'feed'
    | 'showcase'
    | 'marketplace'
    | 'services'
    | 'videos'
    | 'competitions'
    | 'incubator'
    | 'portfolio'
    | 'analytics'
    | 'ai-assistant'
    | 'moderation'
  >('feed');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Sample Data State
  const [posts, setPosts] = useState<InnovationFeedPost[]>([
    {
      id: 'post-1',
      studentName: 'Kato Derrick',
      studentGrade: 'Senior 5 Science',
      title: 'Solar-Powered Irrigation Automated Controller',
      content: 'Designed a micro-controller system using moisture sensors to control water pumps in school vegetable gardens. Saves 40% water!',
      category: 'Agriculture',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop',
      likes: 34,
      commentsCount: 8,
      isVerifiedByTeacher: true,
      teacherVerifier: 'Mr. Okello (Physics HOD)',
      timestamp: '2 hours ago',
    },
    {
      id: 'post-2',
      studentName: 'Nassolo Brenda',
      studentGrade: 'Senior 4 Arts',
      title: 'Luganda Literacy AI Storybook Reader Code Snippet',
      content: 'Created an offline TTS script for reading primary storybooks in local languages.',
      category: 'ICT & Software',
      mediaType: 'code',
      codeSnippet: `def read_story_luganda(text):\n    voice_engine = load_local_model('luganda_v1')\n    audio = voice_engine.synthesize(text)\n    play_audio(audio)\n    print("Story completed successfully!")`,
      likes: 29,
      commentsCount: 5,
      isVerifiedByTeacher: true,
      teacherVerifier: 'Ms. Nabawanuka (ICT Facilitator)',
      timestamp: '4 hours ago',
    },
    {
      id: 'post-3',
      studentName: 'Mwesigwa Joshua',
      studentGrade: 'Senior 6 Vocational',
      title: 'Recycled Plastic Filament for 3D Printed Lab Beakers',
      content: 'Testing local high-density polyethylene recycling to make affordable science test tube racks and beakers.',
      category: 'STEM',
      mediaType: 'video',
      likes: 42,
      commentsCount: 12,
      isVerifiedByTeacher: false,
      timestamp: '1 day ago',
    },
  ]);

  const [projects, setProjects] = useState<StudentProject[]>([
    {
      id: 'proj-1',
      title: 'Smart Poultry Feeder with SMS Alert System',
      studentName: 'Kato Derrick',
      grade: 'Senior 5',
      category: 'Robotics & IoT',
      problemSolved: 'Automating feeding schedules in rural poultry farms to reduce feed waste.',
      objectives: 'Build GSM connected Arduino board with load sensors.',
      skillsUsed: ['Arduino C++', 'GSM API', 'Circuit Soldering', 'Technical Writing'],
      status: 'Approved',
      progressPercent: 85,
      repoUrl: 'github.com/schoolsoul/smart-poultry-v1',
      teacherFeedback: 'Outstanding application of IoT in Agriculture. Recommended for National Science Fair.',
      awards: ['1st Place School Tech Fair 2026', 'STEM Innovator Badge'],
      createdAt: '2026-06-12',
    },
    {
      id: 'proj-2',
      title: 'Ugandan Folktales Interactive Mobile App',
      studentName: 'Nassolo Brenda',
      grade: 'Senior 4',
      category: 'ICT & Software',
      problemSolved: 'Preserving indigenous cultural storytelling for younger primary pupils.',
      objectives: 'Develop offline React Native app with audio narration.',
      skillsUsed: ['TypeScript', 'React Native', 'UI/UX Design', 'Translation'],
      status: 'Published',
      progressPercent: 100,
      teacherFeedback: 'Culturally relevant and very well executed UI.',
      awards: ['Digital Creative Award 2026'],
      createdAt: '2026-05-20',
    },
  ]);

  const [products, setProducts] = useState<MarketplaceProduct[]>([
    {
      id: 'prod-1',
      title: 'Handcrafted Barkcloth Notebook Covers',
      sellerName: 'Kintu Paul',
      sellerGrade: 'Senior 3',
      category: 'Arts & Crafts',
      priceUGX: 15000,
      quantityAvailable: 12,
      description: 'Eco-friendly traditional barkcloth bound hard-cover journal notebooks.',
      approvalStatus: 'Approved',
      approvedBy: 'Mr. Musoke (Entrepreneurship Club)',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
    },
    {
      id: 'prod-2',
      title: 'Organic School Garden Honey (500g Jar)',
      sellerName: 'Young Farmers Society',
      sellerGrade: 'All Grades',
      category: 'Agriculture',
      priceUGX: 20000,
      quantityAvailable: 25,
      description: 'Pure, raw honey harvested from the school apiary project.',
      approvalStatus: 'Approved',
      approvedBy: 'Dr. Mukasa (Agriculture Dept)',
      imageUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop',
    },
    {
      id: 'prod-3',
      title: 'Custom 3D Printed Science Molecule Models',
      sellerName: 'Mwesigwa Joshua',
      sellerGrade: 'Senior 6',
      category: '3D Prints',
      priceUGX: 10000,
      quantityAvailable: 8,
      description: 'High precision molecular geometry plastic models for O-Level Chemistry revision.',
      approvalStatus: 'Approved',
      approvedBy: 'Ms. Akello (Chemistry HOD)',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
    },
  ]);

  const [services, setServices] = useState<ServiceListing[]>([
    {
      id: 'serv-1',
      title: 'O-Level Mathematics & Physics Peer Tutoring',
      studentName: 'Kato Derrick',
      category: 'Tutoring',
      hourlyRateUGX: 8000,
      description: '1-on-1 step by step problem solving techniques for O-Level National Examinations.',
      approvalStatus: 'Approved',
      bookingsCount: 14,
    },
    {
      id: 'serv-2',
      title: 'Custom Event Poster & Logo Graphic Design',
      studentName: 'Nassolo Brenda',
      category: 'Graphic Design',
      hourlyRateUGX: 12000,
      description: 'Vector posters, club logos, and digital graphics using Canva and Figma.',
      approvalStatus: 'Approved',
      bookingsCount: 9,
    },
  ]);

  const [competitions, setCompetitions] = useState<Competition[]>([
    {
      id: 'comp-1',
      title: 'National School STEM & Climate Innovation Challenge 2026',
      category: 'STEM & Climate',
      deadline: '2026-09-15',
      prizePoolUGX: 2500000,
      participantsCount: 48,
      status: 'Open for Submissions',
      organizer: 'Ministry of Education & Vinexsah Tech',
      description: 'Build sustainable agricultural, water purification, or clean energy prototypes.',
    },
    {
      id: 'comp-2',
      title: 'Annual School Hackathon: AI for Community Health',
      category: 'Software & AI',
      deadline: '2026-08-30',
      prizePoolUGX: 1000000,
      participantsCount: 32,
      status: 'Open for Submissions',
      organizer: 'SchoolSoul ICT Club',
      description: 'Create offline software tools addressing health awareness and clinic triage.',
    },
  ]);

  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([
    {
      id: 'bp-1',
      title: 'Eco-Briq Bio-Fuel Enterprise',
      ventureName: 'Eco-Briq Energy',
      studentFounder: 'Opio Samuel & Team',
      concept: 'Converting school kitchen organic waste and sawdust into smokeless cooking briquettes.',
      targetMarket: 'Local households and school canteens in town.',
      estimatedCostUGX: 350000,
      expectedMonthlyRevenueUGX: 750000,
      teacherMentor: 'Mr. Kato (Commerce Teacher)',
      stage: 'Prototyping',
    },
  ]);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // New Post Form Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<InnovationFeedPost['category']>('STEM');

  // New Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('10000');
  const [newProdCategory, setNewProdCategory] = useState<MarketplaceProduct['category']>('Arts & Crafts');
  const [newProdDesc, setNewProdDesc] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;

    const newPost: InnovationFeedPost = {
      id: 'post-' + Date.now(),
      studentName: user?.username || 'Student Innovator',
      studentGrade: 'Senior Division',
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
      likes: 1,
      commentsCount: 0,
      isVerifiedByTeacher: isTeacherOrAdmin,
      teacherVerifier: isTeacherOrAdmin ? user?.username : undefined,
      timestamp: 'Just now',
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowPostModal(false);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle || !newProdDesc) return;

    const newProd: MarketplaceProduct = {
      id: 'prod-' + Date.now(),
      title: newProdTitle,
      sellerName: user?.username || 'Student Seller',
      sellerGrade: 'Senior Division',
      category: newProdCategory,
      priceUGX: parseInt(newProdPrice) || 10000,
      quantityAvailable: 10,
      description: newProdDesc,
      approvalStatus: isTeacherOrAdmin ? 'Approved' : 'Pending Review',
      approvedBy: isTeacherOrAdmin ? user?.username : undefined,
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop',
    };

    setProducts([newProd, ...products]);
    setNewProdTitle('');
    setNewProdDesc('');
    setShowProductModal(false);
  };

  const handleAiAsk = () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiResponse(
        `💡 **AI Innovation Mentor Guidance:**\n\n` +
        `**Project Refinement for "${aiPrompt}"**:\n` +
        `1. **Problem Statement**: Clearly define the local community issue (e.g., crop post-harvest loss or solar efficiency).\n` +
        `2. **Methodology**: Start with a low-cost prototype using local materials or open-source microcontrollers.\n` +
        `3. **Teacher Verification**: Consult your STEM/Commerce teacher to get your project certified for the School Marketplace.\n` +
        `4. **Key Metric to Track**: Measure efficiency boost (e.g. percentage time or cost saved).\n\n` +
        `*Note: This suggestion is generated by SchoolSoul AI. Submit your prototype draft to your assigned teacher mentor for formal endorsement.*`
      );
      setAiLoading(false);
    }, 900);
  };

  const handleApproveProduct = (prodId: string) => {
    setProducts(
      products.map((p) =>
        p.id === prodId ? { ...p, approvalStatus: 'Approved', approvedBy: user?.username || 'Faculty Lead' } : p
      )
    );
  };

  const handleVerifyPost = (postId: string) => {
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, isVerifiedByTeacher: true, teacherVerifier: user?.username || 'Faculty' } : p
      )
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Vision 11: Innovation Hub & Marketplace
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                {isOnline ? 'Online Sync Active' : 'Offline Mode (Queued Local Store)'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Student Innovation Hub & Entrepreneurship Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              A safe, school-moderated ecosystem for student STEM projects, video showcases, peer collaboration, approved student marketplace listings, business incubation, and automated portfolio generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Share Innovation Update
            </button>
            <button
              onClick={() => setShowProductModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition hover:scale-105 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> List Product / Service
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'feed', label: 'Innovation Feed', icon: Lightbulb, badge: posts.length },
            { id: 'showcase', label: 'Projects Showcase', icon: Cpu, badge: projects.length },
            { id: 'marketplace', label: 'Student Marketplace', icon: ShoppingBag, badge: products.length },
            { id: 'services', label: 'Student Services', icon: Briefcase, badge: services.length },
            { id: 'videos', label: 'Video Showcase', icon: Video, badge: 'HD' },
            { id: 'competitions', label: 'Competitions', icon: Trophy, badge: competitions.length },
            { id: 'incubator', label: 'Business Incubator', icon: Zap, badge: businessPlans.length },
            { id: 'portfolio', label: 'Auto Portfolio', icon: Award },
            { id: 'analytics', label: 'Hub Analytics', icon: BarChart3 },
            { id: 'ai-assistant', label: 'AI Innovation Assistant', icon: Bot },
            ...(isTeacherOrAdmin ? [{ id: 'moderation', label: 'Teacher Moderation Queue', icon: ShieldCheck, badge: 'Staff' }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      isActive ? 'bg-indigo-500/40 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}

      {/* 1. INNOVATION FEED TAB */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student posts, tech..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                {['All', 'STEM', 'Robotics', 'Agriculture', 'ICT & Software', 'Arts & Crafts'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                      selectedCategory === cat
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Stream */}
            {posts
              .filter(
                (p) =>
                  (selectedCategory === 'All' || p.category === selectedCategory) &&
                  (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.content.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((post) => (
                <div
                  key={post.id}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl transition hover:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                        {post.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{post.studentName}</h4>
                          <span className="text-[11px] text-slate-400">• {post.studentGrade}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{post.timestamp}</span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-medium">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {post.isVerifiedByTeacher ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Teacher Verified
                      </span>
                    ) : isTeacherOrAdmin ? (
                      <button
                        onClick={() => handleVerifyPost(post.id)}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Verify Post
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">
                        Under Moderation
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white leading-snug">{post.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>
                  </div>

                  {/* Code Snippet Media if present */}
                  {post.mediaType === 'code' && post.codeSnippet && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-1">
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3" /> Source Code Snippet
                        </span>
                        <span>Python / Embedded C</span>
                      </div>
                      <pre className="pt-2">{post.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Image Media if present */}
                  {post.mediaType === 'image' && post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 max-h-72">
                      <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Video Media Simulation */}
                  {post.mediaType === 'video' && (
                    <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2 text-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                        <Video className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-200">Demonstration Video Preview (HD Cached)</p>
                      <span className="text-[10px] text-slate-500">Moderated & Verified Safe for School Viewers</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setPosts(posts.map((p) => (p.id === post.id ? { ...p, likes: p.likes + 1 } : p)));
                        }}
                        className="flex items-center gap-1.5 hover:text-indigo-400 transition cursor-pointer"
                      >
                        <ThumbsUp className="w-4 h-4 text-slate-400" />
                        <span>{post.likes} Endorsements</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-indigo-400 transition cursor-pointer">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span>{post.commentsCount} Peer Discussions</span>
                      </button>
                    </div>
                    {post.teacherVerifier && (
                      <span className="text-[10px] text-slate-500">Verified by: {post.teacherVerifier}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Right Sidebar Widget Stack */}
          <div className="space-y-6">
            {/* Quick AI Innovation Widget */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/40 border border-indigo-800/40 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">AI Innovation Assistant</h3>
              </div>
              <p className="text-xs text-slate-300">
                Need help refining your STEM project concept, writing business plans, or preparing demonstration pitches?
              </p>
              <button
                onClick={() => setActiveTab('ai-assistant')}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                Launch AI Mentor <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top Trending Projects List */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Featured Innovators
              </h3>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{proj.category}</span>
                    <h4 className="text-xs font-bold text-white leading-tight">{proj.title}</h4>
                    <p className="text-[11px] text-slate-400">By {proj.studentName} ({proj.grade})</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${proj.progressPercent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT PROJECTS SHOWCASE TAB */}
      {activeTab === 'showcase' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" /> Student Project Portfolios & Lifecycle Management
              </h2>
              <p className="text-xs text-slate-400">
                Detailed research, engineering objectives, progress tracking, and teacher endorsement history.
              </p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" /> Submit Project Portfolio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {proj.category}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        proj.status === 'Published' || proj.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-200">Innovator:</strong> {proj.studentName} ({proj.grade})
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p>
                      <strong className="text-indigo-300">Problem Addressed:</strong> {proj.problemSolved}
                    </p>
                    <p>
                      <strong className="text-purple-300">Objectives:</strong> {proj.objectives}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.skillsUsed.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] border border-slate-800">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {proj.teacherFeedback && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Faculty Endorsement & Feedback
                      </span>
                      <p className="text-xs italic text-slate-300">"{proj.teacherFeedback}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Milestone Progress</span>
                    <span className="font-bold text-indigo-400">{proj.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: `${proj.progressPercent}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STUDENT MARKETPLACE TAB */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" /> Safe School Student Marketplace
              </h2>
              <p className="text-xs text-slate-400">
                Student-crafted products, artwork, 3D lab models, and agricultural harvests. All items undergo mandatory teacher approval.
              </p>
            </div>

            <button
              onClick={() => setShowProductModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" /> List Product for Approval
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-44 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
                    <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/90 text-emerald-400 border border-emerald-500/30">
                      UGX {prod.priceUGX.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{prod.category}</span>
                    {prod.approvalStatus === 'Approved' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Teacher Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending Approval
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white">{prod.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{prod.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Seller: {prod.sellerName}</span>
                    <span className="text-emerald-400 font-bold">{prod.quantityAvailable} in Stock</span>
                  </div>

                  {isTeacherOrAdmin && prod.approvalStatus !== 'Approved' && (
                    <button
                      onClick={() => handleApproveProduct(prod.id)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Approve for Student Sales
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. STUDENT SERVICES MARKETPLACE TAB */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sky-400" /> Student Skills & Services Directory
            </h2>
            <p className="text-xs text-slate-400">
              Peer tutoring, graphic design, and coding services. Bookings are monitored and confirmed by school mentors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((serv) => (
              <div key={serv.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {serv.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">UGX {serv.hourlyRateUGX.toLocaleString()} / hr</span>
                </div>

                <h3 className="text-base font-bold text-white">{serv.title}</h3>
                <p className="text-xs text-slate-300">{serv.description}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Student Provider: {serv.studentName}</span>
                  <span className="text-sky-300 font-semibold">{serv.bookingsCount} Completed Sessions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VIDEO SHOWCASE TAB */}
      {activeTab === 'videos' && (
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Student Video Demonstration Showcase</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Record or upload experiment demonstrations, robotics tests, agricultural pitches, and public speeches. All videos are compressed locally, cached for offline access, and screened before public publishing.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer inline-flex items-center gap-2">
            <Video className="w-4 h-4" /> Record Video Clip (Camera API)
          </button>
        </div>
      )}

      {/* 6. COMPETITIONS TAB */}
      {activeTab === 'competitions' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Innovation Competitions & Science Fairs
            </h2>
            <p className="text-xs text-slate-400">
              Participate in school hackathons, ICT challenges, and agriculture fairs with automated scoring and certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitions.map((comp) => (
              <div key={comp.id} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {comp.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">Prize Pool: UGX {comp.prizePoolUGX.toLocaleString()}</span>
                </div>

                <h3 className="text-base font-bold text-white">{comp.title}</h3>
                <p className="text-xs text-slate-300">{comp.description}</p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Organizer: {comp.organizer}</span>
                  <span>Deadline: {comp.deadline}</span>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" /> Register Project Team
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. BUSINESS INCUBATOR TAB */}
      {activeTab === 'incubator' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> School Business Incubator & Ventures
            </h2>
            <p className="text-xs text-slate-400">
              Student-led micro enterprises with cost estimations, revenue projections, and teacher mentor oversight.
            </p>
          </div>

          {businessPlans.map((bp) => (
            <div key={bp.id} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{bp.ventureName}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                  Stage: {bp.stage}
                </span>
              </div>

              <p className="text-xs text-slate-300">{bp.concept}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Estimated Startup Cost</span>
                  <span className="font-bold text-slate-200">UGX {bp.estimatedCostUGX.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Expected Monthly Revenue</span>
                  <span className="font-bold text-emerald-400">UGX {bp.expectedMonthlyRevenueUGX.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Teacher Mentor</span>
                  <span className="font-bold text-indigo-300">{bp.teacherMentor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. AUTO PORTFOLIO GENERATOR TAB */}
      {activeTab === 'portfolio' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" /> Student Innovation & Skills Passport
              </h2>
              <p className="text-xs text-slate-400">Auto-compiled resume of projects, badges, marketplace sales, and teacher recommendations.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg">
              <Download className="w-4 h-4" /> Export Portfolio to PDF
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm">Innovator: {user?.username || 'Student Innovator'}</h3>
              <p className="text-slate-400">Class: Senior Secondary Division • Specialization: STEM & ICT</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-indigo-300">Verified Skills & Badges</h4>
              <div className="flex flex-wrap gap-2">
                {['Arduino C++', 'Agricultural IoT', 'React Native', 'Barkcloth Crafts', 'Financial Literacy'].map((b, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold">
                    🏆 {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. HUB ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl">
            <span className="text-xs font-bold text-slate-400">Active Innovators</span>
            <div className="text-2xl font-black text-white">124</div>
            <span className="text-[10px] text-emerald-400">+18% this term</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl">
            <span className="text-xs font-bold text-slate-400">Approved STEM Projects</span>
            <div className="text-2xl font-black text-indigo-400">{projects.length}</div>
            <span className="text-[10px] text-slate-500">Teacher Endorsed</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl">
            <span className="text-xs font-bold text-slate-400">Marketplace Sales</span>
            <div className="text-2xl font-black text-emerald-400">UGX 450,000</div>
            <span className="text-[10px] text-slate-400">School Supervised</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-xl">
            <span className="text-xs font-bold text-slate-400">Competition Submissions</span>
            <div className="text-2xl font-black text-amber-400">80</div>
            <span className="text-[10px] text-slate-500">2 Active Hackathons</span>
          </div>
        </div>
      )}

      {/* 10. AI INNOVATION ASSISTANT TAB */}
      {activeTab === 'ai-assistant' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Bot className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">AI STEM & Entrepreneurship Mentor</h2>
              <p className="text-xs text-slate-400">Brainstorm project ideas, calculate business costs, or refine science fair proposals.</p>
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. How can I build a low-cost solar egg incubator using local materials in Uganda?"
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleAiAsk}
              disabled={aiLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition"
            >
              <Sparkles className="w-4 h-4" /> {aiLoading ? 'Synthesizing Advice...' : 'Ask AI Innovation Mentor'}
            </button>
          </div>

          {aiResponse && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-sans text-xs text-slate-200 whitespace-pre-wrap space-y-2">
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* 11. TEACHER MODERATION QUEUE TAB */}
      {activeTab === 'moderation' && isTeacherOrAdmin && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Faculty Safeguarding & Moderation Desk
            </h2>
            <p className="text-xs text-slate-400">Review student marketplace listings, project posts, and services before public publication.</p>
          </div>

          <div className="space-y-3">
            {products.map((prod) => (
              <div key={prod.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{prod.title}</h4>
                  <p className="text-[11px] text-slate-400">By {prod.sellerName} • UGX {prod.priceUGX.toLocaleString()}</p>
                </div>
                {prod.approvalStatus === 'Approved' ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Approved
                  </span>
                ) : (
                  <button
                    onClick={() => handleApproveProduct(prod.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-500"
                  >
                    Approve Listing
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW POST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Share Student Innovation Update</h3>
            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Innovation Title</label>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g. Automated Soil pH Testing Probe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                >
                  <option value="STEM">STEM</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="ICT & Software">ICT & Software</option>
                  <option value="Arts & Crafts">Arts & Crafts</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description & Methodology</label>
                <textarea
                  rows={4}
                  required
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Describe your prototype, materials used, and research results..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 cursor-pointer"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">List Product for School Marketplace</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  placeholder="e.g. Woven Raffia Desk Organizer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Price (UGX)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  >
                    <option value="Arts & Crafts">Arts & Crafts</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Software">Software</option>
                    <option value="Electronics">Electronics</option>
                    <option value="3D Prints">3D Prints</option>
                    <option value="Books">Books</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Product Description</label>
                <textarea
                  rows={3}
                  required
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Details about craftsmanship, materials, or software features..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 cursor-pointer"
                >
                  Submit for Teacher Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
