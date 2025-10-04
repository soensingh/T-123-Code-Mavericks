import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet'
import { MapPin, Shield, AlertTriangle, Users, Lightbulb, Navigation, Route, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import ApiService from '../services/apiService'
import IncidentReporting from './IncidentReporting'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for different zone types
const createCustomIcon = (color, size = [25, 41]) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: ${size[0]}px; height: ${size[1]}px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]]
  })
}

// Custom user location icon
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-icon',
    html: `
      <div style="
        width: 20px; 
        height: 20px; 
        background: linear-gradient(45deg, #667eea, #764ba2); 
        border: 4px solid white; 
        border-radius: 50%; 
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.4);
        position: relative;
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 10px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.4); }
          50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(102, 126, 234, 0.6); }
          100% { box-shadow: 0 0 10px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.4); }
        }
      </style>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

// Custom destination icon
const createDestinationIcon = () => {
  return L.divIcon({
    className: 'destination-icon',
    html: `
      <div style="
        width: 0; 
        height: 0; 
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-bottom: 30px solid #e74c3c;
        position: relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <div style="
          position: absolute;
          top: 8px;
          left: -8px;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  })
}

// Jalandhar-specific sample data with realistic coordinates
const JALANDHAR_CENTER = [31.3260, 75.5762] // Jalandhar, Punjab coordinates

// Map click handler component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick
  })
  return null
}

// Location tracking component
const LocationTracker = ({ onLocationUpdate, userLocation }) => {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15)
    }
  }, [userLocation, map])

  return null
}

// Center-follow pin overlay (pure DOM overlay, no map events) 
const CenterFollowPin = ({ active }) => {
  if (!active) return null
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -100%)',
      zIndex: 1200,
      pointerEvents: 'none'
    }}>
      <div style={{ position:'relative', width:40, height:40 }}>
        <div style={{
          position:'absolute',
          top:10,
          left:10,
          width:20,
          height:20,
          borderRadius:'50%',
          background:'radial-gradient(circle at 30% 30%, #ffb347, #e67e22)',
          boxShadow:'0 0 6px rgba(0,0,0,0.3)'
        }} />
        <div style={{
          position:'absolute',
          left:'50%',
          top:'50%',
          width:6,
          height:6,
          background:'#fff',
          borderRadius:'50%',
          transform:'translate(-50%, -50%)'
        }} />
        <div style={{
          position:'absolute',
          bottom:-14,
          left:'50%',
          width:0,
          height:0,
          borderLeft:'6px solid transparent',
          borderRight:'6px solid transparent',
            borderTop:'14px solid #e67e22',
          transform:'translateX(-50%)'
        }} />
      </div>
    </div>
  )
}

// Get real road route using OSRM (free alternative)
async function getRealRoute(start, end) {
  try {
    console.log('🛣️ Fetching route from OSRM...');
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );
    
    if (!response.ok) {
      throw new Error('Route API failed');
    }
    
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const coordinates = data.routes[0].geometry.coordinates;
      const route = coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
      console.log('✅ Got real route with', route.length, 'points');
      return route;
    }
    
    throw new Error('No route found');
  } catch (error) {
    console.warn('Failed to get real route, using direct line:', error);
    return [start, end]; // Fallback to direct line
  }
}

// Check if a point is too close to danger zones
function isPointSafe(point, dangerZones, safeDistance = 100) {
  for (const zone of dangerZones) {
    const distance = L.latLng(point.lat, point.lng).distanceTo(L.latLng(zone.lat, zone.lng));
    if (distance < (zone.radius + safeDistance)) {
      return false;
    }
  }
  return true;
}

