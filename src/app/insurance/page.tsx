import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateFAQSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Health Insurance Providers - Compare Plans & TPAs | AIHealz',
  description: 'Compare health insurance providers, plans, TPAs, and claim settlement ratios. Find the best insurance for your needs with cashless hospital networks.',
  keywords: 'health insurance, insurance providers, TPA, claim settlement, cashless hospitals, medical insurance',
  alternates: { canonical: '/insurance' },
  openGraph: {
    type: 'website',
    siteName: 'aihealz',
    title: 'Compare Health Insurance Plans | AIHealz',
    description: 'Compare insurance providers by claim settlement ratio, network hospitals, and plan options.',
    url: 'https://aihealz.com/insurance',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Health Insurance Plans | AIHealz',
    description: 'Compare insurance providers by claim settlement ratio, network hospitals, and plan options.',
  },
};

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  private: 'Private Insurer',
  public: 'Public Sector',
  government: 'Government Scheme',
  cooperative: 'Cooperative',
};

const PLAN_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  family_floater: 'Family Floater',
  senior_citizen: 'Senior Citizen',
  group: 'Group/Corporate',
  critical_illness: 'Critical Illness',
  top_up: 'Top-Up',
  super_top_up: 'Super Top-Up',
  personal_accident: 'Personal Accident',
};

async function getGeoFromCookie() {
  const cookieStore = await cookies();
  const geoCookie = cookieStore.get('aihealz-geo')?.value;
  if (!geoCookie) return null;

  const parts = geoCookie.split(':');
  return {
    countrySlug: parts[0] || null,
    citySlug: parts[1] || null,
  };
}

