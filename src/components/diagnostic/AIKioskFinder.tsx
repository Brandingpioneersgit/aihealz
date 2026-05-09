'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, ExternalLink, Loader2, AlertCircle, Settings } from 'lucide-react';

interface AIKiosk {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  operatingHours: string;
  phone?: string;
  features: string[];
  rating?: number;
  testsAvailable: string[];
  waitTime?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// City name normalization for matching
const normalizeCity = (city: string): string => {
  return city.toLowerCase().replace(/[^a-z]/g, '');
};

// Map of city aliases to canonical names
const CITY_ALIASES: Record<string, string> = {
  'bengaluru': 'bangalore',
  'mumbai': 'mumbai',
  'bombay': 'mumbai',
  'delhi': 'delhi',
  'newdelhi': 'delhi',
  'chennai': 'chennai',
  'madras': 'chennai',
  'kolkata': 'kolkata',
  'calcutta': 'kolkata',
  'hyderabad': 'hyderabad',
  'pune': 'pune',
  'ahmedabad': 'ahmedabad',
  'jaipur': 'jaipur',
  'lucknow': 'lucknow',
  'chandigarh': 'chandigarh',
  'kochi': 'kochi',
  'cochin': 'kochi',
  'gurgaon': 'gurgaon',
  'gurugram': 'gurgaon',
  'noida': 'noida',
  'surat': 'surat',
  'nagpur': 'nagpur',
  'indore': 'indore',
  'bhopal': 'bhopal',
  'coimbatore': 'coimbatore',
  'visakhapatnam': 'visakhapatnam',
  'vizag': 'visakhapatnam',
  'patna': 'patna',
  'vadodara': 'vadodara',
  'baroda': 'vadodara',
  'thiruvananthapuram': 'thiruvananthapuram',
  'trivandrum': 'thiruvananthapuram',
};

// All available AI kiosks by city
const ALL_KIOSKS: AIKiosk[] = [
  // Bangalore
  {
    id: 'blr-1',
    name: 'HealthATM - Phoenix Mall',
    address: 'Phoenix Marketcity, Whitefield',
    city: 'bangalore',
    distance: '1.2 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543210',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG', 'Cholesterol'],
    rating: 4.5,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '5 mins',
    coordinates: { lat: 12.9698, lng: 77.7499 },
  },
  {
    id: 'blr-2',
    name: 'MedCheck AI Kiosk - Majestic Station',
    address: 'Kempegowda Bus Station, Majestic',
    city: 'bangalore',
    distance: '3.5 km',
    operatingHours: '6 AM - 11 PM',
    features: ['Blood Pressure', 'Temperature', 'Weight', 'Height', 'Vision Test'],
    rating: 4.2,
    testsAvailable: ['Basic Vitals', 'Vision Screening'],
    waitTime: '2 mins',
    coordinates: { lat: 12.9779, lng: 77.5665 },
  },
  {
    id: 'blr-3',
    name: 'Dr. Lal PathLabs Kiosk',
    address: 'Indiranagar 100 Ft Road',
    city: 'bangalore',
    distance: '4.8 km',
    operatingHours: '7 AM - 9 PM',
    phone: '+91-1800-102-5522',
    features: ['Sample Collection', 'Report Printing', 'Health Assessment', 'AI Symptom Checker'],
    rating: 4.7,
    testsAvailable: ['Full Body Checkup', 'Thyroid Panel', 'Liver Function'],
    waitTime: '10 mins',
    coordinates: { lat: 12.9784, lng: 77.6408 },
  },
  // Mumbai
  {
    id: 'mum-1',
    name: 'HealthATM - Phoenix Palladium',
    address: 'High Street Phoenix, Lower Parel',
    city: 'mumbai',
    distance: '2.1 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543211',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.6,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '8 mins',
    coordinates: { lat: 18.9947, lng: 72.8258 },
  },
  {
    id: 'mum-2',
    name: 'Thyrocare Health Kiosk',
    address: 'Andheri West Metro Station',
    city: 'mumbai',
    distance: '5.3 km',
    operatingHours: '7 AM - 10 PM',
    phone: '+91-1800-599-9999',
    features: ['Blood Pressure', 'BMI', 'Sample Collection', 'Report Printing'],
    rating: 4.4,
    testsAvailable: ['Thyroid Panel', 'Diabetes Panel', 'Full Body Checkup'],
    waitTime: '5 mins',
    coordinates: { lat: 19.1360, lng: 72.8296 },
  },
  // Delhi
  {
    id: 'del-1',
    name: 'HealthATM - Select Citywalk',
    address: 'Select Citywalk Mall, Saket',
    city: 'delhi',
    distance: '1.8 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543212',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG', 'Cholesterol'],
    rating: 4.7,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '6 mins',
    coordinates: { lat: 28.5289, lng: 77.2180 },
  },
  {
    id: 'del-2',
    name: 'Dr. Lal PathLabs Kiosk - Rajiv Chowk',
    address: 'Rajiv Chowk Metro Station',
    city: 'delhi',
    distance: '4.2 km',
    operatingHours: '6 AM - 11 PM',
    phone: '+91-1800-102-5522',
    features: ['Sample Collection', 'Report Printing', 'Health Assessment'],
    rating: 4.5,
    testsAvailable: ['Full Body Checkup', 'Thyroid Panel', 'Liver Function'],
    waitTime: '12 mins',
    coordinates: { lat: 28.6328, lng: 77.2197 },
  },
  // Chennai
  {
    id: 'chn-1',
    name: 'HealthATM - Express Avenue',
    address: 'Express Avenue Mall, Royapettah',
    city: 'chennai',
    distance: '2.5 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543213',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.4,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '7 mins',
    coordinates: { lat: 13.0605, lng: 80.2605 },
  },
  {
    id: 'chn-2',
    name: 'Vijaya Diagnostic Kiosk',
    address: 'Chennai Central Railway Station',
    city: 'chennai',
    distance: '3.8 km',
    operatingHours: '6 AM - 10 PM',
    features: ['Blood Pressure', 'Temperature', 'Weight', 'Sample Collection'],
    rating: 4.3,
    testsAvailable: ['Basic Vitals', 'Diabetes Panel'],
    waitTime: '5 mins',
    coordinates: { lat: 13.0827, lng: 80.2707 },
  },
  // Hyderabad
  {
    id: 'hyd-1',
    name: 'HealthATM - Inorbit Mall',
    address: 'Inorbit Mall, Hitec City',
    city: 'hyderabad',
    distance: '1.5 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543214',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG', 'Cholesterol'],
    rating: 4.6,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '4 mins',
    coordinates: { lat: 17.4355, lng: 78.3835 },
  },
  {
    id: 'hyd-2',
    name: 'Vijaya Diagnostic Kiosk - Ameerpet',
    address: 'Ameerpet Metro Station',
    city: 'hyderabad',
    distance: '4.0 km',
    operatingHours: '7 AM - 10 PM',
    phone: '+91-040-4567890',
    features: ['Sample Collection', 'Report Printing', 'Blood Pressure', 'BMI'],
    rating: 4.5,
    testsAvailable: ['Full Body Checkup', 'Thyroid Panel', 'Liver Function', 'Kidney Function'],
    waitTime: '8 mins',
    coordinates: { lat: 17.4375, lng: 78.4483 },
  },
  // Pune
  {
    id: 'pun-1',
    name: 'HealthATM - Phoenix Marketcity',
    address: 'Phoenix Marketcity, Viman Nagar',
    city: 'pune',
    distance: '2.0 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543215',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.5,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '6 mins',
    coordinates: { lat: 18.5623, lng: 73.9156 },
  },
  // Kolkata
  {
    id: 'kol-1',
    name: 'HealthATM - South City Mall',
    address: 'South City Mall, Prince Anwar Shah Road',
    city: 'kolkata',
    distance: '1.9 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543216',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.4,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '7 mins',
    coordinates: { lat: 22.5008, lng: 88.3631 },
  },
  // Ahmedabad
  {
    id: 'ahm-1',
    name: 'HealthATM - Ahmedabad One Mall',
    address: 'Ahmedabad One Mall, Vastrapur',
    city: 'ahmedabad',
    distance: '2.3 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543217',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.3,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '5 mins',
    coordinates: { lat: 23.0361, lng: 72.5295 },
  },
  // Jaipur
  {
    id: 'jai-1',
    name: 'HealthATM - World Trade Park',
    address: 'World Trade Park, Malviya Nagar',
    city: 'jaipur',
    distance: '1.7 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543218',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2'],
    rating: 4.2,
    testsAvailable: ['Basic Health Check', 'Diabetes Panel'],
    waitTime: '4 mins',
    coordinates: { lat: 26.8528, lng: 75.8031 },
  },
  // Gurgaon
  {
    id: 'gur-1',
    name: 'HealthATM - Ambience Mall',
    address: 'Ambience Mall, DLF Phase 3',
    city: 'gurgaon',
    distance: '1.4 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543219',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG', 'Cholesterol'],
    rating: 4.6,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '5 mins',
    coordinates: { lat: 28.5043, lng: 77.0964 },
  },
  // Noida
  {
    id: 'noi-1',
    name: 'HealthATM - DLF Mall of India',
    address: 'DLF Mall of India, Sector 18',
    city: 'noida',
    distance: '1.6 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543220',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.5,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '6 mins',
    coordinates: { lat: 28.5672, lng: 77.3266 },
  },
];

// Get user's city from cookie
const getUserCity = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'aihealz-geo') {
      const parts = value.split(':');
      return parts[1] || null;
    }
  }
  return null;
};