// Simple safe route calculation avoiding danger zones
async function calculateSafeRoute(start, end, dangerZones = []) {
  // Ensure we have valid start and end points
  if (!start || !end || typeof start.lat !== 'number' || typeof start.lng !== 'number' || 
      typeof end.lat !== 'number' || typeof end.lng !== 'number') {
    console.warn('Invalid start or end coordinates:', { start, end })
    return { coordinates: [start, end], safetyScore: 50, isDetoured: false }
  }
  
  console.log('📍 Getting route from', start, 'to', end, 'avoiding', dangerZones.length, 'danger zones')
  
  try {
    // First get the normal route
    const normalRoute = await getRealRoute(start, end);
    
    // If no danger zones, return normal route
    if (!dangerZones || dangerZones.length === 0) {
      console.log('✅ No danger zones, using direct route');
      return { coordinates: normalRoute, safetyScore: 100, isDetoured: false };
    }
    
    // Check if normal route goes through danger zones
    const routeIsSafe = normalRoute.every(point => isPointSafe(point, dangerZones));
    
    if (routeIsSafe) {
      console.log('✅ Normal route is safe');
      return { coordinates: normalRoute, safetyScore: 100, isDetoured: false };
    }
    
    console.log('⚠️ Normal route goes through danger zones, finding safer alternative...');
    
    // Enhanced waypoint generation for better route alternatives
    const midLat = (start.lat + end.lat) / 2;
    const midLng = (start.lng + end.lng) / 2;
    const latDiff = Math.abs(end.lat - start.lat);
    const lngDiff = Math.abs(end.lng - start.lng);
    
    // Create multiple waypoint options for better alternatives
    const waypointOptions = [
      // North detour
      { lat: midLat + Math.max(0.005, latDiff * 0.3), lng: midLng },
      // South detour  
      { lat: midLat - Math.max(0.005, latDiff * 0.3), lng: midLng },
      // East detour
      { lat: midLat, lng: midLng + Math.max(0.005, lngDiff * 0.3) },
      // West detour
      { lat: midLat, lng: midLng - Math.max(0.005, lngDiff * 0.3) },
      // Northeast diagonal
      { lat: midLat + Math.max(0.003, latDiff * 0.2), lng: midLng + Math.max(0.003, lngDiff * 0.2) },
      // Southwest diagonal
      { lat: midLat - Math.max(0.003, latDiff * 0.2), lng: midLng - Math.max(0.003, lngDiff * 0.2) }
    ];
    
    let bestRoute = normalRoute;
    let bestSafetyScore = 0;
    
    // Test each waypoint option
    for (const waypoint of waypointOptions) {
      try {
        // Ensure waypoint is safe
        if (!isPointSafe(waypoint, dangerZones)) continue;
        
        const route1 = await getRealRoute(start, waypoint);
        const route2 = await getRealRoute(waypoint, end);
        const fullRoute = [...route1, ...route2];
        
        // Calculate safety score (percentage of safe points)
        const safePoints = fullRoute.filter(point => isPointSafe(point, dangerZones)).length;
        const safetyScore = (safePoints / fullRoute.length) * 100;
        
        console.log(`🛡️ Waypoint route safety: ${safetyScore.toFixed(1)}%`);
        
        if (safetyScore > bestSafetyScore) {
          bestSafetyScore = safetyScore;
          bestRoute = fullRoute;
        }
      } catch (error) {
        console.warn('Failed to calculate waypoint route:', error);
      }
    }
    
    if (bestSafetyScore > 0) {
      console.log(`✅ Using safer route with ${bestSafetyScore.toFixed(1)}% safety score`);
      return { coordinates: bestRoute, safetyScore: bestSafetyScore, isDetoured: true };
    } else {
      console.warn('⚠️ Could not find safer alternative, using original route with warning');
      return { coordinates: normalRoute, safetyScore: 30, isDetoured: false };
    }
    
  } catch (error) {
    console.warn('Route calculation failed, using direct line:', error);
    return { coordinates: [start, end], safetyScore: 50, isDetoured: false };
  }
}

// Map event handler component
const MapEventHandler = ({ onMoveEnd }) => {
  const map = useMap()
  
  useMapEvents({
    moveend: () => {
      const center = map.getCenter()
      console.log('🗺️ Map moved to:', { lat: center.lat, lng: center.lng })
      if (onMoveEnd) {
        onMoveEnd({ lat: center.lat, lng: center.lng })
      }
    }
  })
  
  return null
}

// Route planning component
const RoutePlanner = ({ start, end, dangerZones, onRouteCalculated }) => {
  const map = useMap()

  useEffect(() => {
    const getRoute = async () => {
      try {
        if (!start || !end) return
        if (typeof start !== 'object' || typeof end !== 'object') return
        
        console.log('🛣️ Calculating route...')
        const routeData = await calculateSafeRoute(start, end, dangerZones)
        if (!routeData || !routeData.coordinates || !Array.isArray(routeData.coordinates) || routeData.coordinates.length === 0) return
        
        const route = routeData.coordinates
        
        // Calculate total distance along the route
        let totalDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
          totalDistance += L.latLng(route[i].lat, route[i].lng).distanceTo(L.latLng(route[i+1].lat, route[i+1].lng))
        }
        const distanceKm = (totalDistance / 1000).toFixed(2)
        
        // Estimate time (assuming 30 km/h average speed in city)
        const estimatedTimeMinutes = Math.round((totalDistance / 1000) / 30 * 60)
        
        if (onRouteCalculated) {
          onRouteCalculated({ 
            route, 
            distance: distanceKm,
            time: estimatedTimeMinutes,
            safetyScore: routeData.safetyScore.toFixed(1),
            isDetoured: routeData.isDetoured
          })
        }
        
        console.log('✅ Route calculated:', {
          points: route.length,
          distance: distanceKm + 'km',
          time: estimatedTimeMinutes + ' minutes',
          safetyScore: routeData.safetyScore.toFixed(1) + '%',
          isDetoured: routeData.isDetoured ? 'Yes' : 'No'
        })
      } catch (err) {
        console.error('RoutePlanner failed:', err)
      }
    }
    
    getRoute();
  }, [start, end, dangerZones, onRouteCalculated])

  return null
}

// Radius visualization component
const RadiusPreview = ({ center, radius, visible, color = '#667eea' }) => {
  const map = useMap()
  const circleRef = useRef(null)

  useEffect(() => {
    if (!visible || !center || !radius) {
      if (circleRef.current) {
        map.removeLayer(circleRef.current)
        circleRef.current = null
      }
      return
    }

    // Remove existing circle
    if (circleRef.current) {
      map.removeLayer(circleRef.current)
    }

    // Create new circle
    circleRef.current = L.circle([center.lat, center.lng], {
      radius: radius,
      color: color,
      fillColor: color,
      fillOpacity: 0.1,
      weight: 2,
      opacity: 0.6,
      dashArray: '10, 10'
    }).addTo(map)

    // Cleanup function
    return () => {
      if (circleRef.current) {
        map.removeLayer(circleRef.current)
        circleRef.current = null
      }
    }
  }, [map, center, radius, visible, color])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (circleRef.current) {
        map.removeLayer(circleRef.current)
      }
    }
  }, [map])

  return null
}

// (keep existing getDistanceFromLine later in file to avoid duplication errors if present)

