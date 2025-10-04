import React, { useState, useEffect } from 'react'
import { AlertTriangle, Shield, CheckCircle, XCircle, MapPin, Clock, User, MessageSquare } from 'lucide-react'
import ApiService from '../services/apiService'

const IncidentReporting = ({ userLocation, onClose }) => {
  const [activeTab, setActiveTab] = useState('report')
  const [incidents, setIncidents] = useState([])
  const [pendingIncidents, setPendingIncidents] = useState([])
  const [loading, setLoading] = useState(false)

  // Report form state
  const [reportForm, setReportForm] = useState({
    type: 'safety_concern',
    description: '',
    severity: 'medium',
    lat: userLocation?.lat || '',
    lng: userLocation?.lng || ''
  })

  useEffect(() => {
    loadIncidents()
    loadPendingIncidents()
  }, [])

  const loadIncidents = async () => {
    try {
      const data = await ApiService.fetchIncidents()
      setIncidents(data)
    } catch (error) {
      console.error('Error loading incidents:', error)
    }
  }

  const loadPendingIncidents = async () => {
    try {
      const data = await ApiService.fetchPendingIncidents()
      setPendingIncidents(data)
    } catch (error) {
      console.error('Error loading pending incidents:', error)
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const incidentData = {
        id: `incident-${Date.now()}`,
        type: reportForm.type,
        lat: parseFloat(reportForm.lat),
        lng: parseFloat(reportForm.lng),
        description: reportForm.description,
        severity: reportForm.severity,
        reporterId: 'current_user' // In a real app, this would be the logged-in user ID
      }

      await ApiService.createIncident(incidentData)
      
      // Reset form
      setReportForm({
        type: 'safety_concern',
        description: '',
        severity: 'medium',
        lat: userLocation?.lat || '',
        lng: userLocation?.lng || ''
      })

      // Refresh data
      await loadIncidents()
      await loadPendingIncidents()
      
      alert('✅ Incident reported successfully! It will be reviewed by volunteers.')
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('❌ Error submitting report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVolunteerAction = async (incidentId, action, comment = '') => {
    try {
      await ApiService.volunteerAction(incidentId, {
        action,
        volunteerId: 'volunteer_user', // In a real app, this would be the logged-in volunteer ID
        comment
      })

      // Refresh data
      await loadIncidents()
      await loadPendingIncidents()
      
      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'resolved'
      alert(`✅ Incident ${actionText} successfully!`)
    } catch (error) {
      console.error('Error processing volunteer action:', error)
      alert('❌ Error processing action. Please try again.')
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return '#2ed573'
      case 'medium': return '#f39c12'
      case 'high': return '#ff4757'
      default: return '#666'
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        width: '90%',
        maxWidth: '800px',
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} color="#ff4757" />
            Incident Management
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #eee'
        }}>
          {[
            { id: 'report', label: 'Report Incident', icon: AlertTriangle },
            { id: 'community', label: 'Community Reports', icon: MessageSquare },
            { id: 'volunteer', label: 'Volunteer Review', icon: Shield }
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

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {activeTab === 'report' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#333' }}>Report a Safety Incident</h3>
              <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Incident Type
                  </label>
                  <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="safety_concern">Safety Concern</option>
                    <option value="harassment">Harassment</option>
                    <option value="poor_lighting">Poor Lighting</option>
                    <option value="broken_infrastructure">Broken Infrastructure</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Severity Level
                  </label>
                  <select
                    value={reportForm.severity}
                    onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="low">Low - Minor concern</option>
                    <option value="medium">Medium - Moderate risk</option>
                    <option value="high">High - Immediate attention needed</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                    Description
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Describe the incident in detail..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={reportForm.lat}
                      onChange={(e) => setReportForm({ ...reportForm, lat: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#555' }}>
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={reportForm.lng}
                      onChange={(e) => setReportForm({ ...reportForm, lng: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <AlertTriangle size={16} />
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'community' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#333' }}>Recent Community Reports</h3>
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
                          background: getSeverityColor(incident.severity),
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          marginRight: '10px'
                        }}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span style={{
                          background: getStatusColor(incident.status),
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {incident.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} />
                        {new Date(incident.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <h4 style={{ margin: '5px 0', color: '#333' }}>
                      {incident.type.replace('_', ' ').toUpperCase()}
                    </h4>
                    
                    <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                      {incident.description}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '12px', color: '#888' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} />
                        {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle size={12} color="#2ed573" />
                        {incident.approvalCount} approvals
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <XCircle size={12} color="#ff4757" />
                        {incident.rejectionCount} rejections
                      </span>
                    </div>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No incidents reported yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'volunteer' && (
            <div>
              <h3 style={{ marginTop: 0, color: '#333' }}>Pending Volunteer Review</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                Help verify community reports by reviewing incidents in your area.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {pendingIncidents.map(incident => (
                  <div
                    key={incident.id}
                    style={{
                      border: '2px solid #f39c12',
                      borderRadius: '10px',
                      padding: '15px',
                      background: '#fff9e6'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span style={{
                          background: getSeverityColor(incident.severity),
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          marginRight: '10px'
                        }}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span style={{
                          background: '#f39c12',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          AWAITING REVIEW
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} />
                        {new Date(incident.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <h4 style={{ margin: '5px 0', color: '#333' }}>
                      {incident.type.replace('_', ' ').toUpperCase()}
                    </h4>
                    
                    <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                      {incident.description}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '12px', color: '#888', marginBottom: '15px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} />
                        {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle size={12} color="#2ed573" />
                        {incident.approvalCount} approvals
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <XCircle size={12} color="#ff4757" />
                        {incident.rejectionCount} rejections
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleVolunteerAction(incident.id, 'approve')}
                        style={{
                          flex: 1,
                          background: '#2ed573',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '6px',
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
                        onClick={() => handleVolunteerAction(incident.id, 'reject')}
                        style={{
                          flex: 1,
                          background: '#ff4757',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <XCircle size={16} />
                        Reject (False)
                      </button>
                      <button
                        onClick={() => handleVolunteerAction(incident.id, 'resolve')}
                        style={{
                          flex: 1,
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '6px',
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
                        Resolve (Fixed)
                      </button>
                    </div>
                  </div>
                ))}
                {pendingIncidents.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No incidents pending review.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IncidentReporting