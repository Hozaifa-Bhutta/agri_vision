import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '34.122.161.108', // Use env var, default to localhost
  user: process.env.DB_USER || 'root',      // Use env var, default to root
  password: process.env.DB_PASSWORD || 'T)"X)j@4u_qPPISd', // Use env var, provide a strong default only for local dev
  database: process.env.DB_NAME || 'agri_insights_db',  // Use env var, default to db-411
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306, // Use env var, default to 3306
});

export const connectDb = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to Google Cloud SQL MySQL!');
    connection.release();
    return connection; // Return the connection object for further use
  } catch (err) {
    console.error('Database connection error:', err);
    throw err; // Re-throw the error to be handled upstream
  }
};

export const query = async (sql: string, values: any[]): Promise<any[]> => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(sql, values);
      connection.release();
      return rows as any[];
    } catch (err) {
      console.error('Query error:', err);
      throw err; // Re-throw the error to be handled upstream
    }
  };

// method to check if user exists and if password is correct
export const checkUser = async (username: string, password: string) => {
  try {
    const sql = 'SELECT * FROM UserAccount WHERE username = ? AND password = ?';
    const values = [username, password];
    const rows = await query(sql, values);
    return rows.length > 0; // Return true if user exists, false otherwise

    } catch (err) {
        console.error('Check user error:', err);
        throw err; // Re-throw the error to be handled upstream
    }
}

export const createUser = async (username: string, password: string, county_state: string) => {
  try {
    // first check if user exists
    if (await checkUser(username, password)) {
      throw new Error('User already exists');
    }
    const sql = 'INSERT INTO UserAccount (username, password, county_state) VALUES (?, ?, ?)';
    const values = [username, password, county_state];
    const result = await query(sql, values);
    return result; // Return the result of the insert operation
  } catch (err) {
    console.error('Create user error:', err);
    throw err; // Re-throw the error to be handled upstream
  }
}

export const getCounties = async () => {
  try {
    const sql = 'SELECT * FROM Counties';
    const rows = await query(sql, []);
    console.log(rows);
    return rows; // Return the result of the query
  } catch (err) {
    console.error('Get counties error:', err);
    throw err; // Re-throw the error to be handled upstream
  }
}

export const getUserInfo = async (username: string) => {
  try {
    const sql = 'SELECT * FROM UserAccount WHERE username = ?';
    const values = [username];
    const rows = await query(sql, values);
    return rows[0]; // Return the first row of the result
  } catch (err) {
    console.error('Get user info error:', err);
    throw err; // Re-throw the error to be handled upstream
  }
}

export const updateUser = async (username: string, county_state: string) => {
  try {
    const sql = 'UPDATE UserAccount SET county_state = ? WHERE username = ?';
    const values = [county_state, username];
    const result = await query(sql, values);
    return result; // Return the result of the update operation
  } catch (err) {
    console.error('Update user error:', err);
    throw err; // Re-throw the error to be handled upstream
  }
}


// ...existing code...

export const getYieldsByUsername = async (username: string) => {
  try {
    const sql = 'SELECT * FROM CropYield WHERE username = ?';
    const values = [username];
    const rows = await query(sql, values);
    return rows; // Return all yield records for this user
  } catch (err) {
    console.error('Get yields error:', err);
    throw err; // Re-throw the error to be handled upstream
  }
}

export const createYield = async (yieldData: { 
  crop_type: string, 
  measurement_date: string, 
  yieldacre: number, 
  username: string ,
  county_state: string
}) => {
  try {

    const sql = 'INSERT INTO CropYield (crop_type, measurement_date, county_state, username, yieldacre) VALUES (?, ?, ?, ?, ?)';
    const values = [
      yieldData.crop_type,
      yieldData.measurement_date,
      yieldData.county_state,
      yieldData.username,
      yieldData.yieldacre
    ];
    console.log('SQL:', sql);
    console.log('Values:', values);
    const result = await query(sql, values);
    return {
      ...yieldData,
    }; // Return the newly created record
  } catch (err) {
    console.error('Create yield error:', err);
    throw err; // Re-throw the error to be handled upstream
  }
}


export const getAuditLogs = async (username: string, limit: number) => {
  try {
    // Sanitize the limit value to prevent SQL injection
    const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 1000));
    
    // Use string concatenation for the LIMIT value
    const sql = `SELECT * FROM CropYield_AuditLog WHERE username = ? ORDER BY action_timestamp DESC LIMIT ${safeLimit}`;
    console.log('SQL:', sql);
    const values = [username]; // Only username uses placeholder
    
    const rows = await query(sql, values);
    return rows;
  }
  catch (err) {
    console.error('Get audit logs error:', err);
    throw err;
  }
}


export const deleteYieldById = async (
  compositeId: { 
    cropType: string, 
    measurementDate: string, 
    username: string, 
    county_state: string 
  }
) => {
  try {
    const sql = 'DELETE FROM CropYield WHERE crop_type = ? AND measurement_date = ? AND username = ? AND county_state = ?';
    const values = [
      compositeId.cropType,
      compositeId.measurementDate,
      compositeId.username,
      compositeId.county_state
    ];
    
    const result = await query(sql, values);
    return result; // Return the result of the delete operation
  } catch (err) {
    console.error('Delete yield error:', err);
    throw err; // Re-throw the error to be handled upstream
  }
}