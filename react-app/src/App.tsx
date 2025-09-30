import { useMemo, useState } from 'react';
import { accessRequests as seedRequests, locations, products, savedSearches } from './data';
import type { AccessRequest, AvailabilityDetail, Location, LocationAvailabilityStatus, Product } from './types';

type AvailabilityFilter = 'all' | LocationAvailabilityStatus;

const locationLookup = new Map(locations.filter((loc) => loc.id !== 'all').map((loc) => [loc.id, loc]));

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2
  });
}

function statusPillClass(status: AccessRequest['status']) {
  if (status === 'Completed') return 'status-pill completed';
  if (status === 'Escalated') return 'status-pill escalated';
  return 'status-pill open';
}

const availabilityOrder: LocationAvailabilityStatus[] = ['available', 'pending', 'unavailable'];

const availabilityLabels: Record<LocationAvailabilityStatus, string> = {
  available: 'Available',
  pending: 'Pending',
  unavailable: 'Not Available'
};

const availabilityClass: Record<LocationAvailabilityStatus, string> = {
  available: 'availability-badge badge-available',
  pending: 'availability-badge badge-pending',
  unavailable: 'availability-badge badge-unavailable'
};

const availabilityDotClass: Record<LocationAvailabilityStatus, string> = {
  available: 'location-status available',
  pending: 'location-status pending',
  unavailable: 'location-status unavailable'
};

const defaultBulkSelection = { productIds: [] as string[], targetLocationIds: [] as string[] };

function availabilitySummary(product: Product) {
  const summary = { available: 0, pending: 0, unavailable: 0 } as Record<LocationAvailabilityStatus, number>;
  for (const detail of product.availability) {
    summary[detail.status] += 1;
  }
  return summary;
}

function activeLocations(selected: string[]): string[] {
  if (selected.length === 0 || selected.includes('all')) {
    return Array.from(locationLookup.keys());
  }
  return selected;
}

function matchesAvailabilityFilter(
  product: Product,
  selectedLocations: string[],
  availabilityFilter: AvailabilityFilter
) {
  if (availabilityFilter === 'all') return true;
  const targets = activeLocations(selectedLocations);
  return product.availability.some((detail) => targets.includes(detail.locationId) && detail.status === availabilityFilter);
}

function matchesLocationScope(product: Product, selectedLocations: string[]) {
  if (selectedLocations.length === 0 || selectedLocations.includes('all')) return true;
  return product.availability.some((detail) => selectedLocations.includes(detail.locationId));
}

function matchesSearchTerm(product: Product, searchTerm: string) {
  if (!searchTerm) return true;
  const term = searchTerm.toLowerCase();
  return (
    product.name.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term) ||
    product.tags.some((tag) => tag.toLowerCase().includes(term))
  );
}

function getLocation(detail: AvailabilityDetail): Location | undefined {
  return locationLookup.get(detail.locationId);
}

