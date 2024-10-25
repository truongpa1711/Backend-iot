import Data from "../models/Data.js";

export const getAllData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const start = req.query.start ? parseDate(req.query.start) : null;
    const end = req.query.end ? parseDate(req.query.end) : null;
    const specificTimestamp = req.query.timestamp ? parseDate(req.query.timestamp) : null;
    if (specificTimestamp && ((start && specificTimestamp < start) || (end && specificTimestamp > end))) {
      return res.status(400).json({ message: 'specificTimestamp must be between start and end.' });
    }

    const sort = {};
    if (req.query.sorttemperature) sort.temperature = req.query.sorttemperature === "true" ? 1 : -1;
    if (req.query.sorthumidity) sort.humidity = req.query.sorthumidity === "true" ? 1 : -1;
    if (req.query.sortbrightness) sort.brightness = req.query.sortbrightness === "true" ? 1 : -1;
    if (req.query.sorttimestamp) sort.timestamp = req.query.sorttimestamp === "true" ? 1 : -1;
 
    const query = {};
    if (req.query.temperature) {
      query.temperature = parseFloat(req.query.temperature);
    }
    if (req.query.humidity) {
      query.humidity = parseFloat(req.query.humidity);
    }
    if (req.query.brightness) {
      query.brightness = parseFloat(req.query.brightness);
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
    
    const data = await Data.find(query).sort(sort).skip(skip).limit(limit);
    const count = await Data.countDocuments(query);

    res.json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLatestData = async (req, res) => {
  try {
    const latestData = await Data.find().sort({ timestamp: -1 }).limit(20);
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
