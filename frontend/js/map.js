/**
 * Clinic Locator & Map Module
 * Implements Haversine distance calculations and Leaflet.js map visualization
 * Author: Ziad Asaad - Frontend / UX Lead & Author
 */

const MapLocator = {
  map: null,
  markersLayer: null,
  userLocation: null,
  clinicsData: [],

  /**
   * Calculate distance between two coordinates in kilometers (Haversine Formula)
   */
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  },

  /**
   * Initialize Map and Load Clinics
   */
  async init(mapContainerId = 'clinics-map', listContainerId = 'clinics-list') {
    const listEl = document.getElementById(listContainerId);
    if (!listEl) return;

    // Load clinics data from ApiClient
    this.clinicsData = await ApiClient.getContacts();

    // Default reference coordinates: Kafr El Sheikh Medical Campus
    const defaultCenter = [31.1005, 30.9515];
    this.clinicsData.forEach(c => {
      c.distance_km = this.calculateHaversineDistance(defaultCenter[0], defaultCenter[1], c.lat, c.lon);
    });
    this.clinicsData.sort((a, b) => a.distance_km - b.distance_km);

    // Render list immediately
    this.renderClinicsList(listContainerId);

    // Initialize Leaflet Map if container exists
    const mapEl = document.getElementById(mapContainerId);
    if (mapEl && typeof L !== 'undefined') {
      this.initLeafletMap(mapContainerId);
    }

    // Try locating user position with high accuracy
    this.requestUserLocation(listContainerId);
  },

  /**
   * Initialize Leaflet interactive map
   */
  initLeafletMap(containerId) {
    // Default university center coordinates (Kafr El Sheikh Medical Campus)
    const defaultCenter = [31.1005, 30.9515];

    try {
      this.map = L.map(containerId).setView(defaultCenter, 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
      this.plotClinicMarkers();
    } catch (e) {
      console.warn('[MapLocator] Leaflet map init error or offline mode:', e);
    }
  },

  plotClinicMarkers() {
    if (!this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    this.clinicsData.forEach(clinic => {
      const isEmergency = clinic.phone === '123' || clinic.type === 'emergency';
      const markerColor = isEmergency ? '#dc2626' : '#0284c7';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: ${markerColor}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px;"><i class="fa-solid fa-hospital"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const popupContent = `
        <div style="font-family: inherit; padding: 4px; direction: rtl; text-align: right;">
          <h4 style="margin: 0 0 4px; font-weight: 800; color: #0f172a;">${clinic.name}</h4>
          <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">${clinic.location}</p>
          <a href="tel:${clinic.phone}" style="display: inline-flex; align-items: center; gap: 6px; background: #0284c7; color: #fff; padding: 4px 12px; border-radius: 99px; text-decoration: none; font-size: 12px; font-weight: 700;"><i class="fa-solid fa-phone"></i> اتصال: ${clinic.phone}</a>
        </div>
      `;

      L.marker([clinic.lat, clinic.lon], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(this.markersLayer);
    });
  },

  /**
   * Request user geolocation to compute exact distance and sort nearest
   */
  requestUserLocation(listContainerId) {
    if ('geolocation' in navigator) {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLocation = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };

          // Re-calculate distances for each clinic accurately
          this.clinicsData.forEach(c => {
            c.distance_km = this.calculateHaversineDistance(
              this.userLocation.lat,
              this.userLocation.lon,
              c.lat,
              c.lon
            );
          });

          // Sort by nearest distance
          this.clinicsData.sort((a, b) => a.distance_km - b.distance_km);

          // Re-render list
          this.renderClinicsList(listContainerId);

          // Add user pin on map
          if (this.map) {
            this.plotClinicMarkers();

            const userIcon = L.divIcon({
              className: 'user-pin',
              html: `<div style="background-color: #16a34a; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px rgba(22,163,74,0.8); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px;"><i class="fa-solid fa-person-walking"></i></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            L.marker([this.userLocation.lat, this.userLocation.lon], { icon: userIcon })
              .bindPopup('<div style="font-family: inherit; font-size: 12px; font-weight: 800; direction: rtl; display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-location-crosshairs" style="color: #16a34a;"></i><span>موقعك الحالي بدقة GPS</span></div>')
              .addTo(this.map);
            this.map.setView([this.userLocation.lat, this.userLocation.lon], 14);
          }
        },
        (err) => {
          console.log('[MapLocator] Geolocation not granted or unavailable:', err.message);
        },
        geoOptions
      );
    }
  },

  /**
   * Render clinics into UI cards
   */
  renderClinicsList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isArabic = document.documentElement.lang === 'ar' || document.body.getAttribute('dir') === 'rtl';

    container.innerHTML = this.clinicsData.map(c => {
      const isEmergency = c.phone === '123' || (c.name || '').includes('طوارئ') || (c.name || '').includes('مستشفى');
      const badgeText = isEmergency 
        ? (isArabic ? 'طوارئ واستقبال 24h' : 'Emergency 24/7') 
        : (isArabic ? 'مركز رعاية معتمد' : 'Verified Medical Center');
      
      const badgeClass = isEmergency ? 'red' : 'green';
      const distanceLabel = (c.distance_km !== null && !isNaN(c.distance_km)) 
        ? (isArabic ? `يبعد ${c.distance_km} كم` : `${c.distance_km} km away`) 
        : (isArabic ? 'داخل الحرم الجامعي' : 'On Campus');

      const servicesHtml = (c.services || []).map(s => `
        <span class="footer-badge">${s}</span>
      `).join('');

      return `
        <div class="clinic-card ${isEmergency ? 'emergency-card-highlight' : ''}" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-sm); transition: transform 0.2s;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <span class="badge-severity ${badgeClass}">
              <i class="${isEmergency ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'}"></i>
              <span class="badge-dot"></span>
              <span>${badgeText}</span>
            </span>
            <span style="font-size: 0.825rem; font-weight: 800; color: var(--primary); display: inline-flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-location-dot"></i>
              <span>${distanceLabel}</span>
            </span>
          </div>

          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">
              ${isArabic ? c.name : (c.name_en || c.name)}
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.4;">
              ${c.location}
            </p>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${servicesHtml}
          </div>

          <div style="margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.85rem; color: var(--text-subtle); display: inline-flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-clock"></i>
              <span>${c.available_24h ? (isArabic ? 'متاح 24/7' : 'Available 24/7') : (c.hours || '8 AM - 6 PM')}</span>
            </span>
            <a href="tel:${c.phone}" class="emergency-call-btn" style="${isEmergency ? 'background-color: #dc2626; color: #fff;' : 'background-color: var(--primary); color: #fff;'} padding: 8px 18px; font-weight: 800;">
              <i class="fa-solid fa-phone"></i>
              <span>${isArabic ? 'اتصل الآن' : 'Call Now'} (${c.phone})</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }
};

if (typeof window !== 'undefined') {
  window.MapLocator = MapLocator;
}