const SafetyMap = () => {
  const [mapData, setMapData] = useState({
    safeZones: [],
    dangerZones: [],
    panicAlerts: [],
    volunteers: []
  })
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [userLocation, setUserLocation] = useState(null)
  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)
  const [distance, setDistance] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(null)
  const [routeSafetyScore, setRouteSafetyScore] = useState(null)
  const [isRouteDetoured, setIsRouteDetoured] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showIncidentReporting, setShowIncidentReporting] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [droppedPins, setDroppedPins] = useState([])
  const [isPinDropMode, setIsPinDropMode] = useState(false)
  const [ratingLocation, setRatingLocation] = useState(null)
  const [customRadius, setCustomRadius] = useState(200)
  const mapRef = useRef(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Load saved safety zones and pins from MySQL database on component mount
  useEffect(() => {
    const loadDataFromDatabase = async () => {
      try {
        // Check if server is running
        const serverHealth = await ApiService.checkServerHealth();
        console.log('🏥 Server health check:', serverHealth);
        if (!serverHealth) {
          console.warn('Backend server not available, using sample data only');
          return;
        }

        // Load zones from database
        const zonesData = await ApiService.fetchZones();
        console.log('🔍 Loaded zones from database:', zonesData);
        if (zonesData && (zonesData.safeZones || zonesData.dangerZones)) {
          setMapData(prevData => {
            const newMapData = {
              ...prevData,
              safeZones: zonesData.safeZones || [],
              dangerZones: zonesData.dangerZones || []
            };
            console.log('✅ Updated mapData with zones:', newMapData);
            console.log(`📊 Total zones: Safe=${newMapData.safeZones.length}, Danger=${newMapData.dangerZones.length}`);
            return newMapData;
          });
        } else {
          console.warn('⚠️ No zones data received or empty zones');
        }

        // Load pins from database
        const pinsData = await ApiService.fetchPins();
        console.log('Loaded pins from database:', pinsData);
        if (pinsData && Array.isArray(pinsData)) {
          setDroppedPins(pinsData);
          console.log('Updated dropped pins:', pinsData);
        }
      } catch (error) {
        console.error('Error loading data from database:', error);
        // Fallback to localStorage if database fails
        try {
        const savedZones = localStorage.getItem('guardaid-safety-zones');
        if (savedZones) {
          const parsedZones = JSON.parse(savedZones);
          setMapData(prevData => ({
            ...prevData,
            safeZones: parsedZones.safeZones || [],
            dangerZones: parsedZones.dangerZones || []
          }));
        }          const savedPins = localStorage.getItem('guardaid-dropped-pins');
          if (savedPins) {
            const parsedPins = JSON.parse(savedPins);
            setDroppedPins(parsedPins);
          }
        } catch (localError) {
          console.error('Error loading from localStorage fallback:', localError);
        }
      }
    };

    // Initial load
    loadDataFromDatabase();
    
    // Set up periodic refresh every 5 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing data...');
      loadDataFromDatabase();
    }, 5000); // 5 seconds for faster sync

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [])

  // Debug mapData changes
  useEffect(() => {
    console.log('📊 MapData updated:', mapData);
    console.log(`📊 Zones count: Safe=${mapData.safeZones?.length || 0}, Danger=${mapData.dangerZones?.length || 0}`);
  }, [mapData]);

  // Save safety zones to MySQL database
  const saveSafetyZones = async (newMapData) => {
    // Keep localStorage as backup
    try {
      const userCreatedZones = {
        safeZones: newMapData.safeZones.filter(zone => zone.isUserCreated),
        dangerZones: newMapData.dangerZones.filter(zone => zone.isUserCreated)
      }
      localStorage.setItem('guardaid-safety-zones', JSON.stringify(userCreatedZones))
    } catch (error) {
      console.error('Error saving zones to localStorage:', error)
    }
  }

  // Save dropped pins to MySQL database
  const saveDroppedPins = async (pins) => {
    // Keep localStorage as backup
    try {
      localStorage.setItem('guardaid-dropped-pins', JSON.stringify(pins))
    } catch (error) {
      console.error('Error saving pins to localStorage:', error)
    }
  }

  // Get user's live location
  const getCurrentLocation = () => {
    setIsTracking(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(newLocation)
          setIsTracking(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Fallback to Jalandhar center
          setUserLocation({ lat: JALANDHAR_CENTER[0], lng: JALANDHAR_CENTER[1] })
          setIsTracking(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
      setUserLocation({ lat: JALANDHAR_CENTER[0], lng: JALANDHAR_CENTER[1] })
      setIsTracking(false)
    }
  }

  // Search for places in Jalandhar
  const searchLocation = () => {
    if (!searchQuery.trim()) return

    // Sample search results for Jalandhar landmarks
    const jalandharLandmarks = {
      'model town': { lat: 31.3240, lng: 75.5810 },
      'civil lines': { lat: 31.3300, lng: 75.5700 },
      'cantt': { lat: 31.3180, lng: 75.5820 },
      'gt road': { lat: 31.3350, lng: 75.5650 },
      'railway station': { lat: 31.3380, lng: 75.5580 },
      'bus stand': { lat: 31.3260, lng: 75.5762 },
      'dav college': { lat: 31.3290, lng: 75.5740 },
      'lovely professional university': { lat: 31.2532, lng: 75.7047 },
      'wonderland': { lat: 31.3156, lng: 75.5994 }
    }

    const searchKey = searchQuery.toLowerCase()
    const found = Object.entries(jalandharLandmarks).find(([key]) => 
      key.includes(searchKey) || searchKey.includes(key)
    )

    if (found) {
      const location = found[1]
      setDestination(location)
      setShowSuggestions(false)
      setSearchQuery('')
      
      // Move map to searched location
      if (mapRef.current) {
        mapRef.current.setView([location.lat, location.lng], 15)
      }
      
      // Drop a pin at the searched location
      const searchPin = {
        id: Date.now(),
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date()
      }
      
      setDroppedPins(prev => [...prev, searchPin])
      
      // Save to database
      ApiService.createPin(searchPin)
      
      console.log('🔍 Pin dropped at searched location:', location)
    } else {
      alert(`Location "${searchQuery}" not found. Try: Model Town, Civil Lines, Cantt, GT Road, etc.`)
    }
  }

  // Get search suggestions
  const getSearchSuggestions = (query) => {
    if (!query.trim()) return []
    
    const jalandharLandmarks = [
      'Model Town', 'Civil Lines', 'Cantt', 'GT Road', 'Railway Station',
      'Bus Stand', 'DAV College', 'Lovely Professional University', 'Wonderland',
      'Phagwara Gate', 'Nakodar Road', 'Kapurthala Road', 'Pathankot Road',
      'Kartarpur', 'Adampur', 'Shahkot', 'Phillaur', 'Goraya'
    ]
    
    const lowerQuery = query.toLowerCase()
    return jalandharLandmarks.filter(place => 
      place.toLowerCase().includes(lowerQuery)
    ).slice(0, 6) // Show max 6 suggestions
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.trim()) {
      const suggestions = getSearchSuggestions(value)
      setSearchSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    // Trigger search with the selected suggestion
    setTimeout(() => searchLocation(), 100)
  }

  // Handle pin dropping at current location or center
  const handlePinDrop = () => {
    setIsPinDropMode(!isPinDropMode)
  }

  // Get current map center coordinates
  const getCurrentMapCenter = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter()
      const coords = { lat: center.lat, lng: center.lng }
      console.log('📍 Map center from map instance:', coords)
      return coords
    }
    if (mapCenter) {
      console.log('📍 Map center from state:', mapCenter)
      return mapCenter
    }
    // Fallback to default center (not user location)
    const fallback = { lat: JALANDHAR_CENTER[0], lng: JALANDHAR_CENTER[1] }
    console.log('⚠️ Map ref and state not available, using fallback:', fallback)
    return fallback
  }

  // Drop pin at exact map center
  const dropPinAtCenter = async () => {
    if (!isPinDropMode) return
    
    const centerCoords = getCurrentMapCenter()
    console.log('Dropping pin at map center:', centerCoords)
    
    const newPin = {
      id: Date.now(),
      lat: centerCoords.lat,
      lng: centerCoords.lng,
      timestamp: new Date()
    }
    
    // Validate coordinates
    if (Number.isNaN(Number(newPin.lat)) || Number.isNaN(Number(newPin.lng))) {
      console.error('Invalid coordinates, aborting pin drop')
      return
    }
    
    // Add pin and set as destination
    const updatedPins = [...droppedPins, newPin]
    setDroppedPins(updatedPins)
    
    // Save to database
    try {
      await ApiService.createPin(newPin)
      console.log('Pin saved to database')
    } catch (error) {
      console.error('Failed to save pin to database:', error)
      // Fallback to localStorage
      saveDroppedPins(updatedPins)
    }
    
    setDestination({ lat: newPin.lat, lng: newPin.lng })
    setIsPinDropMode(false)
  }

  // Handle map clicks for pin dropping
  const handleMapClick = async (latlng) => {
    if (isPinDropMode) {
      const newPin = {
        id: Date.now(),
        lat: latlng.lat,
        lng: latlng.lng,
        timestamp: new Date()
      }
      const updatedPins = [...droppedPins, newPin]
      setDroppedPins(updatedPins)
      
      // Save to database
      try {
        await ApiService.createPin(newPin)
        console.log('Pin saved to database')
      } catch (error) {
        console.error('Failed to save pin to database:', error)
        // Fallback to localStorage
        saveDroppedPins(updatedPins)
      }
      
      setDestination({ lat: latlng.lat, lng: latlng.lng })
      setIsPinDropMode(false)
    }
  }

  // Remove dropped pin
  const removePin = async (pinId) => {
    const updatedPins = droppedPins.filter(pin => pin.id !== pinId)
    setDroppedPins(updatedPins)
    
    // Delete from database
    try {
      await ApiService.deletePin(pinId)
      console.log('Pin deleted from database')
    } catch (error) {
      console.error('Failed to delete pin from database:', error)
      // Fallback to localStorage
      saveDroppedPins(updatedPins)
    }
    
    // Check if the removed pin was the current destination
    const removedPin = droppedPins.find(pin => pin.id === pinId)
    if (destination && removedPin && 
        destination.lat === removedPin.lat && 
        destination.lng === removedPin.lng) {
      setDestination(null)
      setRoute(null)
    }
  }

  // Rate area with custom radius
  const rateAreaWithRadius = async (rating) => {
    try {
      if (!ratingLocation) {
        alert('Please select a location first!')
        return
      }

      const newRating = {
        lat: ratingLocation.lat,
        lng: ratingLocation.lng,
        rating: rating,
        radius: customRadius,
        timestamp: new Date(),
        userId: 'current_user'
      }

      // Determine if this creates a new safe/danger zone
      const isGoodRating = rating >= 3
      const zoneName = ratingLocation.isUserLocation ? 
        'My Location Rating' : 
        `Pin Location ${new Date().toLocaleTimeString()}`
      
      if (isGoodRating) {
        const newSafeZone = {
          id: `user-safe-${Date.now()}`,
          lat: ratingLocation.lat,
          lng: ratingLocation.lng,
          name: zoneName,
          volunteers: 0,
          rating: rating,
          totalRatings: 1,
          radius: customRadius,
          isUserCreated: true,
          createdAt: new Date().toISOString(),
          ratingHistory: [newRating]
        }
        const updatedMapData = {
          ...mapData,
          safeZones: [...mapData.safeZones, newSafeZone]
        }
        setMapData(updatedMapData)
        
        // Save to database
        try {
          console.log('🔄 Saving safe zone to database:', newSafeZone);
          const result = await ApiService.createZone({
            id: newSafeZone.id,
            type: 'safe',
            lat: newSafeZone.lat,
            lng: newSafeZone.lng,
            name: newSafeZone.name,
            rating: newSafeZone.rating,
            radius: newSafeZone.radius,
            ratingHistory: newSafeZone.ratingHistory
          })
          console.log('✅ Safe zone saved to database:', result)
          // Force refresh data to sync with other devices
          setTimeout(async () => {
            const zonesData = await ApiService.fetchZones();
            if (zonesData) {
              setMapData(prevData => ({
                ...prevData,
                safeZones: zonesData.safeZones || [],
                dangerZones: zonesData.dangerZones || []
              }));
            }
          }, 1000);
        } catch (error) {
          console.error('Failed to save safe zone to database:', error)
          // Fallback to localStorage
          saveSafetyZones(updatedMapData)
        }
      } else {
        const newDangerZone = {
          id: `user-danger-${Date.now()}`,
          lat: ratingLocation.lat,
          lng: ratingLocation.lng,
          name: zoneName,
          incidents: 1,
          rating: rating,
          totalRatings: 1,
          radius: customRadius,
          isUserCreated: true,
          createdAt: new Date().toISOString(),
          ratingHistory: [newRating]
        }
        const updatedMapData = {
          ...mapData,
          dangerZones: [...mapData.dangerZones, newDangerZone]
        }
        setMapData(updatedMapData)
        
        // Save to database
        try {
          console.log('🔄 Saving danger zone to database:', newDangerZone);
          const result = await ApiService.createZone({
            id: newDangerZone.id,
            type: 'danger',
            lat: newDangerZone.lat,
            lng: newDangerZone.lng,
            name: newDangerZone.name,
            rating: newDangerZone.rating,
            radius: newDangerZone.radius,
            ratingHistory: newDangerZone.ratingHistory
          })
          console.log('✅ Danger zone saved to database:', result)
          // Force refresh data to sync with other devices
          setTimeout(async () => {
            const zonesData = await ApiService.fetchZones();
            if (zonesData) {
              setMapData(prevData => ({
                ...prevData,
                safeZones: zonesData.safeZones || [],
                dangerZones: zonesData.dangerZones || []
              }));
            }
          }, 1000);
        } catch (error) {
          console.error('Failed to save danger zone to database:', error)
          // Fallback to localStorage
          saveSafetyZones(updatedMapData)
        }
      }

      setShowRatingModal(false)
      setRatingLocation(null)
      alert(`✅ Area rated and saved to database! Zone created with ${customRadius}m radius. Your rating is now permanently stored and visible to all users.`)
    } catch (error) {
      console.error('Error rating area:', error)
      alert('❌ Error creating rating. Please try again.')
      setShowRatingModal(false)
      setRatingLocation(null)
    }
  }

  // Open rating modal for specific location
  const openRatingModal = (location, isUserLocation = false) => {
    try {
      setRatingLocation({
        lat: location.lat,
        lng: location.lng,
        isUserLocation: isUserLocation
      })
      setShowRatingModal(true)
    } catch (error) {
      console.error('Error opening rating modal:', error)
      alert('Error opening rating dialog. Please try again.')
    }
  }

  useEffect(() => {
    // Auto-get location on component mount
    getCurrentLocation()
  }, [])

  // Track live map center coordinates for pin dropping
  useEffect(() => {
    if (!isPinDropMode || !mapRef.current) return
    
    const map = mapRef.current
    let centerCoords = null
    
    const updateMapCenter = () => {
      const center = map.getCenter()
      centerCoords = { lat: center.lat, lng: center.lng }
      setMapCenter(centerCoords)
    }
    
    // Initialize center coordinates
    updateMapCenter()
    
    // Listen for map movement
    map.on('move', updateMapCenter)
    map.on('zoom', updateMapCenter)
    map.on('drag', updateMapCenter)
    
    return () => {
      map.off('move', updateMapCenter)
      map.off('zoom', updateMapCenter) 
      map.off('drag', updateMapCenter)
    }
  }, [isPinDropMode])
  
  // Clear map center when exiting pin mode
  useEffect(() => {
    if (!isPinDropMode) {
      setMapCenter(null)
    }
  }, [isPinDropMode])


