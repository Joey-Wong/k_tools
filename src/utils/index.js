export const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err]);
export const getFileInfo = (filePath) => {
  // 找到最后一个斜杠的索引
  const lastSlashIndex = filePath.lastIndexOf("/");
  // 获取所在路径
  const directory = filePath.slice(0, lastSlashIndex);
  // 获取文件名
  const fullFileName = filePath.slice(lastSlashIndex + 1);
  // 找到文件名中最后一个点的索引
  const lastDotIndex = fullFileName.lastIndexOf(".");
  // 获取文件后缀，如果没有点则为空字符串
  const fileExtension = lastDotIndex !== -1 ? fullFileName.slice(lastDotIndex + 1) : "";
  // 获取不包含后缀的文件名
  const fileNameWithoutExtension = lastDotIndex !== -1 ? fullFileName.slice(0, lastDotIndex) : fullFileName;
  return {
    ext: fileExtension,
    name: fileNameWithoutExtension,
    dir: directory,
  };
};

// 00:54:56.32 -> 秒
export const formatToSeconds = (timeStr) => {
  // 分割时间字符串
  const [hoursStr, minutesStr, secondsAndMsStr] = timeStr.split(":");
  const [secondsStr, msStr] = secondsAndMsStr.split(".");
  // 将字符串转换为数字
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const seconds = parseInt(secondsStr, 10);
  const ms = msStr ? parseInt(msStr, 10) : 0;
  // 计算总秒数
  return hours * 3600 + minutes * 60 + seconds + ms / 1000;
};

export const getVideoInfo = (src) => {
  return new Promise((resolve, reject) => {
    // 创建 video 元素
    const video = document.createElement("video");
    video.src = src;

    // 定义一个移除 video 元素的函数
    const removeVideoElement = () => {
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    };

    // 监听 loadedmetadata 事件，当视频元数据加载完成时触发
    video.addEventListener("loadedmetadata", () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;
      // 移除 video 元素
      removeVideoElement();
      // 解析 Promise 并返回视频信息
      resolve({ width, height, duration });
    });

    // 监听 error 事件，当视频加载出错时触发
    video.addEventListener("error", () => {
      // 移除 video 元素
      removeVideoElement();
      // 拒绝 Promise 并抛出错误
      reject(new Error("Failed to load video metadata"));
    });

    // 将 video 元素添加到 body 中
    document.body.appendChild(video);
  });
};

export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
