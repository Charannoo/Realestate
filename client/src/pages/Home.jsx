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
                        Hyderabad&apos;s Finest{' '}
                        <span style={{ color: 'var(--accent)' }}><TypingText text="Urban Homes" delay={0.5} /></span>
                    </motion.h1>
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Verified-style inventory across Greater Hyderabad — from Jubilee & Banjara to the ORR growth belt. Real locality data, INR pricing, and tools for buyers & sellers grounded in Telangana metro reality.
                    </motion.p>

                    <motion.div
                        className="stats-row liquid-glass"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="stat">
                            <span className="stat-number">Metro</span>
                            <span className="stat-label">Hyderabad‑first catalogue</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">500–501</span>
                            <span className="stat-label">PIN bands + peri‑urban</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">₹ tiers</span>
                            <span className="stat-label">Lakhs to premium Cr</span>
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
                        <h2>Featured in Hyderabad</h2>
                        <p>Newest premium picks across GHMC corridors & nearby growth belts.</p>
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
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Reach serious buyers scouting Jubilee, Cyberabad towers, Miyapur corridor & ORR neighbourhoods.</p>
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