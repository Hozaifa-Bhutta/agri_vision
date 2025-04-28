import { count } from 'console';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs'; 

// we never end up setting up the env variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || '34.122.161.108', 
  user: process.env.DB_USER || 'root',     
  password: process.env.DB_PASSWORD || 'T)"X)j@4u_qPPISd',
  database: process.env.DB_NAME || 'agri_insights_db',  
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
});

export const connectDb = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to Google Cloud SQL MySQL!');
    connection.release();
    return connection; 
  } catch (err) {
    console.error('Database connection error:', err);
    throw err; 
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
      throw err;
    }
  };


export const checkUser = async (username: string, password: string) => {
  // method to check if user exists and if password is correct
  const sql = 'SELECT * FROM UserAccount WHERE username = ?';
  const result = await query(sql, [username]);

  if (result.length === 0) {
    return false; // no such user
  }

  const user = result[0];
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    // return user object (without the password!)
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } else {
    return false;
  }
};


export const doesUserExist = async (username: string) => {
  // method to check if user exists
  const sql = 'SELECT * FROM UserAccount WHERE username = ?';
  const result = await query(sql, [username]);
  return result.length > 0;
}

export const createUser = async (username: string, password: string, county_state: string) => {
  // method to create a new user (and check if user already exists)
  const connection = await pool.getConnection();
  try {
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction();
    
    // first check if user exists
    const checkSql = 'SELECT * FROM UserAccount WHERE username = ?';
    const [checkResult] = await connection.execute(checkSql, [username]);
    
    if ((checkResult as any[]).length > 0) {
      throw new Error('User already exists');
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = 'INSERT INTO UserAccount (username, password, county_state) VALUES (?, ?, ?)';
    const values = [username, hashedPassword, county_state];
    const [result] = await connection.execute(sql, values);
    
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    console.error('Create user error:', err);
    throw err; 
  } finally {
    connection.release();
  }
};



export const getCounties = async () => {
  // method to get all counties
  try {
    const sql = 'SELECT * FROM Counties';
    const rows = await query(sql, []);
    return rows;
  } catch (err) {
    console.error('Get counties error:', err);
    throw err; 
  }
}

export const getUserInfo = async (username: string) => {
  // method to get user info
  try {
    const sql = 'SELECT * FROM UserAccount WHERE username = ?';
    const values = [username];
    const rows = await query(sql, values);
    return rows[0]; 
  } catch (err) {
    console.error('Get user info error:', err);
    throw err; 
  }
}

export const updateUser = async (username: string, county_state: string) => {
  // method to update user info
  const connection = await pool.getConnection();
  try {
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction();
    
    const sql = 'UPDATE UserAccount SET county_state = ? WHERE username = ?';
    const values = [county_state, username];
    const [result] = await connection.execute(sql, values);
    
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    console.error('Update user error:', err);
    throw err; 
  } finally {
    connection.release();
  }
};


export const getYieldsByUsername = async (username: string) => {
  // method to get all yield records for a user
  try {
    const sql = 'SELECT * FROM CropYield WHERE username = ?';
    const values = [username];
    const rows = await query(sql, values);
    return rows; // return all yield records for this user
  } catch (err) {
    console.error('Get yields error:', err);
    throw err; 
  }
}

export const createYield = async (yieldData: { 
  crop_type: string, 
  measurement_date: string, 
  yieldacre: number, 
  username: string,
  county_state: string
}) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction();

    const sql = 'INSERT INTO CropYield (crop_type, measurement_date, county_state, username, yieldacre) VALUES (?, ?, ?, ?, ?)';
    const values = [
      yieldData.crop_type,
      yieldData.measurement_date,
      yieldData.county_state,
      yieldData.username,
      yieldData.yieldacre
    ];

    const [result] = await connection.execute(sql, values);
    
    await connection.commit();
    return {
      ...yieldData,
    };
  } catch (err) {
    await connection.rollback();
    console.error('Create yield error:', err);
    throw err; 
  } finally {
    connection.release();
  }
};


export const getAuditLogs = async (username: string, limit: number) => {
  // method to get audit logs for a user
  try {
    // we don't want crazy numbers 
    const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 1000));
    
    const sql = `SELECT * FROM CropYield_AuditLog WHERE username = ? ORDER BY action_timestamp DESC LIMIT ${safeLimit}`;
    const values = [username]; // only username uses placeholder
    
    const rows = await query(sql, values);
    return rows;
  }
  catch (err) {
    console.error('Get audit logs error:', err);
    throw err;
  }
}


export const updateUserEntry = async (yieldData: {
  username: string,
  county_state: string,
  crop_type: string,
  measurement_date: string,
  yieldacre: number
}) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction();
    
    const sql = 'UPDATE CropYield SET yieldacre = ? WHERE username = ? AND county_state = ? AND crop_type = ? AND measurement_date = ?';
    const values = [
      yieldData.yieldacre,
      yieldData.username,
      yieldData.county_state,
      yieldData.crop_type,
      yieldData.measurement_date
    ];
    
    const [result] = await connection.execute(sql, values);
    
    await connection.commit();
    return result;
  }
  catch (err) {
    await connection.rollback();
    console.error('Update yield error:', err);
    throw err; 
  } finally {
    connection.release();
  }
};


