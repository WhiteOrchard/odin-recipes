import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Bed, Bath, Maximize, Calendar, Star,
  Home, Shield, Wifi, Car, Wine, Waves, TreePine, Crown,
} from 'lucide-react';
import { properties, tenants, formatFullCurrency, formatCurrency } from '../data/mockData';
import { clsx } from 'clsx';
import { useState } from 'react';

const amenityIcons: Record<string, typeof Home> = {
  'Private Pool': Waves, 'Infinity Pool': Waves, 'Indoor Pool': Waves,
  'Wine Cellar': Wine, 'Wine Cave': Wine, 'Wine Room': Wine, 'Wine Storage': Wine,
  'Smart Home': Wifi, 'Security Suite': Shield, 'Underground Parking': Car,
  'Climate-Controlled Garage': Car, 'Heated Driveway': Car,
  'Garden': TreePine, 'Mediterranean Garden': TreePine, 'Formal Gardens': TreePine,
  'Meditation Garden': TreePine, 'Sculpture Garden': TreePine, 'Hedge Maze': TreePine,
  'Helipad Access': Crown, 'Helipad': Crown, 'Concierge': Crown,
};

const statusColors: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  occupied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  listed: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const property = properties.find(p => p.id === id);
  const tenant = property?.tenantId ? tenants.find(t => t.id === property.tenantId) : null;
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'financials'>('overview');

  if (!property) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-400">Property not found</p>
      </div>
    );
  }

  const tabs = ['overview', 'amenities', 'financials'] as const;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/properties"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Properties
      </Link>

      {/* Hero section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="relative h-80 overflow-hidden rounded-xl lg:h-96">
          <img src={property.images[0]} alt={property.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className={clsx('absolute left-4 top-4 rounded-full px-3 py-1 text-sm font-semibold capitalize', statusColors[property.status])}>
            {property.status}
          </span>
        </div>
        {property.images[1] && (
          <div className="relative h-80 overflow-hidden rounded-xl lg:h-96">
            <img src={property.images[1]} alt={property.name} className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {/* Property header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">{property.name}</h1>
            <div className="flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 dark:bg-gold-900/30">
              <Star size={14} className="fill-gold-400 text-gold-400" />
              <span className="text-sm font-semibold text-gold-700 dark:text-gold-400">{property.rating}</span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <MapPin size={16} />
            <span>{property.address}, {property.city}, {property.country}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl font-bold text-slate-900 dark:text-white">{formatFullCurrency(property.price)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rent: <span className="font-semibold text-gold-600 dark:text-gold-400">{formatCurrency(property.monthlyRent)}/mo</span>
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Bed, label: 'Bedrooms', value: property.bedrooms },
          { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
          { icon: Maximize, label: 'Square Feet', value: property.sqft.toLocaleString() },
          { icon: Calendar, label: 'Year Built', value: property.yearBuilt },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
            <s.icon size={20} className="text-gold-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'border-b-2 pb-3 text-sm font-medium capitalize transition-colors',
                activeTab === tab
                  ? 'border-gold-500 text-gold-700 dark:text-gold-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-mansion-800">
              <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Description</h2>
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{property.description}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-mansion-800">
              <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Property Type</h2>
              <p className="mt-2 inline-block rounded-full bg-mansion-100 px-3 py-1 text-sm font-medium capitalize text-mansion-700 dark:bg-mansion-700 dark:text-mansion-200">
                {property.type}
              </p>
            </div>
          </div>
          {/* Tenant card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-mansion-800">
            <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Current Tenant</h2>
            {tenant ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 font-semibold text-white">
                    {tenant.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{tenant.firstName} {tenant.lastName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{tenant.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Lease Period</span>
                    <span className="text-slate-900 dark:text-white">{tenant.leaseStart} to {tenant.leaseEnd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Monthly Rent</span>
                    <span className="font-medium text-gold-600 dark:text-gold-400">{formatFullCurrency(tenant.monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium capitalize text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      {tenant.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">No tenant currently assigned</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'amenities' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {property.amenities.map(amenity => {
            const Icon = amenityIcons[amenity] || Home;
            return (
              <div key={amenity} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-mansion-800">
                <div className="rounded-lg bg-gold-50 p-2 text-gold-600 dark:bg-gold-900/30 dark:text-gold-400">
                  <Icon size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{amenity}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-mansion-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Property Value</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatFullCurrency(property.price)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-mansion-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Revenue</p>
            <p className="mt-1 text-2xl font-bold text-gold-600 dark:text-gold-400">{formatFullCurrency(property.monthlyRent)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-mansion-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Annual Yield</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {((property.monthlyRent * 12 / property.price) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
