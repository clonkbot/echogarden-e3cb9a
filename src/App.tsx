import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Type definitions
type SeedData = {
  _id: Id<"seeds">;
  content: string;
  category: string;
  treeType?: string;
  isDreamSeed: boolean;
  growthLevel: number;
  authorName: string;
  branchCount: number;
  reactionCount: number;
  createdAt: number;
};

// Floating particles component
function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${
              ['rgba(167,139,250,0.4)', 'rgba(251,191,36,0.3)', 'rgba(244,114,182,0.3)', 'rgba(52,211,153,0.3)'][Math.floor(Math.random() * 4)]
            }, transparent)`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Tiny creatures that appear near content
function TinyCreature({ type }: { type: 'firefly' | 'butterfly' | 'sprite' }) {
  const creatures: Record<string, string> = {
    firefly: '✨',
    butterfly: '🦋',
    sprite: '🧚',
  };

  return (
    <span className="animate-bounce-slow text-xs opacity-70">
      {creatures[type]}
    </span>
  );
}

// Auth component
function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <FloatingParticles />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl md:text-7xl mb-4">🌱</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            EchoGarden
          </h1>
          <p className="text-white/60 mt-3 font-body text-base md:text-lg">
            Plant thoughts. Grow ideas. Watch them bloom.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 transition-all font-body text-base"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 transition-all font-body text-base"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <p className="text-pink-400 text-sm text-center font-body">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-display font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50 glow-button"
            >
              {isLoading ? "..." : flow === "signIn" ? "Enter Garden" : "Create Garden"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-white/60 hover:text-white transition-colors font-body text-sm"
            >
              {flow === "signIn" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => signIn("anonymous")}
              className="w-full py-3 rounded-2xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all font-body text-sm"
            >
              🌿 Continue as Guest Wanderer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile setup modal
function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const createProfile = useMutation(api.profiles.createOrUpdate);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    await createProfile({ displayName: name.trim() });
    setIsLoading(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 md:p-8 rounded-3xl w-full max-w-md animate-scale-in">
        <h2 className="font-display text-2xl font-bold text-white mb-2">Welcome, Gardener!</h2>
        <p className="text-white/60 mb-6 font-body text-sm">Choose a name for your garden journey</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your gardener name"
            className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 transition-all font-body text-base"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-display font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? "Planting..." : "Start Growing 🌱"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Tree visualization based on growth level and type
function TreeVisual({ growthLevel, treeType }: { growthLevel: number; treeType?: string }) {
  const trees: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '🪴',
    4: '🌳',
    5: '🌲',
  };

  const specialTrees: Record<string, string> = {
    heart: '🌸',
    wisdom: '🌴',
    dream: '🌺',
  };

  const size = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'][growthLevel - 1] || 'text-2xl';

  return (
    <span className={`${size} animate-grow`}>
      {treeType && growthLevel >= 3 ? specialTrees[treeType] : trees[growthLevel]}
    </span>
  );
}

// Emotion reactions
const emotions = [
  { emoji: '💖', name: 'love' },
  { emoji: '✨', name: 'inspire' },
  { emoji: '🤗', name: 'comfort' },
  { emoji: '🌟', name: 'wonder' },
  { emoji: '🌈', name: 'hope' },
];

// Branch type selector
const branchTypes = [
  { icon: '💡', name: 'advice', label: 'Advice' },
  { icon: '📖', name: 'continuation', label: 'Continue Story' },
  { icon: '💭', name: 'experience', label: 'My Experience' },
  { icon: '🎨', name: 'artwork', label: 'Creative Response' },
  { icon: '🔧', name: 'solution', label: 'Solution' },
  { icon: '🌀', name: 'alternate', label: 'Alternate Reality' },
];

// Categories for exploring
const categories = [
  { id: 'creativity', name: 'Creativity', emoji: '🎨', color: 'from-pink-500 to-rose-500' },
  { id: 'life-advice', name: 'Life Advice', emoji: '🌟', color: 'from-amber-500 to-orange-500' },
  { id: 'dreams', name: 'Dreams', emoji: '🌙', color: 'from-violet-500 to-purple-500' },
  { id: 'future-tech', name: 'Future Tech', emoji: '🚀', color: 'from-cyan-500 to-blue-500' },
  { id: 'philosophy', name: 'Philosophy', emoji: '🦋', color: 'from-emerald-500 to-teal-500' },
];

// Seed card component
function SeedCard({
  seed,
  onClick,
  showCreature = false,
}: {
  seed: {
    _id: Id<"seeds">;
    content: string;
    category: string;
    treeType?: string;
    isDreamSeed: boolean;
    growthLevel: number;
    authorName: string;
    branchCount: number;
    reactionCount: number;
    createdAt: number;
  };
  onClick: () => void;
  showCreature?: boolean;
}) {
  const react = useMutation(api.reactions.react);
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = async (emotion: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await react({ seedId: seed._id, emotion });
    setShowReactions(false);
  };

  return (
    <div
      className="glass-card p-4 md:p-5 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-fade-in relative group"
      onClick={onClick}
    >
      {showCreature && seed.growthLevel >= 3 && (
        <div className="absolute -top-2 -right-2">
          <TinyCreature type={seed.growthLevel >= 4 ? 'butterfly' : 'firefly'} />
        </div>
      )}

      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <TreeVisual growthLevel={seed.growthLevel} treeType={seed.treeType} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-body text-sm md:text-base leading-relaxed line-clamp-3">
            {seed.content}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              {seed.isDreamSeed ? '🌙' : '👤'} {seed.authorName}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              🌿 {seed.branchCount}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              💖 {seed.reactionCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {categories.find(c => c.id === seed.category) && (
            <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${categories.find(c => c.id === seed.category)?.color} text-white`}>
              {categories.find(c => c.id === seed.category)?.emoji} {categories.find(c => c.id === seed.category)?.name}
            </span>
          )}
          {seed.treeType && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
              {seed.treeType === 'heart' ? '❤️ Heart Tree' : seed.treeType === 'wisdom' ? '🧠 Wisdom Tree' : '💫 Dream Tree'}
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(!showReactions);
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-lg"
          >
            💖
          </button>

          {showReactions && (
            <div className="absolute bottom-full right-0 mb-2 flex gap-1 bg-slate-900/95 backdrop-blur-xl p-2 rounded-2xl border border-white/20 animate-scale-in">
              {emotions.map((em) => (
                <button
                  key={em.name}
                  onClick={(e) => handleReaction(em.name, e)}
                  className="p-2 hover:scale-125 transition-transform text-xl"
                  title={em.name}
                >
                  {em.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Seed detail view
function SeedDetail({
  seedId,
  onClose
}: {
  seedId: Id<"seeds">;
  onClose: () => void;
}) {
  const seed = useQuery(api.seeds.get, { id: seedId });
  const growBranch = useMutation(api.branches.grow);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchContent, setBranchContent] = useState("");
  const [branchType, setBranchType] = useState("advice");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchContent.trim()) return;

    setIsSubmitting(true);
    await growBranch({
      seedId,
      content: branchContent.trim(),
      branchType,
    });
    setBranchContent("");
    setShowBranchForm(false);
    setIsSubmitting(false);
  };

  if (!seed) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="animate-pulse text-4xl">🌱</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onClose}
            className="mb-4 text-white/60 hover:text-white transition-colors flex items-center gap-2 font-body text-sm"
          >
            ← Back to Garden
          </button>

          <div className="glass-card p-5 md:p-8 rounded-3xl animate-slide-up">
            <div className="text-center mb-6">
              <TreeVisual growthLevel={seed.growthLevel} treeType={seed.treeType} />
              {seed.treeType && (
                <p className="text-white/60 text-sm mt-2 font-body">
                  {seed.treeType === 'heart' ? '❤️ Heart Tree - Grown from emotional connections' :
                   seed.treeType === 'wisdom' ? '🧠 Wisdom Tree - Grown from solutions' :
                   '💫 Dream Tree - Grown from creativity'}
                </p>
              )}
            </div>

            <p className="text-white text-lg md:text-xl leading-relaxed font-body text-center mb-6">
              "{seed.content}"
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-white/50 mb-6 font-body">
              <span>{seed.isDreamSeed ? '🌙' : '👤'} {seed.authorName}</span>
              <span>·</span>
              <span>🌿 {seed.branchCount} branches</span>
              <span>·</span>
              <span>💖 {seed.reactionCount} reactions</span>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {emotions.map((em) => {
                const count = seed.reactions.filter((r: { emotion: string }) => r.emotion === em.name).length;
                if (count === 0) return null;
                return (
                  <span key={em.name} className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {em.emoji} {count}
                  </span>
                );
              })}
            </div>

            <button
              onClick={() => setShowBranchForm(!showBranchForm)}
              className="w-full py-3 rounded-2xl border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 transition-all font-display text-sm"
            >
              🌿 Grow a Branch
            </button>

            {showBranchForm && (
              <form onSubmit={handleSubmitBranch} className="mt-4 animate-fade-in">
                <div className="flex flex-wrap gap-2 mb-4">
                  {branchTypes.map((bt) => (
                    <button
                      key={bt.name}
                      type="button"
                      onClick={() => setBranchType(bt.name)}
                      className={`px-3 py-2 rounded-xl text-xs transition-all ${
                        branchType === bt.name
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {bt.icon} {bt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={branchContent}
                  onChange={(e) => setBranchContent(e.target.value)}
                  placeholder="Add your branch to this idea..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 transition-all font-body text-sm resize-none"
                  rows={4}
                />

                <button
                  type="submit"
                  disabled={!branchContent.trim() || isSubmitting}
                  className="mt-3 w-full py-3 rounded-xl bg-emerald-500 text-white font-display text-sm hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Growing..." : "Plant Branch 🌿"}
                </button>
              </form>
            )}
          </div>

          {seed.branches.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-white/80 font-display text-lg">🌿 Branches</h3>
              {seed.branches.map((branch: { _id: string; content: string; branchType: string; authorName: string }) => (
                <div key={branch._id} className="glass-card p-4 rounded-2xl animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">
                      {branchTypes.find(bt => bt.name === branch.branchType)?.icon || '🌿'}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-body text-sm leading-relaxed">{branch.content}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                        <span className="capitalize">{branchTypes.find(bt => bt.name === branch.branchType)?.label}</span>
                        <span>·</span>
                        <span>by {branch.authorName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Plant seed modal
function PlantSeedModal({ onClose }: { onClose: () => void }) {
  const plantSeed = useMutation(api.seeds.plant);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("creativity");
  const [isDreamSeed, setIsDreamSeed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prompts = [
    "What idea is on your mind today?",
    "What question keeps you awake at night?",
    "Share a dream you can't forget...",
    "What would you tell your younger self?",
    "If you could solve one problem...",
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    await plantSeed({
      content: content.trim(),
      category,
      isDreamSeed,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg glass-card p-5 md:p-8 rounded-3xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Plant a Seed</h2>
            <p className="text-white/60 font-body text-sm mt-1">{currentPrompt}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your thought, question, or dream..."
            className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 transition-all font-body text-base resize-none"
            rows={5}
            autoFocus
          />

          <div>
            <p className="text-white/60 text-sm mb-3 font-body">Choose a garden</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    category === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white`
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isDreamSeed}
              onChange={(e) => setIsDreamSeed(e.target.checked)}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-violet-500 focus:ring-violet-400/50"
            />
            <span className="text-white/80 font-body text-sm">
              🌙 Plant as Dream Seed (anonymous)
            </span>
          </label>

          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-display font-semibold hover:opacity-90 transition-all disabled:opacity-50 glow-button"
          >
            {isSubmitting ? "Planting..." : "Plant Seed 🌱"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Navigation tabs
type Tab = 'home' | 'explore' | 'plant' | 'garden' | 'profile';

function Navigation({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: '🏡', label: 'Home' },
    { id: 'explore', icon: '🌲', label: 'Explore' },
    { id: 'plant', icon: '🌱', label: 'Plant' },
    { id: 'garden', icon: '🌸', label: 'My Garden' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 z-40 safe-area-bottom">
      <div className="flex justify-around items-center py-2 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-3 md:px-4 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'text-white bg-white/10'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span className="text-xl md:text-2xl">{tab.icon}</span>
            <span className="text-[10px] md:text-xs mt-1 font-body">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// Home garden view
function HomeGarden({ onSelectSeed }: { onSelectSeed: (id: Id<"seeds">) => void }) {
  const trendingSeeds = useQuery(api.seeds.getTrending);
  const recentSeeds = useQuery(api.seeds.list, { limit: 10 });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">Welcome to the Garden</h1>
        <p className="text-white/60 font-body text-sm md:text-base">Explore growing ideas from fellow gardeners</p>
      </div>

      {trendingSeeds && trendingSeeds.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
            🌳 Trending Trees
            <TinyCreature type="butterfly" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingSeeds.slice(0, 4).map((seed: SeedData, i: number) => (
              <SeedCard
                key={seed._id}
                seed={seed}
                onClick={() => onSelectSeed(seed._id)}
                showCreature={i === 0}
              />
            ))}
          </div>
        </section>
      )}

      {recentSeeds && (
        <section>
          <h2 className="font-display text-xl text-white mb-4">🌱 Fresh Seeds</h2>
          <div className="space-y-4">
            {recentSeeds.map((seed: SeedData) => (
              <SeedCard
                key={seed._id}
                seed={seed}
                onClick={() => onSelectSeed(seed._id)}
              />
            ))}
          </div>

          {recentSeeds.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🌱</div>
              <p className="text-white/60 font-body">The garden is empty. Plant the first seed!</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// Explore forest view
function ExploreForest({ onSelectSeed }: { onSelectSeed: (id: Id<"seeds">) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categorySeeds = useQuery(
    api.seeds.listByCategory,
    selectedCategory ? { category: selectedCategory } : "skip"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">Explore Forest</h1>
        <p className="text-white/60 font-body text-sm md:text-base">Discover ideas by topic</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            className={`p-4 md:p-6 rounded-2xl transition-all ${
              selectedCategory === cat.id
                ? `bg-gradient-to-br ${cat.color} scale-105`
                : 'glass-card hover:scale-102'
            }`}
          >
            <div className="text-3xl md:text-4xl mb-2">{cat.emoji}</div>
            <div className="font-display text-white text-sm md:text-base">{cat.name}</div>
          </button>
        ))}
      </div>

      {selectedCategory && categorySeeds && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="font-display text-xl text-white">
            {categories.find(c => c.id === selectedCategory)?.emoji} {categories.find(c => c.id === selectedCategory)?.name} Seeds
          </h2>
          {categorySeeds.map((seed: SeedData) => (
            <SeedCard
              key={seed._id}
              seed={seed}
              onClick={() => onSelectSeed(seed._id)}
            />
          ))}
          {categorySeeds.length === 0 && (
            <p className="text-center text-white/60 py-8 font-body">No seeds in this garden yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  );
}

// My garden view
function MyGarden({ onSelectSeed }: { onSelectSeed: (id: Id<"seeds">) => void }) {
  const mySeeds = useQuery(api.seeds.listByUser);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">Your Garden</h1>
        <p className="text-white/60 font-body text-sm md:text-base">See how your ideas have grown</p>
      </div>

      {mySeeds && mySeeds.length > 0 ? (
        <div className="space-y-4">
          {mySeeds.map((seed: SeedData) => (
            <SeedCard
              key={seed._id}
              seed={seed}
              onClick={() => onSelectSeed(seed._id)}
              showCreature={seed.growthLevel >= 4}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌿</div>
          <p className="text-white/60 font-body mb-4">You haven't planted any seeds yet</p>
          <p className="text-white/40 font-body text-sm">Tap the Plant tab to share your first idea!</p>
        </div>
      )}
    </div>
  );
}

// Profile view
function ProfileView() {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.get);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const updateProfile = useMutation(api.profiles.createOrUpdate);

  const handleSave = async () => {
    if (newName.trim()) {
      await updateProfile({ displayName: newName.trim() });
      setIsEditing(false);
    }
  };

  const titleBadges: Record<string, string> = {
    'Seed Planter': '🌱',
    'Idea Gardener': '🌿',
    'Forest Philosopher': '🌲',
    'Dream Architect': '🏛️',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 md:p-8 rounded-3xl text-center">
        <div className="text-6xl md:text-7xl mb-4">
          {profile ? titleBadges[profile.title] || '🌱' : '🌱'}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-center font-display text-xl focus:outline-none focus:border-violet-400/50"
              autoFocus
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-xl bg-emerald-500 text-white font-body text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-xl bg-white/10 text-white font-body text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
              {profile?.displayName || 'Anonymous Gardener'}
            </h2>
            <button
              onClick={() => {
                setNewName(profile?.displayName || '');
                setIsEditing(true);
              }}
              className="text-white/40 hover:text-white/60 text-xs font-body"
            >
              Edit name
            </button>
          </>
        )}

        <div className="mt-4 inline-block px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/30 to-pink-500/30 border border-violet-400/30">
          <span className="font-display text-white">
            {profile?.title || 'Seed Planter'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 md:p-6 rounded-2xl text-center">
          <div className="text-3xl md:text-4xl font-display text-emerald-400">
            {profile?.seedsPlanted || 0}
          </div>
          <div className="text-white/60 font-body text-sm mt-1">Seeds Planted</div>
        </div>
        <div className="glass-card p-4 md:p-6 rounded-2xl text-center">
          <div className="text-3xl md:text-4xl font-display text-violet-400">
            {profile?.branchesGrown || 0}
          </div>
          <div className="text-white/60 font-body text-sm mt-1">Branches Grown</div>
        </div>
      </div>

      <div className="glass-card p-5 md:p-6 rounded-2xl">
        <h3 className="font-display text-lg text-white mb-4">🏆 Titles & Progress</h3>
        <div className="space-y-3">
          {Object.entries(titleBadges).map(([title, badge]) => {
            const requirements: Record<string, number> = {
              'Seed Planter': 0,
              'Idea Gardener': 20,
              'Forest Philosopher': 50,
              'Dream Architect': 100,
            };
            const total = (profile?.seedsPlanted || 0) + (profile?.branchesGrown || 0);
            const unlocked = total >= requirements[title];

            return (
              <div
                key={title}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  unlocked ? 'bg-white/10' : 'bg-white/5 opacity-50'
                }`}
              >
                <span className="text-2xl">{badge}</span>
                <div className="flex-1">
                  <div className="font-display text-white text-sm">{title}</div>
                  <div className="text-white/40 text-xs font-body">
                    {requirements[title]}+ contributions
                  </div>
                </div>
                {unlocked && <span className="text-emerald-400">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => signOut()}
        className="w-full py-4 rounded-2xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all font-body text-sm"
      >
        🚪 Leave Garden
      </button>
    </div>
  );
}

// Main app component
function MainApp() {
  const profile = useQuery(api.profiles.get);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [selectedSeedId, setSelectedSeedId] = useState<Id<"seeds"> | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (profile === null) {
      setShowProfileSetup(true);
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'plant') {
      setShowPlantModal(true);
      setActiveTab('home');
    }
  }, [activeTab]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900' : 'bg-gradient-to-br from-emerald-50 via-violet-50 to-pink-50'}`}>
      <FloatingParticles />

      <div className="relative z-10 pb-24 pt-4">
        <div className="px-4 max-w-2xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="font-display text-lg text-white font-semibold">EchoGarden</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </header>

          {/* Content */}
          {activeTab === 'home' && <HomeGarden onSelectSeed={setSelectedSeedId} />}
          {activeTab === 'explore' && <ExploreForest onSelectSeed={setSelectedSeedId} />}
          {activeTab === 'garden' && <MyGarden onSelectSeed={setSelectedSeedId} />}
          {activeTab === 'profile' && <ProfileView />}

          {/* Footer */}
          <footer className="mt-12 pb-4 text-center">
            <p className="text-white/30 text-xs font-body">
              Requested by @flambons · Built by @clonkbot
            </p>
          </footer>
        </div>
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {showProfileSetup && profile === null && (
        <ProfileSetup onComplete={() => setShowProfileSetup(false)} />
      )}

      {showPlantModal && (
        <PlantSeedModal onClose={() => setShowPlantModal(false)} />
      )}

      {selectedSeedId && (
        <SeedDetail
          seedId={selectedSeedId}
          onClose={() => setSelectedSeedId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-white/60 font-body">Growing your garden...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <MainApp />;
}