export default function App() {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['all']);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id ?? null);
  const [requests, setRequests] = useState<AccessRequest[]>(seedRequests);
  const [bulkSelection, setBulkSelection] = useState(defaultBulkSelection);
  const [showIntro, setShowIntro] = useState(true);
  const [modalContext, setModalContext] = useState<{ product: Product; locationId: string } | null>(null);
  const [justification, setJustification] = useState('');

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => matchesSearchTerm(product, searchTerm))
      .filter((product) => matchesLocationScope(product, selectedLocations))
      .filter((product) => matchesAvailabilityFilter(product, selectedLocations, availabilityFilter));
  }, [availabilityFilter, searchTerm, selectedLocations]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return filteredProducts[0] ?? null;
    return products.find((product) => product.id === selectedProductId) ?? filteredProducts[0] ?? null;
  }, [filteredProducts, selectedProductId]);

  const selectedAvailabilitySummary = selectedProduct ? availabilitySummary(selectedProduct) : null;

  const discoveryRate = filteredProducts.length / products.length;
  const unavailableCount = filteredProducts.filter((product) =>
    product.availability.some((detail) => detail.status === 'unavailable')
  ).length;

  const uniqueRequestsOpen = requests.filter((req) => req.status !== 'Completed').length;

  const bulkReady = bulkSelection.productIds.length > 0 && bulkSelection.targetLocationIds.length > 0;

  const resultsForSummary = filteredProducts.length;

  const savedSelectionActive = useMemo(() => {
    return savedSearches.filter((saved) => {
      const sameTerm = saved.searchTerm === searchTerm;
      const sameAvailability = saved.availability === availabilityFilter;
      const sameLocations = saved.locations.every((loc) => selectedLocations.includes(loc));
      return sameTerm && sameAvailability && sameLocations;
    });
  }, [availabilityFilter, searchTerm, selectedLocations]);

  const handleLocationToggle = (id: string) => {
    if (id === 'all') {
      setSelectedLocations(['all']);
      return;
    }
    setSelectedLocations((prev) => {
      const withoutAll = prev.filter((value) => value !== 'all');
      if (withoutAll.includes(id)) {
        const next = withoutAll.filter((value) => value !== id);
        return next.length ? next : ['all'];
      }
      return [...withoutAll, id];
    });
  };

  const handleSavedSearch = (savedId: string) => {
    const saved = savedSearches.find((entry) => entry.id === savedId);
    if (!saved) return;
    setSearchTerm(saved.searchTerm);
    setAvailabilityFilter(saved.availability as AvailabilityFilter);
    setSelectedLocations(saved.locations.length ? saved.locations : ['all']);
  };

  const handleBulkSelect = (productId: string) => {
    setBulkSelection((prev) => {
      const exists = prev.productIds.includes(productId);
      const productIds = exists
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId];
      return { ...prev, productIds };
    });
  };

  const handleBulkLocationSelect = (locationId: string) => {
    setBulkSelection((prev) => {
      const exists = prev.targetLocationIds.includes(locationId);
      const targetLocationIds = exists
        ? prev.targetLocationIds.filter((id) => id !== locationId)
        : [...prev.targetLocationIds, locationId];
      return { ...prev, targetLocationIds };
    });
  };

  const handleBulkRequest = () => {
    if (!bulkReady) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    const newRequests: AccessRequest[] = [];

    for (const productId of bulkSelection.productIds) {
      const product = products.find((item) => item.id === productId);
      if (!product) continue;
      for (const locationId of bulkSelection.targetLocationIds) {
        const location = locationLookup.get(locationId);
        if (!location) continue;
        newRequests.push({
          id: `req-${Math.floor(Math.random() * 9000 + 1000)}`,
          productId,
          productName: product.name,
          locationId,
          locationName: location.name,
          status: 'Open',
          submittedOn: timestamp,
          expectedResolution: timestamp,
          owner: 'Auto Assignment'
        });
      }
    }

    setRequests((prev) => [...newRequests, ...prev]);
    setBulkSelection(defaultBulkSelection);
  };

  const handleRequestAccess = (product: Product, locationId: string) => {
    setJustification('');
    setModalContext({ product, locationId });
  };

  const submitRequest = () => {
    if (!modalContext) return;
    const location = locationLookup.get(modalContext.locationId);
    if (!location) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    setRequests((prev) => [
      {
        id: `req-${Math.floor(Math.random() * 9000 + 1000)}`,
        productId: modalContext.product.id,
        productName: modalContext.product.name,
        locationId: modalContext.locationId,
        locationName: location.name,
        status: 'Open',
        submittedOn: timestamp,
        expectedResolution: timestamp,
        owner: 'Sales Automation Bot'
      },
      ...prev
    ]);
    setModalContext(null);
    setJustification('');
  };

  const productResults = filteredProducts.map((product) => {
    const summary = availabilitySummary(product);
    const selected = product.id === selectedProduct?.id;
    const selectedLocationsActive = activeLocations(selectedLocations);
    const availableInSelected = product.availability.filter(
      (detail) => selectedLocationsActive.includes(detail.locationId) && detail.status === 'available'
    ).length;

    return (
      <article
        key={product.id}
        className={selected ? 'product-card active' : 'product-card'}
        onClick={() => setSelectedProductId(product.id)}
      >
        <div>
          <header>
            <h3>{product.name}</h3>
            <p>{product.category}</p>
          </header>
          <p>{product.description}</p>
          <div className="tag-group">
            {product.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Available in {availableInSelected} of {selectedLocationsActive.length} selected locations
          </div>
        </div>
        <div className="availability-badges">
          {availabilityOrder.map((status) => (
            <span key={status} className={availabilityClass[status]}>
              {availabilityLabels[status]} · {summary[status]}
            </span>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
            <input
              type="checkbox"
              checked={bulkSelection.productIds.includes(product.id)}
              onChange={() => handleBulkSelect(product.id)}
            />
            Bulk
          </label>
        </div>
      </article>
    );
  });

  return (
    <div className="app-shell">
      {showIntro && (
        <div className="intro-overlay" role="dialog" aria-modal="true">
          <div className="intro-card">
            <h2>Welcome to Multi-Location Catalog Visibility</h2>
            <p>
              Discover products, compare availability, and launch access requests across every business location from a single
              interface.
            </p>
            <div className="intro-highlights">
              <span>🔍 Search across all catalogs simultaneously</span>
              <span>🚚 Initiate access requests for new ship-to locations</span>
              <span>⚙️ Automate cross-location reorder workflows</span>
            </div>
            <div className="detail-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowIntro(false)}>
                Dismiss tour
              </button>
            </div>
          </div>
        </div>
      )}

      <header>
        <div className="topbar">
          <div className="branding">
            <h1>Catalog Visibility Control Center</h1>
            <p>Holistic product discovery for procurement, operations, and sales teams</p>
          </div>
          <div className="location-selector">
            <label htmlFor="locationScope" style={{ fontWeight: 600 }}>
              Location context
            </label>
            <select
              id="locationScope"
              value={selectedLocations[0] ?? 'all'}
              onChange={(event) => handleLocationToggle(event.target.value)}
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', padding: '0.85rem 2rem' }}>
          <div className="location-chip-list">
            {locations
              .filter((location) => location.id !== 'all')
              .map((location) => (
                <button
                  key={location.id}
                  className={selectedLocations.includes(location.id) ? 'location-chip active' : 'location-chip'}
                  onClick={() => handleLocationToggle(location.id)}
                >
                  <span className="status-dot" />
                  <span>{location.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>{location.region}</span>
                </button>
              ))}
            <button
              className={selectedLocations.includes('all') ? 'location-chip active' : 'location-chip'}
              onClick={() => handleLocationToggle('all')}
            >
              <span className="status-dot" />
              All Locations
            </button>
          </div>
        </div>
      </header>

      <main className="main-layout">
        <aside className="sidebar">
          <section>
            <h2>Unified search</h2>
            <div className="search-input" role="search">
              <span aria-hidden>🔎</span>
              <input
                type="search"
                placeholder="Search products, categories, or tags"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </section>

          <section>
            <h2>Availability filter</h2>
            <div className="filter-group" role="group" aria-label="Availability">
              {(['all', ...availabilityOrder] as AvailabilityFilter[]).map((option) => (
                <button
                  key={option}
                  className={availabilityFilter === option ? 'filter-chip active' : 'filter-chip'}
                  onClick={() => setAvailabilityFilter(option)}
                >
                  {option === 'all' ? 'Show all statuses' : availabilityLabels[option]}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2>Saved discovery views</h2>
            <div className="saved-search">
              {savedSearches.map((saved) => (
                <button key={saved.id} onClick={() => handleSavedSearch(saved.id)}>
                  {saved.label}
                </button>
              ))}
              {!savedSelectionActive.length && <span>No saved views match your current filters.</span>}
            </div>
          </section>

          <section>
            <h2>Bulk actions</h2>
            <div className="bulk-panel">
              <label>Select target locations</label>
              <div className="location-chip-list">
                {Array.from(locationLookup.values()).map((location) => (
                  <button
                    key={location.id}
                    className={bulkSelection.targetLocationIds.includes(location.id) ? 'location-chip active' : 'location-chip'}
                    onClick={() => handleBulkLocationSelect(location.id)}
                  >
                    <span className="status-dot" />
                    {location.name}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" disabled={!bulkReady} onClick={handleBulkRequest}>
                Launch {bulkSelection.productIds.length} request{bulkSelection.productIds.length === 1 ? '' : 's'}
              </button>
              <button className="btn btn-ghost" onClick={() => setBulkSelection(defaultBulkSelection)}>
                Clear selection
              </button>
            </div>
          </section>

          <section>
            <h2>Workflow timeline</h2>
            <div className="timeline">
              <div className="timeline-item">Budget approvals auto-route to sales after 48 hours</div>
              <div className="timeline-item">Notification sent when product becomes available in any location</div>
              <div className="timeline-item">CSV bulk import supports up to 500 SKUs per request</div>
            </div>
          </section>
        </aside>

        <section className="content-area">
          <div className="metric-strip" role="status" aria-live="polite">
            <div className="metric-card">
              <span>Results</span>
              <strong>{resultsForSummary}</strong>
              <small>{formatPercent(discoveryRate)} discovery rate</small>
            </div>
            <div className="metric-card">
              <span>Unavailable matches</span>
              <strong>{unavailableCount}</strong>
              <small>Prioritize expansion</small>
            </div>
            <div className="metric-card">
              <span>Active requests</span>
              <strong>{uniqueRequestsOpen}</strong>
              <small>Monitoring in CRM</small>
            </div>
            {selectedProduct && (
              <div className="metric-card">
                <span>{selectedProduct.name} adoption</span>
                <strong>{formatPercent(selectedProduct.metrics.adoptionRate)}</strong>
                <small>{formatCurrency(selectedProduct.metrics.averageOrderValue)} avg order</small>
              </div>
            )}
          </div>

          <div className="results-surface">
            <div className="product-list" aria-label="Product results">
              {productResults.length ? (
                productResults
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No products found. Adjust filters to expand your search.</p>
              )}
            </div>

            <div className="detail-panel">
              {selectedProduct ? (
                <>
                  <div className="detail-header">
                    <div>
                      <h2>{selectedProduct.name}</h2>
                      <div className="subtitle">{selectedProduct.category}</div>
                    </div>
                    {selectedAvailabilitySummary && (
                      <div className="availability-badges">
                        {availabilityOrder.map((status) => (
                          <span key={status} className={availabilityClass[status]}>
                            {availabilityLabels[status]} · {selectedAvailabilitySummary[status]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{selectedProduct.description}</p>

                  <section className="section-card">
                    <h3>Cross-location performance</h3>
                    <ul>
                      {selectedProduct.usageHighlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 style={{ marginBottom: '0.65rem' }}>Location availability</h3>
                    <div className="availability-matrix">
                      <div className="availability-row header">
                        <span>Location</span>
                        <span>Status</span>
                        <span>Pricing</span>
                        <span>Lead time</span>
                      </div>
                      {selectedProduct.availability.map((detail) => {
                        const location = getLocation(detail);
                        return (
                          <div className="availability-row" key={`${selectedProduct.id}-${detail.locationId}`}>
                            <span>{location?.name ?? detail.locationId}</span>
                            <span className={availabilityDotClass[detail.status]}>
                              <span className="dot" />
                              {availabilityLabels[detail.status]}
                            </span>
                            <span>{detail.price}</span>
                            <span>
                              {detail.leadTime}
                              {detail.lastOrderDate && (
                                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                  Last order {detail.lastOrderDate}
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <div className="detail-actions">
                    {selectedProduct.availability
                      .filter((detail) => detail.status !== 'available')
                      .map((detail) => (
                        <button
                          key={`${selectedProduct.id}-${detail.locationId}`}
                          className="btn btn-primary"
                          onClick={() => handleRequestAccess(selectedProduct, detail.locationId)}
                        >
                          Request access · {locationLookup.get(detail.locationId)?.name ?? detail.locationId}
                        </button>
                      ))}
                    <button className="btn btn-secondary">Add to multi-location cart</button>
                    <button className="btn btn-ghost">View historical orders</button>
                  </div>

                  <section className="section-card">
                    <h3>Related products</h3>
                    <ul>
                      {selectedProduct.relatedProducts.map((related) => (
                        <li key={related}>{related}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="section-card">
                    <h3>Documentation</h3>
                    <ul>
                      {selectedProduct.documentationLinks.map((doc) => (
                        <li key={doc.label}>
                          <a href={doc.url}>{doc.label}</a>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Select a product to view location availability details.</p>
              )}

              <section className="section-card">
                <h3>Pending access requests</h3>
                <div className="request-table" aria-live="polite">
                  <div className="request-row header">
                    <span>Product</span>
                    <span>Location</span>
                    <span>Status</span>
                    <span>Owner</span>
                  </div>
                  {requests.map((request) => (
                    <div key={request.id} className="request-row">
                      <span>{request.productName}</span>
                      <span>{request.locationName}</span>
                      <span className={statusPillClass(request.status)}>{request.status}</span>
                      <span>{request.owner}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      {modalContext && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Request access · {locationLookup.get(modalContext.locationId)?.name ?? modalContext.locationId}</h3>
            <p>
              Provide optional context for why <strong>{modalContext.product.name}</strong> is needed in this location.
              Notifications will be routed to the assigned sales representative.
            </p>
            <textarea
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              rows={4}
              placeholder="Share business impact, demand forecasts, or compliance obligations."
            />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModalContext(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitRequest}>
                Submit request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
