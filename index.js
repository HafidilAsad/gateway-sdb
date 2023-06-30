const Readline = require("@serialport/parser-readline");
const { SerialPort } = require("serialport");

const port = new SerialPort(
  "COM4",
  {
    baudRate: 9600,
    stopBits: 1,
    parity: "even",
  },
  (err) => {
    if (err != null) {
      console.log(err);
      return;
    }
  }
);

const parser = port.pipe(new Readline({ delimiter: "\r\n" }));

port.on("open", () => {
  console.log("Serial port is open");

  port.on("data", (data) => {
    console.log("Received data:", data);

    // Check if the received data is a Modbus request
    if (data.toString().startsWith("01 03 00 00")) {
      // This is a Modbus request to read holding register 0
      const slaveId = data.readUInt8(1);
      const address = data.readUInt16BE(3);
      const quantity = data.readUInt16BE(5);

      // Check if the request matches the desired slave ID and address
      if (slaveId === 1 && address === 0 && quantity === 1) {
        // Create the Modbus response
        const response = Buffer.alloc(5);
        response.writeUInt8(slaveId, 0);
        response.writeUInt8(quantity * 2, 1); // Response length
        response.writeUInt16BE(123, 2); // Holding register value

        port.write(response);
      }
    }
  });
});

port.on("error", (err) => {
  console.error("Error:", err.message);
});