const getKiosksForCity = (citySlug: string | null): AIKiosk[] => {
  if (!citySlug) return [];
  const normalized = normalizeCity(citySlug);
  const canonicalCity = CITY_ALIASES[normalized] || normalized;
  return ALL_KIOSKS.filter(k => k.city === canonicalCity);
};

const formatCityName = (city: string): string => {
  return city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ');
};

export default function AIKioskFinder() {
  const [_location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kiosks, setKiosks] = useState<AIKiosk[]>([]);
  const [selectedKiosk, setSelectedKiosk] = useState<AIKiosk | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const cityFromCookie = getUserCity();
    if (cityFromCookie) {
      setDetectedCity(cityFromCookie);
    }
  }, []);

  const getLocation = () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const cityFromCookie = getUserCity();
    if (cityFromCookie) {
      setDetectedCity(cityFromCookie);
      const cityKiosks = getKiosksForCity(cityFromCookie);
      if (cityKiosks.length > 0) {
        setKiosks(cityKiosks);
        setIsLoading(false);
        return;
      }
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      setKiosks([]);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        const cityKiosks = getKiosksForCity(cityFromCookie);
        setKiosks(cityKiosks);
        setIsLoading(false);
      },
      () => {
        const cityKiosks = getKiosksForCity(cityFromCookie);
        if (cityKiosks.length === 0 && !cityFromCookie) {
          setError('Unable to detect your location. Please select your city from location settings.');
        }
        setKiosks(cityKiosks);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openDirections = (kiosk: AIKiosk) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${kiosk.coordinates.lat},${kiosk.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="card" style={{ padding: 28 }}>
      {/* Header */}
      <div className="row ai-center gap-3" style={{ marginBottom: 24 }}>
        <span className="spec-icon" aria-hidden="true">AI</span>
        <div className="col" style={{ minWidth: 0 }}>
          <span className="kicker">
            <span className="dot" />
            Diagnostic kiosks
          </span>
          <h2
            className="display"
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              margin: '4px 0 0',
            }}
          >
            AI Health Kiosks Near You
          </h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '4px 0 0' }}>
            Self-service diagnostic kiosks for quick health checks.
          </p>
        </div>
      </div>

      {/* Location strip */}
      {detectedCity && !hasSearched && (
        <div
          className="card-flat row between ai-center"
          style={{ padding: '10px 14px', marginBottom: 16 }}
        >
          <div className="row ai-center gap-2" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
            <MapPin size={14} style={{ color: 'var(--cobalt)' }} />
            <span>
              Your location:{' '}
              <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>
                {formatCityName(detectedCity)}
              </strong>
            </span>
          </div>
          <a
            href="/settings"
            className="row ai-center gap-1 mono"
            style={{
              fontSize: 11,
              color: 'var(--cobalt)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            <Settings size={12} />
            Change
          </a>
        </div>
      )}

      {/* Find button */}
      {!hasSearched && !isLoading && (
        <button
          onClick={getLocation}
          className="btn btn-cobalt btn-lg"
          style={{ width: '100%' }}
        >
          <MapPin size={18} />
          Find Kiosks {detectedCity ? `in ${formatCityName(detectedCity)}` : 'Near Me'}
        </button>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          className="row ai-center center gap-3"
          style={{ padding: '32px 0', color: 'var(--ink-3)' }}
        >
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 14 }}>Finding nearby health kiosks…</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="row ai-center gap-3"
          style={{
            padding: 14,
            background: 'var(--orange-50)',
            border: '1px solid rgba(255, 90, 46, .28)',
            borderRadius: 'var(--r-2)',
            color: 'var(--orange-2)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Kiosk List */}
      {hasSearched && kiosks.length > 0 && (
        <div className="col gap-4" style={{ marginTop: 16 }}>
          <div className="row between ai-center" style={{ flexWrap: 'wrap', gap: 8 }}>
            <h3
              className="display"
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--ink)',
                margin: 0,
                letterSpacing: '-0.015em',
              }}
            >
              {kiosks.length} kiosk{kiosks.length > 1 ? 's' : ''} found
              {detectedCity && (
                <span
                  className="mono"
                  style={{
                    color: 'var(--ink-4)',
                    fontWeight: 500,
                    fontSize: 12,
                    marginLeft: 8,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  · {formatCityName(detectedCity)}
                </span>
              )}
            </h3>
            <button
              onClick={() => { setHasSearched(false); setKiosks([]); }}
              className="btn btn-ghost btn-sm row ai-center gap-1"
            >
              <Navigation size={12} />
              Search again
            </button>
          </div>

          <div className="col gap-3">
            {kiosks.map((kiosk) => {
              const isSelected = selectedKiosk?.id === kiosk.id;
              return (
                <div
                  key={kiosk.id}
                  className="card-flat"
                  style={{
                    padding: 18,
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--cobalt)' : 'var(--rule)',
                    background: isSelected ? 'var(--paper-2)' : 'var(--paper)',
                    transition: 'border-color var(--transition-fast), background var(--transition-fast)',
                  }}
                  onClick={() => setSelectedKiosk(kiosk)}
                >
                  <div className="row between ai-start gap-3">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row ai-center gap-2" style={{ marginBottom: 6, flexWrap: 'wrap' }}>
                        <h4
                          className="display"
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--ink)',
                            margin: 0,
                            letterSpacing: '-0.015em',
                          }}
                        >
                          {kiosk.name}
                        </h4>
                        {kiosk.rating && (
                          <span
                            className="pill pill-lemon"
                            style={{ fontSize: 10 }}
                          >
                            ★ {kiosk.rating}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 10px' }}>
                        {kiosk.address}
                      </p>

                      <div className="row gap-3 mono" style={{ flexWrap: 'wrap', fontSize: 11 }}>
                        <span
                          className="row ai-center gap-1"
                          style={{
                            color: 'var(--cobalt)',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <MapPin size={11} />
                          {kiosk.distance}
                        </span>
                        <span
                          className="row ai-center gap-1"
                          style={{
                            color: 'var(--ink-3)',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <Clock size={11} />
                          {kiosk.operatingHours}
                        </span>
                        {kiosk.waitTime && (
                          <span className="pill pill-mint" style={{ fontSize: 10 }}>
                            Wait: {kiosk.waitTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(kiosk);
                      }}
                      aria-label="Get directions"
                      className="row ai-center center"
                      style={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--r-2)',
                        background: 'var(--cobalt-50)',
                        color: 'var(--cobalt)',
                        border: '1px solid rgba(28, 91, 255, .22)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--cobalt)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--cobalt-50)';
                        e.currentTarget.style.color = 'var(--cobalt)';
                      }}
                    >
                      <Navigation size={18} />
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div
                      className="hairline-t"
                      style={{ marginTop: 14, paddingTop: 14 }}
                    >
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: 16,
                        }}
                      >
                        <div>
                          <p
                            className="mono"
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: 'var(--ink-4)',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              margin: '0 0 8px',
                            }}
                          >
                            Available features
                          </p>
                          <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                            {kiosk.features.map((feature) => (
                              <span key={feature} className="pill" style={{ textTransform: 'none' }}>
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p
                            className="mono"
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: 'var(--ink-4)',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              margin: '0 0 8px',
                            }}
                          >
                            Tests available
                          </p>
                          <div className="row gap-1" style={{ flexWrap: 'wrap' }}>
                            {kiosk.testsAvailable.map((test) => (
                              <span key={test} className="pill pill-mint" style={{ textTransform: 'none' }}>
                                {test}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="row gap-2" style={{ marginTop: 14, flexWrap: 'wrap' }}>
                        {kiosk.phone && (
                          <a
                            href={`tel:${kiosk.phone}`}
                            className="btn btn-paper btn-sm row ai-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={13} />
                            Call
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDirections(kiosk);
                          }}
                          className="btn btn-cobalt btn-sm row ai-center gap-2"
                        >
                          <ExternalLink size={13} />
                          Get directions
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No kiosks state */}
      {hasSearched && !isLoading && kiosks.length === 0 && (
        <div className="card-flat col ai-center gap-3" style={{ padding: 32, textAlign: 'center', marginTop: 16 }}>
          <span className="spec-icon" aria-hidden="true">!</span>
          <h3
            className="display"
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            No AI kiosks {detectedCity ? `in ${formatCityName(detectedCity)}` : 'found'}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: 'var(--ink-3)',
              maxWidth: 420,
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {detectedCity
              ? `We're expanding our AI Health Kiosk network to ${formatCityName(detectedCity)} soon. Check back later or explore traditional diagnostic labs.`
              : 'We couldn\'t detect your location. Please enable location services or select your city.'}
          </p>
          <div className="row gap-2" style={{ marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/diagnostic-labs" className="btn btn-cobalt btn-sm">
              Find diagnostic labs
            </a>
            <button
              onClick={() => { setHasSearched(false); setKiosks([]); }}
              className="btn btn-paper btn-sm"
            >
              Search again
            </button>
          </div>
        </div>
      )}

      {/* Info section */}
      <div
        className="card-quiet"
        style={{ padding: 18, marginTop: 24 }}
      >
        <h4
          className="display"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 6px',
            letterSpacing: '-0.01em',
          }}
        >
          What are AI Health Kiosks?
        </h4>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>
          AI-powered self-service health kiosks let you perform basic screenings without
          visiting a clinic — instant readings for blood pressure, BMI, glucose levels, and
          more. Some also offer AI symptom assessment and test booking.
        </p>
      </div>
    </div>
  );
}
