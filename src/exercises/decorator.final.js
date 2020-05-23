const runInBatch = (command, batchSize = 2) => {
  let pendingQueue = [];

  return (data) => {
    pendingQueue.push(() => command(data));

    if (pendingQueue.length >= batchSize) {
      const runNow = [...pendingQueue];
      pendingQueue = [];
      runNow.forEach((run) => {
        run();
      });
    }
  };
};

module.exports = { runInBatch };
