const ModbusRTU = require("modbus-serial");
const mysql = require("mysql2/promise");
const Long = require("long");

const client = new ModbusRTU();
const HOST = "10.14.139.128";
const PORT = 4111;

//Tegangannnnnnnnn
const ADDRESS_1 = 778; //VR
const ADDRESS_2 = 779; //VS
const ADDRESS_3 = 780; //VT

//arus=======================================
const ADDRESS_4 = 773; //IR
const ADDRESS_5 = 774; //IS
const ADDRESS_6 = 775; //IT

//RATA-RATA==================================
const ADDRESS_7 = 781; //V_AVG
const ADDRESS_8 = 772; //I_AVG

//Frequency
const ADDRESS_9 = 790; //Freq
//power Factor
const ADDRESS_10 = 789; //Power Factor

// Unbalance
const ADDRESS_11 = 925; //I Unbalance
const ADDRESS_12 = 927; //V Unbalance

//kwh
const ADDRESS_13 = 1280; //
const ADDRESS_14 = 791; //KWh

//apparent power
const ADDRESS_15 = 806; //KWh

//Energy Del
const ADDRESS_16 = 1388; //KWh

//THDV
const ADDRESS_17 = 2560; //thd v1
const ADDRESS_18 = 2562; //thd v2
const ADDRESS_19 = 2563; //thd v3

//THD I
const ADDRESS_20 = 3072; //thd I1
const ADDRESS_21 = 3073; //thd I2
const ADDRESS_22 = 3074; //thd I3

//Tegangannn =================
const SLAVE_ID = 1;

// Database configuration
const DB_HOST = "localhost";
const DB_USER = "root";
const DB_PASSWORD = "";
const DB_DATABASE = "sdb";

const DB_TABLE = "realtime_sdb";
const DB_TABLE2 = "permenit_sdb1";

const DB_UPDATE_ID = 1;

async function connectToDatabase() {
  try {
    const pool = await mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("Connected to database");

    return pool;
  } catch (error) {
    console.error(`Error connecting to database: ${error}`);
    process.exit(1);
  }
}

async function insertValueIntoDatabase(
  pool,
  p_tot,
  i_avg,
  i_1,
  i_2,
  i_3,
  v_1,
  v_2,
  v_3,
  v_avg
) {
  try {
    const [rows, fields] = await pool.execute(
      `INSERT INTO ${DB_TABLE2} ( ptot, i_avg, i_1, i_2, i_3, v_1, v_2, v_3, v_avg) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p_tot, i_avg, i_1, i_2, i_3, v_1, v_2, v_3, v_avg]
    );

    // console.log(`Inserted values into database successfully`);
  } catch (error) {
    console.error(`Error inserting values into database: ${error}`);
  }
}

async function updateValueInDatabase(pool, value, column) {
  try {
    const roundedValue = parseFloat(value); // round value to one decimal place
    const timestamp = new Date().toISOString(); // get current timestamp in ISO format
    const [rows, fields] = await pool.execute(
      `UPDATE ${DB_TABLE} SET ${column} = ? WHERE id = ?`,
      [roundedValue, DB_UPDATE_ID]
    );

    // console.log(`Updated value ${value} in database with `);
  } catch (error) {
    console.error(`Error updating value in database: ${error}`);
  }
}

client.connectTCP(HOST, { port: PORT }).then(() => {
  // Set the slave ID to 1
  client.setID(SLAVE_ID);

  // Connect to the database
  connectToDatabase().then((pool) => {
    setInterval(() => {
      //Tegangan========================

      client.readHoldingRegisters(ADDRESS_1, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data V-R: ${err}`);
          process.exit(1);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readUInt16BE(0) / 10).toFixed(0);

          updateValueInDatabase(pool, value, "v_1");
        }
      });
      client.readHoldingRegisters(ADDRESS_2, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data V-S: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readUInt16BE(0) / 10).toFixed(0);

          updateValueInDatabase(pool, value, "v_2");
        }
      });

      client.readHoldingRegisters(ADDRESS_3, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data V-T: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readUInt16BE(0) / 10).toFixed(0);

          updateValueInDatabase(pool, value, "v_3");
        }
      });

      //Arus====================================
      client.readHoldingRegisters(ADDRESS_4, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data I-R: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readUInt16BE(0).toFixed(0);

          updateValueInDatabase(pool, value, "i_1");
        }
      });

      client.readHoldingRegisters(ADDRESS_5, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data I-S: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readUInt16BE(0).toFixed(0);

          updateValueInDatabase(pool, value, "i_2");
        }
      });

      client.readHoldingRegisters(ADDRESS_6, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data I-T: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readUInt16BE(0).toFixed(0);

          updateValueInDatabase(pool, value, "i_3");
        }
      });

      //RATA - RATA
      client.readHoldingRegisters(ADDRESS_7, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data V-AVG: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readUInt16BE(0) / 10).toFixed(0);

          updateValueInDatabase(pool, value, "v_avg");
        }
      });

      client.readHoldingRegisters(ADDRESS_8, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data I-AVG: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readUInt16BE(0).toFixed(0);

          updateValueInDatabase(pool, value, "i_avg");
        }
      });

      //Frequency
      client.readHoldingRegisters(ADDRESS_9, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data Freq: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readUInt16BE(0) / 10).toFixed(0);

          updateValueInDatabase(pool, value, "frequency");
        }
      });

      //KWH
      client.readHoldingRegisters(ADDRESS_13, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data Kwh: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readUInt16BE(0).toFixed();

          // updateValueInDatabase(pool, value, "i_1");
        }
      });

      //KWH
      client.readHoldingRegisters(ADDRESS_14, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data Kwh 2: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readUInt16BE(0).toFixed();

          // updateValueInDatabase(pool, value, "i_1");
        }
      });
    }, 1500);
  });
});

