import { Request, Response } from 'express';
import GardenDesign from '../models/GardenDesign';
import User from '../models/User';
import UserOrder from '../models/UserOrder';
import PointsLog from '../models/PointsLog';
import { getUserIdFromRequest } from '../utils/auth';
import axios from 'axios';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import gardenStylesData, { commonGardenPrompts, commonRenderingPrompts } from '../data/gardenStyles';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Add WordTag interface definition
interface WordTag {
  id: number | string;
  text: string;
}

/**
 * Get current user's garden design images for a project
 * @route GET /api/garden-designs
 */
export const getGardenDesigns = async (req: Request, res: Response) => {
  try {
    console.log('API call received: GET /api/garden-designs');
    console.log('Request query:', req.query);
    console.log('Request user:', req.user);
    
    // Get user ID from request
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get project ID from query and convert to number
    const { project_id, is_del, is_like } = req.query;
    console.log('Raw project_id from query:', project_id);
    console.log('Raw is_del from query:', is_del);
    console.log('Raw is_like from query:', is_like);
    
    if (!project_id) {
      console.log('Validation failed: Missing project_id');
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Convert project_id to number
    const projectId = Number(project_id);
    console.log('Converted projectId:', projectId);
    
    if (isNaN(projectId)) {
      console.log('Validation failed: Invalid project_id format');
      return res.status(400).json({ error: 'Project ID must be a number' });
    }
    
    // Build query conditions
    const whereCondition: any = {
      user_id,
      project_id: projectId,
    };
    
    // If is_del parameter is provided, add it to query conditions
    if (is_del !== undefined) {
      whereCondition.is_del = Number(is_del);
    }
    
    // If is_like parameter is provided, add it to query conditions
    if (is_like !== undefined) {
      whereCondition.is_like = Number(is_like);
    }
    
    console.log('Executing database query with params:', whereCondition);
    
    // Query database to get garden design images
    const gardenDesigns = await GardenDesign.findAll({
      where: whereCondition,
      order: [
        ['ctime', 'DESC'] // Sort by creation time in descending order
      ]
    });
    
    console.log(`Query result: Found ${gardenDesigns.length} garden designs`);
    
    return res.status(200).json(gardenDesigns);
  } catch (error) {
    console.error('Error fetching garden designs:', error);
    return res.status(500).json({ error: 'Failed to fetch garden designs' });
  }
};

/**
 * Update garden design image like status
 * @route PUT /api/garden-designs/:id/like
 */
export const updateLikeStatus = async (req: Request, res: Response) => {
  try {
    console.log('API call received: PUT /api/garden-designs/:id/like');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    // Get user ID from request
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get image ID
    const { id } = req.params;
    const designId = Number(id);
    
    if (isNaN(designId)) {
      console.log('Validation failed: Invalid design ID format');
      return res.status(400).json({ error: 'Design ID must be a number' });
    }
    
    // Get like status to set
    const { is_like } = req.body;
    
    if (is_like === undefined || ![0, 1].includes(Number(is_like))) {
      console.log('Validation failed: Invalid like status');
      return res.status(400).json({ error: 'is_like must be 0 or 1' });
    }
    
    // Find the image and ensure it belongs to the current user
    const gardenDesign = await GardenDesign.findOne({
      where: {
        id: designId,
        user_id
      }
    });
    
    if (!gardenDesign) {
      console.log('Design not found or does not belong to user');
      return res.status(404).json({ error: 'Garden design not found' });
    }
    
    // Update like status
    await gardenDesign.update({ is_like: Number(is_like) });
    
    console.log(`Updated design ${designId} like status to ${is_like}`);
    
    return res.status(200).json(gardenDesign);
  } catch (error) {
    console.error('Error updating garden design like status:', error);
    return res.status(500).json({ error: 'Failed to update garden design like status' });
  }
};

/**
 * Soft delete garden design image (mark as deleted)
 * @route PUT /api/garden-designs/:id/delete
 */
export const softDeleteDesign = async (req: Request, res: Response) => {
  try {
    console.log('API call received: PUT /api/garden-designs/:id/delete');
    console.log('Request params:', req.params);
    
    // Get user ID from request
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get image ID
    const { id } = req.params;
    const designId = Number(id);
    
    if (isNaN(designId)) {
      console.log('Validation failed: Invalid design ID format');
      return res.status(400).json({ error: 'Design ID must be a number' });
    }
    
    // Find the image and ensure it belongs to the current user
    const gardenDesign = await GardenDesign.findOne({
      where: {
        id: designId,
        user_id
      }
    });
    
    if (!gardenDesign) {
      console.log('Design not found or does not belong to user');
      return res.status(404).json({ error: 'Garden design not found' });
    }
    
    // Update delete status to deleted (is_del=1)
    await gardenDesign.update({ is_del: 1 });
    
    console.log(`Soft deleted design ${designId}`);
    
    return res.status(200).json(gardenDesign);
  } catch (error) {
    console.error('Error deleting garden design:', error);
    return res.status(500).json({ error: 'Failed to delete garden design' });
  }
};

/**
 * Generate garden design image
 * @route POST /api/garden-designs/generate
 */
export const generateDesign = async (req: Request, res: Response) => {
  try {
    console.log('API call received: POST /api/garden-designs/generate');
    console.log('Request body:', req.body);
    
    // Get user ID from request
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if BFL API key is configured
    const BFL_API_KEY = process.env.BFL_API_KEY;
    if (!BFL_API_KEY) {
      console.error('Environment variable BFL_API_KEY is not set');
      return res.status(500).json({ error: 'API configuration error' });
    }

    // Create current date, only year-month-day part
    const now = new Date();
    // Convert date to YYYY-MM-DD format string
    const todayStr = now.toISOString().split('T')[0];
    // Create Date object with only date
    const today = new Date(todayStr);
    
    console.log('Today\'s date (string format):', todayStr);
    console.log('Today\'s date (Date object):', today);

    // Check if user has active subscription
    const activeSubscription = await UserOrder.findOne({
      where: {
        user_id,
        member_start_date: {
          [Op.lte]: today // Start date less than or equal to current date
        },
        member_end_date: {
          [Op.gte]: today // End date greater than or equal to current date
        }
      }
    });

    // Debug logs
    console.log('Subscription query conditions:', {
      user_id,
      'member_start_date <=': todayStr,
      'member_end_date >=': todayStr,
      'Date object': today
    });

    if (!activeSubscription) {
      console.log('No active subscription for user:', user_id);
      return res.status(403).json({ 
        error: 'No active subscription',
        message: 'There are no active subscriptions, please check the annual discount subscription information.'
      });
    } else {
      console.log('Found active subscription:', {
        id: activeSubscription.id,
        start_date: activeSubscription.member_start_date,
        end_date: activeSubscription.member_end_date
      });
    }

    // Check if user points are sufficient
    const user = await User.findByPk(user_id);
    if (!user) {
      console.log('User not found:', user_id);
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user points are sufficient
    const userPoints = parseInt(user.points || '0', 10);
    if (userPoints < 1) {
      console.log('Insufficient points for user:', user_id);
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    // Get request parameters
    const { 
      imageUrl, 
      size, 
      styleType, 
      positiveWords, 
      negativeWords, 
      structuralSimilarity,
      projectId 
    } = req.body;
    
    // Parameter validation
    if (!imageUrl || !size || !styleType || !projectId) {
      console.log('Validation failed: Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Parse parameters
    let finalPrompt = '';  // Final prompt to send to API
    let finalNegativePrompt = ''; // Final negative prompt to send to API
    let style_id = '';  // Style ID
    let style_name = ''; // Style name
    let positiveWordsArr: WordTag[] = []; // Positive words array
    let negativeWordsArr: WordTag[] = []; // Negative words array

    // Limit number of words in each type group
    const MAX_STYLE_WORDS = 5;
    const MAX_COMMON_GARDEN_WORDS = 5;
    const MAX_COMMON_RENDERING_WORDS = 5;

    // Different processing based on styleType
    if (styleType === 'Classic styles') {
      // Classic styles: Use style name to find preset style
      style_name = positiveWords; // Style name saved in positiveWords
      
      // Find corresponding style in gardenStylesData
      const styleIndex = gardenStylesData.findIndex((style: any) => style.name === style_name);
      
      if (styleIndex !== -1) {
        style_id = (styleIndex + 1).toString(); // Style ID is index+1
        
        // Get preset positive and negative words for this style
        const stylePositivePrompts = gardenStylesData[styleIndex].positivePrompts;
        const styleNegativePrompts = gardenStylesData[styleIndex].negativePrompts;
        const styleDescription = gardenStylesData[styleIndex].description || "";
        
        // Format prompt according to new template
        finalPrompt = `Please change the design style of the garden space in the picture to ${style_name}. The main features of this style are: ${styleDescription}.`;
        
        // Save original words for database record
        positiveWordsArr = stylePositivePrompts.split(',')
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        // If there are negative words, add them to negativeWordsArr
        if (styleNegativePrompts) {
          negativeWordsArr = styleNegativePrompts.split(',')
            .map((text: string) => ({
            id: Date.now() + Math.random(),
            text: text.trim()
          }));
        }
      } else {
        console.log('Style not found:', style_name);
        return res.status(400).json({ error: 'Invalid style name' });
      }
    } else if (styleType === 'Custom styles') {
      // Custom styles: Parse user-provided custom words
      style_id = '99'; // 99 represents Custom styles
      style_name = 'custom style';

      try {
        // Process user-provided positive and negative words (already comma-separated strings)
        const hasPositiveWords = positiveWords && positiveWords.trim().length > 0;
        const hasNegativeWords = negativeWords && negativeWords.trim().length > 0;
        
        // Format prompt based on whether positive and negative words are available
        if (hasPositiveWords && hasNegativeWords) {
          finalPrompt = `Please adjust this picture according to the following requirements: 1. Add these elements "${positiveWords}" on the basis of the original picture; 2. At the same time, please do not include these elements in the generated new image: "${negativeWords}"`;
        } else if (hasPositiveWords) {
          finalPrompt = `Please adjust this picture according to the following requirements: Add these elements "${positiveWords}" on the basis of the original picture;`;
        } else if (hasNegativeWords) {
          finalPrompt = `Please adjust this picture according to the following requirements: please do not include these elements in the generated new image: "${negativeWords}"`;
        } else {
          // If user didn't provide any words, use default prompt
          finalPrompt = "Please adjust and optimize this garden picture to make it more beautiful and professional.";
        }
        
        // Save original words for database record
        if (hasPositiveWords) {
          positiveWordsArr = positiveWords.split(',')
            .map((text: string) => ({
              id: Date.now() + Math.random(),
              text: text.trim()
            }));
        }
        
        if (hasNegativeWords) {
          negativeWordsArr = negativeWords.split(',')
            .map((text: string) => ({
              id: Date.now() + Math.random(),
              text: text.trim()
            }));
        }
      } catch (e) {
        console.error('Error parsing word tags:', e);
        return res.status(400).json({ error: 'Invalid word tag format' });
      }
    } else {
      console.log('Validation failed: Invalid style type');
      return res.status(400).json({ error: 'Invalid style type' });
    }
    
    // Convert WordTag arrays to strings for database storage
    const positiveWordsString = positiveWordsArr.map(tag => tag.text).filter(Boolean).join(', ');
    const negativeWordsString = negativeWordsArr.map(tag => tag.text).filter(Boolean).join(', ');
    
    console.log('Final prompt:', finalPrompt);
    console.log('Positive words for DB:', positiveWordsString);
    console.log('Negative words for DB:', negativeWordsString);
    
    // Parse image size
    if (!size.includes('*')) {
      console.log('Validation failed: Invalid size format');
      return res.status(400).json({ error: 'Invalid size format, expected format: width*height' });
    }

    // Parse structural similarity parameter
    const similarity = parseInt(structuralSimilarity);
    console.log('Structural similarity:', similarity);

    // First call third-party API to generate image
    let request_id = null;

    try {
      console.log('Calling BFL API to generate image');
      
      // Get API key
      const BFL_API_KEY = process.env.BFL_API_KEY;
      if (!BFL_API_KEY) {
        console.error('BFL_API_KEY environment variable not set');
        return res.status(500).json({ error: 'API configuration error' });
      }
      
      // Download image from URL and convert to base64
      console.log('Downloading and converting image:', imageUrl);
      
      // Use axios to get image data
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');
      const base64Image = imageBuffer.toString('base64');
      
      console.log('Image converted to base64');
      
      // Request BFL API
      const apiUrl = 'https://api.bfl.ai/v1/flux-kontext-pro';
      
      const headers = {
        'accept': 'application/json',
        'x-key': BFL_API_KEY,
        'Content-Type': 'application/json'
      };
      
      const data = {
        'prompt': finalPrompt, // Use new format prompt
        'input_image': base64Image, // Pass base64 encoded image
        'aspect_ratio': "4:3",
        'safety_tolerance': 2,
        'prompt_upsampling': true,
      };
      
      console.log('Sending request to BFL API');
      
      const response = await axios.post(apiUrl, data, { headers });
      
      if (response.status !== 200) {
        throw new Error(`API responded with status code ${response.status}`);
      }
      
      const result = response.data;
      console.log('BFL API response:', result);
      
      if (!result.id) {
        throw new Error('Failed to get request_id from BFL API');
      }
      
      request_id = result.id;
      console.log(`Received request_id: ${request_id}`);
    } catch (apiError: any) {
      console.error('Error calling BFL API:', apiError);
      return res.status(500).json({ 
        error: 'Failed to generate garden design', 
        details: apiError.message 
      });
    }
    
    // Create new design record
    const gardenDesign = await GardenDesign.create({
      user_id,
      project_id: projectId,
      pic_orginial: imageUrl,
      status: 1, // 1 represents processing
      style_id: Number(style_id),
      style_name,
      positive_words: positiveWordsString, // Save as comma-separated string
      negative_words: negativeWordsString, // Save as comma-separated string
      structural_similarity: similarity,
      is_like: 0,
      is_del: 0,
      points_cost: 1, // Record points cost
      third_task_id: request_id, // Save BFL API request ID
      ctime: Math.floor(Date.now() / 1000),
      utime: Math.floor(Date.now() / 1000)
    });

    // Process points deduction
    try {
      // 1. Update user points
      await user.update({
        points: (userPoints - 1).toString(),
        utime: Math.floor(Date.now() / 1000)
      });

      // 2. Update points balance in user order table
      const userOrder = await UserOrder.findOne({
        where: {
          user_id,
          points_remain: {
            [Op.gt]: 0
          }
        },
        order: [['member_start_date', 'ASC']]
      });

      if (userOrder) {
        await userOrder.update({
          points_remain: (userOrder.points_remain || 0) - 1,
          utime: Math.floor(Date.now() / 1000)
        });
      } else {
        console.log('No valid user order found for user:', user_id);
      }

      // 3. Add points log
      await PointsLog.create({
        user_id,
        points_type: '2', // 2 represents decrease
        points_num: 1,    // Amount deducted this time
        log_type: 11,     // 11 represents generating design image
        log_content: 'Generate garden_design',
        related_id: gardenDesign.id.toString(),
        ctime: Math.floor(Date.now() / 1000),
        utime: Math.floor(Date.now() / 1000)
      });

      console.log('Points deducted successfully for user:', user_id);
    } catch (pointsError) {
      console.error('Error processing points deduction:', pointsError);
      // Log error but don't interrupt flow
    }
    
    return res.status(200).json(gardenDesign);
  } catch (error) {
    console.error('Error generating garden design:', error);
    return res.status(500).json({ error: 'Failed to generate garden design' });
  }
};

/**
 * Check BFL API image generation status
 * @route GET /api/garden-designs/check-status/:requestId
 */
export const checkBflStatus = async (req: Request, res: Response) => {
  try {
    console.log('API call received: GET /api/garden-designs/check-status/:requestId');
    console.log('Request params:', req.params);
    
    // Get user ID from request
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get request_id
    const { requestId } = req.params;
    
    if (!requestId) {
      console.log('Validation failed: Missing requestId');
      return res.status(400).json({ error: 'requestId is required' });
    }

    // Check if BFL API key is configured
    const BFL_API_KEY = process.env.BFL_API_KEY;
    if (!BFL_API_KEY) {
      console.error('Environment variable BFL_API_KEY is not set');
      return res.status(500).json({ error: 'API configuration error' });
    }
    
    try {
      // Query BFL API for status
      console.log('Querying BFL API task status:', requestId);
      
      // API configuration
      const apiUrl = 'https://api.bfl.ai/v1/get_result';
      
      // Request headers
      const headers = {
        'accept': 'application/json',
        'x-key': BFL_API_KEY
      };
      
      // Request parameters
      const params = { id: requestId };
      
      // Send GET request
      const response = await axios.get(apiUrl, { params, headers });
      
      // Check response
      if (response.status !== 200) {
        throw new Error(`API responded with status code ${response.status}`);
      }
      
      const result = response.data;
      console.log(`BFL API status query result:`, result);
      
      if (!result) {
        return res.status(400).json({ status: 'pending', message: 'No result found' });
      }
      
      // Check task status
      const status = result.status;
      
      if (status === "Ready") {
        // Task completed, get image URL
        const imageUrl = result.result.sample;
        console.log('Generated image URL:', imageUrl);
        
        // Find corresponding design record and update status
        const gardenDesign = await GardenDesign.findOne({
          where: {
            third_task_id: requestId,
            user_id
          }
        });
        
        if (gardenDesign) {
          // Update design status to success
          await gardenDesign.update({
            pic_result: imageUrl,
            pic_third_orginial: imageUrl,
            status: 2, // 2 represents success
            utime: Math.floor(Date.now() / 1000)
          });
          
          return res.status(200).json({
            status: 'completed',
            image_url: imageUrl,
            garden_design: gardenDesign
          });
        } else {
          return res.status(404).json({ error: 'Garden design not found' });
        }
      } else if (status === "Processing" || status === "Queued") {
        // Task still in progress
        return res.status(200).json({ status: 'pending', message: 'Generation in progress' });
      } else {
        // Task failed or abnormal status
        console.error(`BFL task abnormal: ${requestId}, status: ${status}`);
        
        // Find corresponding design record and update status to failed
        const gardenDesign = await GardenDesign.findOne({
          where: {
            third_task_id: requestId,
            user_id
          }
        });
        
        if (gardenDesign) {
          // Update design status to failed
          await gardenDesign.update({
            status: 3, // 3 represents failed
            utime: Math.floor(Date.now() / 1000)
          });
        }
        
        return res.status(400).json({ 
          status: 'failed', 
          message: `Generation failed with status: ${status}` 
        });
      }
      
    } catch (apiError: any) {
      console.error('Error calling BFL API:', apiError);
      return res.status(500).json({ 
        error: 'Failed to check generation status', 
        details: apiError.message 
      });
    }
    
  } catch (error) {
    console.error('Error checking BFL status:', error);
    return res.status(500).json({ error: 'Failed to check BFL status' });
  }
}; 