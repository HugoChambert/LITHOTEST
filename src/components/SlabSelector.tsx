import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { slabInventory } from '../data/slabInventory';
import { Slab } from '../types';

export function SlabSelector() {
  const { selectedSlab, setSelectedSlab } = useAppStore();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSlabs = useMemo(() => {
    return slabInventory.filter((slab) => {
      const matchesFilter = filter === 'all' || slab.color === filter || slab.type === filter;
      const matchesSearch = slab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            slab.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const colors = useMemo(() => {
    const uniqueColors = new Set(slabInventory.map(s => s.color).filter(Boolean));
    return Array.from(uniqueColors) as string[];
  }, []);

  const types = useMemo(() => {
    const uniqueTypes = new Set(slabInventory.map(s => s.type).filter(Boolean));
    return Array.from(uniqueTypes) as string[];
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Slab Inventory</h2>
        <input
          type="text"
          placeholder="Search slabs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.filters}>
        <button
          className={`btn btn-secondary ${filter === 'all' ? 'active' : ''}`}
          style={filter === 'all' ? styles.activeFilter : {}}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {colors.map((color) => (
          <button
            key={color}
            className={`btn btn-secondary ${filter === color ? 'active' : ''}`}
            style={filter === color ? styles.activeFilter : {}}
            onClick={() => setFilter(color)}
          >
            {color}
          </button>
        ))}
        {types.map((type) => (
          <button
            key={type}
            className={`btn btn-secondary ${filter === type ? 'active' : ''}`}
            style={filter === type ? styles.activeFilter : {}}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div style={styles.slabGrid}>
        {filteredSlabs.map((slab) => (
          <SlabCard
            key={slab.sku}
            slab={slab}
            isSelected={selectedSlab?.sku === slab.sku}
            onClick={() => setSelectedSlab(slab)}
          />
        ))}
      </div>
    </div>
  );
}

interface SlabCardProps {
  slab: Slab;
  isSelected: boolean;
  onClick: () => void;
}

function SlabCard({ slab, isSelected, onClick }: SlabCardProps) {
  return (
    <div
      style={{
        ...styles.slabCard,
        ...(isSelected ? styles.slabCardSelected : {})
      }}
      onClick={onClick}
    >
      <div style={styles.slabImageContainer}>
        <img
          src={slab.image}
          alt={slab.name}
          style={styles.slabImage}
          loading="lazy"
        />
      </div>
      <div style={styles.slabInfo}>
        <h3 style={styles.slabName}>{slab.name}</h3>
        <p style={styles.slabDetails}>{slab.finish} • {slab.quarry}</p>
        <p style={styles.slabSku}>{slab.sku}</p>
      </div>
      {isSelected && (
        <div style={styles.selectedBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-md)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-sm)'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  searchInput: {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    background: 'var(--primary)',
    border: '1px solid var(--border)',
    borderRadius: '0.375rem',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none'
  },
  filters: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    flexWrap: 'wrap' as const
  },
  activeFilter: {
    background: 'var(--accent)',
    color: 'var(--primary)',
    borderColor: 'var(--accent)'
  },
  slabGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
    overflowY: 'auto' as const,
    padding: '2px'
  },
  slabCard: {
    background: 'var(--secondary)',
    border: '2px solid var(--border)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const
  },
  slabCardSelected: {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 0 2px var(--accent)'
  },
  slabImageContainer: {
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
    background: 'var(--primary)'
  },
  slabImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  slabInfo: {
    padding: 'var(--spacing-sm)'
  },
  slabName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: 'var(--spacing-xs)',
    color: 'var(--text-primary)'
  },
  slabDetails: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginBottom: 'var(--spacing-xs)'
  },
  slabSku: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontFamily: 'monospace'
  },
  selectedBadge: {
    position: 'absolute' as const,
    top: 'var(--spacing-sm)',
    right: 'var(--spacing-sm)',
    background: 'var(--accent)',
    color: 'var(--primary)',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
