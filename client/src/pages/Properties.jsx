import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from "../components/PropertyCard.jsx";

function Properties() {
    const [properties, setProperties] = useState([]);
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
                } else {
                    console.error("API returned non-array data:", data);
                    setProperties([]);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const filteredProperties = useMemo(() => {
        let result = properties;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter((p) =>
                p.title.toLowerCase().includes(lowerTerm) ||
                p.location.toLowerCase().includes(lowerTerm)
            );
        }

        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) {
                result = result.filter((p) => p.price >= min && p.price <= max);
            } else {
                result = result.filter((p) => p.price >= min);
            }
        }

        return result;
    }, [searchTerm, priceRange, properties]);

    return (
        <div className="container">
            <header className="hero" style={{ padding: '3rem 0', background: 'none', textAlign: 'center' }}>
                <h1>Browse Greater Hyderabad</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    Default inventory is metro-scoped (GHMC core, Cyberabad, ORR neighbourhoods, peri‑urban RR / Medchal / Sangareddy). Filter by locality or budget.
                </p>

                <div className="search-bar" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div className="input-with-icon" style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Try Banjara Hills, Miyapur, Gachibowli, or PIN 5000…"
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
                        <p>No listings match this search.</p>
                        {properties.length === 0 && (
                            <>
                                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                                    In Supabase (<strong>same project</strong> as <code style={{ color: 'var(--accent)' }}>server/.env</code>), run{' '}
                                    <code style={{ color: 'var(--accent)' }}>sql/bootstrap_estate_dev.sql</code> once (tables, geo columns, dev anon policies so the API key can upsert listings).{' '}
                                    Then from repo root run <code style={{ color: 'var(--accent)' }}>npm run seed:hyderabad</code>. Prefer <code style={{ color: 'var(--accent)' }}>SUPABASE_SERVICE_ROLE_KEY</code> on the server instead of widening anon policies in production.
                                </p>
                                <Link to="/add">
                                    <button style={{ marginTop: '1rem' }}>Create listing</button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Properties;
