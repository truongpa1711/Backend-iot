import Devices from "../models/Devices.js";
import mqttClient from "../services/mqtt.js";

export const filterDevice = async (req, res) => {
  try {
    const device = req.query.device;
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 

    const start = req.query.start ? parseDate(req.query.start) : null; 
    const end = req.query.end ? parseDate(req.query.end) : null; 
    const specificTimestamp = req.query.timestamp
      ? parseDate(req.query.timestamp)
      : null; 
    const sort = req.query.sort === "true" ? 1 : -1;
    const query = {};
    
    if (device) {
      if (["fan", "ac", "light"].includes(device)) {
        query[device] = { $ne: "" };
      } else {
        return res.status(400).json({ message: "Invalid device type" });
      }
    }
    
    if (specificTimestamp) {
      query.timestamp = { $eq: specificTimestamp };
    } else {
      if (start) {
        query.timestamp = { ...query.timestamp, $gte: start }; 
      }
      if (end) {
        query.timestamp = { ...query.timestamp, $lte: end };
      }
    }

    const devices = await Devices.find(query)
      .sort({ timestamp: sort })
      .limit(limit)
      .skip((page - 1) * limit); 

    const totalDevices = await Devices.countDocuments(query); 
    const totalPages = Math.ceil(totalDevices / limit); 

    return res.status(200).json({
      devices,
      totalDevices,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Yêu cầu đúng fomat" });
  }
};

export const controlDevices=(req,res)=>{
  const controlData = req.body.mes;
  console.log(controlData)
  mqttClient.publish("home/control", JSON.stringify(controlData), (err) => {
    if (err) {
      console.error("Error publishing control data:", err);
      return res.status(500).json({ message: "Failed to publish control data." });
    }
    console.log("Published to control");
    return res.status(200).json({ message: "Control data published successfully." });
  });
  
}

const parseDate = (input) => {
  const [time, date] = input.split(" ");
  const [hours, minutes, secondsWithMilliseconds] = time.split(":");
  const [seconds, milliseconds] = secondsWithMilliseconds.split(",");

  const ms = milliseconds || "000";
  let [day, month, year] = date.split("/").map(Number); // Convert to numbers

  // Adjust hours for UTC+0
  let utcHours = hours - 7;
  let adjustedDay = day;
  let adjustedMonth = month;
  let adjustedYear = year;

  if (utcHours < 0) {
    utcHours += 24; // Wrap around if negative
    adjustedDay -= 1; // Decrement the day

    // Handle month and year adjustment
    if (adjustedDay < 1) {
      adjustedMonth -= 1; // Decrement the month
      if (adjustedMonth < 1) {
        adjustedMonth = 12; // Wrap to December
        adjustedYear -= 1; // Decrement the year
      }
      // Calculate the last day of the previous month
      adjustedDay = new Date(adjustedYear, adjustedMonth, 0).getDate();
    }
  }

  const dateString = `${adjustedYear}-${String(adjustedMonth).padStart(
    2,
    "0"
  )}-${String(adjustedDay).padStart(2, "0")}T${String(utcHours).padStart(
    2,
    "0"
  )}:${minutes}:${seconds}.${ms}Z`;
  return dateString;
};
