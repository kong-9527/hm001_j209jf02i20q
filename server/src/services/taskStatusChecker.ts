import axios from 'axios';
import { Sequelize, Op } from 'sequelize';
import GardenDesign from '../models/GardenDesign';

// API配置
const API_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks';
const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-93f08f8aec02495ebad527ed5c2a7d8c'; // 从环境变量获取API密钥
const MAX_RETRIES = 3; // 最大重试次数
const RETRY_DELAY = 1000; // 重试延迟（毫秒）
const TIMEOUT = 10000; // 请求超时（毫秒）
const MAX_RUNNING_TIME = 60 * 60 * 1000; // 任务最长运行时间（1小时）

/**
 * 带重试机制的发送请求
 * @param url 请求URL
 * @param headers 请求头
 * @param retries 剩余重试次数
 * @returns 响应数据或null
 */
async function sendRequestWithRetry(url: string, headers: any, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await axios.get(url, { 
      headers,
      timeout: TIMEOUT 
    });
    return response.data;
  } catch (error: any) {
    // 如果是请求超时或网络错误，且还有重试机会，则进行重试
    if ((axios.isAxiosError(error) && 
        (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || !error.response)) && 
        retries > 0) {
      console.log(`请求失败，将在 ${RETRY_DELAY}ms 后重试，剩余重试次数: ${retries-1}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendRequestWithRetry(url, headers, retries - 1);
    }
    
    // 如果是服务器错误（5xx），也进行重试
    if (axios.isAxiosError(error) && error.response && error.response.status >= 500 && retries > 0) {
      console.log(`服务器错误 ${error.response.status}，将在 ${RETRY_DELAY}ms 后重试，剩余重试次数: ${retries-1}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendRequestWithRetry(url, headers, retries - 1);
    }
    
    // 打印详细错误信息
    console.error('请求失败:');
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`状态码: ${error.response.status}`);
        console.error('响应数据:', error.response.data);
      } else if (error.request) {
        console.error('请求已发送但未收到响应');
        console.error(error.request);
      } else {
        console.error('请求配置错误:', error.message);
      }
      console.error('请求配置:', error.config);
    } else {
      console.error('未知错误:', error);
    }
    
    return null;
  }
}

/**
 * 根据task_id获取任务状态和结果
 * @param taskId 任务ID
 * @returns 任务结果或null
 */
async function getTaskResult(taskId: string) {
  try {
    const url = `${API_BASE_URL}/${taskId}`;
    
    const headers = {
      'Authorization': `Bearer ${API_KEY}`
    };
    
    console.log(`正在请求任务状态: ${taskId}`);
    const result = await sendRequestWithRetry(url, headers);
    
    if (!result) {
      console.error(`获取任务结果失败: ${taskId}`);
      return null;
    }
    
    console.log(`任务状态:`, result.status || '未知');
    
    // 检查任务状态
    if (result.status === 'FAILED') {
      console.error(`任务失败: ${taskId}, 错误信息:`, result.error || '未知错误');
      // 返回特殊值表示任务失败
      return 'FAILED';
    }
    
    // 检查任务结果中是否有图片URL
    if (result.output && result.output.results && result.output.results.length > 0) {
      const imgUrl = result.output.results[0].url;
      console.log(`获取到图片URL: ${imgUrl}`);
      return imgUrl;
    } else {
      console.log(`任务 ${taskId} 尚未完成或未找到图片URL`);
      return null;
    }
  } catch (error) {
    console.error(`获取任务结果时发生异常: ${error}`);
    return null;
  }
}

/**
 * 检查任务是否已经运行太长时间
 * @param design GardenDesign记录
 * @returns 是否运行太长时间
 */
function isTaskRunningTooLong(design: any): boolean {
  if (!design.ctime) return false;
  
  const creationTime = design.ctime * 1000; // 转换为毫秒
  const currentTime = Date.now();
  const runningTime = currentTime - creationTime;
  
  if (runningTime > MAX_RUNNING_TIME) {
    console.log(`任务 ${design.id} 运行时间过长: ${Math.round(runningTime / 60000)} 分钟`);
    return true;
  }
  
  return false;
}

/**
 * 检查并更新未完成的garden_design记录
 */
async function checkPendingTasks() {
  try {
    console.log('开始检查未完成的garden_design任务...');
    
    // 查找状态为"生成中"，未删除，且有第三方任务ID的记录
    const pendingDesigns = await GardenDesign.findAll({
      where: {
        status: 1, // 1代表生成中
        is_del: 0, // 未删除
        third_task_id: {
          [Op.not]: null, // third_task_id不为空
          [Op.ne]: ''     // third_task_id不为空字符串
        }
      }
    });
    
    console.log(`找到 ${pendingDesigns.length} 个待处理任务`);
    
    // 遍历每个任务并检查状态
    for (const design of pendingDesigns) {
      const taskId = design.third_task_id;
      
      if (!taskId) {
        console.log(`任务ID为空，跳过: ${design.id}`);
        continue;
      }
      
      console.log(`处理任务ID: ${taskId}, 设计ID: ${design.id}`);
      
      // 检查任务是否运行时间过长
      if (isTaskRunningTooLong(design)) {
        console.log(`任务 ${design.id} 运行时间过长，标记为失败`);
        await design.update({
          status: 3, // 3代表生成失败
          utime: Math.floor(Date.now() / 1000)
        });
        continue;
      }
      
      // 获取任务结果
      const result = await getTaskResult(taskId);
      
      // 处理不同的结果
      if (result === 'FAILED') {
        // 任务失败
        console.log(`设计ID ${design.id} 的任务已失败，更新状态`);
        await design.update({
          status: 3, // 3代表生成失败
          utime: Math.floor(Date.now() / 1000)
        });
      } else if (result) {
        // 任务成功，获取到了图片URL
        console.log(`更新设计ID ${design.id} 的状态和图片URL`);
        
        // 更新记录
        await design.update({
          status: 2,                       // 2代表生成成功
          pic_result: result,              // 保存图片URL
          utime: Math.floor(Date.now() / 1000) // 更新10位时间戳
        });
        
        console.log(`设计ID ${design.id} 更新完成`);
      } else {
        // 任务仍在处理中
        console.log(`设计ID ${design.id} 的任务尚未完成，等待下次检查`);
      }
    }
    
    console.log('完成本轮任务检查');
  } catch (error) {
    console.error(`检查任务时出错: ${error}`);
    // 出错时不会中断服务，等待下一次定时调用
  }
}

/**
 * 启动任务检查器服务
 */
export function startTaskChecker() {
  console.log('启动garden_design任务状态检查服务');
  
  // 立即执行一次
  checkPendingTasks().catch(err => {
    console.error('首次执行任务检查时出错:', err);
  });
  
  // 设置每10秒执行一次
  const intervalId = setInterval(() => {
    checkPendingTasks().catch(err => {
      console.error('执行任务检查时出错:', err);
    });
  }, 10000);
  
  // 返回停止函数，以便需要时可以停止服务
  return function stopTaskChecker() {
    clearInterval(intervalId);
    console.log('garden_design任务状态检查服务已停止');
  };
}

// 导出服务启动函数
export default startTaskChecker; 