export default async function InsurancePage() {
  const geo = await getGeoFromCookie();

  const [insurers, tpas, stats] = await Promise.all([
    prisma.insuranceProvider.findMany({
      where: { isActive: true },
      include: {
        plans: {
          where: { isActive: true },
          take: 3,
          select: { name: true, planType: true, sumInsuredMin: true, sumInsuredMax: true, premiumStartsAt: true },
        },
        _count: {
          select: { plans: true, hospitalTies: true, claims: true },
        },
      },
      orderBy: [
        { claimSettlementRatio: 'desc' },
      ],
    }),
    prisma.tpa.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { insuranceLinks: true, hospitalLinks: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.insuranceProvider.aggregate({
      _count: true,
      _avg: { claimSettlementRatio: true },
      where: { isActive: true },
    }),
  ]);

  const formatRatio = (ratio: number | null) => {
    if (!ratio) return '-';
    return `${Number(ratio).toFixed(1)}%`;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(0)} L`;
    return `${amount.toLocaleString('en-IN')}`;
  };

  // Generate structured data
  const insuranceFaqs = [
    { question: 'What is Claim Settlement Ratio (CSR)?', answer: 'CSR indicates the percentage of claims an insurer pays out of total claims received. A higher CSR (above 95%) indicates reliable claim processing and is a key factor in choosing insurance.' },
    { question: 'What is a TPA in health insurance?', answer: 'A Third Party Administrator (TPA) is an organization that processes insurance claims on behalf of insurance companies. They handle cashless hospitalization approvals and claim settlements.' },
    { question: 'What are cashless hospitals?', answer: 'Cashless hospitals are part of an insurer\'s network where you can get treatment without paying upfront. The insurer directly settles the bill with the hospital.' },
    { question: 'How do I compare insurance plans?', answer: 'Compare plans by premium, sum insured, claim settlement ratio, network hospitals, waiting periods, co-pay requirements, and specific coverage inclusions/exclusions.' },
  ];

  const structuredData = [
    generateWebPageSchema(
      'Health Insurance Providers - Compare Plans & TPAs',
      'Compare health insurance providers, plans, TPAs, and claim settlement ratios. Find the best insurance with cashless hospital networks.',
      'https://aihealz.com/insurance'
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Insurance', url: '/insurance' },
    ]),
    generateItemListSchema(
      'Health Insurance Providers',
      'Compare insurance providers by claim settlement ratio and plans',
      insurers.slice(0, 10).map((ins, i) => ({
        name: ins.name,
        url: `/insurance/${ins.slug}`,
        position: i + 1,
      }))
    ),
    generateFAQSchema(insuranceFaqs),
  ];

  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8 mt-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">Insurance</span>
        </nav>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/30 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span></span>
            Health Insurance & TPAs
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Health Insurance</span> Plans
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
            Compare {stats._count}+ insurance providers by claim settlement ratio, network hospitals,
            and plan options. Find the right coverage for you and your family.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-slate-900/50 border border-white/5 rounded-xl px-5 py-3 backdrop-blur-md">
              <span className="text-2xl font-bold text-white">{stats._count}</span>
              <span className="ml-2 text-slate-500 text-sm">Insurers</span>
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-xl px-5 py-3 backdrop-blur-md">
              <span className="text-2xl font-bold text-white">{tpas.length}</span>
              <span className="ml-2 text-slate-500 text-sm">TPAs</span>
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-xl px-5 py-3 backdrop-blur-md">
              <span className="text-2xl font-bold text-white">{formatRatio(stats._avg.claimSettlementRatio as number | null)}</span>
              <span className="ml-2 text-slate-500 text-sm">Avg CSR</span>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Browse by Type</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/insurance"
              className="px-4 py-2 rounded-full bg-teal-500/20 text-teal-400 text-sm font-medium hover:bg-teal-500/30 transition-colors border border-teal-500/30"
            >
              All Providers
            </Link>
            {Object.entries(PROVIDER_TYPE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/insurance?type=${key}`}
                className="px-4 py-2 rounded-full bg-slate-900/50 text-slate-400 text-sm font-medium hover:text-white hover:bg-slate-800 transition-colors border border-white/5"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Insurance Providers Grid */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Insurance Providers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insurers.map((insurer) => (
              <Link
                key={insurer.id}
                href={`/insurance/${insurer.slug}`}
                className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-teal-500/40 hover:bg-slate-900/60 transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {insurer.logo ? (
                      <img
                        src={insurer.logo}
                        alt={insurer.name}
                        className="w-16 h-16 object-contain rounded-lg bg-white/5 p-2 border border-white/5"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center border border-teal-500/20">
                        <span className="text-2xl font-bold text-teal-400">{insurer.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors truncate">
                          {insurer.name}
                        </h3>
                        {Number(insurer.claimSettlementRatio) >= 95 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-xs font-semibold flex-shrink-0 border border-amber-500/30">
                            Top Rated
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {PROVIDER_TYPE_LABELS[insurer.providerType] || insurer.providerType}
                      </p>
                    </div>
                  </div>

                  {/* CSR Badge */}
                  {insurer.claimSettlementRatio && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-slate-900">{Number(insurer.claimSettlementRatio).toFixed(0)}%</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">Claim Settlement Ratio</p>
                        <p className="text-xs text-emerald-500/80">
                          {Number(insurer.claimSettlementRatio) >= 95 ? 'Excellent' :
                           Number(insurer.claimSettlementRatio) >= 90 ? 'Very Good' :
                           Number(insurer.claimSettlementRatio) >= 80 ? 'Good' : 'Average'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-lg font-bold text-white">{insurer._count.plans}</p>
                      <p className="text-xs text-slate-500">Plans</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-lg font-bold text-white">{insurer._count.hospitalTies}</p>
                      <p className="text-xs text-slate-500">Hospitals</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-lg font-bold text-white">{insurer._count.claims || 0}</p>
                      <p className="text-xs text-slate-500">Claims</p>
                    </div>
                  </div>

                  {/* Sample Plans */}
                  {insurer.plans.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Popular Plans</p>
                      {insurer.plans.map((plan, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300 truncate">{plan.name}</span>
                          {plan.premiumStartsAt && (
                            <span className="text-teal-400 font-medium flex-shrink-0">
                              from {formatCurrency(Number(plan.premiumStartsAt))}/yr
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TPAs Section */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Third Party Administrators (TPAs)</h2>
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/5">
              <p className="text-sm text-slate-400">
                TPAs handle claim processing and cashless hospitalization on behalf of insurance companies.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 text-xs text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left font-semibold">TPA Name</th>
                    <th scope="col" className="px-6 py-3 text-center font-semibold">Insurance Partners</th>
                    <th scope="col" className="px-6 py-3 text-center font-semibold">Network Hospitals</th>
                    <th scope="col" className="px-6 py-3 text-left font-semibold">Contact</th>
                    <th scope="col" className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tpas.map((tpa) => (
                    <tr key={tpa.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {tpa.logo ? (
                            <Image
                              src={tpa.logo}
                              alt={tpa.name}
                              width={40}
                              height={40}
                              unoptimized
                              className="w-10 h-10 rounded object-contain bg-white/5 border border-white/5"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                              <span className="font-bold text-purple-400">{tpa.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{tpa.name}</p>
                            {tpa.licenseNumber && (
                              <p className="text-xs text-slate-500">License: {tpa.licenseNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-teal-400">{tpa._count.insuranceLinks}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-cyan-400">{tpa._count.hospitalLinks}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {tpa.customerCarePhone && (
                            <p className="text-slate-300">{tpa.customerCarePhone}</p>
                          )}
                          {tpa.email && (
                            <p className="text-slate-500 text-xs">{tpa.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/insurance/tpa/${tpa.slug}`}
                          className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Plan Types Info */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Types of Health Insurance Plans</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(PLAN_TYPE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/insurance/plans?type=${key}`}
                className="p-5 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 hover:border-teal-500/40 hover:bg-slate-900/60 transition-all group"
              >
                <h3 className="font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">{label}</h3>
                <p className="text-sm text-slate-400">
                  {key === 'individual' && 'Coverage for a single person'}
                  {key === 'family_floater' && 'Single sum insured for entire family'}
                  {key === 'senior_citizen' && 'Specialized plans for 60+ age group'}
                  {key === 'group' && 'Corporate and group coverage'}
                  {key === 'critical_illness' && 'Lump sum on diagnosis of listed illnesses'}
                  {key === 'top_up' && 'Extra coverage above base policy'}
                  {key === 'super_top_up' && 'Aggregate deductible based coverage'}
                  {key === 'personal_accident' && 'Coverage for accidental injuries'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