export const deleteUserEntry = async (yieldData: {
  username: string,
  crop_type: string,
  measurement_date: string,
  county_state: string
}) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction();
    
    const sql = 'DELETE FROM CropYield WHERE username = ? AND crop_type = ? AND measurement_date = ? AND county_state = ?';
    const values = [
      yieldData.username,
      yieldData.crop_type,
      yieldData.measurement_date,
      yieldData.county_state
    ];
    
    const [result] = await connection.execute(sql, values);
    
    await connection.commit();
    return result;
  }
  catch (err) {
    await connection.rollback();
    console.error('Delete yield error:', err);
    throw err; 
  } finally {
    connection.release();
  }
};

export const getSoilData = async (county_state: string) => {
  // method to get soil data for a specific county and state
  try {
    const sql = 'SELECT * FROM Soil WHERE county_state = ?';
    const values = [county_state];
    const rows = await query(sql, values);
    return rows; // Return the result of the query
  } catch (err) {
    console.error('Get soil data error:', err);
    throw err; 
  }
}
export const getAvailableDates = async (county_state: string) => {
  // method to get available measurement dates for a specific county and state
  try {
    const sql = 'SELECT DISTINCT measurement_date FROM Climate WHERE county_state = ?';
    const values = [county_state];
    const rows = await query(sql, values);
    return rows; // return the result of the query
  } catch (err) {
    console.error('Get available dates error:', err);
    throw err; 
  }
}
export const getClimateData = async (county_state: string, measurement_date: string) => {
  // method to get climate data for a specific county, state, and measurement date
  try {
    const sql = 'SELECT * FROM Climate WHERE county_state = ? AND measurement_date = ?';
    const values = [county_state, measurement_date];
    const rows = await query(sql, values);
    return rows; // return the result of the query
  } catch (err) {
    console.error('Get climate data error:', err);
    throw err; 
  }
}
export const cropAdvancedQuery = async (username: string) => {
  // advanced query #1, this is in a transaction whose isolation level is REPEATABLE READ
  // we set it to this isolation level to prevent phantom reads
  const connection = await pool.getConnection(); // Get a connection from the pool
  try {
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction(); // Start the transaction

    const sql = `
      SELECT 
          CY.username,
          CY.county_state,
          AVG(CY.yieldacre) AS avg_yield,
          AR.avg_precipitation
      FROM 
          CropYield CY
      JOIN (
          SELECT 
              county_state,
              AVG(precipitation) AS avg_precipitation
          FROM 
              Climate
          GROUP BY 
              county_state
      ) AR ON CY.county_state = AR.county_state
      WHERE 
          CY.username = ?
      GROUP BY 
          CY.username, CY.county_state, AR.avg_precipitation;
    `;
    const values = [username];
    const [rows] = await connection.execute(sql, values);

    console.log('Crop advanced query result:', rows);

    await connection.commit(); // commit the transaction
    return rows; // return the result of the query
  } catch (err) {
    await connection.rollback(); // rollback the transaction in case of an error
    console.error('Crop advanced query error:', err);
    throw err; 
  } finally {
    connection.release(); // release the connection
  }
};

export const getAvgEnvData = async (countyState: string) => {
  // advanced query #2, this is in a transaction whose isolation level is REPEATABLE READ
  // we set it to this isolation level to prevent phantom reads
  const connection = await pool.getConnection(); // Get a connection from the pool
  try {
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction(); // start the transaction

    const sql_query = `
      SELECT
        Soil.county_state,
        AVG(precipitation) AS avg_precipitation,
        AVG(ph) AS avg_pH_water
      FROM Soil
      JOIN Climate ON Soil.county_state = Climate.county_state
      WHERE Soil.county_state = Climate.county_state AND Soil.county_state = ?
      GROUP BY Soil.county_state;
    `;
    const [rows] = await connection.execute(sql_query, [countyState]);

    console.log('Average environmental data:', rows);

    await connection.commit(); // commit the transaction
    return rows; // return the result of the query
  } catch (err) {
    await connection.rollback(); // rollback the transaction in case of an error
    console.error('Get average environmental data error:', err);
    throw err; 
  } finally {
    connection.release(); // release the connection 
  }
};

export const getAdminCropComparison = async (username: string, countyState: string) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction();
    
    const sql_query = `CALL GetCropComparison(?, ?)`;
    const [rows] = await connection.execute(sql_query, [username, countyState]);
    
    // return first 2 rows
    const firstTwoRows = (rows as any[]).slice(0, 2);
    
    await connection.commit();
    return firstTwoRows;
  } catch (err) {
    await connection.rollback();
    console.error('GetCropComparison error:', err);
    throw err;
  } finally {
    connection.release();
  }
};