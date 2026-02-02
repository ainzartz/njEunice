
"use client";

import { useState, useEffect } from "react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarketInsightsPage() {
  const [insight, setInsight] = useState<any>(null);
  const [language, setLanguage] = useState<'en' | 'ko'>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsight();
  }, []);

  const fetchInsight = async () => {
    try {
      const res = await fetch('/api/market-insight/latest');
      if (res.ok) {
        const data = await res.json();
        setInsight(data);
      }
    } catch (error) {
      console.error("Failed to fetch insight", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      <Navbar theme="light" />

      <section className="pt-32 pb-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-black mb-6">
            Realtor&apos;s Investment Vision
          </h1>
          <p className="text-gray-600 text-lg font-light max-w-2xl mx-auto mb-8">
            Daily real estate trends, mortgage insights, and expert advice for the Bergen County luxury market.
          </p>

          {/* Language Toggle */}
          <div className="inline-flex rounded-full bg-white border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setLanguage('en')}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${language === 'en'
                ? 'bg-black text-white shadow-md'
                : 'text-gray-400 hover:text-black'
                }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ko')}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${language === 'ko'
                ? 'bg-black text-white shadow-md'
                : 'text-gray-400 hover:text-black'
                }`}
            >
              한국어
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
            <p className="text-sm text-gray-500 animate-pulse">Loading daily insights...</p>
          </div>
        ) : insight ? (
          <article className="prose prose-lg prose-gray mx-auto">
            <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">
              Date: {new Date(insight.createdAt).toLocaleDateString("en-US", { timeZone: "America/New_York", year: 'numeric', month: 'long', day: 'numeric' })}
            </div>


            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ node, ...props }) => <table className="min-w-full divide-y divide-gray-300 my-4 border border-gray-200" {...props} />,
                  thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                  th: ({ node, ...props }) => <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 border-b border-gray-200" {...props} />,
                  td: ({ node, ...props }) => <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 border-b border-gray-100" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-black" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 space-y-1 mb-4" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 space-y-1 mb-4" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4 text-gray-600" {...props} />,
                }}
              >
                {language === 'en' ? insight.contentEn : insight.contentKo}
              </ReactMarkdown>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 text-xs text-gray-400 bg-gray-50 p-6 rounded-lg">
              <div className="text-[10px] leading-relaxed text-gray-400">
                <strong>Disclaimer:</strong> The content provided herein is for informational purposes only and does not constitute financial, investment, legal, or tax advice. Market conditions and interest rates are subject to change without notice. While we strive to provide accurate market insights, NJ Eunice Realty makes no representations as to the accuracy or completeness of any information. Please consult with a qualified real estate professional, financial advisor, or attorney before making any real estate investment decisions.
              </div>
            </div>
          </article>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No insights available for today. Please check back later.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
