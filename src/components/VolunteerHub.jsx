import React, { useState, useEffect } from 'react'
import { Shield, MapPin, Clock, AlertTriangle, CheckCircle, Users, Award, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ApiService from '../services/apiService'

const VolunteerHub = ({ userLocation }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [pendingIncidents, setPendingIncidents] = useState([])
  const [emergencyAlerts, setEmergencyAlerts] = useState([
    {
      id: 'emg-1',
      type: 'IMMEDIATE DANGER',
      location: { lat: 31.3250, lng: 75.5780 },
      reportedBy: 'Priya S.',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      distance: 0.8,
      status: 'active'
    },
    {
      id: 'emg-2',
      type: 'FEELING UNSAFE',
      location: { lat: 31.3200, lng: 75.5720 },
      reportedBy: 'Anonymous',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      distance: 1.2,
      status: 'resolved'
    }
  ])
  const [volunteerStats, setVolunteerStats] = useState({
    incidentsReviewed: 23,
    emergenciesResponded: 7,
    communityRating: 4.8,
    hoursServed: 45
  })

  useEffect(() => {
    loadPendingIncidents()
  }, [])

  const loadPendingIncidents = async () => {
    try {
      const data = await ApiService.fetchPendingIncidents()
      setPendingIncidents(data)
    } catch (error) {
      console.error('Error loading pending incidents:', error)
    }
  }

  const handleIncidentAction = async (incidentId, action) => {
    try {
      await ApiService.volunteerAction(incidentId, {
        action,
        volunteerId: user.id,
        comment: ''
      })
      
      // Refresh data
      await loadPendingIncidents()
      
      // Update stats
      setVolunteerStats(prev => ({
        ...prev,
        incidentsReviewed: prev.incidentsReviewed + 1
      }))
      
      alert(`✅ Incident ${action}d successfully!`)
    } catch (error) {
      console.error('Error processing incident action:', error)
      alert('❌ Error processing action. Please try again.')
    }
  }

  const respondToEmergency = (emergencyId) => {
    setEmergencyAlerts(prev => 
      prev.map(alert => 
        alert.id === emergencyId 
          ? { ...alert, status: 'responding', respondedBy: user.name }
          : alert
      )
    )
    
    setVolunteerStats(prev => ({
      ...prev,
      emergenciesResponded: prev.emergenciesResponded + 1
    }))
    
    alert('🚨 Emergency response activated! Navigate to the location to assist.')
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = Math.floor((now - timestamp) / 60000) // minutes
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    const hours = Math.floor(diff / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <Shield size={48} color="#2ed573" />
        <h1 style={{ margin: '10px 0', color: '#333', fontSize: '28px', fontWeight: 'bold' }}>
          Volunteer Hub
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Welcome back, {user?.name}! Ready to help your community?
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        {[
          { label: 'Incidents Reviewed', value: volunteerStats.incidentsReviewed, icon: CheckCircle, color: '#2ed573' },
          { label: 'Emergencies Responded', value: volunteerStats.emergenciesResponded, icon: AlertTriangle, color: '#ff4757' },
          { label: 'Community Rating', value: `${volunteerStats.communityRating}/5`, icon: Award, color: '#f39c12' },
          { label: 'Hours Served', value: volunteerStats.hoursServed, icon: Clock, color: '#667eea' }
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: `2px solid ${stat.color}20`
            }}
          >
            <stat.icon size={32} color={stat.color} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color, marginBottom: '5px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        background: 'white', 
        borderRadius: '12px',
        marginBottom: '20px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Shield },
          { id: 'incidents', label: 'Review Incidents', icon: AlertTriangle },
          { id: 'emergencies', label: 'Emergency Alerts', icon: Bell }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: activeTab === tab.id ? '#2ed573' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Actions */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                <button
                  onClick={() => setActiveTab('incidents')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600'
                  }}
                >
                  <AlertTriangle size={16} />
                  Review Incidents ({pendingIncidents.length})
                </button>
                <button
                  onClick={() => setActiveTab('emergencies')}
                  style={{
                    background: 'linear-gradient(135deg, #ff4757, #ff6b7a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600'
                  }}
                >
                  <Bell size={16} />
                  Emergency Alerts ({emergencyAlerts.filter(a => a.status === 'active').length})
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#2ed573', fontWeight: '600' }}>✓</span> Approved incident report at Model Town (2 hours ago)
                </div>
                <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#ff4757', fontWeight: '600' }}>🚨</span> Responded to emergency alert at Civil Lines (1 day ago)
                </div>
                <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#f39c12', fontWeight: '600' }}>⭐</span> Received 5-star rating from community member (2 days ago)
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              Incidents Pending Review ({pendingIncidents.length})
            </h3>
            
            {pendingIncidents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <CheckCircle size={48} color="#2ed573" style={{ marginBottom: '15px' }} />
                <h4 style={{ margin: '0 0 10px 0' }}>All caught up!</h4>
                <p style={{ margin: 0 }}>No incidents pending review at the moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {pendingIncidents.map(incident => (
                  <div
                    key={incident.id}
                    style={{
                      border: '2px solid #f39c12',
                      borderRadius: '12px',
                      padding: '15px',
                      background: '#fff9e6'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span style={{
                          background: '#f39c12',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {incident.severity?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} />
                        {new Date(incident.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <h4 style={{ margin: '5px 0', color: '#333' }}>
                      {incident.type?.replace('_', ' ').toUpperCase() || 'INCIDENT REPORT'}
                    </h4>
                    
                    <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                      {incident.description}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '12px', color: '#888', marginBottom: '15px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} />
                        {incident.lat?.toFixed(4)}, {incident.lng?.toFixed(4)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle size={12} color="#2ed573" />
                        {incident.approvalCount || 0} approvals
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleIncidentAction(incident.id, 'approve')}
                        style={{
                          flex: 1,
                          background: '#2ed573',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <CheckCircle size={16} />
                        Approve (Legit)
                      </button>
                      <button
                        onClick={() => handleIncidentAction(incident.id, 'reject')}
                        style={{
                          flex: 1,
                          background: '#ff4757',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <AlertTriangle size={16} />
                        Reject (False)
                      </button>
                      <button
                        onClick={() => handleIncidentAction(incident.id, 'resolve')}
                        style={{
                          flex: 1,
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Shield size={16} />
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'emergencies' && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              Emergency Alerts
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {emergencyAlerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    border: `2px solid ${alert.status === 'active' ? '#ff4757' : '#2ed573'}`,
                    borderRadius: '12px',
                    padding: '15px',
                    background: alert.status === 'active' ? '#fff5f5' : '#f0fff4'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <span style={{
                        background: alert.status === 'active' ? '#ff4757' : '#2ed573',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {getTimeAgo(alert.timestamp)} • {alert.distance}km away
                    </div>
                  </div>
                  
                  <h4 style={{ margin: '5px 0', color: '#333' }}>
                    {alert.type}
                  </h4>
                  
                  <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                    Reported by: <strong>{alert.reportedBy}</strong>
                    {alert.respondedBy && (
                      <div style={{ color: '#2ed573', marginTop: '5px' }}>
                        ✓ Volunteer {alert.respondedBy} is responding
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '12px', color: '#888', marginBottom: '15px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={12} />
                      {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                    </span>
                  </div>
                  
                  {alert.status === 'active' && !alert.respondedBy && (
                    <button
                      onClick={() => respondToEmergency(alert.id)}
                      style={{
                        background: 'linear-gradient(135deg, #ff4757, #ff6b7a)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Bell size={16} />
                      RESPOND TO EMERGENCY
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VolunteerHub