// const timeToSeconds=(timeStr)=> {
//     const timeParts = timeStr.split(":");
//     const hours = parseInt(timeParts[0]);
//     const minutes = parseInt(timeParts[1]);
//     const seconds = parseInt(timeParts[2]);

//     return (hours * 3600) + (minutes * 60) + seconds;
// }

// module.exports={timeToSeconds}

const timeToSeconds = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return NaN;

    const timeParts = timeStr.split(":");
    const hours = timeParts[0] ? parseInt(timeParts[0]) : 0;
    const minutes = timeParts[1] ? parseInt(timeParts[1]) : 0;
    const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;

    return (hours * 3600) + (minutes * 60) + seconds;
};

module.exports = { timeToSeconds };

// const timeToSeconds = (timeStr) => {
//     const timeParts = timeStr.split(":");
//     const hours = timeParts[0] ? parseInt(timeParts[0]) : 0;
//     const minutes = timeParts[1] ? parseInt(timeParts[1]) : 0;
//     const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;

//     console.log("timeStr", minutes, seconds);
//     return (hours * 3600) + (minutes * 60) + seconds;
// }
// module.exports = { timeToSeconds }