// Helper function to calculate distance from point to line
const getDistanceFromLine = (lineStart, lineEnd, point) => {
  // Simplified distance calculation
  const A = point[0] - lineStart[0]
  const B = point[1] - lineStart[1]
  const C = lineEnd[0] - lineStart[0]
  const D = lineEnd[1] - lineStart[1]

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  const param = lenSq !== 0 ? dot / lenSq : -1

  let xx, yy

  if (param < 0) {
    xx = lineStart[0]
    yy = lineStart[1]
  } else if (param > 1) {
    xx = lineEnd[0]
    yy = lineEnd[1]
  } else {
    xx = lineStart[0] + param * C
    yy = lineStart[1] + param * D
  }

  const dx = point[0] - xx
  const dy = point[1] - yy
  return Math.sqrt(dx * dx + dy * dy) * 111000 // Convert to meters approximately
}

  return (
    <div className="card">
      {/* Header with controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Live Safety Map - Jalandhar</h2>
        <div className="filter-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSelectedFilter('all')}
            style={{
              padding: '8px 16px',
              border: selectedFilter === 'all' ? '2px solid #667eea' : '1px solid #ddd',
              background: selectedFilter === 'all' ? '#667eea' : 'white',
              color: selectedFilter === 'all' ? 'white' : '#666',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          <button 
            onClick={() => setSelectedFilter('safe')}
            style={{
              padding: '8px 16px',
              border: selectedFilter === 'safe' ? '2px solid #2ed573' : '1px solid #ddd',
              background: selectedFilter === 'safe' ? '#2ed573' : 'white',
              color: selectedFilter === 'safe' ? 'white' : '#666',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            Safe Zones
          </button>
          <button 
            onClick={() => setSelectedFilter('danger')}
            style={{
              padding: '8px 16px',
              border: selectedFilter === 'danger' ? '2px solid #ff4757' : '1px solid #ddd',
              background: selectedFilter === 'danger' ? '#ff4757' : 'white',
              color: selectedFilter === 'danger' ? 'white' : '#666',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            Danger Zones
          </button>
        </div>
      </div>

      {/* Location and search controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button
          onClick={getCurrentLocation}
          disabled={isTracking}
          style={{
            padding: '10px 15px',
            background: isTracking ? '#95a5a6' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: isTracking ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Navigation size={16} />
          {isTracking ? 'Getting Location...' : 'My Location'}
        </button>

        <button
          onClick={handlePinDrop}
          style={{
            padding: '10px 15px',
            background: isPinDropMode ? '#e74c3c' : '#f39c12',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <MapPin size={16} />
          {isPinDropMode ? 'Cancel' : 'Drop Pin'}
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 15px',
            background: '#8e44ad',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ↻ Sync
        </button>

        {isPinDropMode && (
          <button
            onClick={dropPinAtCenter}
            style={{
              padding: '10px 15px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 4px 8px rgba(39, 174, 96, 0.3)',
              animation: 'pulse 2s infinite'
            }}
          >
            <MapPin size={16} />
            📍 Drop Pin at Center
          </button>
        )}

        <div style={{ display: 'flex', gap: '5px', flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search places in Jalandhar..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              flex: 1,
              minWidth: '200px'
            }}
          />
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: '60px',
              background: '#ffffff',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
              zIndex: 1001,
              marginTop: '5px',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    borderBottom: index < searchSuggestions.length - 1 ? '1px solid #e8e8e8' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#333333',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0f8ff'
                    e.target.style.transform = 'translateX(2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.transform = 'translateX(0px)'
                  }}
                >
                  <MapPin size={16} color="#667eea" />
                  <span style={{ color: '#333333', fontWeight: '500' }}>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={searchLocation}
            style={{
              padding: '10px 15px',
              background: '#2ed573',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>

        <button
          onClick={() => userLocation && openRatingModal(userLocation, true)}
          disabled={!userLocation}
          style={{
            padding: '10px 15px',
            background: userLocation ? '#f39c12' : '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: userLocation ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Star size={16} />
          Rate My Area
        </button>

        <button
          onClick={() => setShowIncidentReporting(true)}
          style={{
            padding: '10px 15px',
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <AlertTriangle size={16} />
          Report Incident
        </button>
      </div>

      {/* Pin drop instructions */}
      {isPinDropMode && (
        <div style={{ 
          background: '#e8f5e8', 
          border: '1px solid #4caf50',
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <MapPin size={20} color="#2e7d32" />
          <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
            📍 Move the map to position the center pin, then click "Drop Here" to place your pin
          </span>
        </div>
      )}

      {/* Route info */}
      {userLocation && destination && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          padding: '15px 20px', 
          borderRadius: '12px', 
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Route size={22} color="white" />
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}>
            {distance && estimatedTime 
              ? `Route planned • ${distance}km • ${estimatedTime} min`
              : 'Route planning...'
            }
          </span>
          <button
            onClick={() => {
              setDestination(null);
              setRoute(null);
            }}
            style={{
              background: 'rgba(255, 71, 87, 0.9)',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)'
            }}
          >
            Clear Route
          </button>
        </div>
      )}

      {/* Map */}
      <div className="map-container" style={{ height: '500px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
        <CenterFollowPin active={isPinDropMode} />
        {isPinDropMode && mapCenter && (
          <div style={{
            position:'absolute',
            bottom:10,
            left:'50%',
            transform:'translateX(-50%)',
            background:'rgba(0,0,0,0.8)',
            color:'#fff',
            padding:'8px 12px',
            borderRadius:'16px',
            fontSize:'11px',
            zIndex:1300,
            pointerEvents:'none',
            fontFamily:'monospace',
            border:'1px solid #333'
          }}>
            📍 Pin will drop at: {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}
          </div>
        )}
        <MapContainer 
          center={userLocation ? [userLocation.lat, userLocation.lng] : JALANDHAR_CENTER} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <LocationTracker onLocationUpdate={setUserLocation} userLocation={userLocation} />
          <MapEventHandler onMoveEnd={setMapCenter} />
          
          {/* Show crosshair at map center when in pin drop mode */}
          {isPinDropMode && mapCenter && (
            <Marker 
              position={[mapCenter.lat, mapCenter.lng]} 
              icon={L.divIcon({
                className: 'crosshair-icon',
                html: '<div style="width: 20px; height: 20px; background: red; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            />
          )}
          
          {userLocation && destination && (
            <>
              <RoutePlanner 
                start={userLocation}
                end={destination}
                dangerZones={mapData.dangerZones}
                onRouteCalculated={(routeData) => {
                  console.log('📊 Route calculated:', routeData);
                  setRoute(routeData.route)
                  setDistance(routeData.distance)
                  setEstimatedTime(routeData.time)
                  setRouteSafetyScore(routeData.safetyScore)
                  setIsRouteDetoured(routeData.isDetoured)
                }}
              />
            </>
          )}
          
          {/* Display route as polyline with safety-based styling */}
          {route && route.length > 0 && (
            <Polyline 
              positions={route.map(point => [point.lat, point.lng])}
              color={isRouteDetoured ? "#ff6b9d" : "#2196F3"}
              weight={6}
              opacity={0.8}
              dashArray={isRouteDetoured ? "10, 5" : null}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: '5px 0', color: isRouteDetoured ? '#ff6b9d' : '#2196F3' }}>
                    {isRouteDetoured ? '🛡️ Safe Route (Detoured)' : '🛣️ Direct Route'}
                  </h4>
                  <div style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Distance:</strong> {distance}km<br />
                    <strong>Time:</strong> ~{estimatedTime} min<br />
                    <strong>Safety Score:</strong> {routeSafetyScore}%
                  </div>
                  {isRouteDetoured && (
                    <div style={{ 
                      background: '#fff9e6', 
                      color: '#856404', 
                      padding: '8px', 
                      borderRadius: '6px', 
                      fontSize: '12px',
                      marginTop: '8px',
                      border: '1px solid #ffeaa7'
                    }}>
                      ⚠️ Route has been modified to avoid danger zones for your safety
                    </div>
                  )}
                </div>
              </Popup>
            </Polyline>
          )}

          {/* Dropped pins (guarded) */}
          {Array.isArray(droppedPins) && droppedPins.length > 0 && droppedPins.map(pin => {
            try {
              if(!pin) return null
              const latNum = Number(pin.lat)
              const lngNum = Number(pin.lng)
              if(Number.isNaN(latNum) || Number.isNaN(lngNum)) return null
              return (
                <Marker 
                  key={`pin-${pin.id}`}
                  position={[latNum, lngNum]}
                  icon={createDestinationIcon()}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(45deg, #f39c12, #e67e22)',
                    borderRadius: '50%',
                    margin: '0 auto 10px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MapPin size={24} color="white" />
                  </div>
                  <h4 style={{ margin: '5px 0', color: '#f39c12', fontWeight: 'bold' }}>📍 Dropped Pin</h4>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                    <strong>Lat:</strong> {latNum.toFixed(4)}<br/>
                    <strong>Lng:</strong> {lngNum.toFixed(4)}
                  </p>
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openRatingModal(pin, false)
                      }}
                      style={{
                        background: '#2ed573',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Rate Area
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDestination({ lat: pin.lat, lng: pin.lng })
                      }}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Route Here
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removePin(pin.id)
                      }}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                    </div>
                  </Popup>
                </Marker>
              )
            } catch(e) {
              console.error('Error rendering dropped pin', e, pin)
              return null
            }
          })}

          {/* User location */}
          {userLocation && (
            <>
              {/* Pulsing circle for user location */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={50}
                pathOptions={{ 
                  color: '#667eea', 
                  fillColor: '#667eea', 
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
              <Marker 
                position={[userLocation.lat, userLocation.lng]}
                icon={createUserLocationIcon()}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      borderRadius: '50%',
                      margin: '0 auto 10px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Navigation size={24} color="white" />
                    </div>
                    <h4 style={{ margin: '5px 0', color: '#667eea', fontWeight: 'bold' }}>📍 You Are Here</h4>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                      <strong>Lat:</strong> {userLocation.lat.toFixed(4)}<br/>
                      <strong>Lng:</strong> {userLocation.lng.toFixed(4)}
                    </p>
                    <div style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      marginTop: '8px'
                    }}>
                      Live Location Active
                    </div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Destination marker */}
          {destination && (
            <Marker 
              position={[destination.lat, destination.lng]}
              icon={createDestinationIcon()}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
                    borderRadius: '50%',
                    margin: '0 auto 10px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MapPin size={24} color="white" />
                  </div>
                  <h4 style={{ margin: '5px 0', color: '#e74c3c', fontWeight: 'bold' }}>🎯 Destination</h4>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                    Safe route calculated avoiding danger zones
                  </p>
                  <div style={{
                    background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    marginTop: '8px'
                  }}>
                    Route Optimized
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Safe Zones */}
          {console.log('🗺️ Rendering safe zones:', mapData.safeZones)}
          {(selectedFilter === 'all' || selectedFilter === 'safe') && mapData.safeZones.map(zone => {
            console.log('🟢 Rendering safe zone:', zone);
            return (
            <div key={`safe-${zone.id}`}>
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{ color: '#2ed573', fillColor: '#2ed573', fillOpacity: 0.2 }}
              />
              <Marker position={[zone.lat, zone.lng]}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <Shield size={20} color="#2ed573" style={{ marginBottom: '5px' }} />
                    <h4 style={{ margin: '5px 0', color: '#2ed573' }}>{zone.name}</h4>
                    {zone.isUserCreated && (
                      <div style={{ 
                        background: '#e8f5e8', 
                        color: '#2e7d32', 
                        padding: '3px 8px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        margin: '5px 0'
                      }}>
                        👤 Community Rated
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', margin: '5px 0' }}>
                      <Star size={14} color="#f39c12" />
                      <span>{zone.rating}/5 ({zone.totalRatings} ratings)</span>
                    </div>
                    <p style={{ margin: '5px 0' }}>
                      <Users size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      {zone.volunteers} volunteers nearby
                    </p>
                    {zone.createdAt && (
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                        Added: {new Date(zone.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          )})}

          {/* Danger Zones */}
          {console.log('🗺️ Rendering danger zones:', mapData.dangerZones)}
          {(selectedFilter === 'all' || selectedFilter === 'danger') && mapData.dangerZones.map(zone => {
            console.log('🔴 Rendering danger zone:', zone);
            return (
            <div key={`danger-${zone.id}`}>
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{ color: '#ff4757', fillColor: '#ff4757', fillOpacity: 0.3 }}
              />
              <Marker position={[zone.lat, zone.lng]}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <AlertTriangle size={20} color="#ff4757" style={{ marginBottom: '5px' }} />
                    <h4 style={{ margin: '5px 0', color: '#ff4757' }}>{zone.name}</h4>
                    {zone.isUserCreated && (
                      <div style={{ 
                        background: '#ffebee', 
                        color: '#d32f2f', 
                        padding: '3px 8px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        margin: '5px 0'
                      }}>
                        👤 Community Rated
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', margin: '5px 0' }}>
                      <Star size={14} color="#f39c12" />
                      <span>{zone.rating}/5 ({zone.totalRatings} ratings)</span>
                    </div>
                    <p style={{ margin: '5px 0' }}>
                      {zone.incidents} recent incidents reported
                    </p>
                    {zone.createdAt && (
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                        Added: {new Date(zone.createdAt).toLocaleDateString()}
                      </p>
                    )}
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                      Route will avoid this area
                    </p>
                  </div>
                </Popup>
              </Marker>
            </div>
          )})}

          {/* Other markers... (volunteers, panic alerts) */}
          {selectedFilter === 'all' && mapData.volunteers.map(volunteer => (
            <Marker key={`volunteer-${volunteer.id}`} position={[volunteer.lat, volunteer.lng]}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <Users size={20} color="#5352ed" style={{ marginBottom: '5px' }} />
                  <h4 style={{ margin: '5px 0' }}>{volunteer.name}</h4>
                  <p style={{ margin: '5px 0' }}>
                    Status: <span style={{ color: volunteer.status === 'online' ? '#2ed573' : '#95a5a6' }}>
                      {volunteer.status}
                    </span>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Radius Preview Circle */}
          {showRatingModal && ratingLocation && (
            <RadiusPreview 
              center={ratingLocation}
              radius={customRadius}
              visible={showRatingModal}
              color="#667eea"
            />
          )}
        </MapContainer>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            width: '300px',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px' }}>Rate Area</h3>
            
            {/* Radius selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                Radius: <span style={{ color: '#667eea', fontSize: '16px' }}>{customRadius}m</span>
              </label>
              <div style={{ 
                background: 'linear-gradient(to right, #667eea, #764ba2)', 
                borderRadius: '8px', 
                padding: '2px',
                marginBottom: '8px'
              }}>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={customRadius}
                  onChange={(e) => setCustomRadius(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    height: '4px',
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                <span>50m</span>
                <span>500m</span>
              </div>
            </div>

            {/* Rating buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => rateAreaWithRadius(rating)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: rating <= 2 ? '#ff4757' : rating <= 3 ? '#f39c12' : '#2ed573',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: '0.9',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowRatingModal(false)
                setRatingLocation(null)
              }}
              style={{
                background: 'rgba(108, 117, 125, 0.8)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="responsive-grid-4" style={{ marginTop: '20px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #d4edda, #c3e6cb)', 
          padding: '20px', 
          borderRadius: '12px', 
          textAlign: 'center',
          border: '2px solid #b8dacc',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <Shield size={28} color="#155724" />
          <h4 style={{ margin: '12px 0 8px 0', color: '#155724', fontSize: '16px', fontWeight: 'bold' }}>Safe Zones</h4>
          <p style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#155724',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            {mapData.safeZones.length}
          </p>
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)', 
          padding: '20px', 
          borderRadius: '12px', 
          textAlign: 'center',
          border: '2px solid #f1b0b7',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <AlertTriangle size={28} color="#721c24" />
          <h4 style={{ margin: '12px 0 8px 0', color: '#721c24', fontSize: '16px', fontWeight: 'bold' }}>Danger Zones</h4>
          <p style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#721c24',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            {mapData.dangerZones.length}
          </p>
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #cce7ff, #b3d9ff)', 
          padding: '20px', 
          borderRadius: '12px', 
          textAlign: 'center',
          border: '2px solid #99ccff',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <Users size={28} color="#004085" />
          <h4 style={{ margin: '12px 0 8px 0', color: '#004085', fontSize: '16px', fontWeight: 'bold' }}>Active Volunteers</h4>
          <p style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#004085',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            {mapData.volunteers.filter(v => v.status === 'online').length}
          </p>
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)', 
          padding: '20px', 
          borderRadius: '12px', 
          textAlign: 'center',
          border: '2px solid #ffe066',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <Navigation size={28} color="#856404" />
          <h4 style={{ margin: '12px 0 8px 0', color: '#856404', fontSize: '16px', fontWeight: 'bold' }}>Live Tracking</h4>
          <p style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#856404',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            {userLocation ? 'ON' : 'OFF'}
          </p>
        </div>
      </div>

      {/* Incident Reporting Modal */}
      {showIncidentReporting && (
        <IncidentReporting
          userLocation={userLocation}
          onClose={() => setShowIncidentReporting(false)}
        />
      )}
    </div>
  )
}

export default SafetyMap