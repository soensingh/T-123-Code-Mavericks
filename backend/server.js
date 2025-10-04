const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'sswsj234okm',
  database: 'guardaid_db'
};

let pool;

// Initialize database
async function initDB() {
  try {
    // First connect without database to create it
    const tempConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'sswsj234okm'
    });
    
    await tempConnection.query('CREATE DATABASE IF NOT EXISTS guardaid_db');
    await tempConnection.end();
    
    // Now connect to the database
    pool = mysql.createPool(dbConfig);
    
    // Create tables
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS safety_zones (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(10) NOT NULL,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        radius INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS dropped_pins (
        id BIGINT PRIMARY KEY,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS incidents (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        description TEXT,
        severity VARCHAR(10) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'pending',
        reporter_id VARCHAR(50) DEFAULT 'anonymous',
        approved_by VARCHAR(50) NULL,
        resolved_by VARCHAR(50) NULL,
        approval_count INT DEFAULT 0,
        rejection_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS incident_approvals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        incident_id VARCHAR(50) NOT NULL,
        volunteer_id VARCHAR(50) NOT NULL,
        action VARCHAR(20) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
        UNIQUE KEY unique_volunteer_incident (incident_id, volunteer_id)
      )
    `);
    
    // Add default zones if database is empty
    const [existingZones] = await pool.execute('SELECT COUNT(*) as count FROM safety_zones');
    if (existingZones[0].count === 0) {
      console.log('🌱 Adding default safety zones...');
      
      const defaultZones = [
        // Safe zones
        { id: 'default-safe-1', type: 'safe', lat: 31.3290, lng: 75.5740, name: 'DAV College Area', rating: 5, radius: 300 },
        { id: 'default-safe-2', type: 'safe', lat: 31.3240, lng: 75.5810, name: 'Model Town', rating: 4, radius: 400 },
        { id: 'default-safe-3', type: 'safe', lat: 31.3300, lng: 75.5700, name: 'Civil Lines', rating: 4, radius: 350 },
        
        // Danger zones
        { id: 'default-danger-1', type: 'danger', lat: 31.3180, lng: 75.5820, name: 'Cantt Area', rating: 2, radius: 200 },
        { id: 'default-danger-2', type: 'danger', lat: 31.3350, lng: 75.5650, name: 'GT Road Junction', rating: 2, radius: 150 }
      ];
      
      for (const zone of defaultZones) {
        await pool.execute(
          'INSERT INTO safety_zones (id, type, lat, lng, name, rating, radius) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [zone.id, zone.type, zone.lat, zone.lng, zone.name, zone.rating, zone.radius]
        );
      }
      
      console.log(`✅ Added ${defaultZones.length} default zones to database`);
    }
    
    console.log('✅ Database connected and tables created');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

// API Routes

// Get all zones
app.get('/api/zones', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM safety_zones ORDER BY created_at DESC');
    console.log(`📊 Found ${rows.length} zones in database`);
    
    const safeZones = rows.filter(zone => zone.type === 'safe').map(zone => ({
      id: zone.id,
      lat: parseFloat(zone.lat),
      lng: parseFloat(zone.lng),
      name: zone.name,
      rating: zone.rating,
      radius: zone.radius,
      isUserCreated: true,
      volunteers: 0,
      totalRatings: 1
    }));
    
    const dangerZones = rows.filter(zone => zone.type === 'danger').map(zone => ({
      id: zone.id,
      lat: parseFloat(zone.lat),
      lng: parseFloat(zone.lng),
      name: zone.name,
      rating: zone.rating,
      radius: zone.radius,
      isUserCreated: true,
      incidents: 1,
      totalRatings: 1
    }));
    
    console.log(`✅ Returning: Safe=${safeZones.length}, Danger=${dangerZones.length}`);
    res.json({ safeZones, dangerZones });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

// Create zone
app.post('/api/zones', async (req, res) => {
  try {
    const { id, type, lat, lng, name, rating, radius } = req.body;
    
    await pool.execute(
      'INSERT INTO safety_zones (id, type, lat, lng, name, rating, radius) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, type, lat, lng, name, rating, radius]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({ error: 'Failed to create zone' });
  }
});

// Get all pins
app.get('/api/pins', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM dropped_pins');
    
    const pins = rows.map(pin => ({
      id: pin.id,
      lat: parseFloat(pin.lat),
      lng: parseFloat(pin.lng),
      timestamp: pin.created_at
    }));
    
    res.json(pins);
  } catch (error) {
    console.error('Error fetching pins:', error);
    res.status(500).json({ error: 'Failed to fetch pins' });
  }
});

// Create pin
app.post('/api/pins', async (req, res) => {
  try {
    const { id, lat, lng } = req.body;
    
    await pool.execute(
      'INSERT INTO dropped_pins (id, lat, lng) VALUES (?, ?, ?)',
      [id, lat, lng]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating pin:', error);
    res.status(500).json({ error: 'Failed to create pin' });
  }
});

// Delete pin
app.delete('/api/pins/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM dropped_pins WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting pin:', error);
    res.status(500).json({ error: 'Failed to delete pin' });
  }
});

// Get all incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT i.*, 
             COUNT(CASE WHEN ia.action = 'approve' THEN 1 END) as approval_count,
             COUNT(CASE WHEN ia.action = 'reject' THEN 1 END) as rejection_count
      FROM incidents i 
      LEFT JOIN incident_approvals ia ON i.id = ia.incident_id 
      GROUP BY i.id 
      ORDER BY i.created_at DESC
    `);
    
    const incidents = rows.map(incident => ({
      id: incident.id,
      type: incident.type,
      lat: parseFloat(incident.lat),
      lng: parseFloat(incident.lng),
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      reporterId: incident.reporter_id,
      approvedBy: incident.approved_by,
      resolvedBy: incident.resolved_by,
      approvalCount: incident.approval_count,
      rejectionCount: incident.rejection_count,
      timestamp: incident.created_at,
      updatedAt: incident.updated_at
    }));
    
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Create incident
app.post('/api/incidents', async (req, res) => {
  try {
    const { id, type, lat, lng, description, severity, reporterId } = req.body;
    
    await pool.execute(
      'INSERT INTO incidents (id, type, lat, lng, description, severity, reporter_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, type, lat, lng, description, severity || 'medium', reporterId || 'anonymous', 'pending']
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Volunteer action on incident (approve/reject/resolve)
app.post('/api/incidents/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, volunteerId, comment } = req.body;
    
    // Insert or update approval record
    await pool.execute(
      'INSERT INTO incident_approvals (incident_id, volunteer_id, action, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE action = VALUES(action), comment = VALUES(comment)',
      [id, volunteerId, action, comment]
    );
    
    // Update incident status based on approvals
    if (action === 'resolve') {
      await pool.execute(
        'UPDATE incidents SET status = ?, resolved_by = ? WHERE id = ?',
        ['resolved', volunteerId, id]
      );
    } else {
      // Count approvals and rejections
      const [counts] = await pool.execute(`
        SELECT 
          COUNT(CASE WHEN action = 'approve' THEN 1 END) as approvals,
          COUNT(CASE WHEN action = 'reject' THEN 1 END) as rejections
        FROM incident_approvals WHERE incident_id = ?
      `, [id]);
      
      const { approvals, rejections } = counts[0];
      
      // Auto-approve if 3+ volunteers approve
      if (approvals >= 3) {
        await pool.execute(
          'UPDATE incidents SET status = ?, approved_by = ? WHERE id = ?',
          ['approved', volunteerId, id]
        );
      }
      // Auto-reject if 3+ volunteers reject
      else if (rejections >= 3) {
        await pool.execute(
          'UPDATE incidents SET status = ? WHERE id = ?',
          ['rejected', id]
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing incident action:', error);
    res.status(500).json({ error: 'Failed to process action' });
  }
});

// Get pending incidents for volunteers
app.get('/api/incidents/pending', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT i.*, 
             COUNT(CASE WHEN ia.action = 'approve' THEN 1 END) as approval_count,
             COUNT(CASE WHEN ia.action = 'reject' THEN 1 END) as rejection_count
      FROM incidents i 
      LEFT JOIN incident_approvals ia ON i.id = ia.incident_id 
      WHERE i.status = 'pending'
      GROUP BY i.id 
      ORDER BY i.created_at DESC
    `);
    
    const incidents = rows.map(incident => ({
      id: incident.id,
      type: incident.type,
      lat: parseFloat(incident.lat),
      lng: parseFloat(incident.lng),
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      reporterId: incident.reporter_id,
      approvalCount: incident.approval_count,
      rejectionCount: incident.rejection_count,
      timestamp: incident.created_at
    }));
    
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching pending incidents:', error);
    res.status(500).json({ error: 'Failed to fetch pending incidents' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GuardAid Backend is running' });
});

// Start server
async function startServer() {
  await initDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Network: http://192.168.10.124:${PORT}`);
  });
}

startServer();