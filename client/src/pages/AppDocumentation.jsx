import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertCircle, Loader, BookOpen, ChevronRight, Menu, X } from 'lucide-react';

export default function AppDocumentation() {
    const [markdown, setMarkdown] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tableOfContents, setTableOfContents] = useState([]);
    const [activeSection, setActiveSection] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const generateId = (text) => {
        return text
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');
    };

    const getChildrenText = (children) => {
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) return children.map(getChildrenText).join('');
        return '';
    };

    useEffect(() => {
        fetchDocumentation();
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            const headings = document.querySelectorAll('h2[id]');
            let currentSection = '';
            let closestHeading = null;
            let closestDistance = Infinity;

            headings.forEach((heading) => {
                const rect = heading.getBoundingClientRect();

                if (rect.top <= 150 && rect.top >= 0) {
                    currentSection = heading.id;
                }

                const distance = Math.abs(rect.top);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestHeading = heading;
                }
            });

            if (!currentSection && closestHeading) {
                currentSection = closestHeading.id;
            }

            if (currentSection) {
                setActiveSection(currentSection);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [markdown]);

    useEffect(() => {
        if (activeSection) {
            const link = document.querySelector(`a[href="#${activeSection}"]`);
            if (!link) return;

            let navContainer = link.closest('nav');
            if (!navContainer) return;

            let scrollableParent = navContainer;
            while (scrollableParent && scrollableParent !== document.body) {
                const overflow = window.getComputedStyle(scrollableParent).overflowY;
                if (overflow === 'auto' || overflow === 'scroll') {
                    break;
                }
                scrollableParent = scrollableParent.parentElement;
            }

            if (scrollableParent) {
                const linkOffset = link.offsetTop;
                const linkHeight = link.offsetHeight;
                const containerHeight = scrollableParent.offsetHeight;
                scrollableParent.scrollTop = linkOffset - containerHeight / 2 + linkHeight / 2;
            }
        }
    }, [activeSection]);

    const fetchDocumentation = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/app-documentation`);

            if (!response.ok) {
                throw new Error(`Failed to fetch documentation: ${response.statusText}`);
            }

            const data = await response.json();

            let processedContent = data.content;
            processedContent = processedContent.replace(/^#\s+SourceToLive Application Documentation\s*\n+/m, '');
            processedContent = processedContent.replace(/##\s+Table of Contents\s*\n+(?:[\s\S]*?)\n+---\s*\n+/m, '');

            setMarkdown(processedContent);

            const headingsMatch = processedContent.match(/^#+\s+.+$/gm) || [];
            const toc = headingsMatch
                .map(heading => {
                    const level = heading.match(/^#+/)[0].length;
                    const text = heading.replace(/^#+\s+/, '').trim();
                    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    return { level, text, id };
                })
                .filter(item => item.level === 2);
            setTableOfContents(toc);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching documentation:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 lg:py-12">
            {/* Header */}
            <div className="mb-12 relative">
                <div className="absolute inset-0 bg-linear-to-r from-[#4CAF50]/10 to-[#3B7DC3]/10 rounded-2xl blur-2xl -z-10 opacity-60"></div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 bg-linear-to-br from-white/80 to-white/50 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-[0_4px_20px_rgba(76,175,80,0.1)]">
                    <div className="p-4 rounded-xl bg-linear-to-br from-[#4CAF50] to-[#388E3C] shadow-lg">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/30">
                            <span className="w-2 h-2 rounded-full bg-[#4CAF50]"></span>
                            <span className="text-xs font-semibold text-[#4CAF50] uppercase tracking-wide">User Guide</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2">
                            SourceToLive
                            <span className="block bg-linear-to-r from-[#4CAF50] to-[#3B7DC3] bg-clip-text text-transparent">
                                Application Documentation
                            </span>
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
                            Complete user guide for SourceToLive platform. Learn how to use the application, deploy projects, and manage your infrastructure.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                {/* Mobile Menu Button */}
                <div className="lg:hidden mb-4 sticky top-14 z-40 bg-white">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="cursor-pointer w-full flex items-center justify-between px-6 py-4 rounded-xl border border-white/60 bg-linear-to-r from-[#4CAF50]/10 to-[#3B7DC3]/10 backdrop-blur-md shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:bg-linear-to-r hover:from-[#4CAF50]/20 hover:to-[#3B7DC3]/20 transition-all border-b"
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-[#4CAF50]" />
                            <span className="font-bold text-gray-900 uppercase tracking-wider text-sm">Table of Contents</span>
                        </div>
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5 text-[#4CAF50]" />
                        ) : (
                            <Menu className="h-5 w-5 text-[#4CAF50]" />
                        )}
                    </button>

                    {mobileMenuOpen && (
                        <div className="sticky top-24 mt-2 rounded-xl border border-white/60 bg-white/70 backdrop-blur-md shadow-[0_4px_16px_rgba(15,23,42,0.08)] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <nav className="p-4 flex flex-col space-y-1">
                                {tableOfContents.length > 0 ? (
                                    tableOfContents.map((item, idx) => (
                                        <a
                                            key={idx}
                                            href={`#${item.id}`}
                                            onClick={() => {
                                                setActiveSection(item.id);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`group relative flex items-start gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out text-sm ${activeSection === item.id
                                                ? 'bg-[#4CAF50] text-white shadow-md shadow-[#4CAF50]/20'
                                                : 'text-gray-700 hover:text-[#4CAF50] hover:bg-[#4CAF50]/5'
                                                }`}
                                        >
                                            <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ease-in-out ${activeSection === item.id
                                                ? 'bg-white/30 text-white'
                                                : 'bg-[#4CAF50]/20 text-[#4CAF50] group-hover:bg-[#4CAF50]/40'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                            <span className="flex-1 font-medium leading-tight">
                                                {item.text}
                                            </span>
                                            <ChevronRight className={`shrink-0 w-4 h-4 transition-all duration-200 ease-in-out ${activeSection === item.id
                                                ? 'translate-x-1 opacity-100'
                                                : 'translate-x-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                                                }`} />
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 text-center py-4">No sections found</p>
                                )}
                            </nav>
                            <div className="px-4 py-3 border-t border-white/60 bg-linear-to-r from-[#4CAF50]/5 to-[#3B7DC3]/5 text-xs text-gray-600 text-center">
                                <p className="font-medium">{tableOfContents.length} sections</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Table of Contents (Desktop Only) */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-20 rounded-xl border border-white/60 bg-white/70 backdrop-blur-md shadow-[0_4px_16px_rgba(15,23,42,0.08)] overflow-hidden">
                        <div className="bg-linear-to-r from-[#4CAF50]/10 to-[#3B7DC3]/10 px-6 py-4 border-b border-white/60">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-[#4CAF50]" />
                                Table of Contents
                            </h3>
                        </div>

                        <nav className="p-4 flex flex-col space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {tableOfContents.length > 0 ? (
                                tableOfContents.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={`#${item.id}`}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`group relative flex items-start gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out text-sm ${activeSection === item.id
                                            ? 'bg-[#4CAF50] text-white shadow-md shadow-[#4CAF50]/20'
                                            : 'text-gray-700 hover:text-[#4CAF50] hover:bg-[#4CAF50]/5'
                                            }`}
                                    >
                                        <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ease-in-out ${activeSection === item.id
                                            ? 'bg-white/30 text-white'
                                            : 'bg-[#4CAF50]/20 text-[#4CAF50] group-hover:bg-[#4CAF50]/40'
                                            }`}>
                                            {idx + 1}
                                        </span>

                                        <span className="flex-1 font-medium leading-tight">
                                            {item.text}
                                        </span>

                                        <ChevronRight className={`shrink-0 w-4 h-4 transition-all duration-200 ease-in-out ${activeSection === item.id
                                            ? 'translate-x-1 opacity-100'
                                            : 'translate-x-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                                            }`} />
                                    </a>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-4">No sections found</p>
                            )}
                        </nav>

                        <div className="px-4 py-3 border-t border-white/60 bg-linear-to-r from-[#4CAF50]/5 to-[#3B7DC3]/5 text-xs text-gray-600 text-center">
                            <p className="font-medium">{tableOfContents.length} sections</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Loader className="h-10 w-10 animate-spin text-[#4CAF50]" />
                                    <div className="absolute inset-0 bg-[#4CAF50]/20 rounded-full blur-lg -z-10"></div>
                                </div>
                                <p className="text-gray-600 font-medium">Loading documentation...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200/60 bg-red-50/70 backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(15,23,42,0.08)]">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-900">Error Loading Documentation</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                    <button
                                        onClick={fetchDocumentation}
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.3)] transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <article className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-[0_4px_16px_rgba(15,23,42,0.08)]">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ node, children, ...props }) => (
                                        <h1 className="text-2xl sm:text-4xl font-bold mt-12 mb-6 text-gray-900 bg-linear-to-r from-[#4CAF50] to-[#388E3C] bg-clip-text pb-2" {...props}>
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ node, children, ...props }) => {
                                        const text = getChildrenText(children);
                                        const id = generateId(text);
                                        return (
                                            <div className="mt-10 mb-6">
                                                <h2 id={id} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3 scroll-mt-24 group" {...props}>
                                                    <span className="inline-block w-1 h-10 bg-linear-to-b from-[#4CAF50] to-[#3B7DC3] rounded-full"></span>
                                                    {children}
                                                </h2>
                                                <div className="h-0.5 w-24 bg-linear-to-r from-[#4CAF50] to-transparent"></div>
                                            </div>
                                        );
                                    },
                                    h3: ({ node, children, ...props }) => (
                                        <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 flex items-center gap-2 pt-2" {...props}>
                                            <span className="inline-block w-1.5 h-6 bg-[#4CAF50] rounded-full"></span>
                                            {children}
                                        </h3>
                                    ),
                                    h4: ({ node, children, ...props }) => (
                                        <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800" {...props}>
                                            {children}
                                        </h4>
                                    ),
                                    h5: ({ node, children, ...props }) => (
                                        <h5 className="text-base font-semibold mt-3 mb-2 text-gray-800" {...props}>
                                            {children}
                                        </h5>
                                    ),
                                    h6: ({ node, children, ...props }) => (
                                        <h6 className="text-base font-semibold mt-3 mb-2 text-gray-800" {...props}>
                                            {children}
                                        </h6>
                                    ),
                                    p: ({ node, children, ...props }) => (
                                        <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base" {...props}>
                                            {children}
                                        </p>
                                    ),
                                    ul: ({ node, children, ...props }) => (
                                        <ul className="my-6 space-y-3 list-none ml-0" {...props}>
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ node, children, ...props }) => (
                                        <ol className="my-6 space-y-3 list-none ml-0" {...props}>
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ node, children, ...props }) => (
                                        <li className="text-gray-700 text-sm sm:text-base flex gap-3 items-start" {...props}>
                                            <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#4CAF50]/10 text-[#4CAF50] font-semibold text-xs mt-0.5">•</span>
                                            <span className="flex-1 pt-0.5">{children}</span>
                                        </li>
                                    ),
                                    code: ({ node, inline, children, ...props }) =>
                                        inline ? (
                                            <code className="bg-gray-100 text-[#388E3C] px-1.5 py-0.5 rounded font-mono text-xs whitespace-nowrap" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <code className="bg-gray-900 text-[#FFF] px-3 py-2 rounded font-mono text-xs block whitespace-pre-wrap wrap-break-word" {...props}>{children}</code>
                                        ),
                                    pre: ({ node, children, ...props }) => (
                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-700 text-xs" {...props}>
                                            {children}
                                        </pre>
                                    ),
                                    table: ({ node, children, ...props }) => (
                                        <div className="overflow-x-auto my-6">
                                            <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-sm" {...props}>
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    thead: ({ node, children, ...props }) => (
                                        <thead {...props}>
                                            {children}
                                        </thead>
                                    ),
                                    tbody: ({ node, children, ...props }) => (
                                        <tbody {...props}>
                                            {children}
                                        </tbody>
                                    ),
                                    tr: ({ node, children, ...props }) => (
                                        <tr className="hover:bg-green-50/50 transition-colors" {...props}>
                                            {children}
                                        </tr>
                                    ),
                                    th: ({ node, children, ...props }) => (
                                        <th className="bg-linear-to-r from-[#4CAF50] to-[#388E3C] font-bold py-3 px-4 text-left text-white text-xs sm:text-sm border border-gray-300 first:rounded-tl-lg last:rounded-tr-lg" {...props}>
                                            {children}
                                        </th>
                                    ),
                                    td: ({ node, children, ...props }) => (
                                        <td className="py-3 px-4 border border-gray-300 text-gray-700 text-xs sm:text-sm" {...props}>
                                            {children}
                                        </td>
                                    ),
                                    a: ({ node, children, ...props }) => (
                                        <a className="text-[#4CAF50] hover:text-[#388E3C] font-medium transition-colors hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
                                            {children}
                                        </a>
                                    ),
                                    blockquote: ({ node, children, ...props }) => (
                                        <blockquote className="pl-4 border-l-4 border-[#4CAF50] text-gray-600 italic my-4 bg-green-50/50 py-2 pr-4 rounded-r" {...props}>
                                            {children}
                                        </blockquote>
                                    ),
                                    hr: ({ node, ...props }) => (
                                        <hr className="border-t border-gray-300 my-8" {...props} />
                                    ),
                                    strong: ({ node, children, ...props }) => (
                                        <strong className="font-bold text-gray-900" {...props}>
                                            {children}
                                        </strong>
                                    ),
                                    em: ({ node, children, ...props }) => (
                                        <em className="italic text-gray-700" {...props}>
                                            {children}
                                        </em>
                                    ),
                                }}
                            >
                                {markdown}
                            </ReactMarkdown>
                        </article>
                    )}
                </main>
            </div>
        </div>
    );
}