client.connectTCP(HOST, { port: PORT }).then(() => {
  // Set the slave ID to 1
  client.setID(SLAVE_ID);

  // Connect to the database
  connectToDatabase().then((pool) => {
    setInterval(() => {
      //Power Factor
      client.readHoldingRegisters(ADDRESS_10, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data Power Factor: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readUInt16BE(0) / 1000).toFixed(1);

          updateValueInDatabase(pool, value, "power_factor");
        }
      });

      //Unbalance
      client.readHoldingRegisters(ADDRESS_11, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data I Unbalance: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readUInt32BE() / 100).toFixed(1);

          updateValueInDatabase(pool, value, "current_unbalance");
        }
      });

      client.readHoldingRegisters(ADDRESS_12, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data V Unbalance: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readUInt32BE(0) / 100).toFixed(1);

          updateValueInDatabase(pool, value, "voltage_unbalance");
        }
      });

      //I THD=====================================================================

      client.readHoldingRegisters(ADDRESS_22, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data THD I3: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readInt16BE(0) / 10).toFixed(1);

          updateValueInDatabase(pool, value, "thd_i3");
        }
      });

      client.readHoldingRegisters(ADDRESS_21, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data THD I2: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readInt16BE(0) / 10).toFixed(1);

          updateValueInDatabase(pool, value, "thd_i2");
        }
      });

      client.readHoldingRegisters(ADDRESS_20, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data THD I1: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readInt16BE(0) / 10).toFixed(1);

          updateValueInDatabase(pool, value, "thd_i1");
        }
      });

      //V THD
      client.readHoldingRegisters(ADDRESS_19, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data THD V3: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readInt16BE(0) / 10).toFixed(1);

          updateValueInDatabase(pool, value, "thd_v3");
        }
      });

      client.readHoldingRegisters(ADDRESS_18, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data THD V2: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readInt16BE(0) / 10).toFixed(1);

          updateValueInDatabase(pool, value, "thd_v2");
        }
      });

      client.readHoldingRegisters(ADDRESS_17, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data THD V1: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = (buffer.readInt16BE(0) / 10).toFixed(1);

          updateValueInDatabase(pool, value, "thd_v1");
        }
      });

      //Apparent Energy
      client.readHoldingRegisters(ADDRESS_16, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data Apparent Energy: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readInt32BE(0).toFixed();

          updateValueInDatabase(pool, value, "energy");
        }
      });

      //Apparent Power
      client.readHoldingRegisters(ADDRESS_15, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data Apparent Power: ${err}`);
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readUInt16BE(0).toFixed();

          updateValueInDatabase(pool, value, "power");
        }
      });
    }, 1000);

    //Insert Data Permenit
  });
});

client
  .connectTCP(HOST, { port: PORT })
  .then(() => {
    // Set the slave ID to 1
    client.setID(SLAVE_ID);

    // Connect to the database
    connectToDatabase().then((pool) => {
      setInterval(() => {
        client.readHoldingRegisters(ADDRESS_1, 2, function (err, data) {
          if (err) {
            console.error(`Error reading data: ${err}`);
          } else {
            const buffer = Buffer.from(data.buffer);
            const gas_used = buffer.readFloatBE();

            client.readHoldingRegisters(ADDRESS_2, 2, function (err, data) {
              if (err) {
                console.error(`Error reading data: ${err}`);
              } else {
                const buffer = Buffer.from(data.buffer);
                const gas_consumption = buffer.readUInt32BE();

                // Insert the values into the database
                const now = new Date();
                const hour = now.getHours();
                const minute = now.getMinutes();
                const second = now.getSeconds();

                let valueInserted = false;

                // if (
                //   hour === 8 &&
                //   minute === 27 &&
                //   second === 0 &&
                //   !valueInserted
                // ) {
                //   insertValueIntoDatabaseAkhir(
                //     pool,
                //     "Striko 1",
                //     gas_used,
                //     gas_consumption
                //   );
                // } else if (hour !== 8 || minute !== 27 || second !== 59) {
                //   valueInserted = false;
                // }
              }
            });
          }
        });
      }, 2000000000);
    });
  })

  .catch((error) => {
    console.error(`Error connecting to Modbus TCP server: ${error}`);
    process.exit(1);
  });
