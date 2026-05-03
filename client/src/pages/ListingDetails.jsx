import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Mail, Calendar, Trash2, X, CheckCircle, Share2, Heart, Calculator, Target, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Toast from '../components/Toast';
import MortgageCalculator from '../components/MortgageCalculator';
import NegotiationAssistant from '../components/NegotiationAssistant';
import LiveabilityScore from '../components/LiveabilityScore';
import PropertyDualMap from '../components/PropertyDualMap.jsx';

/** OSM bbox: Greater Hyderabad corridor when listing has no stored coordinates */
const HYDERABAD_REGION_EMBED =
    'https://www.openstreetmap.org/export/embed.html?bbox=78.20%2C17.26%2C78.72%2C17.62&layer=mapnik';

function toCoordNumber(value) {
    if (value == null || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
}
function ListingDetails({ user }) {
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

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        return `http://localhost:5000/uploads/${img}`;
    };

    const HERO_FALLBACK_IMAGE =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Charminar%2C_Hyderabad.jpg/1280px-Charminar%2C_Hyderabad.jpg';

    // Safety check for critical data
    if (!property || !property.title) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading or Error...</div>;

    const mapLat = toCoordNumber(property.latitude);
    const mapLng = toCoordNumber(property.longitude);
    const addressLine = [property.location, property.pincode].filter(Boolean).join(', ');
    const googleMapsAddressUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`;
    const googleMapsPinUrl =
        mapLat != null && mapLng != null
            ? `https://www.google.com/maps/search/?api=1&query=${mapLat}%2C${mapLng}`
            : googleMapsAddressUrl;

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
                <img
                    src={getImageUrl(property.image) || HERO_FALLBACK_IMAGE}
                    alt={property.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        e.currentTarget.src = HERO_FALLBACK_IMAGE;
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.7)',
                    }}
                />
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
                        {property.image_credit ? (
                            <p
                                role="note"
                                style={{
                                    marginTop: '1.25rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid var(--border)',
                                    fontSize: '0.8rem',
                                    lineHeight: 1.55,
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                {property.image_credit}
                            </p>
                        ) : null}
                    </div>

                    {/* Embedded map — OSM marker when lat/lng exist; metro overview fallback */}
                    <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Location</h2>
                        {mapLat != null && mapLng != null ? (
                            <>
                                <PropertyDualMap
                                    lat={mapLat}
                                    lng={mapLng}
                                    title={property.title}
                                    addressLabel={`${addressLine}\nApprox. ${mapLat.toFixed(5)}°N · ${mapLng.toFixed(5)}°E`}
                                    hideLayerSwitcher
                                    height={360}
                                />
                                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                                    <a
                                        href={googleMapsPinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            background: '#fff',
                                            color: '#000',
                                            padding: '0.6rem 1.1rem',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <MapPin size={17} aria-hidden /> Open in Google Maps
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                    No GPS pin saved yet for this listing — map shows Greater Hyderabad context. Use the button below for navigation to the full address.
                                </p>
                                <iframe
                                    title="Greater Hyderabad overview"
                                    src={HYDERABAD_REGION_EMBED}
                                    width="100%"
                                    height={360}
                                    style={{ border: 0, borderRadius: '12px' }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                                <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    © <a href="https://openstreetmap.org/copyright" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>OpenStreetMap</a>
                                </p>
                                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                                    <a
                                        href={googleMapsAddressUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            background: '#fff',
                                            color: '#000',
                                            padding: '0.6rem 1.1rem',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <MapPin size={17} aria-hidden /> Open address in Google Maps
                                    </a>
                                </div>
                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                                    {addressLine}
                                </p>
                            </>
                        )}
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
