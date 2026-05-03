# Urbanova Frontend Codebase (For Lovable.dev)

This document contains the complete frontend React codebase for the Urbanova Real Estate Platform, including the new Dark Liquid Glass AI Chat and Negotiation Assistant integrations.


## File: src\components\AdminAnalytics.jsx

``jsx
import { motion } from 'framer-motion';

function AdminAnalytics({ stats, users, properties }) {
    // 1. Calculate User Roles Distribution
    const userRoles = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    const totalUsers = users.length || 1; // Avoid division by zero
    const roleData = [
        { label: 'Buyers', value: userRoles.buyer || 0, color: '#4caf50' },
        { label: 'Sellers', value: userRoles.seller || 0, color: '#2196f3' },
        { label: 'Admins', value: userRoles.admin || 0, color: '#d4af37' },
    ];

    // 2. Property Price Ranges (Mock bins)
    const priceRanges = {
        'Low (<$100k)': 0,
        'Mid ($100k-$500k)': 0,
        'High ($500k-$1M)': 0,
        'Luxury (>$1M)': 0
    };

    properties.forEach(p => {
        if (p.price < 100000) priceRanges['Low (<$100k)']++;
        else if (p.price < 500000) priceRanges['Mid ($100k-$500k)']++;
        else if (p.price < 1000000) priceRanges['High ($500k-$1M)']++;
        else priceRanges['Luxury (>$1M)']++;
    });

    const maxProperties = Math.max(...Object.values(priceRanges), 1);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

            {/* User Distribution - Donut Chart */}
            <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>User Distribution</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                    <svg width="200" height="200" viewBox="0 0 100 100">
                        {(() => {
                            let cumulativePercent = 0;
                            return roleData.map((role, i) => {
                                const percent = role.value / totalUsers;
                                const startAngle = cumulativePercent * Math.PI * 2;
                                cumulativePercent += percent;
                                const endAngle = cumulativePercent * Math.PI * 2;

                                const x1 = 50 + 40 * Math.cos(startAngle);
                                const y1 = 50 + 40 * Math.sin(startAngle);
                                const x2 = 50 + 40 * Math.cos(endAngle);
                                const y2 = 50 + 40 * Math.sin(endAngle);

                                const largeArcFlag = percent > 0.5 ? 1 : 0;

                                // Handle single item case (full circle)
                                const pathData = percent === 1
                                    ? `M 50 10 A 40 40 0 1 1 49.99 10`
                                    : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                                return (
                                    <path
                                        key={role.label}
                                        d={pathData}
                                        fill={role.color}
                                        stroke="#111"
                                        strokeWidth="1"
                                    />
                                );
                            });
                        })()}
                        <circle cx="50" cy="50" r="20" fill="#111" />
                    </svg>
                    <div style={{ marginLeft: '2rem' }}>
                        {roleData.map(role => (
                            <div key={role.label} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <div style={{ width: '12px', height: '12px', background: role.color, marginRight: '0.5rem', borderRadius: '2px' }}></div>
                                <span style={{ color: '#ccc' }}>{role.label}: {role.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Property Price Ranges - Bar Chart */}
            <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Listing Price Ranges</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    {Object.entries(priceRanges).map(([label, count]) => {
                        const heightPercent = (count / maxProperties) * 100;
                        return (
                            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                                <div style={{ height: '150px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #333' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            width: '80%',
                                            background: 'var(--accent)',
                                            borderRadius: '4px 4px 0 0',
                                            minHeight: '4px',
                                            opacity: 0.8
                                        }}
                                    />
                                </div>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{count}</span>
                                <span style={{ color: '#666', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                                    {label.split(' ')[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;
``

## File: src\components\AdminLogs.jsx

``jsx
import React, { useState, useEffect } from 'react';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const adminUserStr = localStorage.getItem('adminUser');
                const userStr = localStorage.getItem('user');
                let token = null;
                if (adminUserStr) token = JSON.parse(adminUserStr).token;
                if (!token && userStr) token = JSON.parse(userStr).token;

                if (!token) {
                    setError('No token found. Please log in.');
                    setLoading(false);
                    return;
                }

                const res = await fetch('/api/logs', {
                    headers: {
                        'token': token
                    }
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server Error: ${res.status} - ${errorText}`);
                }

                const data = await res.json();
                setLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) return <div className="text-gray-400">Loading activity logs...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            {logs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No activity logs found.</p>
            ) : (
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                                <th style={{ padding: '1rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                                        {log.user?.username || 'Unknown User'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: log.user?.role === 'admin' ? 'var(--accent)' : '#333',
                                            color: log.user?.role === 'admin' ? '#000' : '#fff',
                                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem'
                                        }}>
                                            {log.user?.role || 'Deleted'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{log.action}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;
``

## File: src\components\AIChat.jsx

``jsx
import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2, MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your Urbanova AI assistant. Ask me to find properties, or ask any questions about real estate!", sender: 'ai' }
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
``

## File: src\components\AuthModal.jsx

``jsx
import { useState } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';

function AuthModal({ onClose, onLogin, initialView = 'login', defaultRole = 'buyer' }) {
    const [isLogin, setIsLogin] = useState(initialView === 'login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: defaultRole
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? 'login' : 'register';

        // Frontend guard: block 'admin' username registration
        if (!isLogin && formData.username.toLowerCase() === 'admin') {
            setError("The username 'admin' is reserved. Please choose another.");
            return;
        }

        try {
            const res = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                const errorMessage = typeof data === 'string' ? data : (data.message || data.error || 'Authentication failed');
                throw new Error(errorMessage);
            }

            localStorage.setItem('user', JSON.stringify(data));
            onLogin(data);
            onClose();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        }
    }

    return (
        <div className="modal-overlay">
            <div className="auth-modal">
                <button className="close-btn" onClick={onClose}><X size={20} /></button>

                <div className="auth-header">
                    <h2>Urbanova.</h2>
                    <p>{isLogin ? 'Welcome Back' : 'Join the Community'}</p>
                </div>

                <div className="auth-tabs">
                    <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
                    <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Register</button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <User size={18} />
                        <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <Mail size={18} />
                            <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
                        </div>
                    )}

                    <div className="input-group">
                        <Lock size={18} />
                        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    </div>

                    {!isLogin && (
                        <div className="role-select">
                            <label>I am a:</label>
                            <div className="role-options">
                                <label className={formData.role === 'buyer' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="buyer" checked={formData.role === 'buyer'} onChange={handleChange} />
                                    Buyer
                                </label>
                                <label className={formData.role === 'seller' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="seller" checked={formData.role === 'seller'} onChange={handleChange} />
                                    Seller
                                </label>
                                <label className={formData.role === 'agent' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="agent" checked={formData.role === 'agent'} onChange={handleChange} />
                                    Agent
                                </label>
                            </div>
                        </div>
                    )}

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="submit-btn">
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthModal;
``

## File: src\components\ErrorBoundary.jsx

``jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: '#ff4444', backgroundColor: '#111', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ccc' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem', padding: '1rem 2rem', background: 'var(--accent)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
``

## File: src\components\Footer.jsx

``jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from './Toast';

function Footer() {
    const [toast, setToast] = useState(null); // { message, type }

    const handleSubscribe = (e) => {
        e.preventDefault();
        setToast({ message: "Thanks for subscribing!", type: "success" });
    };

    return (
        <footer className="footer">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="container footer-content">
                <div className="footer-brand">
                    <Link to="/" className="logo">Urbanova.</Link>
                    <p>Premium Real Estate Marketplace.</p>
                </div>

                <div className="footer-links">
                    <div className="link-group">
                        <h4>Platform</h4>
                        <Link to="/">Home</Link>
                        <Link to="/properties">Properties</Link>
                        <Link to="/add">List Property</Link>
                    </div>
                    <div className="link-group">
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <Link to="/careers">Careers</Link>
                        <Link to="/contact">Contact</Link>
                    </div>

                    <div className="link-group" style={{ maxWidth: '300px' }}>
                        <h4>Stay Connected</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Subscribe to our newsletter for the latest premium listings.
                        </p>
                        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    flex: 1,
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.9rem',
                                    boxShadow: 'none',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="footer-bottom container">
                <p>&copy; 2024 Estate Platform. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
``

## File: src\components\LiveabilityScore.jsx

``jsx
import { useState, useEffect } from 'react';
import { MapPin, X, Activity, Shield, Car, School, Hospital, Dumbbell, Home, Train } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function LiveabilityScore({ property, isOpen, onClose }) {
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        
        setLoading(true);
        const timer = setTimeout(() => {
            const baseScore = 72;
            const locationFactor = property?.location?.toLowerCase().includes('central') ? 15 : 
                                   property?.location?.toLowerCase().includes('north') ? 10 : 5;
            
            const amenities = {
                hospitals: { count: Math.floor(Math.random() * 5) + 1, distance: Math.floor(Math.random() * 3) + 1 },
                schools: { count: Math.floor(Math.random() * 8) + 2, distance: Math.floor(Math.random() * 5) + 1 },
                gyms: { count: Math.floor(Math.random() * 6) + 1, distance: Math.floor(Math.random() * 2) + 1 },
                metro: { count: Math.random() > 0.5 ? 1 : 0, distance: Math.floor(Math.random() * 5) + 1 },
                parks: { count: Math.floor(Math.random() * 4) + 1, distance: Math.floor(Math.random() * 3) + 1 }
            };

            const amenitiesScore = Math.min(100, 
                (amenities.hospitals.count > 0 ? 20 : 0) +
                (amenities.schools.count > 2 ? 20 : 0) +
                (amenities.gyms.count > 0 ? 15 : 0) +
                (amenities.metro.count > 0 ? 25 : 0) +
                (amenities.parks.count > 0 ? 20 : 0)
            );

            const noiseLevel = ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)];
            const trafficDensity = ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)];
            const crimeRate = ['Very Safe', 'Safe', 'Moderate'][Math.floor(Math.random() * 3)];

            const totalScore = Math.round((baseScore + locationFactor + amenitiesScore) / 2.5);

            setScore({
                overall: Math.min(95, totalScore),
                noiseLevel,
                trafficDensity,
                crimeRate,
                amenities,
                breakdown: [
                    { label: 'Healthcare Access', score: amenities.hospitals.count > 0 ? 85 + Math.random() * 15 : 40 + Math.random() * 20 },
                    { label: 'Education', score: amenities.schools.count > 2 ? 80 + Math.random() * 20 : 50 + Math.random() * 20 },
                    { label: 'Fitness & Recreation', score: amenities.gyms.count > 0 ? 75 + Math.random() * 20 : 45 + Math.random() * 15 },
                    { label: 'Connectivity', score: amenities.metro.count > 0 ? 90 + Math.random() * 10 : 60 + Math.random() * 20 },
                    { label: 'Green Spaces', score: amenities.parks.count > 0 ? 80 + Math.random() * 15 : 50 + Math.random() * 20 },
                ]
            });
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [property, isOpen]);

    const getScoreColor = (score) => {
        if (score >= 80) return '#38ef7d';
        if (score >= 60) return '#f093fb';
        return '#eb3349';
    };

    const getScoreGrade = (score) => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        return 'D';
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <motion.div 
                className="auth-modal"
                style={{ maxWidth: '650px', maxHeight: '90vh', overflow: 'auto' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            padding: '0.75rem', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Home size={24} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>Liveability Score</h3>
                            <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>Lifestyle quality analysis</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#888' }}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ 
                            width: '50px', height: '50px', border: '3px solid #333',
                            borderTop: '3px solid #38ef7d', borderRadius: '50%',
                            animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
                        }} />
                        <p style={{ color: '#888' }}>Analyzing neighborhood...</p>
                    </div>
                ) : score && (
                    <AnimatePresence>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '2rem', borderRadius: '16px', marginBottom: '1.5rem',
                                background: '#1a1a1a',
                                border: `2px solid ${getScoreColor(score.overall)}`
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '1rem', color: '#888' }}>Overall Score</p>
                                    <div style={{ 
                                        fontSize: '4rem', fontWeight: '800', 
                                        color: getScoreColor(score.overall),
                                        lineHeight: 1
                                    }}>
                                        {score.overall}
                                    </div>
                                    <div style={{ 
                                        fontSize: '1.5rem', fontWeight: '600', 
                                        color: getScoreColor(score.overall)
                                    }}>
                                        Grade {getScoreGrade(score.overall)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ 
                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', 
                                gap: '0.75rem', marginBottom: '1.5rem'
                            }}>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', background: '#1a1a1a',
                                    textAlign: 'center', border: '1px solid #333'
                                }}>
                                    <Activity size={20} color="#667eea" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Noise</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>{score.noiseLevel}</p>
                                </div>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', background: '#1a1a1a',
                                    textAlign: 'center', border: '1px solid #333'
                                }}>
                                    <Car size={20} color="#f5576c" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Traffic</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>{score.trafficDensity}</p>
                                </div>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', background: '#1a1a1a',
                                    textAlign: 'center', border: '1px solid #333'
                                }}>
                                    <Shield size={20} color="#38ef7d" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Safety</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>{score.crimeRate}</p>
                                </div>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', background: '#1a1a1a',
                                    textAlign: 'center', border: '1px solid #333'
                                }}>
                                    <MapPin size={20} color="#764ba2" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Connectivity</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>Good</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#fff' }}>Nearby Amenities</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#1a1a1a', border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}>
                                        <div style={{ background: '#2a1a1a', padding: '0.75rem', borderRadius: '8px' }}>
                                            <Hospital size={20} color="#ef5350" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Hospitals</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#fff' }}>
                                                {score.amenities.hospitals.count} within {score.amenities.hospitals.distance}km
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#1a1a1a', border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}>
                                        <div style={{ background: '#1a2a3a', padding: '0.75rem', borderRadius: '8px' }}>
                                            <School size={20} color="#42a5f5" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Schools</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#fff' }}>
                                                {score.amenities.schools.count} within {score.amenities.schools.distance}km
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#1a1a1a', border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}>
                                        <div style={{ background: '#2a1a2a', padding: '0.75rem', borderRadius: '8px' }}>
                                            <Dumbbell size={20} color="#ec407a" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Gyms</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#fff' }}>
                                                {score.amenities.gyms.count} within {score.amenities.gyms.distance}km
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#1a1a1a', border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}>
                                        <div style={{ background: '#1a2a1a', padding: '0.75rem', borderRadius: '8px' }}>
                                            <Train size={20} color="#66bb6a" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Metro</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#fff' }}>
                                                {score.amenities.metro.count > 0 ? `1 within ${score.amenities.metro.distance}km` : 'Not nearby'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#fff' }}>Score Breakdown</h4>
                                {score.breakdown.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#888' }}>{item.label}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{Math.round(item.score)}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${item.score}%`, height: '100%',
                                                background: getScoreColor(item.score),
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </motion.div>
        </div>
    );
}

export default LiveabilityScore;
``

## File: src\components\MortgageCalculator.jsx

``jsx
import { useState, useEffect } from 'react';
import { DollarSign, Percent, Calculator, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function MortgageCalculator({ isOpen, onClose, price }) {
    const [loanAmount, setLoanAmount] = useState(price);
    const [downPayment, setDownPayment] = useState(price * 0.2);
    const [interestRate, setInterestRate] = useState(6.5);
    const [loanTerm, setLoanTerm] = useState(30);
    const [monthlyPayment, setMonthlyPayment] = useState(0);

    useEffect(() => {
        calculateMortgage();
    }, [loanAmount, downPayment, interestRate, loanTerm, price]);

    // Update loan amount if property price changes and form hasn't been touched yet (optional behavior)
    // For simplicity, we just initialize.

    const calculateMortgage = () => {
        const principal = loanAmount - downPayment;
        const monthlyInterest = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        if (principal <= 0) {
            setMonthlyPayment(0);
            return;
        }

        const mortgage =
            (principal * monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) /
            (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);

        setMonthlyPayment(isFinite(mortgage) ? mortgage : 0);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
                    backdropFilter: 'blur(5px)'
                }}
            >
                <motion.div
                    initial={{ y: 50, scale: 0.9 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 50, scale: 0.9 }}
                    style={{
                        background: '#1a1a1a',
                        padding: '2rem',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '500px',
                        border: '1px solid var(--accent)',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '0.8rem', borderRadius: '12px', marginRight: '1rem' }}>
                            <Calculator size={32} color="var(--accent)" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Mortgage Calculator</h2>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#888' }}>Estimate your monthly payments</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Property Price</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="number"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                                    style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: '#fff', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Down Payment</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(Number(e.target.value))}
                                    style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: '#fff', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Interest Rate</label>
                            <div style={{ position: 'relative' }}>
                                <Percent size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: '#fff', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Loan Term (Years)</label>
                            <select
                                value={loanTerm}
                                onChange={(e) => setLoanTerm(Number(e.target.value))}
                                style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem', color: '#fff', outline: 'none' }}
                            >
                                <option value="15">15 Years</option>
                                <option value="20">20 Years</option>
                                <option value="30">30 Years</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)', padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)' }}>
                        <p style={{ margin: 0, color: '#000', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Estimated Monthly Payment</p>
                        <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '3rem', color: '#000', fontWeight: '800' }}>
                            ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h2>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default MortgageCalculator;
``

## File: src\components\NegotiationAssistant.jsx

``jsx
import { useState } from 'react';
import { DollarSign, TrendingUp, Target, X, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function NegotiationAssistant({ property, isOpen, onClose }) {
    const [offerPrice, setOfferPrice] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const price = property?.price || 0;
    const suggestedMin = Math.floor(price * 0.85);
    const suggestedMax = Math.floor(price * 0.95);
    const marketValue = price;

    const analyzeOffer = async () => {
        if (!offerPrice) return;
        setLoading(true);
        setError(null);
        
        try {
            const offer = parseInt(offerPrice);
            
            const res = await fetch('/api/ai/negotiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ property, offerPrice: offer })
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to analyze offer');

            setAnalysis({
                offer,
                probability: data.probability,
                discountPercent: ((marketValue - offer) / marketValue * 100).toFixed(1),
                strategy: data.strategy,
                counterOffer: data.counterOffer,
                script: data.script,
                suggestedRange: { min: suggestedMin, max: suggestedMax }
            });
            
        } catch (err) {
            console.error(err);
            setError("The AI assistant is currently unavailable. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <motion.div 
                className="auth-modal liquid-glass"
                style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #c9a227 0%, #e6c84d 100%)',
                            padding: '0.75rem', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Target size={24} color="#000" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', textAlign: 'left' }}>AI Negotiation Assistant</h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>Powered by OpenRouter</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {!analysis ? (
                    <>
                        <div style={{ 
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem',
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                                <TrendingUp size={18} /> Market Analysis
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Listed Price: <strong style={{ color: '#fff' }}>₹{marketValue.toLocaleString()}</strong>
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Recommended Range: <strong style={{ color: '#fff' }}>₹{suggestedMin.toLocaleString()} - ₹{suggestedMax.toLocaleString()}</strong>
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-secondary)', textAlign: 'left' }}>
                                Enter Your Offer Price (₹)
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                    type="number" 
                                    value={offerPrice}
                                    onChange={(e) => setOfferPrice(e.target.value)}
                                    placeholder={`e.g., ${suggestedMin.toLocaleString()}`}
                                    style={{ flex: 1, padding: '1rem', fontSize: '1rem', background: 'rgba(0,0,0,0.3)' }}
                                />
                                <button 
                                    onClick={analyzeOffer}
                                    disabled={loading || !offerPrice}
                                    style={{ 
                                        padding: '0 1.5rem', 
                                        background: 'var(--accent)',
                                        color: '#000',
                                        whiteSpace: 'nowrap',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Analyze'}
                                </button>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                            background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <DollarSign size={20} color="var(--accent)" />
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Minimum</p>
                                <p style={{ margin: 0, fontWeight: '600' }}>₹{suggestedMin.toLocaleString()}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <DollarSign size={20} color="#f5576c" />
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Maximum</p>
                                <p style={{ margin: 0, fontWeight: '600' }}>₹{suggestedMax.toLocaleString()}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <AnimatePresence>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'left' }}
                        >
                            <div style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '2rem', borderRadius: '12px', marginBottom: '1.5rem',
                                background: analysis.probability >= 70 ? 'rgba(34,197,94,0.1)' :
                                           analysis.probability >= 40 ? 'rgba(212,175,55,0.1)' :
                                           'rgba(239,68,68,0.1)',
                                border: `1px solid ${analysis.probability >= 70 ? '#22c55e' : analysis.probability >= 40 ? 'var(--accent)' : '#ef4444'}`
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>AI Probability Score</p>
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '3rem', fontWeight: '800', color: analysis.probability >= 70 ? '#22c55e' : analysis.probability >= 40 ? 'var(--accent)' : '#ef4444' }}>
                                        {analysis.probability}%
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Your Offer Breakdown</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your Offer</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600' }}>₹{analysis.offer.toLocaleString()}</p>
                                    </div>
                                    <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Discount</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: analysis.discountPercent > 0 ? '#22c55e' : '#ef4444' }}>
                                            {analysis.discountPercent}%
                                        </p>
                                    </div>
                                    <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Listed Price</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600' }}>₹{marketValue.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                                    💡 AI Strategy
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{analysis.strategy}</p>
                            </div>

                            {analysis.counterOffer && (
                                <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.3)', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e' }}>
                                        🤝 Expected Counter
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        Seller might counter around <strong>₹{analysis.counterOffer.toLocaleString()}</strong>
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageSquare size={18} color="var(--accent)" /> AI Script
                                </h4>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', 
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                                    fontStyle: 'italic', fontSize: '0.9rem', lineHeight: '1.6'
                                }}>
                                    "{analysis.script}"
                                </div>
                            </div>

                            <button 
                                onClick={() => setAnalysis(null)}
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                            >
                                Try Another Offer
                            </button>
                        </motion.div>
                    </AnimatePresence>
                )}
            </motion.div>
        </div>
    );
}

export default NegotiationAssistant;
``

## File: src\components\PropertyCard.jsx

``jsx
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

function PropertyCard({ property }) {
    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        return `http://localhost:5000/uploads/${img}`;
    };

    const handleImageError = (e) => {
        e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
    };

    return (
        <Link to={`/property/${property._id}`} className="card liquid-glass" style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
            <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                {property.image ? (
                    <img
                        src={getImageUrl(property.image)}
                        alt={property.title}
                        onError={handleImageError}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                        No Image
                    </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px', boxSizing: 'border-box' }}>
                    <p className="price" style={{ marginBottom: 0 }}>₹{property.price.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="card-content">
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.title}</h3>
                <p className="location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <MapPin size={14} color="var(--accent)" /> {property.location}
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s' }}>
                        View Details <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default PropertyCard;
``

## File: src\components\TiltCard.jsx

``jsx
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";

const TiltCard = ({ children, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    return (
        <motion.div
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000,
            }}
            whileHover={{ scale: 1.05 }}
        >
            <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
                {children}
            </div>
        </motion.div>
    );
};

export default TiltCard;
``

## File: src\components\Toast.jsx

``jsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const toastVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 }
};

const icons = {
    success: <CheckCircle size={20} color="#4caf50" />,
    error: <AlertCircle size={20} color="#e53935" />,
    info: <Info size={20} color="#2196f3" />
};

const colors = {
    success: '#4caf50',
    error: '#e53935',
    info: '#2196f3'
};

/**
 * Toast Component
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', or 'info'
 * @param {function} onClose - function to call when closing
 * @param {number} duration - duration in ms (default 3000)
 */
function Toast({ message, type = 'info', onClose, duration = 4000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            pointerEvents: 'none' // Allow clicks through the container
        }}>
            <AnimatePresence>
                {message && (
                    <motion.div
                        variants={toastVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{
                            background: '#1a1a1a',
                            border: `1px solid ${colors[type] || colors.info}`,
                            borderLeft: `4px solid ${colors[type] || colors.info}`,
                            borderRadius: '8px',
                            padding: '16px 20px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            minWidth: '300px',
                            maxWidth: '400px',
                            pointerEvents: 'auto', // Re-enable clicks
                            color: '#fff'
                        }}
                    >
                        <div style={{ flexShrink: 0 }}>
                            {icons[type] || icons.info}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: '1.4' }}>
                            {message}
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#fff'}
                            onMouseOut={(e) => e.target.style.color = '#666'}
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Toast;
``

## File: src\components\TypingText.jsx

``jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const TypingText = ({ text, className, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(text.substring(0, i + 1));
                i++;
                if (i === text.length) clearInterval(interval);
            }, 100); // Speed of typing

            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
            >
                |
            </motion.span>
        </motion.span>
    );
};

export default TypingText;
``

## File: src\pages\About.jsx

``jsx
function About() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1>About Urbanova</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#a3a3a3' }}>
                Urbanova is the world's leading premium real estate marketplace. We connect discerning buyers with the most exclusive properties across the globe.
            </p>
        </div>
    );
}

export default About;
``

## File: src\pages\AddListing.jsx

``jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Sparkles } from 'lucide-react';
import Toast from '../components/Toast';

function AddListing() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are in edit mode
    const editingProperty = location.state?.property || null;
    const isEditMode = !!editingProperty;

    const [formData, setFormData] = useState({
        title: editingProperty?.title || '',
        description: editingProperty?.description || '',
        price: editingProperty?.price || '',
        location: editingProperty?.location || '',
        pincode: editingProperty?.pincode || '',
    });

    const [file, setFile] = useState(null);
    const [imageURL, setImageURL] = useState(editingProperty?.image || '');
    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleURLChange = (e) => {
        setImageURL(e.target.value);
    }

    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(-1);

    const handleAI = async () => {
        // If we already have suggestions, cycle through them
        if (aiSuggestions.length > 0) {
            const nextIndex = (currentSuggestionIndex + 1) % aiSuggestions.length;
            setCurrentSuggestionIndex(nextIndex);
            setFormData(prev => ({ ...prev, description: aiSuggestions[nextIndex] }));
            return;
        }

        // Otherwise fetch new ones
        try {
            const res = await fetch('/api/properties/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: formData.title, location: formData.location, price: formData.price })
            });
            const data = await res.json();

            if (data.descriptions && data.descriptions.length > 0) {
                setAiSuggestions(data.descriptions);
                setCurrentSuggestionIndex(0);
                setFormData(prev => ({ ...prev, description: data.descriptions[0] }));
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('location', formData.location);
        data.append('pincode', formData.pincode || '');

        if (file) {
            data.append('image', file);
        } else if (imageURL) {
            data.append('image', imageURL);
        }

        // Append User ID
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id) {
            data.append('user', user._id);
        }

        try {
            const apiUrl = isEditMode ? `/api/properties/${editingProperty._id}` : '/api/properties';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(apiUrl, {
                method: method,
                // headers: { 'Content-Type': 'multipart/form-data' }, // Fetch handles multipart automatically
                body: data,
            });
            if (res.ok) {
                navigate(isEditMode ? `/property/${editingProperty._id}` : '/');
            } else {
                console.error(`Failed to ${isEditMode ? 'update' : 'add'} listing`);
                setToast({ message: `Failed to ${isEditMode ? 'update' : 'publish'} listing. Check console.`, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setToast({ message: `Error ${isEditMode ? 'updating' : 'publishing'} listing.`, type: 'error' });
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', paddingTop: '100px', paddingBottom: '50px' }}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <h1 style={{ marginBottom: '2rem' }}>{isEditMode ? 'Edit Property Listing' : 'List Your Property'}</h1>
            <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border)' }}>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Property Title</label>
                    <input name="title" placeholder="e.g. Modern Penthouse in Downtown" value={formData.title} onChange={handleChange} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Price (₹)</label>
                        <input name="price" type="number" placeholder="10000000" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Location</label>
                        <input name="location" placeholder="e.g. Jubilee Hills, Hyderabad" value={formData.location} onChange={handleChange} required />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pincode / Zip Code</label>
                    <input name="pincode" placeholder="e.g. 500033" value={formData.pincode} onChange={handleChange} required style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Image</label>

                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <div style={{ position: 'relative' }}>
                            <input type="text" placeholder="https://example.com/image.jpg (or upload below)" value={imageURL} onChange={handleURLChange} style={{ paddingLeft: '3rem' }} />
                            <Upload size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }} />
                        </div>

                        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                            <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>OR Upload File (Overrides URL)</p>
                            <input type="file" onChange={handleFileChange} style={{ border: 'none', padding: 0 }} />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <button type="button" onClick={handleAI} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                            <Sparkles size={14} /> AI Generate
                        </button>
                    </div>
                    <textarea name="description" placeholder="Describe the property..." rows="6" value={formData.description} onChange={handleChange} required style={{ width: '100%' }} />
                </div>

                <button type="submit" style={{ width: '100%' }}>
                    {isEditMode ? 'Update Listing' : 'Publish Listing'}
                </button>
            </form>
        </div>
    );
}

export default AddListing;
``

## File: src\pages\AdminDashboard.jsx

``jsx
import { useState, useEffect } from 'react';
import { Users, Building2, Trash2, TrendingUp, DollarSign, Edit2, X, Save, CheckCircle, Menu, Moon, Sun, LayoutDashboard, LogOut, Activity, FileText } from 'lucide-react';
import '../index.css';
import Toast from '../components/Toast';
import AdminAnalytics from '../components/AdminAnalytics';
import TiltCard from '../components/TiltCard';
import AdminLogs from '../components/AdminLogs';

function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, properties: 0, totalValue: 0 });
    const [users, setUsers] = useState([]);
    const [properties, setProperties] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // UI States
    const [theme, setTheme] = useState('dark');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('stats');

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchStats(), fetchUsers(), fetchProperties(), fetchVerifications()]);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getAuthHeaders = (includeContentType = true) => {
        const adminUserStr = localStorage.getItem('adminUser');
        const userStr = localStorage.getItem('user');
        let token = null;
        if (adminUserStr) token = JSON.parse(adminUserStr).token;
        if (!token && userStr) token = JSON.parse(userStr).token;

        const headers = { 'token': `Bearer ${token}` };
        if (includeContentType) headers['Content-Type'] = 'application/json';
        return headers;
    };

    const fetchStats = async () => {
        const res = await fetch('/api/admin/stats', {
            headers: getAuthHeaders(false)
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data || { users: 0, properties: 0, totalValue: 0 });
    };

    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users', {
            headers: getAuthHeaders(false)
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
    };

    const fetchProperties = async () => {
        const res = await fetch('/api/properties');
        if (!res.ok) throw new Error('Failed to fetch properties');
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : []);
    };

    const fetchVerifications = async () => {
        const res = await fetch('/api/admin/pending-verifications', {
            headers: getAuthHeaders(false)
        });
        if (res.ok) {
            const data = await res.json();
            setVerifications(Array.isArray(data) ? data : []);
        }
    };

    const handleVerifyStatus = async (id, status) => {
        try {
            await fetch(`/api/admin/verify-seller/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ status })
            });
            fetchVerifications();
            setToast({ message: `Seller verification ${status}.`, type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to update verification', type: 'error' });
        }
    };

    const [selectedProperties, setSelectedProperties] = useState([]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProperties(properties.map(p => p._id));
        } else {
            setSelectedProperties([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedProperties.includes(id)) {
            setSelectedProperties(selectedProperties.filter(pid => pid !== id));
        } else {
            setSelectedProperties([...selectedProperties, id]);
        }
    };

    const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm, type }

    const openConfirm = (message, onConfirm, type = 'danger') => {
        setConfirmModal({ message, onConfirm, type });
    };

    const closeConfirm = () => {
        setConfirmModal(null);
    };

    const handleBulkDelete = () => {
        if (selectedProperties.length === 0) return;
        openConfirm(`Are you sure you want to delete ${selectedProperties.length} properties?`, async () => {
            setLoading(true);
            try {
                await fetch('/api/admin/properties/bulk-delete', {
                    method: 'POST',
                    headers: getAuthHeaders(true),
                    body: JSON.stringify({ ids: selectedProperties })
                });
                await fetchProperties();
                await fetchStats();
                setSelectedProperties([]);
                setToast({ message: 'Successfully deleted properties.', type: 'success' });
            } catch (err) {
                setToast({ message: 'Failed to delete properties', type: 'error' });
            } finally {
                setLoading(false);
                closeConfirm();
            }
        });
    };

    const handleDeleteUser = (id) => {
        openConfirm('Are you sure you want to ban this user?', async () => {
            await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(false)
            });
            fetchUsers();
            fetchStats();
            closeConfirm();
            setToast({ message: 'User banned successfully.', type: 'success' });
        });
    };

    const [generateCount, setGenerateCount] = useState(5);

    const handleGenerateProperties = async () => {
        setLoading(true);
        try {
            await fetch('/api/admin/generate-properties', {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ count: generateCount })
            });
            await fetchProperties();
            await fetchStats();
            setToast({ message: `Successfully generated ${generateCount} properties!`, type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to generate properties', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProperty = (id) => {
        openConfirm('Delete this listing permanently?', async () => {
            await fetch(`/api/admin/properties/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(false)
            });
            fetchProperties();
            fetchStats();
            closeConfirm();
            setToast({ message: 'Property deleted successfully.', type: 'success' });
        });
    };

    const handleEdit = (type, item) => {
        setEditingItem({ type, data: { ...item } });
    };

    const handleEditChange = (e) => {
        setEditingItem({
            ...editingItem,
            data: { ...editingItem.data, [e.target.name]: e.target.value }
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const { type, data } = editingItem;
        const endpoint = type === 'user' ? `users/${data._id}` : `properties/${data._id}`;

        try {
            await fetch(`/api/admin/${endpoint}`, {
                method: 'PUT',
                headers: getAuthHeaders(true),
                body: JSON.stringify(data)
            });

            setEditingItem(null);
            if (type === 'user') fetchUsers();
            else fetchProperties();
            fetchStats();
            setToast({ message: 'Update successful.', type: 'success' });
        } catch (err) {
            setToast({ message: 'Failed to update', type: 'error' });
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading Dashboard...</div>;
    if (error) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: '#ff6b6b' }}>{error}</div>;

    const navItems = [
        { id: 'stats', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Manage Users', icon: Users },
        { id: 'properties', label: 'Manage Listings', icon: Building2 },
        { id: 'logs', label: 'Activity Logs', icon: Activity },
        { id: 'verifications', label: 'Verifications', icon: FileText }
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0b0c10 0%, #1f2833 100%)', color: '#c5c6c7', transition: 'background 0.3s ease, color 0.3s ease' }}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Mobile Hamburger Overlay */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 100, padding: '0.5rem', background: 'var(--bg-card)', color: 'var(--text-primary)', display: window.innerWidth > 1024 ? 'none' : 'block' }}
                className="neu-outset"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sliding Sidebar */}
            <aside
                className="admin-sidebar neu-outset"
                style={{
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    padding: '2rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: window.innerWidth <= 1024 ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 90,
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                    background: 'var(--bg-card)',
                    borderRight: '1px solid var(--border)',
                    width: '80px', // Default collapsed width
                }}
                onMouseEnter={(e) => {
                    if (window.innerWidth > 1024) e.currentTarget.style.width = '280px';
                }}
                onMouseLeave={(e) => {
                    if (window.innerWidth > 1024) e.currentTarget.style.width = '80px';
                }}
            >
                <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
                    {/* Compact Logo */}
                    <div style={{ width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', flexShrink: 0 }}>
                        UA
                    </div>
                    {/* Expanded Logo Text */}
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0 1rem', letterSpacing: '-0.05em', color: 'var(--text-primary)', whiteSpace: 'nowrap', opacity: 'var(--sidebar-opacity, 0)', transition: 'opacity 0.4s ease', pointerEvents: 'none' }} className="sidebar-text">
                        Urbanova <span style={{ color: 'var(--accent)' }}>Admin</span>
                    </h2>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); window.innerWidth <= 1024 && setSidebarOpen(false); }}
                                className={isActive ? 'neu-inset' : 'neu-outset'}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    padding: '1rem',
                                    width: '100%',
                                    textAlign: 'left',
                                    background: isActive ? 'var(--bg-primary)' : 'transparent',
                                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: isActive ? 600 : 500,
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                                title={item.label} // Tooltip for collapsed state
                            >
                                <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
                                    <Icon size={22} />
                                </div>
                                <span style={{ whiteSpace: 'nowrap', opacity: 'var(--sidebar-opacity, 0)', transition: 'opacity 0.4s ease', pointerEvents: 'none' }} className="sidebar-text">
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </nav>

                {/* User Action - Logout */}
                <button
                    className="admin-logout-btn"
                    onClick={() => {
                        openConfirm(
                            "Are you sure you want to logout of the Admin Portal?",
                            () => {
                                localStorage.removeItem('adminUser');
                                window.location.href = '/bvy-estate';
                            },
                            'danger'
                        );
                    }}
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        padding: '0.5rem 0.5rem 0.5rem 0.15rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: 'transparent',
                        transition: 'all 0.3s ease',
                        border: '1px solid transparent',
                        overflow: 'hidden',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}
                    title="Logout"
                >
                    <div style={{ minWidth: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', flexShrink: 0 }}>AD</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', whiteSpace: 'nowrap', opacity: 'var(--sidebar-opacity, 0)', transition: 'opacity 0.4s ease', pointerEvents: 'none' }} className="sidebar-text">
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Admin Portal</span>
                        <span style={{ fontSize: '0.75rem', color: '#ff6b6b', fontWeight: 500 }}>Click to logout</span>
                    </div>
                </button>
            </aside>

            {/* Global CSS for Sidebar Hover Logic & Premium Admin Theme */}
            <style>{`
                :root {
                    --admin-accent: #d4af37; /* Gold */
                }
                .admin-sidebar {
                    background: rgba(11, 12, 16, 0.95) !important;
                    border-right: 1px solid rgba(212, 175, 55, 0.2) !important;
                }
                .admin-sidebar:hover .sidebar-text {
                    opacity: 1 !important;
                }
                .admin-sidebar:hover .admin-logout-btn:hover {
                    background: rgba(255,255,255,0.05) !important;
                    border-color: rgba(212, 175, 55, 0.2) !important;
                }
                .admin-premium-card {
                    background: rgba(20, 20, 20, 0.7);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    border-radius: 16px;
                }
                /* Override accent color for this specific page */
                h1, h2, h3 { color: #fff !important; }
                .glow-orb { background: var(--admin-accent) !important; opacity: 0.1 !important; }
            `}</style>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: window.innerWidth > 1024 ? '80px' : '0',
                padding: '2rem 3rem',
                maxWidth: '1200px',
                transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxSizing: 'border-box'
            }}>

                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingTop: window.innerWidth <= 1024 ? '3rem' : '0' }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: 'var(--text-primary)' }}>
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage your real estate platform.</p>
                    </div>
                </header>

                {/* Stats View */}
                {activeTab === 'stats' && (
                    <>
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                            <div className="neu-outset" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                                <div className="glow-orb" style={{ top: '-20px', right: '-20px' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div className="neu-inset" style={{ width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={24} color="var(--accent)" />
                                    </div>
                                    <span style={{ background: 'rgba(50, 205, 50, 0.1)', color: '#32cd32', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>+12%</span>
                                </div>
                                <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{stats.users}</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</p>
                            </div>

                            <div className="neu-outset" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                                <div className="glow-orb" style={{ top: '-20px', right: '-20px', background: '#007bff' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div className="neu-inset" style={{ width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={24} color="#007bff" />
                                    </div>
                                    <span style={{ background: 'rgba(50, 205, 50, 0.1)', color: '#32cd32', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>+5%</span>
                                </div>
                                <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{stats.properties}</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Listings</p>
                            </div>

                            <div className="neu-outset" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                                <div className="glow-orb" style={{ top: '-20px', right: '-20px', background: '#e53935' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div className="neu-inset" style={{ width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <DollarSign size={24} color="#e53935" />
                                    </div>
                                    <span style={{ background: 'rgba(229, 57, 53, 0.1)', color: '#e53935', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>-2%</span>
                                </div>
                                <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>₹{(stats?.totalValue || 0).toLocaleString('en-IN')}</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Value</p>
                            </div>
                        </div>

                        {/* SVG Charts */}
                        <AdminAnalytics stats={stats} users={users} properties={properties} />
                    </>
                )}

                {/* Logs View */}
                {activeTab === 'logs' && (
                    <AdminLogs />
                )}

                {/* Verifications View */}
                {activeTab === 'verifications' && (
                    <div className="table-container admin-premium-card" style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.3)', textAlign: 'left' }}>
                                    <th style={{ padding: '1.5rem', color: '#d4af37' }}>Username</th>
                                    <th style={{ padding: '1.5rem', color: '#d4af37' }}>Email</th>
                                    <th style={{ padding: '1.5rem', color: '#d4af37' }}>Document</th>
                                    <th style={{ padding: '1.5rem', color: '#d4af37' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {verifications.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#888', fontSize: '1.1rem' }}>No pending verifications</td></tr>
                                ) : verifications.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{u.username}</td>
                                        <td style={{ padding: '1.5rem', color: '#aaa' }}>{u.email}</td>
                                        <td style={{ padding: '1.5rem' }}>
                                            {u.verificationDocument ? (
                                                <a href={`http://localhost:5000/uploads/${u.verificationDocument}`} target="_blank" rel="noreferrer" style={{ color: '#d4af37', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                                    <FileText size={18} /> View Document
                                                </a>
                                            ) : (
                                                <span style={{ color: '#666' }}>N/A</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                                            <button
                                                onClick={() => handleVerifyStatus(u._id, 'verified')}
                                                style={{ background: 'linear-gradient(to right, #38ef7d, #11998e)', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)' }}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerifyStatus(u._id, 'rejected')}
                                                style={{ background: 'linear-gradient(to right, #ff416c, #ff4b2b)', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 65, 108, 0.3)' }}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Users View */}
                {activeTab === 'users' && (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Username</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Joined</th>
                                    <th style={{ padding: '1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '1rem' }}>{user.username}</td>
                                        <td style={{ padding: '1rem' }}>{user.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                background: user.role === 'admin' ? 'var(--accent)' : '#333',
                                                color: user.role === 'admin' ? '#000' : '#fff',
                                                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit('user', user)}
                                                style={{ background: '#333', padding: '0.5rem', width: 'auto', color: '#fff' }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    style={{ background: '#e53935', padding: '0.5rem', width: 'auto' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Properties View */}
                {activeTab === 'properties' && (
                    <div>
                        <div className="neu-outset" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', padding: '1.5rem', borderRadius: '12px' }}>
                            <h3 style={{ margin: 0, marginRight: 'auto', color: 'var(--text-primary)' }}>Property Generator</h3>
                            <label style={{ color: 'var(--text-secondary)' }}>Count:</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={generateCount}
                                onChange={(e) => setGenerateCount(e.target.value)}
                                className="neu-inset"
                                style={{ margin: 0, padding: '0.5rem 1rem', width: '80px', height: '40px', textAlign: 'center' }}
                            />
                            <button
                                onClick={handleGenerateProperties}
                                className="neu-outset"
                                style={{ height: '40px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                Generate
                            </button>
                            {selectedProperties.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="neu-outset"
                                    style={{ marginLeft: 'auto', color: '#e53935', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', height: '40px', fontWeight: 'bold' }}
                                >
                                    <Trash2 size={16} /> Delete Selected ({selectedProperties.length})
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '1.5rem', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                            <div
                                onClick={() => {
                                    const allIds = properties.map(p => p._id);
                                    if (selectedProperties.length === properties.length) setSelectedProperties([]);
                                    else setSelectedProperties(allIds);
                                }}
                                className={properties.length > 0 && selectedProperties.length === properties.length ? 'neu-inset' : 'neu-outset'}
                                style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: (properties.length > 0 && selectedProperties.length === properties.length) ? 'var(--accent)' : 'var(--text-secondary)'
                                }}
                            >
                                <CheckCircle size={18} />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>Select All Listings</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {properties.map(property => {
                                const isSelected = selectedProperties.includes(property._id);
                                return (
                                    <div
                                        key={property._id}
                                        className={isSelected ? 'neu-inset' : 'neu-outset'}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            borderRadius: '16px',
                                            border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {/* Selection Checkmark Area (Left Column) */}
                                        <div
                                            onClick={() => handleSelectOne(property._id)}
                                            style={{
                                                marginRight: '1.5rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                                                padding: '0.5rem'
                                            }}
                                        >
                                            <CheckCircle size={22} className={isSelected ? 'neu-inset' : ''} style={{ borderRadius: '50%', padding: isSelected ? '2px' : '0' }} />
                                        </div>

                                        {/* Image Area */}
                                        <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, marginRight: '1.5rem', background: 'var(--bg-secondary)', position: 'relative' }}>
                                            {property.image ? (
                                                <img
                                                    src={property.image.startsWith('http') ? property.image : `http://localhost:5000/uploads/${property.image}`}
                                                    alt={property.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No Img</div>
                                            )}
                                        </div>

                                        {/* Info Area */}
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.title}</h4>
                                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.location}</p>
                                        </div>

                                        {/* Price Area */}
                                        <div style={{ padding: '0 2rem', fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                                            ₹{property.price.toLocaleString('en-IN')}
                                        </div>

                                        {/* Actions Area (Right Column) */}
                                        <div style={{ display: 'flex', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                                            <button
                                                onClick={() => handleEdit('property', property)}
                                                className="neu-outset"
                                                style={{ padding: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}
                                                title="Edit Property"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProperty(property._id)}
                                                className="neu-outset"
                                                style={{ padding: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#e53935', borderRadius: '8px' }}
                                                title="Delete Property"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {confirmModal && (
                    <div className="glass-panel" style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                        borderRadius: 0, border: 'none'
                    }}>
                        <div className="neu-outset" style={{ padding: '2.5rem', width: '400px', textAlign: 'center', animation: 'slideUp 0.3s ease' }}>
                            <div className="neu-inset" style={{ width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <Trash2 size={32} color="#e53935" />
                            </div>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Confirm Action</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.5 }}>{confirmModal.message}</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={closeConfirm}
                                    className="neu-outset"
                                    style={{ flex: 1, padding: '0.75rem', color: 'var(--text-primary)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="neu-outset"
                                    style={{ flex: 1, padding: '0.75rem', color: '#e53935' }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingItem && (
                    <div className="glass-panel" style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                        borderRadius: 0, border: 'none'
                    }}>
                        <div className="neu-outset" style={{ padding: '2.5rem', width: '400px', animation: 'slideUp 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Edit {editingItem.type === 'user' ? 'User' : 'Property'}</h3>
                                <button onClick={() => setEditingItem(null)} className="neu-outset" style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate}>
                                {editingItem.type === 'user' ? (
                                    <>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Username</label>
                                            <input
                                                name="username"
                                                value={editingItem.data.username}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
                                            <input
                                                name="email"
                                                value={editingItem.data.email}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Role</label>
                                            <select
                                                name="role"
                                                value={editingItem.data.role}
                                                onChange={handleEditChange}
                                            >
                                                <option value="buyer">Buyer</option>
                                                <option value="seller">Seller</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Title</label>
                                            <input
                                                name="title"
                                                value={editingItem.data.title}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Location</label>
                                            <input
                                                name="location"
                                                value={editingItem.data.location}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Price</label>
                                            <input
                                                name="price"
                                                type="number"
                                                value={editingItem.data.price}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                    </>
                                )}

                                <button type="submit" className="neu-outset" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', color: 'var(--accent)', marginTop: '1rem', padding: '0.75rem', fontWeight: 'bold' }}>
                                    <Save size={18} /> Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
``

## File: src\pages\AdminEntry.jsx

``jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminEntry({ onAdminLogin }) {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'admin' // Forced role
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? 'login' : 'register';

        try {
            const res = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                const errorMessage = typeof data === 'string' ? data : (data.message || data.error || 'Authentication failed');
                throw new Error(errorMessage);
            }

            // Double check role for login
            if (isLogin && data.role !== 'admin') {
                throw new Error("Access Denied. Not an Admin account.");
            }

            localStorage.setItem('adminUser', JSON.stringify(data));
            onAdminLogin(data);
            navigate('/admin'); // Redirect straight to dashboard
        } catch (err) {
            setError(err.message || 'Authentication failed');
        }
    }

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: '400px', padding: '3rem', background: '#111', borderRadius: '16px', border: '1px solid #333' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <ShieldAlert size={48} color="#d32f2f" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>Restricted Access</h1>
                    <p style={{ color: '#666' }}>Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-with-icon">
                        <User size={18} />
                        <input name="username" placeholder="Admin Username" required onChange={handleChange} style={{ background: '#222', border: '1px solid #333', color: '#fff' }} />
                    </div>

                    {!isLogin && (
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input name="email" type="email" placeholder="Admin Email" required onChange={handleChange} style={{ background: '#222', border: '1px solid #333', color: '#fff' }} />
                        </div>
                    )}

                    <div className="input-with-icon">
                        <Lock size={18} />
                        <input name="password" type="password" placeholder="Password" required onChange={handleChange} style={{ background: '#222', border: '1px solid #333', color: '#fff' }} />
                    </div>

                    {error && <p style={{ color: '#d32f2f', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

                    <button type="submit" style={{ background: '#d32f2f', color: '#fff', padding: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLogin ? 'Access Dashboard' : 'Register Admin'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>
                        {isLogin ? 'Need to register a new admin?' : 'Back to Login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default AdminEntry;
``

## File: src\pages\ApiTester.jsx

``jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Copy, Check, ShieldAlert } from 'lucide-react';

function ApiTester() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [prompt, setPrompt] = useState('Hello! Please confirm you are working by telling me one interesting fact about real estate. Keep it to 2-3 sentences.');
  const [temperature, setTemperature] = useState(0.7);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: 'Ready to test. Click the button below.' });
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const runTest = async () => {
    if (!apiKey || !prompt) {
      setStatus({ type: 'error', message: '⚠️ Please fill in the API key and prompt.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'loading', message: 'Connecting to OpenRouter...' });
    setResponse(null);

    const startTime = Date.now();

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'Urbanova AI Tester'
        },
        body: JSON.stringify({
          model,
          temperature,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error?.message || `HTTP ${res.status}`;
        setStatus({ type: 'error', message: `❌ API Error: ${errMsg}` });
        setResponse({
          text: JSON.stringify(data, null, 2),
          meta: { status: res.status }
        });
        return;
      }

      const message = data.choices?.[0]?.message?.content || '(No content)';
      const usage = data.usage || {};
      const modelUsed = data.model || model;

      setStatus({ type: 'success', message: `✅ Success! API key is valid. Response in ${elapsed}s` });
      setResponse({
        text: message,
        meta: {
          model: modelUsed,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          time: `${elapsed}s`
        }
      });

    } catch (err) {
      setStatus({ type: 'error', message: `❌ Network error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (response?.text) {
      navigator.clipboard.writeText(response.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', maxWidth: '800px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--accent)', padding: '0.35rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          <Activity size={14} /> Live API Test
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>OpenRouter <span style={{ color: 'var(--accent)' }}>AI Tester</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Send a prompt to any model and verify your API key instantly.</p>
      </div>

      <motion.div 
        className="liquid-glass" 
        style={{ padding: '2.5rem', marginBottom: '2rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '0.04em' }}>🔑 OpenRouter API Key</label>
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ marginBottom: 0 }}
            placeholder="sk-or-v1-..." 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '0.04em' }}>🤖 Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} style={{ marginBottom: 0, cursor: 'pointer' }}>
              <option value="openai/gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</option>
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
              <option value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (FREE)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '0.04em' }}>🌡️ Temperature: {temperature}</label>
            <input 
              type="range" 
              min="0" max="2" step="0.1" 
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ padding: '0.55rem 0', cursor: 'pointer', background: 'transparent', boxShadow: 'none' }} 
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '0.04em' }}>💬 Prompt</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ minHeight: '120px', resize: 'vertical', marginBottom: 0 }}
          />
        </div>

        {/* Status Bar */}
        <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '2rem', transition: 'all 0.3s',
            background: status.type === 'error' ? 'rgba(239,68,68,0.1)' : status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${status.type === 'error' ? 'rgba(239,68,68,0.3)' : status.type === 'success' ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`
          }}>
          <div style={{ 
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            background: status.type === 'error' ? '#ef4444' : status.type === 'success' ? '#22c55e' : status.type === 'loading' ? 'var(--accent)' : 'var(--text-secondary)',
            boxShadow: status.type !== 'idle' ? `0 0 10px ${status.type === 'error' ? '#ef4444' : status.type === 'success' ? '#22c55e' : 'var(--accent)'}` : 'none'
          }}></div>
          <span style={{ fontSize: '0.9rem', color: status.type === 'error' ? '#ef4444' : status.type === 'success' ? '#22c55e' : 'var(--text-primary)' }}>
            {status.message}
          </span>
        </div>

        <button 
          onClick={runTest} 
          disabled={loading}
          style={{ 
            width: '100%', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            background: 'linear-gradient(135deg, #c9a227, #e6c84d)', color: '#000', fontSize: '1.05rem', boxShadow: '0 8px 25px rgba(212,175,55,0.35)',
            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <Activity className="animate-spin" size={20} />
          ) : (
            <ShieldAlert size={20} />
          )}
          {loading ? 'TESTING API...' : 'TEST API KEY NOW'}
        </button>
      </motion.div>

      {/* Response Area */}
      {response && (
        <motion.div 
          className="liquid-glass" 
          style={{ padding: '2rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#22c55e' }}>●</span> Response Output
            </h3>
            <button 
              onClick={handleCopy}
              style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: 'none' }}
            >
              {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {Object.entries(response.meta).map(([key, value]) => (
              value && (
                <div key={key} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {key}: <span style={{ color: 'var(--text-primary)' }}>{value}</span>
                </div>
              )
            ))}
          </div>

          <div style={{ 
            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem',
            fontSize: '1rem', lineHeight: 1.7, color: '#e2e8f0', whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto'
          }}>
            {response.text}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ApiTester;
``

## File: src\pages\Careers.jsx

``jsx
function Careers() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1>Join Our Team</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#a3a3a3' }}>
                We are always looking for passionate individuals to help us redefine the real estate industry. Check back soon for open positions.
            </p>
        </div>
    );
}

export default Careers;
``

## File: src\pages\Contact.jsx

``jsx
function Contact() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1>Contact Us</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#a3a3a3', marginBottom: '2rem' }}>
                Have questions? We'd love to hear from you.
            </p>
            <div style={{ background: '#141414', padding: '2rem', borderRadius: '12px', display: 'inline-block', border: '1px solid #262626' }}>
                <p>Email: support@urbanova.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Luxury Lane, Beverly Hills, CA</p>
            </div>
        </div>
    );
}

export default Contact;
``

## File: src\pages\Home.jsx

``jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TypingText from '../components/TypingText';
import PropertyCard from '../components/PropertyCard.jsx';
import Toast from '../components/Toast';

function Home({ openAuth, user }) {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetch('/api/properties')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch properties");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const sorted = [...data].sort((a, b) => b.price - a.price).slice(0, 3);
                    setFeaturedProperties(sorted);
                } else {
                    console.error("API returned non-array data:", data);
                }
            })
            .catch(err => console.error("Failed to fetch properties:", err));
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div style={{ overflowX: 'hidden' }}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        Find Your <span style={{ color: 'var(--accent)' }}><TypingText text="Dream Space" delay={0.5} /></span>
                    </motion.h1>
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Premium properties curated for the modern lifestyle. Discover exclusive listings in prime locations.
                    </motion.p>

                    <motion.div
                        className="stats-row liquid-glass"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="stat">
                            <span className="stat-number">1k+</span>
                            <span className="stat-label">Premium Listings</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">Major Cities</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Support</span>
                        </div>
                    </motion.div>

                    <Link to="/properties">
                        <motion.button
                            className="cta-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            Explore Properties <ArrowRight size={20} />
                        </motion.button>
                    </Link>
                </div>
            </header>

            {featuredProperties.length > 0 && (
                <section className="container" style={{ padding: '6rem 2rem' }}>
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Featured Listings</h2>
                        <p>Explore our most exclusive properties.</p>
                    </motion.div>

                    <motion.div
                        className="grid"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.1 }}
                        style={{ margin: '0 0 2rem 0' }}
                    >
                        {featuredProperties.map(property => (
                            <motion.div key={property._id} variants={fadeInUp}>
                                <PropertyCard property={property} />
                            </motion.div>
                        ))}
                    </motion.div>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/properties">
                            <button style={{
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                fontSize: '0.9rem',
                                color: 'var(--text-primary)',
                                padding: '0.8rem 2rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseOver={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
                                onMouseOut={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-primary)'; }}
                            >
                                View All Listings
                            </button>
                        </Link>
                    </div>
                </section>
            )}

            {(!user || user.role !== 'buyer') && (
                <section className="cta-section">
                    <motion.div
                        className="container"
                        style={{ textAlign: 'center' }}
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Ready to Sell?</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>List your property with us and reach thousands of potential buyers today.</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!user) {
                                    openAuth('register', 'seller');
                                } else if (user.role !== 'seller') {
                                    setToast({ message: "You must be registered as a Seller to list properties.", type: "error" });
                                } else {
                                    window.location.href = '/add';
                                }
                            }}
                            style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                        >
                            List Your Property
                        </motion.button>
                    </motion.div>
                </section>
            )}
        </div>
    );
}

export default Home;
``

## File: src\pages\ListingDetails.jsx

``jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Mail, Calendar, Trash2, X, CheckCircle, Share2, Heart, Calculator, Target, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Toast from '../components/Toast';
import MortgageCalculator from '../components/MortgageCalculator';
import NegotiationAssistant from '../components/NegotiationAssistant';
import LiveabilityScore from '../components/LiveabilityScore';

function ListingDetails({ user, adminUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [toast, setToast] = useState(null);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
    const [isLiveabilityOpen, setIsLiveabilityOpen] = useState(false);

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Success States
    const [contactSuccess, setContactSuccess] = useState(false);
    const [scheduleSuccess, setScheduleSuccess] = useState(false);

    useEffect(() => {
        fetch(`/api/properties/${id}`)
            .then(res => res.json())
            .then(data => setProperty(data))
            .catch(err => console.error(err));
    }, [id]);

    const confirmDelete = async () => {
        try {
            const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
            if (res.ok) navigate('/');
            else setToast({ message: 'Failed to delete property.', type: 'error' });
        } catch (err) {
            console.error(err);
            setToast({ message: 'Error deleting property.', type: 'error' });
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setContactSuccess(true);
    }

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        setScheduleSuccess(true);
    }

    const closeContactModal = () => {
        setShowContactModal(false);
        setContactSuccess(false);
    }

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setScheduleSuccess(false);
    }

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        return `http://localhost:5000/uploads/${img}`;
    }


    // Safety check for critical data
    if (!property || !property.title) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading or Error...</div>;

    const price = property.price ? property.price.toLocaleString() : 'N/A';

    // Debugging ownership
    const isOwner = (() => {
        // Strictly check if the logged-in user is the owner
        if (!user || !property) return false;

        // Note: We removed global admin access from this public view
        if (user.role === 'admin') return true; // Legacy fallback if admin logs in via main portal
        if (!property.user) return false;

        const propertyUserId = typeof property.user === 'object' ? property.user._id : property.user;
        const currentUserId = user._id;

        return String(propertyUserId) === String(currentUserId);
    })();

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Cinematic Hero Section */}
            <div style={{ position: 'relative', height: '60vh', width: '100%', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url(${getImageUrl(property.image)})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'brightness(0.7)'
                }}></div>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #050505)'
                }}></div>

                <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '4rem' }}>
                    <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '100px', backdropFilter: 'blur(5px)' }}>
                        <ArrowLeft size={16} /> Back
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <h1 style={{ fontSize: '3.5rem', margin: '0 0 0.5rem 0', fontWeight: '800', letterSpacing: '-0.02em', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{property.title}</h1>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#dedede' }}>
                            <MapPin size={20} color="var(--accent)" /> {property.location}
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '4rem', marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                {/* Left Column: Details */}
                <div>
                    <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>About this property</h2>
                        <p style={{ lineHeight: '1.8', color: '#ccc', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{property.description}</p>
                    </div>

                    {/* Visual Map Placeholder */}
                    <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Location</h2>
                        <div style={{
                            width: '100%', height: '300px', borderRadius: '12px',
                            background: 'url(https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif)', // Placeholder map graphic
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)' }}></div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location + ' ' + (property.pincode || ''))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ position: 'relative', background: '#fff', color: '#000', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', textDecoration: 'none', borderRadius: '8px' }}
                            >
                                <MapPin size={18} /> View on Google Maps
                            </a>
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {property.location} {property.pincode ? `, ${property.pincode}` : ''}
                        </p>
                    </div>
                </div>

                {/* Right Column: Sticky Sidebar */}
                <div style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
                    <div style={{
                        background: 'rgba(20, 20, 20, 0.6)',
                        backdropFilter: 'blur(20px)',
                        padding: '2rem', borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em' }}>Price</p>
                        <div style={{ fontSize: '3rem', color: '#fff', fontWeight: '700', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
                            ₹{Number(property.price).toLocaleString('en-IN')}
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <button onClick={() => setShowScheduleModal(true)} style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}>
                                Schedule Viewing
                            </button>
                            <button onClick={() => setShowContactModal(true)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                Contact Agent / Seller
                            </button>
                            {user && user.role === 'buyer' && (
                                <>
                                    <button
                                        onClick={() => setIsNegotiationOpen(true)}
                                        style={{ width: '100%', background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)', color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Target size={18} /> AI Negotiation
                                    </button>
                                    <button
                                        onClick={() => setIsLiveabilityOpen(true)}
                                        style={{ width: '100%', background: 'rgba(56, 239, 125, 0.1)', border: '1px solid rgba(56, 239, 125, 0.3)', color: '#38ef7d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Home size={18} /> Liveability Score
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setIsCalculatorOpen(true)}
                                style={{ width: '100%', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Calculator size={18} /> Estimate Payments
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <button style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'none' }}>
                                <Share2 size={18} /> Share
                            </button>
                            <button style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'none' }}>
                                <Heart size={18} /> Save
                            </button>
                        </div>

                        {isOwner && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={() => navigate('/add', { state: { property } })}
                                    style={{ width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '0.95rem', boxShadow: 'none' }}
                                >
                                    Edit Listing
                                </button>
                                <button onClick={() => setShowDeleteModal(true)} style={{ width: '100%', background: 'transparent', color: '#d32f2f', border: 'none', fontSize: '0.9rem', opacity: 0.7, boxShadow: 'none' }}>
                                    Delete Listing
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals (Re-used styles) */}
            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="auth-modal" style={{ maxWidth: '400px' }}>
                        <h3>Delete Listing?</h3>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>Are you sure? This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ background: 'transparent', border: '1px solid #eee', color: '#000', boxShadow: 'none' }}>Cancel</button>
                            <button onClick={confirmDelete} style={{ background: '#d32f2f', color: '#fff', boxShadow: 'none' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Modal Placeholder (simplified for brevity logic remains same) */}
            {/* Schedule Modal Placeholder */}
            {(showContactModal || showScheduleModal) && (
                <div className="modal-overlay">
                    <div className="auth-modal" style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>{showContactModal ? 'Contact Agent / Seller' : 'Schedule Viewing'}</h3>
                            <button onClick={() => { setShowContactModal(false); setShowScheduleModal(false) }} style={{ background: 'transparent', color: '#000', padding: 0, boxShadow: 'none' }}><X /></button>
                        </div>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>
                            {contactSuccess || scheduleSuccess ? 'Request Sent Successfully!' : 'Enter your details below to connect with the agent or seller.'}
                        </p>
                        {!contactSuccess && !scheduleSuccess && (
                            <form onSubmit={showContactModal ? handleContactSubmit : handleScheduleSubmit}>
                                <input type="text" placeholder="Your Name" required />
                                <input type="email" placeholder="Your Email" required />
                                {showScheduleModal && <input type="date" required style={{ marginBottom: '1rem' }} />}
                                <button type="submit" className="submit-btn">Send Request</button>
                            </form>
                        )}
                        {(contactSuccess || scheduleSuccess) && <button onClick={() => { setShowContactModal(false); setShowScheduleModal(false) }} className="submit-btn">Close</button>}
                    </div>
                </div>
            )}
            {/* Mortgage Calculator Modal */}
            <MortgageCalculator
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                price={property.price}
            />
            {/* AI Negotiation Assistant */}
            <NegotiationAssistant
                property={property}
                isOpen={isNegotiationOpen}
                onClose={() => setIsNegotiationOpen(false)}
            />
            {/* Liveability Score */}
            <LiveabilityScore
                property={property}
                isOpen={isLiveabilityOpen}
                onClose={() => setIsLiveabilityOpen(false)}
            />
        </div>
    );
}

export default ListingDetails;
``

## File: src\pages\Properties.jsx

``jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from "../components/PropertyCard.jsx";

function Properties() {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState('all');

    useEffect(() => {
        fetch('/api/properties')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch properties");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProperties(data);
                    setFilteredProperties(data);
                } else {
                    console.error("API returned non-array data:", data);
                    setProperties([]);
                    setFilteredProperties([]);
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        let result = properties;

        // Filter by Location/Title
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(lowerTerm) ||
                p.location.toLowerCase().includes(lowerTerm)
            );
        }

        // Filter by Price
        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) {
                result = result.filter(p => p.price >= min && p.price <= max);
            } else {
                // "500000+" case
                result = result.filter(p => p.price >= min);
            }
        }

        setFilteredProperties(result);
    }, [searchTerm, priceRange, properties]);

    return (
        <div className="container">
            <header className="hero" style={{ padding: '3rem 0', background: 'none', textAlign: 'center' }}>
                <h1>Find Your Perfect Home</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Search listings by location, price, or name.</p>

                <div className="search-bar" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div className="input-with-icon" style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by City, Zip, or Address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ margin: 0, paddingLeft: '1rem' }}
                        />
                    </div>
                    <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        style={{ margin: 0, width: '200px' }}
                    >
                        <option value="all">Any Price</option>
                        <option value="0-5000000">Under ₹50 Lakhs</option>
                        <option value="5000000-10000000">₹50L - ₹1 Cr</option>
                        <option value="10000000-20000000">₹1 Cr - ₹2 Cr</option>
                        <option value="20000000-50000000">₹2 Cr - ₹5 Cr</option>
                        <option value="50000000+">₹5 Cr+</option>
                    </select>
                </div>
            </header>

            <section className="grid">
                {filteredProperties.map(property => (
                    <PropertyCard key={property._id} property={property} />
                ))}
                {filteredProperties.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <p>No listings found matching your search.</p>
                        {properties.length === 0 && (
                            <Link to="/add">
                                <button style={{ marginTop: '1rem' }}>Create First Listing</button>
                            </Link>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Properties;
``

## File: src\pages\SellerDashboard.jsx

``jsx
import { useState, useEffect } from 'react';
import { Building2, Eye, Plus, LayoutGrid } from 'lucide-react';
import '../index.css';
import { Link, useNavigate } from 'react-router-dom';

function SellerDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalListings: 0,
        totalViews: 0,
        properties: []
    });
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [verifyFile, setVerifyFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = user?.token;

                // Fetch latest user info
                const userRes = await fetch('/api/users/me', {
                    headers: { 'token': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    const updatedUser = { ...user, ...userData };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }

                // API endpoint: /api/properties/user/stats
                const res = await fetch('/api/properties/user/stats', {
                    headers: { 'token': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch seller stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        if (!verifyFile) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('document', verifyFile);

        try {
            const res = await fetch('/api/users/verify', {
                method: 'POST',
                headers: { 'token': `Bearer ${user.token}` },
                body: formData
            });
            if (res.ok) {
                const updatedUser = await res.json();
                const newUser = { ...user, ...updatedUser };
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
                setVerifyFile(null);
            }
        } catch (err) {
            console.error("Verification upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading Dashboard...</div>;

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="section-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Seller Dashboard</h2>
                    <p>Overview of your listings and performance.</p>
                </div>
                <Link to="/add">
                    <button className="cta-button" style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}>
                        <Plus size={18} /> List New Property
                    </button>
                </Link>
            </div>

            {/* Verification Status */}
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Account Verification</h3>
                {user.verificationStatus === 'verified' && (
                    <div style={{ color: '#32cd32', fontWeight: 'bold' }}>✓ You are a Verified Seller.</div>
                )}
                {user.verificationStatus === 'pending' && (
                    <div style={{ color: '#ffa500', fontWeight: 'bold' }}>⏳ Your verification document is pending review by an administrator.</div>
                )}
                {(!user.verificationStatus || user.verificationStatus === 'unverified' || user.verificationStatus === 'rejected') && (
                    <div>
                        {user.verificationStatus === 'rejected' && <p style={{ color: '#ff6b6b' }}>Your previous verification was rejected. Please re-upload a valid ID or ownership document.</p>}
                        <p style={{ color: 'var(--text-secondary)' }}>Please upload a government-issued ID or property ownership document to become verified.</p>
                        <form onSubmit={handleVerificationSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                            <input type="file" onChange={(e) => setVerifyFile(e.target.files[0])} required />
                            <button type="submit" disabled={uploading} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                {uploading ? 'Uploading...' : 'Submit Document'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        <span>Total Listings</span>
                        <LayoutGrid size={20} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-primary)' }}>{stats.totalListings}</h3>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        <span>Total Views</span>
                        <Eye size={20} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-primary)' }}>{stats.totalViews}</h3>
                </div>
            </div>

            <style>{`
                .listing-row {
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                .listing-row:hover {
                    background-color: rgba(255, 255, 255, 0.03);
                }
            `}</style>

            {/* Listings Table */}
            <div className="listings-section">
                <h3 style={{ marginBottom: '1.5rem' }}>My Listings</h3>

                <div className="table-container" style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Property</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Price</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Location</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Views</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date Posted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.properties.length > 0 ? (
                                stats.properties.map(property => (
                                    <tr
                                        key={property._id}
                                        className="listing-row"
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                        onClick={() => navigate(`/property/${property._id}`)}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', background: '#333' }}>
                                                    {property.image && <img src={property.image.startsWith('http') ? property.image : `http://localhost:5000/uploads/${property.image}`} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                </div>
                                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{property.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>₹{property.price.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '1rem' }}>{property.location}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Eye size={16} style={{ color: 'var(--text-secondary)' }} />
                                                {property.views || 0}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {new Date(property.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        You haven't listed any properties yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SellerDashboard;
``

## File: src\App.css

``css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
``

## File: src\App.jsx

``jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, PlusSquare, Building2, Search, User, LayoutGrid } from 'lucide-react';
import Home from './pages/Home';
import Properties from './pages/Properties';
import ListingDetails from './pages/ListingDetails';
import AddListing from './pages/AddListing';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AdminEntry from './pages/AdminEntry';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';

import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import ApiTester from './pages/ApiTester';
import AIChat from './components/AIChat';

function App() {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authConfig, setAuthConfig] = useState({ view: 'login', role: 'buyer' });
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedAdmin = localStorage.getItem('adminUser');
        if (storedAdmin) {
          setAdminUser(JSON.parse(storedAdmin));
        }
      } catch (err) {
        console.error("Auth Error:", err);
        localStorage.removeItem('user'); // Clear invalid data
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div style={{ height: '100vh', background: '#000' }}></div>;

  const openAuth = (view = 'login', role = 'buyer') => {
    setAuthConfig({ view, role });
    setShowAuthModal(true);
  };

  const handleLogin = (userData) => {
    if (userData.role === 'admin') {
      // Admin logged in via regular modal — treat as admin
      localStorage.removeItem('user');
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setUser(null);
      setAdminUser(userData);
      setShowAuthModal(false);
      window.location.href = '/admin'; // Hard redirect to admin dashboard
    } else {
      setUser(userData);
      setShowAuthModal(false);
    }
  };

  const handleAdminLogin = (adminData) => {
    setAdminUser(adminData);
    // Do NOT set regular user
  };

  // Determine if we are in the Admin Portal "Context" (visual theme)
  const isAdminView = location.pathname === '/bvy-estate' || location.pathname.startsWith('/admin');

  const checkAuth = () => {
    // ... existing checkAuth logic ...
  };

  // ... (hooks are fine)

  const handleLogout = () => {
    // Check if we are logging out of admin or main
    if (isAdminView) {
      localStorage.removeItem('adminUser');
      setAdminUser(null);
    } else {
      localStorage.removeItem('user');
      setUser(null);
      // Only show auth modal if it was a user logout
      setShowAuthModal(true);
    }
  };

  return (
    // Router removed here as it is now in main.jsx
    <div className="app fluid-bg-container">
      <div className="bg-blob bg-blob-1"></div>
      <div className="bg-blob bg-blob-2"></div>
      <div className="bg-blob bg-blob-3"></div>

      <header className="navbar-wrapper liquid-glass">
        <nav className="navbar container">
          <Link to="/" className="logo">Urbanova.</Link>
          <div className="nav-links">
            {isAdminView ? (
              <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none', cursor: 'pointer' }}>
                <HomeIcon size={18} /> Admin Portal
              </a>
            ) : (
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                <HomeIcon size={18} /> Home
              </Link>
            )}

            {/* Standard Navigation (Hidden in Admin Portal View) */}
            {!isAdminView && (
              <>
                <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={18} /> Properties
                </Link>
                {user && (user.role === 'seller' || user.role === 'agent') && (
                  <>
                    <Link to="/add" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PlusSquare size={18} /> List Property
                    </Link>
                    <Link to="/seller" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                      <LayoutGrid size={18} /> {user.role === 'agent' ? 'Agent Dashboard' : 'Dashboard'}
                    </Link>
                  </>
                )}
              </>
            )}



            {/* Auth Buttons Logic */}
            {isAdminView ? (
              /* Admin Portal Logic */
              adminUser ? (
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: '#ff6b6b', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Admin (Logout)
                </button>
              ) : (
                // In Admin Portal but not logged in? (e.g. on login page)
                null
              )
            ) : (
              /* Main Site Logic */
              user ? (
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  {user.username} (Logout)
                </button>
              ) : (
                <button onClick={() => setShowAuthModal(true)} style={{ background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', boxShadow: 'none' }}>
                  LOGIN
                </button>
              )
            )}
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home openAuth={openAuth} user={user} />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<ListingDetails user={user} adminUser={adminUser} />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/add" element={user && (user.role === 'seller' || user.role === 'agent') ? <AddListing /> : <Navigate to="/" />} />
        <Route path="/seller" element={user && (user.role === 'seller' || user.role === 'agent') ? <SellerDashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={adminUser && adminUser.role === 'admin' ? <AdminDashboard /> : <Navigate to="/bvy-estate" />} />
        
        {/* Dedicated AI API Testing Route */}
        <Route path="/api-test" element={<ApiTester />} />

        {/* Secret Admin Route */}
        <Route path="/bvy-estate" element={<AdminEntry onAdminLogin={handleAdminLogin} />} />
      </Routes>
      
      {/* Global AI Assistant */}
      <AIChat />

      <Footer />

      {showAuthModal && !user && !loading && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          initialView={authConfig.view}
          defaultRole={authConfig.role}
        />
      )}
    </div>
  );
}

export default App;
``

## File: src\index.css

``css
/* Global Styles & Reset */
:root {
  --bg-primary: #050505;
  --bg-secondary: #0a0a0c;
  --bg-card: #111114;
  --text-primary: #ffffff;
  --text-secondary: #9aa0a6;
  --accent: #d4af37; /* Amber/Gold */
  --accent-glow: rgba(212, 175, 55, 0.4);
  --border: rgba(255, 255, 255, 0.05);

  /* Soft Neumorphic Shadow Tokens (Ultra Dark Mode) */
  --shadow-light-color: rgba(255, 255, 255, 0.03);
  --shadow-dark-color: rgba(0, 0, 0, 0.8);
  --neu-drop: 10px 10px 30px var(--shadow-dark-color), -10px -10px 30px var(--shadow-light-color);
  --neu-inner: inset 8px 8px 16px var(--shadow-dark-color), inset -8px -8px 16px var(--shadow-light-color);
  --neu-drop-sm: 6px 6px 15px var(--shadow-dark-color), -6px -6px 15px var(--shadow-light-color);
  --neu-inner-sm: inset 4px 4px 10px var(--shadow-dark-color), inset -4px -4px 10px var(--shadow-light-color);
  --neu-active: inset 12px 12px 24px var(--shadow-dark-color), inset -12px -12px 24px var(--shadow-light-color);
}

body {
  margin: 0;
  font-family: 'Outfit', 'Inter', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Fluid Background System */
.fluid-bg-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  z-index: 0;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: -1;
  opacity: 0.6;
  animation: floatBlobs 25s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

.bg-blob-1 {
  top: -10%; left: -10%;
  width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  animation-delay: 0s;
}

.bg-blob-2 {
  bottom: -20%; right: -10%;
  width: 60vw; height: 60vw;
  background: radial-gradient(circle, rgba(50, 50, 60, 0.5) 0%, transparent 70%);
  animation-delay: -5s;
}

.bg-blob-3 {
  top: 40%; left: 40%;
  width: 40vw; height: 40vw;
  background: radial-gradient(circle, rgba(100, 80, 40, 0.1) 0%, transparent 60%);
  animation-delay: -10s;
}

@keyframes floatBlobs {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(10%, 15%) scale(1.1); }
  66% { transform: translate(-10%, -5%) scale(0.9); }
  100% { transform: translate(5%, -15%) scale(1.05); }
}

a {
  color: inherit;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--accent);
}

/* Soft Neumorphic Inputs & Buttons */
button {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 1.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 12px;
  box-shadow: var(--neu-drop);
  backdrop-filter: blur(10px);
}

button:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.06);
  color: var(--accent);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(212, 175, 55, 0.2);
}

button:active {
  transform: translateY(0);
  box-shadow: var(--neu-active);
  background: rgba(0, 0, 0, 0.2);
}

input, textarea, select {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  padding: 1rem 1.25rem;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--neu-inner);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(10px);
}

input:focus, textarea:focus {
  outline: none;
  background-color: rgba(0, 0, 0, 0.4);
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: var(--neu-inner), 0 0 20px var(--accent-glow);
}

/* --- Ultra-Premium Liquid Glass Classes --- */
.liquid-glass {
  background: rgba(20, 20, 25, 0.35);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.15); /* Light catching top edge */
  border-left: 1px solid rgba(255, 255, 255, 0.15); /* Light catching left edge */
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  border-radius: 16px;
}

.neu-outset {
  background: rgba(255, 255, 255, 0.02);
  box-shadow: var(--neu-drop);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.neu-inset {
  background: rgba(0, 0, 0, 0.2);
  box-shadow: var(--neu-inner);
  border-radius: 16px;
}

.glass-panel {
  /* Legacy mapping to liquid glass */
  background: rgba(20, 20, 25, 0.35);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
}

.img-zoom-hover {
  overflow: hidden;
  border-radius: inherit;
}

.img-zoom-hover img {
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.img-zoom-hover:hover img {
  transform: scale(1.08);
}

.glow-orb {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--accent);
  filter: blur(50px);
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
}

/* --------------------------------- */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navbar */
/* Navbar */
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  /* Ensure consistent padding inside container */
}

.logo {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  background: linear-gradient(to right, #fff, #999);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.hero-section {
  padding: 8rem 0 6rem 0;
  text-align: center;
  background: #000;
  position: relative;
  overflow: hidden;
  animation: fadeIn 1s ease-out;
}

.hero-title {
  font-size: 4rem;
  margin: 0 0 1rem 0;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 3rem auto;
  line-height: 1.6;
}

.stats-row {
  display: inline-flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem 3rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  margin-bottom: 3rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

/* Features Section */
.features-section {
  padding: 6rem 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
}

.section-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(20, 20, 25, 0.35);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 2.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(212, 175, 55, 0.2);
}

.feature-icon {
  color: var(--accent);
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Footer */
.footer {
  border-top: 1px solid var(--border);
  padding: 4rem 0 2rem 0;
  background: #000;
  margin-top: 4rem;
  position: relative;
  z-index: 10;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-brand p {
  color: var(--text-secondary);
  margin-top: 1rem;
}

.footer-links {
  display: flex;
  gap: 4rem;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link-group h4 {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
}

.link-group a {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.link-group a:hover {
  color: var(--accent);
}

.footer-bottom {
  text-align: center;
  color: #444;
  font-size: 0.9rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Cards (Existing, slightly refined) */
.card {
  background: var(--gradient-dark);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border-color: #404040;
}

.card-content {
  padding: 1.5rem;
}

.card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card .price {
  color: var(--accent);
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card .location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2.5rem;
  margin: 2rem 0 4rem 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }

}

/* Auth Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.auth-modal {
  background: rgba(20, 20, 25, 0.35);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  color: var(--text-primary);
  padding: 2.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  color: var(--text-secondary);
  padding: 0;
  box-shadow: none;
}

.close-btn:hover {
  color: var(--accent);
  transform: rotate(90deg);
}

.auth-header h2 {
  font-size: 2rem;
  margin: 0;
  letter-spacing: -0.05em;
  color: var(--text-primary);
}

.auth-header p {
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.auth-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  border-bottom: 1px solid var(--border);
}

.auth-tabs button {
  background: transparent;
  color: var(--text-secondary);
  box-shadow: none;
  padding: 0.5rem 1rem;
  border-bottom: 2px solid transparent;
  border-radius: 0;
}

.auth-tabs button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.input-group {
  position: relative;
  margin-bottom: 1rem;
}

.input-group svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.input-group input {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding-left: 3.5rem;
  margin-bottom: 0;
}

.input-group input:focus {
  background: var(--bg-primary);
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-glow);
}

.role-select {
  margin: 1.5rem 0;
  text-align: left;
}

.role-select label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.role-options {
  display: flex;
  gap: 1rem;
}

.role-options label {
  flex: 1;
  background: var(--bg-primary);
  padding: 0.75rem;
  text-align: center;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
}

.role-options label.selected {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}

.role-options input {
  display: none;
}

.submit-btn {
  width: 100%;
  background: var(--accent);
  color: #000;
  margin-top: 1rem;
  box-shadow: none;
}

.submit-btn:hover {
  background: #e5a720;
  /* Slightly darker yellow on hover */
  transform: translateY(-2px);
  box-shadow: 0 5px 15px var(--accent-glow);
}

.error-msg {
  color: #ef4444;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* AI Chat Widget */
.ai-chat-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: chatPulse 2s infinite;
}

@keyframes chatPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
  }

  70% {
    box-shadow: 0 0 0 15px rgba(212, 175, 55, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
  }
}

.ai-chat-btn:hover {
  transform: scale(1.1);
}

.ai-chat-window {
  position: fixed;
  bottom: 7rem;
  right: 2rem;
  width: 350px;
  height: 500px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  border: 1px solid var(--border);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-header {
  background: #000;
  color: #fff;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
}

.online-indicator {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.message.ai {
  background: #fff;
  color: #000;
  align-self: flex-start;
  border: 1px solid #eee;
  border-bottom-left-radius: 2px;
}

.message.user {
  background: #000;
  color: #fff;
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}

.chat-input-area {
  padding: 1rem;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
}

.chat-input-area input {
  margin: 0;
  padding: 0.75rem;
  border-radius: 100px;
  background: #f5f5f5;
  color: #000;
  border: none;
  flex: 1;
}

.chat-input-area button {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: #000;
  box-shadow: none;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
``

## File: src\main.jsx

``jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
``

