import React, { useState } from "react";
import { Calendar, User, Clock, Heart, MessageSquare, ArrowLeft, Search, Bookmark } from "lucide-react";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: "Traditional" | "Footwear" | "Accessories" | "Heritage";
  author: string;
  date: string;
  readTime: string;
  image: string;
  likes: number;
  comments: { user: string; text: string; date: string }[];
}

const initialArticles: Article[] = [
  {
    id: "revival-dhakai-jamdani",
    title: "The Revival of Dhakai Jamdani: Crafting Borderless Luxury",
    summary: "Discover how the legendary weaving communities of Dhaka are reimagining traditional golden-thread sarees for contemporary high-fashion platforms globally.",
    category: "Traditional",
    author: "Sharmila Sen",
    date: "June 24, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    likes: 124,
    comments: [
      { user: "Nusrat J.", text: "This is a beautifully written piece. The heritage of Jamdani is truly unique!", date: "June 25, 2026" },
      { user: "Priya Sharma", text: "Do you source directly from the weavers in Sonargaon? Incredible collection.", date: "June 26, 2026" }
    ],
    content: [
      "For centuries, the name Dhakai Jamdani has evoked images of ethereal translucent fabrics, woven with exquisite geometric patterns that seem to float upon the surface. Originating in the fertile plains surrounding Dhaka, Bangladesh, this ancient handloom art form has withstood the test of industrialization, global shifts, and political borders to remain a crowning jewel of traditional South Asian fashion.",
      "At Megna Enterprise, we believe that true luxury lies in preservation. Every single Jamdani saree in our collection is sourced directly from master weavers who have kept this UNESCO-declared Intangible Cultural Heritage alive. The weaving process is incredibly intense, often requiring two artisans sitting side-by-side on a wooden pit loom for up to six months to complete a single masterpiece.",
      "What makes the modern Jamdani renaissance so captivating is the bold blend of contemporary design sensibilities with centuries-old motifs. Designers are moving beyond standard color palettes to experiment with pastel slate, midnight charcoal, and metallic copper threads, making these sarees perfect not just for wedding rituals, but for elite global gala events.",
      "By purchasing a curated Jamdani, you are not merely buying a dress; you are supporting a cross-border lineage of craftsmanship that translates directly into sustainable living wages for local handloom cooperatives."
    ]
  },
  {
    id: "sneaker-revolution",
    title: "From Track to Runway: The Premium Sneaker Silhouette Revolution",
    summary: "How modern sneaker design combines athletic sole support with luxury full-grain leather, tailored for the urban pioneer of Kolkata and Dhaka.",
    category: "Footwear",
    author: "Tanvir Ahmed",
    date: "June 18, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    likes: 89,
    comments: [
      { user: "Rohan K.", text: "The Megna Pro Elite sneaker is seriously comfortable. Love the editorial styling.", date: "June 19, 2026" }
    ],
    content: [
      "The global sneaker ecosystem has transitioned from basic athletic wear to a definitive lifestyle statement. Today, premium footwear is expected to transition effortlessly from boardrooms to upscale evening lounges.",
      "Megna's engineering team recently launched our signature Pro Elite athletic sneakers. The design marries high-rebound cushioning with premium full-grain Italian leather paneling, presenting a structural hybrid suited for humid subcontinental climates. The mesh panels are dynamically placed to maximize ventilation while reinforcing the visual structure.",
      "Styling sneakers with traditional silhouettes has also emerged as a major trend across South Asian fashion centers. We see influencers pairing bespoke off-white sneakers with traditional linen kurtas or tailored trousers, challenging conventional codes of luxury style.",
      "Maintenance is key to ensuring your leather kicks last a lifetime. We recommend utilizing a natural beeswax cream to seal the leather pores and brushing dirt off the mesh immediately with a soft horsehair brush."
    ]
  },
  {
    id: "watch-collector-guide",
    title: "The Collector's Watch: Curation, Care & Classic Pairings",
    summary: "An essential guide to selecting automatic luxury watches, preserving their complex calibers in humid climates, and styling them with ethnic ensembles.",
    category: "Accessories",
    author: "Joydeep Roy",
    date: "June 12, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&auto=format&fit=crop&q=80",
    likes: 142,
    comments: [],
    content: [
      "A timepiece is more than a tool for tracking hours—it is a visual anchor of personal identity and historical legacy. For the modern enthusiast, collecting watches is a journey of appreciation for miniature engineering and aesthetic design.",
      "In regions like West Bengal and Bangladesh, the humid climate poses unique challenges for mechanical watches. Condensation and moisture are the natural enemies of automatic calibers. It is crucial to ensure that crowns are completely screwed down before stepping outdoors, and storing your collection inside a dehumidified watch box is highly recommended.",
      "When it comes to aesthetic pairings, matching the watch metal with other accessories is a golden rule. A polished rose gold bezel pairs wonderfully with warm-toned traditional sarees and gold jewelry, while a brushed steel chronometer coordinates beautifully with modern formal wear or high-end athletic footwear."
    ]
  },
  {
    id: "megna-logistics-heritage",
    title: "Cross-Border Curation: The Story of Megna Enterprise",
    summary: "Go behind the scenes of our unique dual-node warehouse network in Kolkata and Dhaka that delivers certified authentic merchandise flawlessly.",
    category: "Heritage",
    author: "Biman Das",
    date: "May 28, 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
    likes: 210,
    comments: [
      { user: "Suresh Banik", text: "The delivery to Kolkata was amazingly fast. Really proud of this initiative!", date: "May 29, 2026" },
      { user: "Tahsina R.", text: "Authentic sarees across the border have always been hard to get. Megna solved it.", date: "May 30, 2026" }
    ],
    content: [
      "Megna Enterprise was founded with a single, clear objective: to build a seamless corridor for authentic, premium fashion between India and Bangladesh. Traditionally, customers looking for genuine Dhakai Jamdanis in Kolkata or premium Indian designer apparel in Dhaka faced exorbitant customs fees, long shipping delays, and the constant risk of counterfeit goods.",
      "To resolve this, we established a state-of-the-art dual-warehouse network with operational nodes in Kolkata and Dhaka. Our custom clearance specialists inspect and certify every single piece. This localized distribution ensures that packages do not linger in customs depots, reducing average delivery times to just 3 to 5 business days.",
      "We believe that a border should never be a barrier to high-quality lifestyle choice. Our commitment to authentic source validation means that every single customer receives an official certificate of origin and an absolute guarantee of premium standard craftsmanship."
    ]
  }
];

