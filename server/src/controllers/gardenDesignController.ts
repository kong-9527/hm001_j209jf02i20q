import { Request, Response } from 'express';
import GardenDesign from '../models/GardenDesign';
import User from '../models/User';
import UserOrder from '../models/UserOrder';
import PointsLog from '../models/PointsLog';
import { getUserIdFromRequest } from '../utils/auth';
import axios, { AxiosRequestConfig } from 'axios';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import gardenStylesData, { commonGardenPrompts, commonRenderingPrompts } from '../data/gardenStyles';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { downloadAndUploadToCloudinary } from '../services/imageService';

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
    
    // Check if API key is configured
    const ismaque_API_KEY = process.env.ismaque_API_KEY;
    if (!ismaque_API_KEY) {
      console.error('Environment variable ismaque_API_KEY is not set');
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
        finalPrompt = `Please change the design style of the garden space in the picture to ${style_name}. Please keep the space structure of the picture. The main features of this style are: ${styleDescription}.`;
        
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

    // Call third-party API to generate image and get result directly
    let generatedImageUrl = null;
    let status = 1; // Default to processing

    try {
      console.log('Calling image generation API');
      
      // Get API key
      const ismaque_API_KEY = process.env.ismaque_API_KEY;
      if (!ismaque_API_KEY) {
        console.error('ismaque_API_KEY environment variable not set');
        return res.status(500).json({ error: 'API configuration error' });
      }
      
      // Download image from URL and convert to base64
      console.log('Downloading and converting image:', imageUrl);
      
      // Use axios to get image data
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');
      const base64Image = imageBuffer.toString('base64');
      
      console.log('Image converted to base64');
      
      // Request API
      const apiUrl = 'https://ismaque.org/v1/images/generations';
      
      const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ismaque_API_KEY}`
      };
      
      const data = {
        'model': 'flux-kontext-pro',
        'prompt': finalPrompt,
        'input_image': base64Image,
        'aspect_ratio': '4:3',
        'safety_tolerance': 2,
        'prompt_upsampling': true,
      };
      
      console.log('Sending request to image generation API');
      
      // 简化配置，只保留超时设置，让axios使用全局配置的代理
      const response = await axios.post(apiUrl, data, { 
        headers,
        timeout: 180000 // 180 seconds timeout
      });
      
      if (response.status !== 200) {
        throw new Error(`API responded with status code ${response.status}`);
      }
      
      const result = response.data;
      console.log('API response:', result);
      
      // Check if the response has the expected data structure
      if (!result.data || !result.data[0] || !result.data[0].url) {
        throw new Error('Invalid response format from API');
      }
      
      // Get the generated image URL
      generatedImageUrl = result.data[0].url;
      console.log(`Generated image URL: ${generatedImageUrl}`);
      status = 2; // Set status to success
      
    } catch (apiError: any) {
      console.error('Error calling image generation API:', apiError);
      status = 3; // Set status to failed
      
      // Create a failed record but continue with the process
      console.log('Creating a failed record in the database');
    }
    
    // Create new design record
    const gardenDesign = await GardenDesign.create({
      user_id,
      project_id: projectId,
      pic_orginial: imageUrl,
      status: status, // 1=processing, 2=success, 3=failed
      style_id: Number(style_id),
      style_name,
      positive_words: positiveWordsString,
      negative_words: negativeWordsString,
      structural_similarity: similarity,
      is_like: 0,
      is_del: 0,
      points_cost: 1, // Record points cost
      third_task_id: null, // No longer needed as we directly get the image URL
      pic_third_orginial: generatedImageUrl, // Save original API image URL
      pic_result: generatedImageUrl, // Default to original URL, will be updated if Cloudinary successful
      ctime: Math.floor(Date.now() / 1000),
      utime: Math.floor(Date.now() / 1000)
    });

    // Only process points deduction and Cloudinary upload if generation was successful
    if (status === 2 && generatedImageUrl) {
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
      
      // Upload to Cloudinary if generation was successful
      try {
        console.log('Uploading generated image to Cloudinary');
        const cloudinaryUrl = await downloadAndUploadToCloudinary(generatedImageUrl, user_id);
        
        if (cloudinaryUrl && cloudinaryUrl !== generatedImageUrl) {
          console.log('Image uploaded to Cloudinary successfully:', cloudinaryUrl);
          
          // Update the record with Cloudinary URL
          await gardenDesign.update({
            pic_result: cloudinaryUrl,
            utime: Math.floor(Date.now() / 1000)
          });
        } else {
          console.log('Using original URL as Cloudinary upload failed or returned same URL');
        }
      } catch (cloudinaryError) {
        console.error('Error uploading to Cloudinary:', cloudinaryError);
        // Continue with original URL if Cloudinary upload fails
      }
    }
    
    return res.status(200).json(gardenDesign);
  } catch (error) {
    console.error('Error generating garden design:', error);
    return res.status(500).json({ error: 'Failed to generate garden design' });
  }
};

/**
 * Check if garden design is ready (stub function, no longer needed as we get results directly)
 * This function is kept for backward compatibility with existing frontend code
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
    
    // Get design ID (previously requestId)
    const { requestId } = req.params;
    
    if (!requestId) {
      console.log('Validation failed: Missing requestId');
      return res.status(400).json({ error: 'requestId is required' });
    }

    // Find the garden design record
    const gardenDesign = await GardenDesign.findOne({
      where: {
        id: requestId,
        user_id
      }
    });
    
    if (!gardenDesign) {
      return res.status(404).json({ error: 'Garden design not found' });
    }
    
    // Return status based on the record
    if (gardenDesign.status === 2) {
      // Design is ready
      return res.status(200).json({
        status: 'completed',
        image_url: gardenDesign.pic_result,
        garden_design: gardenDesign
      });
    } else if (gardenDesign.status === 3) {
      // Design generation failed
      return res.status(400).json({ 
        status: 'failed', 
        message: 'Image generation failed' 
      });
    } else {
      // Should not happen as we now get results directly
      return res.status(200).json({ 
        status: 'pending', 
        message: 'Generation in progress' 
      });
    }
  } catch (error) {
    console.error('Error checking design status:', error);
    return res.status(500).json({ error: 'Failed to check design status' });
  }
}; 