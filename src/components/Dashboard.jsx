import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navigation from './Navigation'
import SafetyMap from './SafetyMap'
import IncidentReporting from './IncidentReporting'
import EmergencyAlert from './EmergencyAlert'
import VolunteerHub from './VolunteerHub'
import AdminPanel from './AdminPanel'

const Dashboard = () => {
  const { user, hasRole } = useAuth()
  const [activeSection, setActiveSection] = useState('map')
  const [userLocation, setUserLocation] = useState(null)
  const [showIncidentReporting, setShowIncidentReporting] = useState(false)

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Location access denied, using default location')
          // Default to Jalandhar coordinates
          setUserLocation({
            lat: 31.3260,
            lng: 75.5762
          })
        }
      )
    }
  }, [])

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'map':
        return (
          <SafetyMap 
            userLocation={userLocation}
            showIncidentReporting={showIncidentReporting}
            setShowIncidentReporting={setShowIncidentReporting}
          />
        )
      
      case 'incident':
        return (
          <div style={{ padding: '80px 20px 20px 20px', minHeight: '100vh' }}>
            <IncidentReporting 
              userLocation={userLocation}
              onClose={() => setActiveSection('map')}
            />
          </div>
        )
      
      case 'emergency':
        if (hasRole('woman') || hasRole('admin')) {
          return <EmergencyAlert userLocation={userLocation} />
        }
        return <div>Access denied</div>
      
      case 'volunteer-hub':
        if (hasRole('volunteer') || hasRole('admin')) {
          return <VolunteerHub userLocation={userLocation} />
        }
        return <div>Access denied</div>
      
      case 'admin-panel':
        if (hasRole('admin')) {
          return <AdminPanel />
        }
        return <div>Access denied</div>
      
      default:
        return <SafetyMap userLocation={userLocation} />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <div style={{ 
        marginLeft: '0', // Navigation is now overlay-based
        minHeight: '100vh'
      }}>
        {renderActiveSection()}
      </div>
    </div>
  )
}

export default Dashboard