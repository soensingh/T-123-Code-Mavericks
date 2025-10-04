import React, { useState, useEffect } from 'react'
import { Settings, Users, AlertTriangle, Shield, BarChart3, MapPin, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ApiService from '../services/apiService'

const AdminPanel = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 156,
    activeVolunteers: 23,
    totalIncidents: 89,
    resolvedIncidents: 67,
    pendingIncidents: 15,
    emergencyAlerts: 7,
    safeZones: 12,
    dangerZones: 8
  })
  const [incidents, setIncidents] = useState([])
  const [users, setUsers] = useState([
    { id: '1', name: 'Priya Sharma', role: 'woman', status: 'active', joinedAt: '2024-09-15' },
    { id: '2', name: 'Rajesh Kumar', role: 'volunteer', status: 'active', joinedAt: '2024-09-10' },
    { id: '3', name: 'Simran Singh', role: 'woman', status: 'active', joinedAt: '2024-09-20' },
    { id: '4', name: 'Amit Patel', role: 'volunteer', status: 'inactive', joinedAt: '2024-08-30' }
  ])

  useEffect(() => {
    loadIncidents()
  }, [])

  const loadIncidents = async () => {
    try {
      const data = await ApiService.fetchIncidents()
      setIncidents(data)
      
      // Update stats based on real data
      setStats(prev => ({
        ...prev,
        totalIncidents: data.length,
        resolvedIncidents: data.filter(i => i.status === 'resolved').length,
        pendingIncidents: data.filter(i => i.status === 'pending').length
      }))
    } catch (error) {
      console.error('Error loading incidents:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12'
      case 'approved': return '#2ed573'
      case 'resolved': return '#666'
      case 'rejected': return '#ff4757'
      default: return '#666'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'woman': return '#ff6b9d'
      case 'volunteer': return '#2ed573'
      case 'admin': return '#667eea'
      default: return '#666'
    }
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <Settings size={48} color="#667eea" />
        <h1 style={{ margin: '10px 0', color: '#333', fontSize: '28px', fontWeight: 'bold' }}>
          Admin Dashboard
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          System overview and management controls
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#667eea', trend: '+12%' },
          { label: 'Active Volunteers', value: stats.activeVolunteers, icon: Shield, color: '#2ed573', trend: '+5%' },
          { label: 'Total Incidents', value: stats.totalIncidents, icon: AlertTriangle, color: '#f39c12', trend: '+8%' },
          { label: 'Emergency Alerts', value: stats.emergencyAlerts, icon: Clock, color: '#ff4757', trend: '-3%' }
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: `2px solid ${stat.color}20`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <stat.icon size={24} color={stat.color} />
              <span style={{ 
                fontSize: '12px', 
                color: stat.trend.startsWith('+') ? '#2ed573' : '#ff4757',
                fontWeight: '600'
              }}>
                {stat.trend}
              </span>
            </div>
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
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'incidents', label: 'All Incidents', icon: AlertTriangle },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'zones', label: 'Zone Management', icon: MapPin }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: activeTab === tab.id ? '#667eea' : 'transparent',
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
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* System Health */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="#2ed573" />
                System Health
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Database Status</span>
                  <span style={{ color: '#2ed573', fontWeight: '600' }}>✓ Online</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>API Response Time</span>
                  <span style={{ color: '#2ed573', fontWeight: '600' }}>{'< 100ms'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Active Connections</span>
                  <span style={{ color: '#2ed573', fontWeight: '600' }}>{stats.totalUsers}</span>
                </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <span style={{ color: '#2ed573', fontWeight: '600' }}>✓</span> New user registration (Priya S.)
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <span style={{ color: '#f39c12', fontWeight: '600' }}>⚠</span> Incident reported at Model Town
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <span style={{ color: '#ff4757', fontWeight: '600' }}>🚨</span> Emergency alert resolved
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <span style={{ color: '#667eea', fontWeight: '600' }}>👤</span> Volunteer Rajesh came online
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
              All Incidents ({incidents.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incidents.map(incident => (
                <div
                  key={incident.id}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '10px',
                    padding: '15px',
                    background: '#fafafa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <span style={{
                        background: getStatusColor(incident.status),
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginRight: '8px'
                      }}>
                        {incident.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span style={{
                        background: '#f8f9fa',
                        color: '#666',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}>
                        {incident.severity?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(incident.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <h4 style={{ margin: '5px 0', color: '#333' }}>
                    {incident.type?.replace('_', ' ').toUpperCase() || 'INCIDENT'}
                  </h4>
                  
                  <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                    {incident.description || 'No description provided'}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '12px', color: '#888' }}>
                    <span>Reporter: {incident.reporterId || 'Anonymous'}</span>
                    <span>Approvals: {incident.approvalCount || 0}</span>
                    <span>Rejections: {incident.rejectionCount || 0}</span>
                  </div>
                </div>
              ))}
              
              {incidents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No incidents found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              User Management ({users.length} users)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map(user => (
                <div
                  key={user.id}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '10px',
                    padding: '15px',
                    background: '#fafafa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: getRoleColor(user.role),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • Joined {user.joinedAt}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: user.status === 'active' ? '#2ed573' : '#95a5a6',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {user.status.toUpperCase()}
                    </span>
                    <button
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              Zone Management
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div style={{
                border: '2px solid #2ed573',
                borderRadius: '10px',
                padding: '15px',
                background: '#f0fff4',
                textAlign: 'center'
              }}>
                <Shield size={32} color="#2ed573" style={{ marginBottom: '10px' }} />
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ed573', marginBottom: '5px' }}>
                  {stats.safeZones}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Safe Zones</div>
              </div>
              
              <div style={{
                border: '2px solid #ff4757',
                borderRadius: '10px',
                padding: '15px',
                background: '#fff5f5',
                textAlign: 'center'
              }}>
                <AlertTriangle size={32} color="#ff4757" style={{ marginBottom: '10px' }} />
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4757', marginBottom: '5px' }}>
                  {stats.dangerZones}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Danger Zones</div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Manage Zones on Map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel