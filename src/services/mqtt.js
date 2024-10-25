import mqtt from "mqtt";
import Data from "../models/Data.js";
import Devices from "../models/Devices.js";

const options = {
  username: "phamanhtruong",
  password: "b21dccn741",
};

const mqttClient = mqtt.connect("mqtt://localhost:1994", options);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  
  mqttClient.subscribe("data", (err) => {
    if (!err) {
      console.log("Subscribed to data");
    }
  });

  mqttClient.subscribe("control", (err) => {
    if (!err) {
      console.log("Subscribed to control");
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  try {
    const parsedMessage = JSON.parse(message.toString());
    
    if (topic === "data") {
      const data = new Data({
        temperature: parsedMessage.temperature,
        humidity: parsedMessage.humidity,
        brightness: parsedMessage.brightness,
        timestamp: new Date(),
      });
      // await data.save();
      // console.log("Sensor data saved to MongoDB");
    }

    if (topic === "control") {
      console.log(parsedMessage);
      const historyEvent = {
        fan: parsedMessage.fan !== undefined ? parsedMessage.fan : "", 
        ac: parsedMessage.ac !== undefined ? parsedMessage.ac : "",
        light: parsedMessage.light !== undefined ? parsedMessage.light : "",
        timestamp: new Date(),
      };
      const history = new Devices(historyEvent);
      console.log(history);
      await history.save();
      console.log("Device history saved to MongoDB");
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

export default mqttClient;
