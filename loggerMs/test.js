// test.js (instrumented)
const amqp = require("amqplib");

async function runTest() {
  const url = process.env.AMQP_URL || "amqp://localhost";
  let conn;
  try {
    console.log("Connecting to", url);
    conn = await amqp.connect(url, { heartbeat: 30 });

    conn.on("error", (err) => {
      console.error("CONNECTION ERROR:", err && err.stack ? err.stack : err);
    });
    conn.on("close", () => {
      console.warn("CONNECTION CLOSED");
    });

    console.log("Connected, creating confirm channel...");
    const ch = await conn.createConfirmChannel();

    ch.on("error", (err) => {
      console.error("CHANNEL ERROR:", err && err.stack ? err.stack : err);
    });
    ch.on("close", () => {
      console.warn("CHANNEL CLOSED");
    });

    const exchange = "test-exchange";
    await ch.assertExchange(exchange, "direct", { durable: false });

    const payload = { text: "Hello from Node.js test", ts: new Date().toISOString() };
    console.log("Publishing message to exchange:", exchange);

    ch.publish(exchange, "test", Buffer.from(JSON.stringify(payload)), {}, (err, ok) => {
      if (err) {
        console.error("PUBLISH CALLBACK ERROR:", err);
      } else {
        console.log("PUBLISH OK");
      }
      // close channel and connection after a short delay to allow confirms/handshake
      setTimeout(async () => {
        try {
          await ch.close();
          console.log("Channel closed.");
        } catch (e) {
          console.warn("Channel close error:", e);
        }
        try {
          await conn.close();
          console.log("Connection closed.");
        } catch (e) {
          console.warn("Connection close error:", e);
        }
        process.exit(err ? 1 : 0);
      }, 200);
    });

  } catch (err) {
    console.error("TOP-LEVEL ERROR:", err && err.stack ? err.stack : err);
    if (conn) {
      try { await conn.close(); } catch(e) {}
    }
    process.exit(1);
  }
}

runTest();
