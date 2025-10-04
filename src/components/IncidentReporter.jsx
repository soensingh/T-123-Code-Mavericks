import { useState } from 'react'
import { AlertTriangle, MapPin, Camera, Send, Clock } from 'lucide-react'

const IncidentReporter = () => {
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    urgency: 'medium',
    anonymous: false
  })
  
  const [submitted, setSubmitted] = useState(false)
  const [recentReports, setRecentReports] = useState([
    {
      id: 1,
      type: 'Poor Lighting',
      location: 'Broadway & 42nd St',
      time: '2 hours ago',
      status: 'Under Review'
    },
    {
      id: 2,
      type: 'Suspicious Activity',
      location: 'Central Park West',
      time: '4 hours ago',
      status: 'Investigating'
    },
    {
      id: 3,
      type: 'Street Light Out',
      location: '5th Avenue & 23rd St',
      time: '6 hours ago',
      status: 'Resolved'
    }
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate report submission
    const newReport = {
      id: recentReports.length + 1,
      type: formData.type,
      location: formData.location,
      time: 'Just now',
      status: 'Processing'
    }
    setRecentReports([newReport, ...recentReports])
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setFormData({
      type: '',
      location: '',
      description: '',
      urgency: 'medium',
      anonymous: false
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #2ed573, #1dd1a1)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <Send size={48} style={{ marginBottom: '15px' }} />
          <h2 style={{ margin: '10px 0' }}>Report Submitted Successfully!</h2>
          <p style={{ margin: '10px 0', opacity: '0.9' }}>
            Thank you for helping keep our community safe. Your report has been forwarded to local authorities and community volunteers.
          </p>
          <p style={{ margin: '10px 0', fontSize: '14px' }}>
            Report ID: #GRD{Math.floor(Math.random() * 10000)}
          </p>
        </div>
        <button 
          onClick={() => setSubmitted(false)}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Submit Another Report
        </button>
      </div>
    )
  }

  return (
    <div className="responsive-grid-2">
      {/* Report Form */}
      <div className="card">
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={24} />
          Report Safety Incident
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Incident Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">Select incident type...</option>
              <option value="Poor Lighting">Poor Lighting</option>
              <option value="Suspicious Activity">Suspicious Activity</option>
              <option value="Harassment">Harassment</option>
              <option value="Assault">Assault</option>
              <option value="Theft">Theft</option>
              <option value="Infrastructure Issue">Infrastructure Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter street address or intersection..."
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Urgency Level
            </label>
            <div className="responsive-flex" style={{ marginBottom: '20px' }}>
              {['low', 'medium', 'high', 'emergency'].map(level => (
                <label key={level} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  border: `2px solid ${formData.urgency === level ? '#667eea' : '#ddd'}`,
                  borderRadius: '20px',
                  background: formData.urgency === level ? '#f8f9ff' : 'white'
                }}>
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={formData.urgency === level}
                    onChange={handleChange}
                    style={{ margin: 0 }}
                  />
                  <span style={{ 
                    textTransform: 'capitalize',
                    color: formData.urgency === level ? '#667eea' : '#666'
                  }}>
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide details about the incident..."
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                style={{ margin: 0 }}
              />
              <span style={{ color: '#555' }}>Submit report anonymously</span>
            </label>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <Send size={20} />
            Submit Report
          </button>
        </form>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={24} />
          Recent Community Reports
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {recentReports.map(report => (
            <div
              key={report.id}
              style={{
                padding: '15px',
                border: '1px solid #eee',
                borderRadius: '8px',
                background: '#f8f9fa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#2c3e50' }}>{report.type}</h4>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: report.status === 'Resolved' ? '#d4edda' : 
                            report.status === 'Investigating' ? '#fff3cd' : '#f8d7da',
                  color: report.status === 'Resolved' ? '#155724' : 
                         report.status === 'Investigating' ? '#856404' : '#721c24'
                }}>
                  {report.status}
                </span>
              </div>
              <p style={{ margin: '5px 0', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={14} />
                {report.location}
              </p>
              <p style={{ margin: '5px 0', color: '#888', fontSize: '14px' }}>
                {report.time}
              </p>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Emergency Situation?</h4>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
            For immediate emergencies, contact local authorities first
          </p>
          <button style={{
            background: 'white',
            color: '#f5576c',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '20px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Call 911
          </button>
        </div>
      </div>
    </div>
  )
}

export default IncidentReporter