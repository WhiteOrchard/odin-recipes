import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';
import { clsx } from 'clsx';
import type { Property } from '../types';
import { formatCurrency } from '../data/mockData';

const statusColors: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  occupied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  listed: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
};

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-mansion-800"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span
          className={clsx(
            'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
            statusColors[property.status]
          )}
        >
          {property.status}
        </span>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
          <Star size={14} className="fill-gold-400 text-gold-400" />
          <span className="text-sm font-medium">{property.rating}</span>
        </div>
        <p className="absolute bottom-3 right-3 font-serif text-lg font-bold text-white">
          {formatCurrency(property.price)}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">
          {property.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
          <MapPin size={14} />
          <span>{property.city}, {property.country}</span>
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <Bed size={14} className="text-slate-400" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={14} className="text-slate-400" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize size={14} className="text-slate-400" />
            <span>{property.sqft.toLocaleString()} ft²</span>
          </div>
        </div>

        <div className="mt-3 text-sm">
          <span className="text-slate-400 dark:text-slate-500">Rent: </span>
          <span className="font-semibold text-gold-600 dark:text-gold-400">
            {formatCurrency(property.monthlyRent)}/mo
          </span>
        </div>
      </div>
    </Link>
  );
}