export default function BlogView({ isDarkMode }: { isDarkMode: boolean }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  // Comments local state for active article
  const [commentUser, setCommentUser] = useState("");
  const [commentText, setCommentText] = useState("");

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles(prev =>
      prev.map(art => (art.id === id ? { ...art, likes: art.likes + 1 } : art))
    );
    if (activeArticle && activeArticle.id === id) {
      setActiveArticle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentUser.trim() || !commentText.trim() || !activeArticle) return;

    const newComment = {
      user: commentUser,
      text: commentText,
      date: "Today"
    };

    const updatedArticles = articles.map(art => {
      if (art.id === activeArticle.id) {
        return {
          ...art,
          comments: [...art.comments, newComment]
        };
      }
      return art;
    });

    setArticles(updatedArticles);
    setActiveArticle(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    setCommentUser("");
    setCommentText("");
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "All" || art.category === selectedTag;
    return matchesSearch && matchesTag;
  });

  const tags = ["All", "Traditional", "Footwear", "Accessories", "Heritage"];

  if (activeArticle) {
    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setActiveArticle(null)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </button>

        {/* Hero Image */}
        <div className="aspect-[21/9] w-full overflow-hidden border border-gray-150 dark:border-neutral-800">
          <img
            src={activeArticle.image}
            alt={activeArticle.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400">
            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 font-bold uppercase tracking-wider text-[9px]">
              {activeArticle.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {activeArticle.date}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              By {activeArticle.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {activeArticle.readTime}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            {activeArticle.title}
          </h2>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-6 text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-300 font-light border-b border-gray-150 dark:border-neutral-800 pb-8">
          {activeArticle.content.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between pb-8 border-b border-gray-150 dark:border-neutral-800">
          <button
            onClick={(e) => handleLike(activeArticle.id, e)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 font-bold text-xs uppercase tracking-wider rounded-none transition-colors"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Like Article ({activeArticle.likes})</span>
          </button>
          
          <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
            <Bookmark className="w-4 h-4" />
            <span>Megna Curated Journal</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold tracking-tight uppercase flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-600" />
            Discussion ({activeArticle.comments.length})
          </h3>

          {/* Comment List */}
          <div className="space-y-4">
            {activeArticle.comments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No comments yet. Start the conversation!</p>
            ) : (
              activeArticle.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-4 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800 dark:text-neutral-200">{comment.user}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{comment.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-3 bg-neutral-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Post a Response</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Your Name"
                value={commentUser}
                onChange={(e) => setCommentUser(e.target.value)}
                className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs focus:outline-none focus:border-black text-black dark:text-white"
              />
            </div>
            <textarea
              required
              rows={3}
              placeholder="Your style insight or query..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs focus:outline-none focus:border-black text-black dark:text-white"
            ></textarea>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors"
            >
              Submit Response
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Blog Hero Headline */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">
          THE EDITORIAL JOURNAL
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
          Megna Curation
        </h2>
        <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed">
          Exploring craft, luxury maintenance directives, and borderless heritage style guides across India & Bangladesh.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-4">
        {/* Tags horizontal list */}
        <div className="flex flex-wrap gap-2 justify-start w-full md:w-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-[10px] font-bold px-3 py-1.5 border transition-all uppercase tracking-wider ${
                selectedTag === tag
                  ? "bg-black text-white border-black"
                  : "bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-neutral-950 text-xs pl-3 pr-8 py-2 border border-gray-200 dark:border-neutral-800 rounded-none focus:outline-none focus:border-black dark:text-white"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-20 border bg-white dark:bg-neutral-900">
          <p className="text-xs text-gray-400 italic font-light">No editorial stories matched your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => { setActiveArticle(art); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="group cursor-pointer border border-gray-150 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden flex flex-col justify-between hover:border-black dark:hover:border-white transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-wider">
                  {art.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-4 items-center text-[10px] text-gray-400 font-mono">
                    <span>{art.date}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight leading-snug group-hover:text-orange-600 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-light line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-neutral-800 text-[10px] font-bold text-gray-500">
                  <span className="uppercase tracking-wider">By {art.author}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleLike(art.id, e)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current text-red-500/10 group-hover:text-red-500" />
                      <span>{art.likes}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{art.comments.length}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
