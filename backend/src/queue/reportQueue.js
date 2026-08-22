const { Queue } = require("bullmq");
const connection = require("../config/redis");

const reportQueue = new Queue("report-processing", { connection });

module.exports = reportQueue;
