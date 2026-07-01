import React, { useState } from "react";
import { Mail, Phone, MessageSquare, MapPin, Send, CheckCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function ContactView({ isDarkMode }: { isDarkMode: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("India");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSubmitted(true);
    // Clear inputs
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const offices = [
    {
      city: "Kolkata Hub (India)",
      address: "12/A Park Street, Elgin, Kolkata, West Bengal - 700016",
      phone: "+91 8250568500",
      email: "in-support@megnaenterprise.com",
      hours: "Mon - Sat: 10:00 AM - 7:00 PM IST"
    },
    {
      city: "Dhaka Node (Bangladesh)",
      address: "House 45, Road 11, Banani C/A, Dhaka - 1213",
      phone: "+880 1712 505685",
      email: "bd-support@megnaenterprise.com",
      hours: "Sat - Thu: 10:00 AM - 6:30 PM BST"
    }
  ];

  const faqs = [
    {
      q: "How does the cross-border delivery work?",
      a: "We maintain localized hubs in both Kolkata and Dhaka. When you place an order, we clear all customs processes, prepay local import duties, and coordinate safe dispatch to your doorstep. There are zero additional hidden charges upon receipt."
    },
    {
      q: "Can I pay with local payment systems like bKash or UPI?",
      a: "Yes! If your delivery address is in Bangladesh, our checkout portal dynamically displays bKash, Nagad, and SSLCommerz options. For deliveries inside India, we fully support Razorpay, PhonePe, and Google Pay."
    },
    {
      q: "Are the handloom sarees genuinely certified?",
      a: "Absolutely. Every single saree in our Traditional collection is physically inspected at our hubs and shipped alongside an official Certification of Authenticity, including details of the loom cooperative and artisan origin."
    },
    {
      q: "What is your return policy?",
      a: "We offer an exchange option within 7 days of delivery for sizing adjustments on footwear and accessories. Due to the high value and fragile nature of handloom sarees, we issue video-verified quality seals before dispatch."
    }
  ];

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Editorial Title Banner */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-orange-600 text-[10px] font-bold tracking-[0.3em] uppercase block">
          CONCIERGE DESK
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
          CONNECT WITH US
        </h2>
        <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed">
          Reach our international styling bureaus in Kolkata or Dhaka. We assist with custom sizing directives, wedding curation packages, and transit timelines.
        </p>
      </div>

      {/* Main Grid: Form + Office cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Form Section */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-6 md:p-8 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 pb-3 border-b">
            Send Secure Dispatch Request
          </h3>

          {isSubmitted ? (
            <div className="border border-green-200 bg-green-50/20 p-8 space-y-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Message Logged!</h4>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  Your request has been securely logged on our system. A concierge manager from our **{country} Support Node** will reach out via Email or WhatsApp shortly.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Biman Das"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 px-3 py-2 text-xs focus:outline-none focus:border-black text-black dark:text-white"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 px-3 py-2 text-xs focus:outline-none focus:border-black text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Select Region Desk</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 px-3 py-2 text-xs focus:outline-none focus:border-black text-black dark:text-white font-bold"
                  >
                    <option value="India">India Node (Kolkata)</option>
                    <option value="Bangladesh">Bangladesh Node (Dhaka)</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Subject Matter</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Custom Jamdani Sizing"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 px-3 py-2 text-xs focus:outline-none focus:border-black text-black dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your design specifications, wholesale inquiry, or order cargo question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 px-3 py-2 text-xs focus:outline-none focus:border-black text-black dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Secure Dispatch Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Office hubs info */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 pb-3 border-b border-gray-150">
            Our Regional Bureau Offices
          </h3>

          <div className="space-y-6">
            {offices.map((office, idx) => (
              <div key={idx} className="bg-neutral-50 dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">{office.city}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-light leading-relaxed">{office.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono text-gray-500 border-t pt-3 border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-600" />
                    <span>{office.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-600" />
                    <span className="truncate">{office.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Helpline banner */}
          <div className="bg-orange-500/10 border border-orange-500/20 p-5 flex items-center gap-4">
            <MessageSquare className="w-8 h-8 text-orange-600 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 block">Direct Styling Helpline</span>
              <a href="tel:+918250568500" className="text-xs font-black text-gray-950 dark:text-white hover:underline block">
                +91 8250568500 (India/BD desk)
              </a>
              <span className="text-[10px] text-gray-400 block font-light">Immediate styling consultations via Call / WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion FAQ Section */}
      <div className="space-y-6 max-w-3xl mx-auto pt-6 border-t border-gray-150 dark:border-neutral-800">
        <h3 className="text-lg font-black uppercase tracking-tight text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-orange-600" />
          Frequently Asked Logistics Questions
        </h3>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-neutral-50 dark:hover:bg-neutral-850"
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-neutral-200">
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 border-t border-gray-100 dark:border-neutral-800 text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
