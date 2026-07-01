import React from "react";
import { Award, Compass, ShieldCheck, Ship, Target, Users, Landmark } from "lucide-react";

export default function AboutView({ isDarkMode }: { isDarkMode: boolean }) {
  const pillars = [
    {
      icon: <Landmark className="w-6 h-6 text-orange-600" />,
      title: "Ethical Heritage Sourcing",
      description: "We work directly with weaver cooperatives in Sonargaon and Phulia. By bypassing middlemen, we ensure that over 80% of our traditional sarees' purchase value returns directly to artisan households."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-orange-600" />,
      title: "Absolute Authenticity",
      description: "Every watch, athletic sneaker, and silk garment in our collection undergoes rigorous dual-hub inspection. We supply a hand-signed Certification of Origin and real physical seals with every order."
    },
    {
      icon: <Ship className="w-6 h-6 text-orange-600" />,
      title: "Bespoke Cross-Border Logistics",
      description: "Operating integrated warehouses in Kolkata and Dhaka allows us to prepay all customs duties, verify import regulations, and achieve zero-friction 3-to-5 day white-glove home delivery."
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Founding Curation Hub",
      description: "Megna Enterprise was registered in West Bengal to solve custom bottlenecks for luxury handloom garments."
    },
    {
      year: "2024",
      title: "Dhaka Warehouse Node",
      description: "Opened our fully owned physical operations facility in Banani, Dhaka, enabling local express deliveries across Bangladesh."
    },
    {
      year: "2025",
      title: "Athletic & Watch Expansion",
      description: "Partnered with premium international watch calibrators and sports shoe designers to launch the high-performance Megna Pro Elite division."
    },
    {
      year: "2026",
      title: "Zero-Friction Cross-Border Portal",
      description: "Launched our smart digital catalog system integrating instant dual-currency calculation (INR/BDT) and dynamic AI Stylist helpdesk."
    }
  ];

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Editorial Title Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-gray-150 dark:border-neutral-800 pb-12">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">
            ESTABLISHED IN 2023
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
            BRIDGING CRAFT <br className="hidden md:inline" />
            & COMFORT
          </h2>
          <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed">
            Megna Enterprise is a dual-region luxury lifestyle boutique. We hand-select high-fidelity garments and premium performance footwear for patrons of India and Bangladesh.
          </p>
        </div>
        <div className="lg:col-span-7 h-64 md:h-80 overflow-hidden border border-gray-150">
          <img
            src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1000&auto=format&fit=crop&q=80"
            alt="Megna Artisans"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* The Story Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-600" />
            Our Borderless Vision
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4 font-light leading-relaxed">
            <p>
              Megna Enterprise was born from a realization that boundaries should never restrict the appreciation of exceptional craftsmanship. Beautiful Dhakai Jamdanis, fine silk sarees, and handcrafted luxury accessories are treasures that belong to global wardrobes.
            </p>
            <p>
              By establishing strategic hubs in **Kolkata** and **Dhaka**, we handle the complexities of import compliance, quality verification, and dynamic currency conversions. Our consumers are provided with a localized, familiar shopping layout that completely eliminates unexpected fees or border delays.
            </p>
            <p>
              In parallel, our performance division curates high-performance footwear such as our signature Megna Pro Elite sneaker series, proving that comfort and sophisticated luxury styling are two sides of the same coin.
            </p>
          </div>
        </div>

        {/* Highlight Stats Block */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "4,500+", label: "Verified Border Orders" },
            { value: "180+", label: "Artisan Weavers Supported" },
            { value: "3-5 Days", label: "Express Doorstep Cargo" },
            { value: "100%", label: "Authenticity Certification" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-neutral-50 dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-6 flex flex-col justify-between">
              <span className="text-2xl md:text-3xl font-black text-orange-600 font-mono tracking-tighter">
                {stat.value}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pillars Section */}
      <div className="space-y-8 bg-neutral-50 dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-8 md:p-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-orange-600 text-[10px] font-bold tracking-[0.2em] uppercase">Core Operating Philosophy</span>
          <h3 className="text-2xl font-black uppercase tracking-tight">Our Pillars of Excellence</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 p-6 space-y-4">
              <div className="w-12 h-12 bg-orange-500/10 flex items-center justify-center">
                {pillar.icon}
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                {pillar.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Timeline */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-orange-600 text-[10px] font-bold tracking-[0.2em] uppercase">The Journey</span>
          <h3 className="text-2xl font-black uppercase tracking-tight">Our Milestones</h3>
        </div>

        <div className="border-l-2 border-orange-600 pl-6 md:pl-8 space-y-10 max-w-3xl mx-auto relative pt-4">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="relative group">
              {/* Bullet Node */}
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 bg-orange-600 border-4 border-white dark:border-neutral-950 rounded-full group-hover:scale-125 transition-transform"></div>
              
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-orange-600">{milestone.year}</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">{milestone.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-2xl">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
