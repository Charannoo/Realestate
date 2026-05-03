import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2, MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm Urbanova AI — focused on Hyderabad & peri-urban listings. Ask about neighbourhoods (Jubilee, Gachibowli, Miyapur…) or budget bands and I'll narrow down what you're seeing.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load properties for AI context
        fetch('/api/properties')
            .then(res => res.json())
            .then(data => setProperties(data))
            .catch(err => console.error(err));
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input, properties })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessages(prev => [...prev, { text: data.response, sender: 'ai' }]);
            } else {
                setMessages(prev => [...prev, { text: `Sorry, I encountered an error: ${data.error}`, sender: 'ai' }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { text: "Network error connecting to the AI.", sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                        className="liquid-glass"
                        style={{
                            width: '380px', height: '550px', display: 'flex', flexDirection: 'column',
                            borderRadius: '24px', overflow: 'hidden',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
                            background: 'rgba(10, 10, 15, 0.6)',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.25rem 1.5rem', 
                            background: 'rgba(0,0,0,0.4)', 
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #c9a227, #e6c84d)',
                                    padding: '0.5rem', borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                                }}>
                                    <Sparkles size={18} color="#000" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#fff', letterSpacing: '0.02em' }}>Urbanova AI</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></span>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Online</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                style={{ 
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        {/* Messages Area */}
                        <div style={{
                            flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                            scrollBehavior: 'smooth'
                        }}>
                            {messages.map((msg, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i} 
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        display: 'flex', flexDirection: 'column', gap: '0.4rem'
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em',
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        padding: '0 0.2rem'
                                    }}>
                                        {msg.sender === 'user' ? 'You' : 'Urbanova AI'}
                                    </span>
                                    <div style={{
                                        padding: '0.85rem 1.1rem', 
                                        borderRadius: '16px',
                                        background: msg.sender === 'user' ? 'linear-gradient(135deg, #c9a227, #e6c84d)' : 'rgba(255,255,255,0.05)',
                                        border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                        color: msg.sender === 'user' ? '#000' : '#fff',
                                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                        borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                                        boxShadow: msg.sender === 'user' ? '0 8px 20px rgba(212,175,55,0.2)' : '0 4px 15px rgba(0,0,0,0.2)'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem' }}
                                >
                                    <Loader2 size={16} className="animate-spin" color="var(--accent)" />
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Thinking...</span>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Input Area */}
                        <div style={{
                            padding: '1.25rem', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', gap: '0.75rem', alignItems: 'center'
                        }}>
                            <div style={{ 
                                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px', display: 'flex', alignItems: 'center', padding: '0.4rem'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Ask anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading}
                                    style={{ 
                                        flex: 1, padding: '0.6rem 0.8rem', background: 'transparent', border: 'none', 
                                        color: '#fff', outline: 'none', fontSize: '0.95rem' 
                                    }}
                                />
                            </div>
                            <button 
                                onClick={handleSend} 
                                disabled={isLoading || !input.trim()} 
                                style={{
                                    width: '44px', height: '44px', borderRadius: '12px', 
                                    background: input.trim() && !isLoading ? 'linear-gradient(135deg, #c9a227, #e6c84d)' : 'rgba(255,255,255,0.05)', 
                                    border: 'none', color: input.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.2)', 
                                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s',
                                    boxShadow: input.trim() && !isLoading ? '0 4px 15px rgba(212,175,55,0.3)' : 'none'
                                }}
                            >
                                <Send size={18} style={{ transform: 'translateX(1px) translateY(-1px)' }} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px', height: '64px', borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isOpen ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #c9a227, #e6c84d)',
                    color: isOpen ? '#fff' : '#000', 
                    border: isOpen ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 10px 25px rgba(0,0,0,0.5)' : '0 15px 35px rgba(212,175,55,0.4), inset 0 2px 5px rgba(255,255,255,0.4)',
                    backdropFilter: isOpen ? 'blur(20px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Optional glass shine effect on the button when closed */}
                {!isOpen && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)', borderRadius: '20px 20px 0 0' }}></div>}
                
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X size={28} strokeWidth={2.5} />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <MessageSquareText size={28} strokeWidth={2} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}

export default AIChat;
