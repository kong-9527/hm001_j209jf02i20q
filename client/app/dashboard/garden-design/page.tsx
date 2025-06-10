'use client';

import React, { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import type { DragEvent } from 'react';
import Image from 'next/image';
import gardenStylesData from '../../data/gardenStyles';
import { positiveWordOptions, negativeWordOptions, WordTag } from '../../data/gardenWords';
import WithProjectCheck from '@/app/components/WithProjectCheck';
import { getGardenDesignImages, getGardenDesignList, getDeletedGardenDesigns, getLikedGardenDesigns, updateGardenDesignLikeStatus, deleteGardenDesign, GardenDesignImage, generateGardenDesign } from '@/app/services/gardenDesignService';
import { useProject } from '@/app/contexts/ProjectContext';
import { useEventBus } from '@/app/contexts/EventBus';
import { createCustomStyle, getUserCustomStyles, deleteCustomStyle, getCustomStyleById, updateCustomStyle } from '@/app/services/customStyleService';
import { useNotification } from '@/app/components/NotificationCenter';
import { uploadImage } from '@/app/services/uploadService';

// 定义图片数据类型
interface ImageData {
  id: number;
  src: string;
  alt: string;
  date: string;
  style: string;
  tags: string[];
  createTime: string;
  liked: boolean;
  status: string;
  size?: string;
  positiveWords?: string[];
  negativeWords?: string[];
}

// 定义风格数据类型
interface GardenStyle {
  id: number;
  name: string;
  image: string;
  description: string;
}

// 创建一个获取图片尺寸的辅助函数
const getImageDimensions = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const dimensions = `${img.naturalWidth}*${img.naturalHeight}`;
      resolve(dimensions);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

export default function PhotoGenerator() {
  const [selectedTab, setSelectedTab] = useState('premade');
  const [uploadedImage, setUploadedImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [recentImagesState, setRecentImagesState] = useState<'empty' | 'single' | 'multiple' | 'many'>('empty');
  const [recentImages, setRecentImages] = useState<GardenDesignImage[]>([]);
  const [designImages, setDesignImages] = useState<GardenDesignImage[]>([]);
  const [deletedImages, setDeletedImages] = useState<GardenDesignImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false); // 添加图片加载状态
  const [debugInput, setDebugInput] = useState('');
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Add uploading state
  const [isGenerating, setIsGenerating] = useState(false); // Add generating state
  const uploadAreaRef = useRef<HTMLDivElement>(null);
  const { currentProject } = useProject();
  const { on } = useEventBus();
  const { addNotification } = useNotification();
  
  console.log('Garden Design page render. Current project:', currentProject);
  
  // 结构相似度相关状态
  const [resemblancePercent, setResemblancePercent] = useState(75); // 默认75%
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // 图片详情弹窗状态
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [showImageDetail, setShowImageDetail] = useState(false);
  
  // Tooltip相关状态
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // 风格相关状态
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
  
  // 自定义风格相关状态
  const [positiveWords, setPositiveWords] = useState<WordTag[]>([]);
  const [negativeWords, setNegativeWords] = useState<WordTag[]>([]);
  const [positiveInput, setPositiveInput] = useState('');
  const [negativeInput, setNegativeInput] = useState('');
  
  // 搜索相关状态
  const [positiveSearchInput, setPositiveSearchInput] = useState('');
  const [negativeSearchInput, setNegativeSearchInput] = useState('');
  
  // 保存风格对话框状态
  const [showSaveStyleDialog, setShowSaveStyleDialog] = useState(false);
  const [styleNameInput, setStyleNameInput] = useState('');
  
  // 加载风格对话框状态
  const [showLoadStyleDialog, setShowLoadStyleDialog] = useState(false);
  
  // 编辑风格对话框状态
  const [showEditStyleDialog, setShowEditStyleDialog] = useState(false);
  const [editingStyleId, setEditingStyleId] = useState<number | null>(null);
  const [editStyleNameInput, setEditStyleNameInput] = useState('');
  
  // 添加图片标签相关状态
  const [imageTab, setImageTab] = useState<'all' | 'liked' | 'deleted'>('all');
  
  // 删除确认对话框状态
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deletingStyleId, setDeletingStyleId] = useState<number | null>(null);
  
  // 用户自定义风格列表类型定义
  interface CustomStyleItem {
    id: number;
    name: string;
    preview: string;
    positive_words?: string[];
    negative_words?: string[];
  }
  
  // 用户自定义风格列表 - 替换mock数据为空数组
  const [customStyles, setCustomStyles] = useState<CustomStyleItem[]>([]);
  const [isLoadingStyles, setIsLoadingStyles] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const stylesPerPage = 5;
  
    // 预设词汇选项从gardenWords.ts导入
  
  // 计算token数量的函数
  const calculateTokens = (words: WordTag[]): number => {
    return words.reduce((total, word) => {
      // 按空格分割单词并计算单词数量
      const wordCount = word.text.split(' ').length;
      return total + wordCount;
    }, 0);
  };
  
  // 添加正向词汇
  const addPositiveWord = (word: string) => {
    if (word.trim()) {
      const newWord = {
        id: Date.now(),
        text: word.trim()
      };
      
      // 计算当前tokens与新增词汇的tokens之和
      const currentTokens = calculateTokens(positiveWords);
      const newWordTokens = word.trim().split(' ').length;
      
      // 检查是否超过上限
      if (currentTokens + newWordTokens <= 72) {
      setPositiveWords([...positiveWords, newWord]);
      }
      setPositiveInput('');
    }
  };
  
  // 添加负向词汇
  const addNegativeWord = (word: string) => {
    if (word.trim()) {
      const newWord = {
        id: Date.now(),
        text: word.trim()
      };
      
      // 计算当前tokens与新增词汇的tokens之和
      const currentTokens = calculateTokens(negativeWords);
      const newWordTokens = word.trim().split(' ').length;
      
      // 检查是否超过上限
      if (currentTokens + newWordTokens <= 72) {
      setNegativeWords([...negativeWords, newWord]);
      }
      setNegativeInput('');
    }
  };
  
  // 处理正向词汇输入回车
  const handlePositiveInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPositiveWord(positiveInput);
    }
  };
  
  // 处理负向词汇输入回车
  const handleNegativeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNegativeWord(negativeInput);
    }
  };
  
  // 从预设选项中添加词汇
  const toggleWordSelection = (word: WordTag, isPositive: boolean) => {
    if (isPositive) {
      // 检查是否已添加，已添加则移除，未添加则添加
      const exists = positiveWords.some(w => w.text === word.text);
      if (exists) {
        setPositiveWords(positiveWords.filter(w => w.text !== word.text));
      } else {
        // 检查添加后是否超过token限制
        const currentTokens = calculateTokens(positiveWords);
        const newWordTokens = word.text.split(' ').length;
        if (currentTokens + newWordTokens <= 72) {
        setPositiveWords([...positiveWords, word]);
        }
      }
    } else {
      // 检查是否已添加，已添加则移除，未添加则添加
      const exists = negativeWords.some(w => w.text === word.text);
      if (exists) {
        setNegativeWords(negativeWords.filter(w => w.text !== word.text));
      } else {
        // 检查添加后是否超过token限制
        const currentTokens = calculateTokens(negativeWords);
        const newWordTokens = word.text.split(' ').length;
        if (currentTokens + newWordTokens <= 72) {
        setNegativeWords([...negativeWords, word]);
        }
      }
    }
  };
  
  // 移除已添加的词汇
  const removeWord = (wordId: number, isPositive: boolean) => {
    if (isPositive) {
      setPositiveWords(positiveWords.filter(word => word.id !== wordId));
    } else {
      setNegativeWords(negativeWords.filter(word => word.id !== wordId));
    }
  };
  
  // 清空输入框
  const clearInput = (isPositive: boolean) => {
    if (isPositive) {
      setPositiveInput('');
    } else {
      setNegativeInput('');
    }
  };
  
  // 清空所有选中词汇
  const clearAllWords = (isPositive: boolean) => {
    if (isPositive) {
      setPositiveWords([]);
    } else {
      setNegativeWords([]);
    }
  };
  
  // 重置所有词汇
  const resetAllWords = () => {
    setPositiveWords([]);
    setNegativeWords([]);
  };
  
  // 重置结构相似度到默认值
  const resetResemblance = () => {
    setResemblancePercent(75);
  };
  
  // 处理滑块鼠标按下事件
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSlider(true);
    
    // 直接更新位置
    updateSliderPosition(e.clientX);
  };
  
  // 处理鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingSlider) {
      updateSliderPosition(e.clientX);
    }
  };
  
  // 处理鼠标松开事件
  const handleMouseUp = () => {
    if (isDraggingSlider) {
      setIsDraggingSlider(false);
    }
  };
  
  // 更新滑块位置
  const updateSliderPosition = (clientX: number) => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const rect = slider.getBoundingClientRect();
      const width = rect.width;
      const offset = clientX - rect.left;
      
      // 计算百分比，限制在0-100范围内
      let percent = Math.round((offset / width) * 100);
      percent = Math.max(0, Math.min(100, percent));
      
      setResemblancePercent(percent);
    }
  };
  
  // 添加和移除鼠标事件监听器
  useEffect(() => {
    if (isDraggingSlider) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSlider]);
  
  // 过滤词汇选项
  const filterWordOptions = (options: WordTag[], searchTerm: string): WordTag[] => {
    if (!searchTerm.trim()) return options;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return options.filter(option => 
      option.text.toLowerCase().includes(lowerSearchTerm)
    );
  };
  
  // 输入框焦点状态
  const inputFocusClass = "focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500";

  // 悬浮提示组件
  const Tooltip = ({ id, text }: { id: string; text: string }) => {
    if (activeTooltip !== id) return null;
    
    return (
      <div className="absolute z-50 w-64 max-w-xs bg-black text-white text-xs rounded-lg py-2 px-3 shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
        <div className="absolute top-full left-1/2 w-2 h-2 -translate-x-1/2 rotate-45 bg-black"></div>
        {text}
      </div>
    );
  };
  
  // 处理打开保存风格对话框
  const handleOpenSaveStyleDialog = () => {
    // 检查正向词汇和负向词汇是否同时为空
    if (positiveWords.length === 0 && negativeWords.length === 0) {
      // 如果同时为空，显示提示消息
      alert("Please fill in or select Your Positive Words and Your Negative Words before clicking Save Style");
      return;
    }
    // 满足要求，打开弹窗
    setShowSaveStyleDialog(true);
    setStyleNameInput('');
  };
  
  // 处理关闭保存风格对话框
  const handleCloseSaveStyleDialog = () => {
    setShowSaveStyleDialog(false);
  };
  
  // 处理打开加载风格对话框
  const handleOpenLoadStyleDialog = () => {
    setShowLoadStyleDialog(true);
    // 打开对话框时重新获取最新的自定义风格列表
    if (fetchUserCustomStyles) {
    fetchUserCustomStyles();
    }
  };
  
  // 处理关闭加载风格对话框
  const handleCloseLoadStyleDialog = () => {
    setShowLoadStyleDialog(false);
  };
  
  // 处理打开编辑风格对话框
  const handleOpenEditStyleDialog = async (styleId: number) => {
    try {
      // 根据ID获取自定义风格详情
      const styleToEdit = await getCustomStyleById(styleId);
      
      if (styleToEdit) {
        setEditingStyleId(styleId);
        setEditStyleNameInput(styleToEdit.custom_style_name);
        setShowEditStyleDialog(true);
        
        // 加载风格对应的正负向词汇
        if (styleToEdit.positive_words && styleToEdit.positive_words.length > 0) {
          const positiveWordTags = styleToEdit.positive_words.map(text => ({
            id: Date.now() + Math.random(),
            text
          }));
          setPositiveWords(positiveWordTags);
        } else {
          setPositiveWords([]);
        }
        
        if (styleToEdit.negative_words && styleToEdit.negative_words.length > 0) {
          const negativeWordTags = styleToEdit.negative_words.map(text => ({
            id: Date.now() + Math.random(),
            text
          }));
          setNegativeWords(negativeWordTags);
        } else {
          setNegativeWords([]);
        }
      }
    } catch (error) {
      console.error('获取自定义风格详情失败:', error);
      alert('Failed to get style details, please try again');
    }
  };
  
  // 处理关闭编辑风格对话框
  const handleCloseEditStyleDialog = () => {
    setShowEditStyleDialog(false);
    setEditingStyleId(null);
  };
  
  // 处理更新风格
  const handleUpdateStyle = async () => {
    if (editStyleNameInput.trim() && editingStyleId) {
      try {
        // 获取正负向词汇的文本
        const positiveWordsText = positiveWords.map(word => word.text);
        const negativeWordsText = negativeWords.map(word => word.text);
        
        // 调用API更新自定义风格
        const updatedStyle = await updateCustomStyle(
          editingStyleId,
          editStyleNameInput,
          positiveWordsText,
          negativeWordsText
        );
        
        console.log('更新风格成功:', updatedStyle);
        
        // 更新本地风格列表
        setCustomStyles(prevStyles => 
          prevStyles.map(style => 
            style.id === editingStyleId 
              ? { 
                  ...style, 
                  name: updatedStyle.custom_style_name,
                  preview: positiveWordsText.length > 0 
                    ? positiveWordsText.join(', ')
                    : negativeWordsText.join(', '),
                  positive_words: positiveWordsText,
                  negative_words: negativeWordsText
                } 
              : style
          )
        );
        
        // 关闭对话框
        setShowEditStyleDialog(false);
        setEditingStyleId(null);
      } catch (error) {
        console.error('更新风格失败:', error);
        alert('Failed to update style, please try again');
      }
    }
  };
  
  // 处理加载风格
  const handleLoadStyle = async (styleId: number) => {
    try {
      // 根据ID获取自定义风格详情
      const style = await getCustomStyleById(styleId);
      
      if (style) {
        // 切换到Custom styles标签
        setSelectedTab('custom');
        
        // 加载风格对应的正负向词汇
        if (style.positive_words && style.positive_words.length > 0) {
          const positiveWordTags = style.positive_words.map(text => ({
            id: Date.now() + Math.random(),
            text
          }));
          setPositiveWords(positiveWordTags);
        } else {
          setPositiveWords([]);
        }
        
        if (style.negative_words && style.negative_words.length > 0) {
          const negativeWordTags = style.negative_words.map(text => ({
            id: Date.now() + Math.random(),
            text
          }));
          setNegativeWords(negativeWordTags);
        } else {
          setNegativeWords([]);
        }
        
        // 关闭对话框
        setShowLoadStyleDialog(false);
      }
    } catch (error) {
      console.error('加载风格失败:', error);
      alert('Failed to load style, please try again');
    }
  };
  
  // 处理删除自定义风格
  const handleDeleteCustomStyle = async () => {
    if (deletingStyleId) {
      try {
        // 调用API删除风格
        const success = await deleteCustomStyle(deletingStyleId);
        
        if (success) {
          // 从本地风格列表中移除
          setCustomStyles(prevStyles => prevStyles.filter(style => style.id !== deletingStyleId));
          
          // 关闭对话框
          setShowDeleteConfirmDialog(false);
          setDeletingStyleId(null);
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        console.error('Failed to delete custom style:', error);
        alert('Failed to delete style, please try again');
      }
    }
  };
  
  // 处理保存风格
  const handleSaveStyle = async () => {
    if (styleNameInput.trim()) {
      try {
        // 获取正负向词汇的文本
        const positiveWordsText = positiveWords.map(word => word.text);
        const negativeWordsText = negativeWords.map(word => word.text);
        
        // 调用API保存自定义风格
        const savedStyle = await createCustomStyle(
          styleNameInput, 
          positiveWordsText,
          negativeWordsText
        );
        
        console.log('保存自定义风格成功:', savedStyle);
        
        // 生成预览文本
        let previewText = '';
        if (positiveWordsText.length > 0) {
          previewText = positiveWordsText.join(', ');
        } else if (negativeWordsText.length > 0) {
          previewText = negativeWordsText.join(', ');
        }
        
        // 添加到自定义风格列表
        const newStyle = {
          id: savedStyle.id,
          name: savedStyle.custom_style_name,
          preview: previewText,
          positive_words: positiveWordsText,
          negative_words: negativeWordsText
        };
        setCustomStyles([newStyle, ...customStyles]);
        
        // 关闭对话框
        setShowSaveStyleDialog(false);
      } catch (error) {
        console.error('保存自定义风格失败:', error);
        alert('Failed to save, please try again');
      }
    }
  };
  
  // 渲染自定义风格内容
  const renderCustomStyleContent = () => {
    return (
      <div className="mt-4">
        {/* 样式控制按钮 */}
        <div className="flex justify-between mt-3 mb-3">
          <div className="flex gap-2">
            <button 
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              onClick={handleOpenLoadStyleDialog}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-7.5L12 5.25m0 0l4.5 4.5M12 5.25v13.5" />
              </svg>
              Load Style
            </button>
            <button 
              className="flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
              onClick={handleOpenSaveStyleDialog}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Save Style
            </button>
          </div>
          <button 
            className={`px-3 py-1.5 rounded-lg text-sm ${
              positiveWords.length > 0 || negativeWords.length > 0 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            onClick={resetAllWords}
            disabled={positiveWords.length === 0 && negativeWords.length === 0}
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* 正向词汇部分 */}
          <div>
            <div className="flex items-center mb-3">
              <span className="text-emerald-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              <h3 className="text-sm font-medium text-gray-700">Positive Words</h3>
              <button 
                className="ml-1 text-gray-400 hover:text-gray-500 relative"
                onMouseEnter={() => setActiveTooltip('positive-words')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <Tooltip 
                  id="positive-words" 
                  text="Positive words describe desired elements you want to see in your garden design. They influence the AI to include these features in the generated image."
                />
              </button>
            </div>
            
            {/* 搜索框 */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search positive words..."
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${inputFocusClass}`}
                value={positiveSearchInput}
                onChange={(e) => setPositiveSearchInput(e.target.value)}
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              {positiveSearchInput && (
                <button 
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setPositiveSearchInput('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* 预设词汇选项 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 max-h-44 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {filterWordOptions(positiveWordOptions, positiveSearchInput).map((word) => {
                  const isSelected = positiveWords.some(w => w.text === word.text);
                  return (
                    <button
                      key={word.id}
                      className={`text-xs py-1 px-2 rounded-full border ${isSelected ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-700'} hover:bg-emerald-50`}
                      onClick={() => toggleWordSelection(word, true)}
                    >
                      {word.text}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 已选择的词汇 */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Your Positive Words:</span>
                <span>{calculateTokens(positiveWords)}/72 tokens</span>
              </div>
              <div className="relative">
              <input
                type="text"
                placeholder="Type and press Enter to add custom word..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 ${inputFocusClass}`}
                value={positiveInput}
                onChange={(e) => setPositiveInput(e.target.value)}
                onKeyDown={handlePositiveInputKeyDown}
              />
                {positiveInput && (
                  <button 
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => clearInput(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* 已选词汇展示 */}
              <div className="flex flex-wrap gap-2 mb-2">
                {positiveWords.length > 0 ? (
                  positiveWords.map((word) => (
                    <div key={word.id} className="flex items-center bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs py-1 px-2 rounded-full">
                      <span>{word.text}</span>
                      <button 
                        onClick={() => removeWord(word.id, true)}
                        className="ml-1 text-emerald-600 hover:text-emerald-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Add words from above or type your own</p>
                )}
              </div>
              
              {positiveWords.length > 0 && (
                <button 
                  onClick={() => clearAllWords(true)} 
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          {/* 负向词汇部分 */}
          <div>
            <div className="flex items-center mb-3">
              <span className="text-red-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <h3 className="text-sm font-medium text-gray-700">Negative Words</h3>
              <button 
                className="ml-1 text-gray-400 hover:text-gray-500 relative"
                onMouseEnter={() => setActiveTooltip('negative-words')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <Tooltip 
                  id="negative-words" 
                  text="Negative words help exclude unwanted elements from your garden design. The AI will try to avoid including these features in the generated image."
                />
              </button>
            </div>
            
            {/* 搜索框 */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search negative words..."
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${inputFocusClass}`}
                value={negativeSearchInput}
                onChange={(e) => setNegativeSearchInput(e.target.value)}
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              {negativeSearchInput && (
                <button 
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setNegativeSearchInput('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* 预设词汇选项 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 max-h-44 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {filterWordOptions(negativeWordOptions, negativeSearchInput).map((word) => {
                  const isSelected = negativeWords.some(w => w.text === word.text);
                  return (
                    <button
                      key={word.id}
                      className={`text-xs py-1 px-2 rounded-full border ${isSelected ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-700'} hover:bg-emerald-50`}
                      onClick={() => toggleWordSelection(word, false)}
                    >
                      {word.text}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 已选择的词汇 */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Your Negative Words:</span>
                <span>{calculateTokens(negativeWords)}/72 tokens</span>
              </div>
              <div className="relative">
              <input
                type="text"
                placeholder="Type and press Enter to add custom word..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 ${inputFocusClass}`}
                value={negativeInput}
                onChange={(e) => setNegativeInput(e.target.value)}
                onKeyDown={handleNegativeInputKeyDown}
              />
                {negativeInput && (
                  <button 
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => clearInput(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
        </div>
        
              {/* 已选词汇展示 */}
              <div className="flex flex-wrap gap-2 mb-2">
                {negativeWords.length > 0 ? (
                  negativeWords.map((word) => (
                    <div key={word.id} className="flex items-center bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs py-1 px-2 rounded-full">
                      <span>{word.text}</span>
                      <button 
                        onClick={() => removeWord(word.id, false)}
                        className="ml-1 text-emerald-600 hover:text-emerald-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Add words from above or type your own</p>
                )}
              </div>
              
              {negativeWords.length > 0 && (
                <button 
                  onClick={() => clearAllWords(false)} 
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
          </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Mock风格数据
  const gardenStyles: GardenStyle[] = gardenStylesData.map((style, index) => ({
    id: index + 1,
    name: style.name,
    image: style.image || style.after,
    description: style.description || ''
  }));

  // 处理风格选择
  const handleStyleSelect = (styleId: number) => {
    setSelectedStyleId(styleId);
  };

  // 获取当前选中的风格
  const getSelectedStyle = (): GardenStyle | undefined => {
    return gardenStyles.find(style => style.id === selectedStyleId);
  };
  
  // 为每种状态定义对应的图片数据
  const imageDataMap = {
    single: [
      {
        id: 1,
        src: '/uploads/garden-sample.png',
        alt: 'Garden Photo',
        date: '2024/4/13'
      }
    ],
    multiple: Array(9).fill(0).map((_, index) => ({
      id: index + 1,
      src: '/uploads/garden-sample.png',
      alt: `Garden Photo ${index + 1}`,
      date: `2024/${4 + Math.floor(index/2)}/${10 + index}`
    })),
    many: Array(20).fill(0).map((_, index) => ({
      id: index + 1,
      src: '/uploads/garden-sample.png',
      alt: `Garden Photo ${index + 1}`,
      date: `2024/${1 + Math.floor(index/4)}/${1 + index}`
    }))
  };
  
  // 处理拖拽开始
  const handleDragStart = (e: DragEvent<HTMLDivElement>, imageSrc: string) => {
    e.dataTransfer.setData('text/plain', imageSrc);
    setDraggedImage(imageSrc);
    
    // 创建拖拽预览图像
    if (e.dataTransfer.setDragImage) {
      const img = document.createElement('img');
      img.src = imageSrc;
      e.dataTransfer.setDragImage(img, 50, 50);
    }
  };
  
  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedImage(null);
  };
  
  // 处理拖拽进入目标区域
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // 确保拖拽事件只在上传区域内有效
    if (e.currentTarget === uploadAreaRef.current || 
      (e.target instanceof Node && uploadAreaRef.current && uploadAreaRef.current.contains(e.target))) {
      setIsDragOver(true);
    }
  };
  
  // 处理拖拽在目标区域上方
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // 确保拖拽事件只在上传区域内有效
    if (e.currentTarget === uploadAreaRef.current || 
      (e.target instanceof Node && uploadAreaRef.current && uploadAreaRef.current.contains(e.target))) {
      if (!isDragOver) setIsDragOver(true);
    }
  };
  
  // 处理拖拽离开目标区域
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // 确保只有当鼠标确实离开元素时才设置为false
    // 检查是否离开的是上传区域本身，而不是其子元素
    if (e.currentTarget === uploadAreaRef.current && e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };
  
  // 处理拖拽放置
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // 确保拖拽事件只在上传区域内有效
    if (e.currentTarget !== uploadAreaRef.current && 
      !(e.target instanceof Node && uploadAreaRef.current && uploadAreaRef.current.contains(e.target))) {
      return;
    }
    
    setIsDragOver(false);
    
    // 处理从最近图片拖拽的情况
    const imageSrc = e.dataTransfer.getData('text/plain');
    if (imageSrc) {
      console.log(`Garden Design: 从最近图片拖放图片 ${imageSrc} 到上传区域`);
      setUploadedImage(true);
      setUploadedImageUrl(imageSrc);
      setPreviewImageUrl(imageSrc);
      return;
    }
    
    // 处理从本地电脑拖拽文件的情况
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // 验证是否为图片文件
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      } else {
        console.log('Garden Design: 只支持图片文件');
        // 添加错误提示
        alert('只支持图片文件 (JPG, PNG, WEBP)');
      }
    }
  };
  
  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    try {
      console.log('Garden Design: Starting file upload:', file.name);
      
      // Create file preview URL for display
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          // Set local preview
          setPreviewImageUrl(e.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
      
      // Set uploading state
      setIsUploading(true);
      
      try {
        // Upload image to Cloudinary using uploadImage service
        const imageUrl = await uploadImage(file);
        
        console.log('Garden Design: File upload successful, returned URL:', imageUrl);
        
        // Set uploaded status and save URL
        setUploadedImage(true);
        setUploadedImageUrl(imageUrl);
        
        // Add success notification
        addNotification({
          type: 'success',
          message: 'Image uploaded successfully',
          duration: 3000
        });
      } catch (error) {
        console.error('Garden Design: File upload failed:', error);
        
        // Add error notification
        addNotification({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to upload image',
          duration: 5000
        });
        
        // Reset preview
        setPreviewImageUrl(null);
      } finally {
        setIsUploading(false);
      }
      
    } catch (error) {
      console.error('Garden Design: File processing failed:', error);
      addNotification({
        type: 'error',
        message: 'Failed to process image',
        duration: 5000
      });
      setIsUploading(false);
    }
  };
  
  // 处理文件输入变化
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };
  
  const handleDebugSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 清空输入框
    setDebugInput('');
    
    // 不再通过调试工具修改上传状态，仅保留其他调试功能
  };
  
  // 处理标签切换并加载相应数据
  const handleTabChange = (tab: 'all' | 'liked' | 'deleted') => {
    // 设置当前标签
    setImageTab(tab);
    
    // 获取当前项目ID，如果不存在则返回
    const projectId = currentProject?.id;
    if (!projectId) {
      console.log('No current project, skipping data fetch');
      return;
    }
    
    // 设置加载状态为true
    setIsLoadingImages(true);
    
    // 根据标签类型加载相应数据
    if (tab === 'all') {
      // 获取所有未删除的图片
      fetchGardenDesignList(projectId);
    } else if (tab === 'liked') {
      // 获取已收藏的图片
      fetchLikedGardenDesigns(projectId);
    } else if (tab === 'deleted') {
      // 获取已删除的图片
      fetchDeletedGardenDesigns(projectId);
    }
  };
  
  // 抽取获取花园设计图片列表的函数，便于复用
  const fetchGardenDesignList = useCallback(async (projectId: number) => {
    console.log('Fetching garden design list for project:', projectId);
    
    try {
      const images = await getGardenDesignList(projectId);
      console.log('Received garden design list:', images);
      setDesignImages(images);
    } catch (error) {
      console.error('Failed to fetch garden design list:', error);
      setDesignImages([]);
    } finally {
      setIsLoadingImages(false); // 完成加载，设置状态为false
    }
  }, []);
  
  // 抽取获取已收藏花园设计图片的函数，便于复用
  const fetchLikedGardenDesigns = useCallback(async (projectId: number) => {
    console.log('Fetching liked garden designs for project:', projectId);
    
    try {
      const images = await getLikedGardenDesigns(projectId);
      console.log('Received liked garden designs:', images);
      setDesignImages(images);
    } catch (error) {
      console.error('Failed to fetch liked garden designs:', error);
      setDesignImages([]);
    } finally {
      setIsLoadingImages(false); // 完成加载，设置状态为false
    }
  }, []);
  
  // 抽取获取已删除花园设计图片的函数，便于复用
  const fetchDeletedGardenDesigns = useCallback(async (projectId: number) => {
    console.log('Fetching deleted garden designs for project:', projectId);
    
    try {
      const images = await getDeletedGardenDesigns(projectId);
      console.log('Received deleted garden designs:', images);
      setDeletedImages(images);
    } catch (error) {
      console.error('Failed to fetch deleted garden designs:', error);
      setDeletedImages([]);
    } finally {
      setIsLoadingImages(false); // 完成加载，设置状态为false
    }
  }, []);
  
  // 获取花园设计图片数据 - 最近图片
  useEffect(() => {
    const fetchGardenDesignImages = async () => {
      if (!currentProject) {
        console.log('No current project, skipping API call');
        return;
      }
      
      console.log('Fetching garden design images for project:', currentProject.id);
      
      try {
        const images = await getGardenDesignImages(currentProject.id);
        console.log('Received garden design images:', images);
        setRecentImages(images);
        
        // 根据图片数量设置状态
        if (images.length === 0) {
          setRecentImagesState('empty');
        } else if (images.length <= 4) {
          setRecentImagesState('single');
        } else if (images.length <= 8) {
          setRecentImagesState('multiple');
        } else {
          setRecentImagesState('many');
        }
      } catch (error) {
        console.error('Failed to fetch garden design images:', error);
        setRecentImagesState('empty');
      }
    };
    
    fetchGardenDesignImages();
  }, [currentProject]);
  
  // 获取花园设计图片列表数据 - 初始加载
  useEffect(() => {
    if (!currentProject) {
      console.log('No current project, skipping design list API call');
      return;
    }
    
    // 设置加载状态为true
    setIsLoadingImages(true);
    
    // 根据当前选中的标签页加载相应数据
    console.log('Initial data load for tab:', imageTab);
    if (imageTab === 'all') {
      fetchGardenDesignList(currentProject.id);
    } else if (imageTab === 'liked') {
      fetchLikedGardenDesigns(currentProject.id);
    } else if (imageTab === 'deleted') {
      fetchDeletedGardenDesigns(currentProject.id);
    }
  }, [currentProject, imageTab, fetchGardenDesignList, fetchLikedGardenDesigns, fetchDeletedGardenDesigns]);
  
  // 为每种状态定义对应的图片数据 - 使用API获取的真实数据
  const getRecentImagesData = () => {
    // 对images按照ctime倒序排序
    const sortedImages = [...recentImages].sort((a, b) => {
      return (b.ctime || 0) - (a.ctime || 0);
    });
    
    return sortedImages;
  };
  
  // 渲染最近图片内容
  const renderRecentImages = () => {
    switch (recentImagesState) {
      case 'empty':
        return (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-sm">No recent images</p>
          </div>
        );
      
      case 'single':
      case 'multiple':
      case 'many':
        const imageData = getRecentImagesData();
        
        // 单张图片不需要滚动容器
        if (recentImagesState === 'single') {
          return (
            <div className="grid grid-cols-4 gap-2">
              {imageData.map((image) => (
                <div 
                  key={image.id} 
                  className="relative aspect-square bg-gray-100 rounded-md overflow-hidden cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, image.pic_orginial || '')}
                  onDragEnd={handleDragEnd}
                >
                  <Image 
                    src={image.pic_orginial || ''}
                    alt={image.style_name || 'Garden design'}
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                    {image.ctime ? new Date(image.ctime * 1000).toISOString().split('T')[0].replace(/-/g, '/') : ''}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        
        // 多张图片需要滚动容器
        return (
          <div className="max-h-[20rem] overflow-y-auto pr-6 scrollbar-thin">
            <div className="grid grid-cols-4 gap-2">
              {imageData.map((image) => (
                <div 
                  key={image.id} 
                  className="relative aspect-square bg-gray-100 rounded-md overflow-hidden cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, image.pic_orginial || '')}
                  onDragEnd={handleDragEnd}
                >
                  <Image 
                    src={image.pic_orginial || ''}
                    alt={image.style_name || 'Garden design'}
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                    {image.ctime ? new Date(image.ctime * 1000).toISOString().split('T')[0].replace(/-/g, '/') : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // 渲染图片列表内容 - 根据当前所选标签
  const renderImageList = () => {
    switch (imageTab) {
      case 'all':
        return renderAllImages();
      case 'liked':
        return renderLikedImages();
      case 'deleted':
        return renderDeletedImages();
      default:
        return renderAllImages();
    }
  };
  
  // Render all images
  const renderAllImages = () => {
    // Add loading state check
    if (isLoadingImages) {
      return (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-16 h-16 mb-4 relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
          </div>
          <p className="text-emerald-600 font-medium">Loading...</p>
        </div>
      );
    }
    
    if (designImages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Yet</h3>
          <p className="text-sm text-gray-500 text-center mb-4">Upload an image and choose a style to get started</p>
        </div>
      );
    }
    
    // Use API data, sort by ctime in descending order
    const imageData = [...designImages].sort((a, b) => {
      return (b.ctime || 0) - (a.ctime || 0);
    });
    
    return (
      <div className="h-full p-6 scrollbar-thin overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {imageData.map((image) => (
            <div  
              key={image.id} 
              className={`relative aspect-square bg-gray-100 rounded-md overflow-hidden ${image.status !== 1 ? "group" : ""}`}
            >
              {/* Show background image for all states */}
              {image.pic_result ? (
              <Image 
                  src={image.pic_result}
                alt={image.style_name || 'Garden design'}
                fill
                sizes="100%"
                style={{objectFit: 'cover'}}
                className={`${image.status !== 1 ? "hover:opacity-80 transition-opacity cursor-pointer" : "opacity-50"}`}
                onClick={() => image.status !== 1 && handleImageClick(image)}
              />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
              
              {image.status === 1 && (
                // Processing state display - keep background image
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40">
                  <div className="w-12 h-12 mb-3 relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white font-medium">Processing image...</p>
                </div>
              )}
              
              {/* 显示生成失败状态的标记 */}
              {image.status === 3 && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-md">
                  Failed
                </div>
              )}
              
              {/* 显示风格名称 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                {image.style_name}
              </div>
              
              {/* 只在非处理状态下显示操作按钮 */}
              {image.status !== 1 && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  {/* 只在生成成功状态下显示下载按钮 */}
                  {image.status === 2 && (
                  <button className="p-1.5 rounded-full bg-white text-blue-600 hover:bg-blue-100 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(image.pic_result || '', '_blank');
                          }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                  )}
                  
                  {/* 只在生成成功状态下显示收藏按钮 */}
                  {image.status === 2 && (
                  <button 
                    className={`p-1.5 rounded-full bg-white ${image.is_like === 1 ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} hover:bg-red-50 shadow-sm`}
                    onClick={(e) => handleLikeToggle(e, image)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={image.is_like === 1 ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                  )}
                  
                  {/* 添加删除按钮 - 所有非生成中状态都显示 */}
                  <button 
                    className="p-1.5 rounded-full bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 shadow-sm"
                    onClick={(e) => handleDelete(e, image)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render liked images
  const renderLikedImages = () => {
    // 添加加载中状态判断
    if (isLoadingImages) {
      return (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-16 h-16 mb-4 relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
          </div>
          <p className="text-emerald-600 font-medium">Loading...</p>
        </div>
      );
    }
    
    if (designImages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Liked Images</h3>
          <p className="text-sm text-gray-500 text-center mb-4">Images you like will appear here</p>
        </div>
      );
    }
    
    // 按照ctime倒序排序
    const sortedImages = [...designImages].sort((a, b) => {
      return (b.ctime || 0) - (a.ctime || 0);
    });
    
    // 与renderAllImages类似的渲染代码，这里简化了
    return (
      <div className="h-full p-6 scrollbar-thin overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {sortedImages.map((image) => (
            <div  
              key={image.id} 
              className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group"
            >
              {image.pic_result ? (
              <Image 
                  src={image.pic_result}
                alt={image.style_name || 'Garden design'}
                fill
                sizes="100%"
                style={{objectFit: 'cover'}}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => handleImageClick(image)}
              />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                {image.style_name}
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button className="p-1.5 rounded-full bg-white text-blue-600 hover:bg-blue-100 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(image.pic_result || '', '_blank');
                        }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
                <button 
                  className="p-1.5 rounded-full bg-white text-red-500 hover:bg-red-50 shadow-sm"
                  onClick={(e) => handleLikeToggle(e, image)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                <button 
                  className="p-1.5 rounded-full bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 shadow-sm"
                  onClick={(e) => handleDelete(e, image)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render deleted images - modified to fetch deleted images from database
  const renderDeletedImages = () => {
    // 添加加载中状态判断
    if (isLoadingImages) {
      return (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-16 h-16 mb-4 relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
          </div>
          <p className="text-emerald-600 font-medium">Loading...</p>
        </div>
      );
    }
    
    if (deletedImages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Deleted Images</h3>
          <p className="text-sm text-gray-500 text-center mb-4">Images you've deleted will appear here for 30 days</p>
        </div>
      );
    }
    
    // 按照ctime倒序排序
    const sortedImages = [...deletedImages].sort((a, b) => {
      return (b.ctime || 0) - (a.ctime || 0);
    });
    
    return (
      <div className="h-full p-6 scrollbar-thin overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {sortedImages.map((image) => (
            <div  
              key={image.id} 
              className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group"
            >
              <Image 
                src={image.pic_result || ''}
                alt={image.style_name || 'Garden design'}
                fill
                sizes="100%"
                style={{objectFit: 'cover'}}
                className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => handleImageClick(image)}
              />
              
              {/* 显示生成失败状态的标记 */}
              {image.status === 3 && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-md">
                  Failed
                </div>
              )}
              
              {/* 显示风格名称 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                {image.style_name} (Deleted)
              </div>
              
              {/* 已移除操作按钮 */}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // 处理图片点击 - 修改为使用GardenDesignImage类型
  const handleImageClick = (image: GardenDesignImage) => {
      setSelectedImage(image);
      setShowImageDetail(true);
  };

  // 关闭图片详情弹窗
  const handleCloseImageDetail = () => {
    setShowImageDetail(false);
    setSelectedImage(null);
  };

  // 渲染图片详情弹窗
  const renderImageDetailModal = () => {
    if (!showImageDetail || !selectedImage) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* 图片展示 */}
          <div className="relative w-full pt-6 px-6">
            <div className="relative w-full h-80 rounded-lg overflow-hidden">
              {selectedImage.pic_result ? (
              <Image 
                  src={selectedImage.pic_result}
                alt={selectedImage.style_name || 'Garden design'}
                fill
                style={{objectFit: 'cover'}}
                className="w-full h-full"
              />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* 图片信息 */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-y-4">
              <div className="text-gray-500">Style</div>
              <div className="font-medium">{selectedImage.style_name || 'Unknown'}</div>
              
              <div className="text-gray-500">Status</div>
              <div className="font-medium">
                {selectedImage.status === 1 ? 'Processing' : 
                 selectedImage.status === 2 ? 'Success' : 
                 selectedImage.status === 3 ? <span className="text-red-500">Failed</span> : 'Unknown'}
              </div>
              
              <div className="text-gray-500">Created At</div>
              <div className="font-medium">
                {selectedImage.ctime 
                  ? new Date(selectedImage.ctime * 1000).toLocaleString() 
                  : 'Unknown'}
              </div>
              
              {selectedImage.pic_orginial && (
                <>
              <div className="text-gray-500">View Original Image</div>
                  <div className="text-emerald-600 font-medium cursor-pointer" 
                       onClick={() => window.open(selectedImage.pic_orginial || '', '_blank')}>
                    Click here
                  </div>
                </>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex mt-6 gap-4">
              <button 
                className="flex-1 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
                onClick={() => window.open(selectedImage.pic_result || '', '_blank')}
              >
                Download Image
              </button>
              <button 
                className={`flex-1 py-3 rounded-md border ${selectedImage.is_like === 1 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'} transition`}
                onClick={async () => {
                  if (selectedImage) {
                    const newLikeStatus = selectedImage.is_like === 1 ? 0 : 1;
                    try {
                      // 调用API更新收藏状态
                      await updateGardenDesignLikeStatus(selectedImage.id, newLikeStatus);
                      
                      // 更新图片详情状态
                      setSelectedImage({...selectedImage, is_like: newLikeStatus});
                      
                      // 更新设计图片列表
                      setDesignImages(prevImages => 
                        prevImages.map(img => 
                          img.id === selectedImage.id ? { ...img, is_like: newLikeStatus } : img
                        )
                      );
                      
                      // 更新最近图片列表
                      setRecentImages(prevImages => 
                        prevImages.map(img => 
                          img.id === selectedImage.id ? { ...img, is_like: newLikeStatus } : img
                        )
                      );
                      
                      // 如果在"liked"标签页并且取消了喜欢，关闭详情窗口
                      if (imageTab === 'liked' && newLikeStatus === 0) {
                        setShowImageDetail(false);
                      }
                      
                    } catch (error) {
                      console.error('Failed to update like status:', error);
                    }
                  }
                }}
              >
                {selectedImage.is_like === 1 ? 'Liked' : 'Like'}
              </button>
            </div>
          </div>
          
          {/* 关闭按钮 */}
          <button 
            onClick={handleCloseImageDetail}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // 处理图片喜欢状态更新
  const handleLikeToggle = async (e: React.MouseEvent, image: GardenDesignImage) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发图片点击事件

    try {
      // 切换喜欢状态：如果当前是喜欢的，则设置为不喜欢，反之亦然
      const newLikeStatus = image.is_like === 1 ? 0 : 1;
      
      // 调用API更新喜欢状态
      await updateGardenDesignLikeStatus(image.id, newLikeStatus);
      
      // 更新图片列表中的状态
      setDesignImages(prevImages => 
        prevImages.map(img => 
          img.id === image.id ? { ...img, is_like: newLikeStatus } : img
        )
      );
      
      // 更新最近图片列表中的状态（如果存在）
      setRecentImages(prevImages => 
        prevImages.map(img => 
          img.id === image.id ? { ...img, is_like: newLikeStatus } : img
        )
      );
      
      // 如果在"liked"标签页并且取消了喜欢，则从列表中移除该图片
      if (imageTab === 'liked' && newLikeStatus === 0) {
        setDesignImages(prevImages => prevImages.filter(img => img.id !== image.id));
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
      // 可以添加错误提示
    }
  };

  // 处理图片删除
  const handleDelete = async (e: React.MouseEvent, image: GardenDesignImage) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发图片点击事件

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      // 调用API软删除图片
      await deleteGardenDesign(image.id);
      
      // 从当前图片列表中移除该图片
      setDesignImages(prevImages => prevImages.filter(img => img.id !== image.id));
      
      // 更新最近图片列表，如果该图片存在于最近图片列表中，也需要移除
      setRecentImages(prevImages => prevImages.filter(img => img.id !== image.id));
    } catch (error) {
      console.error('Failed to delete image:', error);
      // 可以添加错误提示
    }
  };
  
  // 监听项目切换事件
  useEffect(() => {
    console.log('Garden Design: Setting up project_selected event listener. Current project:', currentProject, 'Current tab:', imageTab);
    
    // 订阅项目选择事件
    const unsubscribe = on('project_selected', (data) => {
      console.log('Garden Design: Project selected event received with data:', data);
      
      const selectedProjectId = data?.selectedProjectId;
      console.log('Garden Design: Extracted project ID:', selectedProjectId, 'Current project ID:', currentProject?.id);
      
      if (selectedProjectId) {
        console.log('Garden Design: Loading data for project ID:', selectedProjectId);
        
        // 如果项目ID与当前项目ID相同，也需要强制刷新数据
        const isCurrentProject = currentProject?.id === selectedProjectId;
        console.log('Garden Design: Is same as current project?', isCurrentProject);
        
        // 获取最近图片数据
        console.log('Garden Design: Calling getGardenDesignImages with project ID:', selectedProjectId);
        getGardenDesignImages(selectedProjectId)
          .then(images => {
            console.log('Garden Design: Successfully got garden design images, count:', images.length);
            setRecentImages(images);
            
            // 根据图片数量设置状态
            if (images.length === 0) {
              setRecentImagesState('empty');
            } else if (images.length <= 4) {
              setRecentImagesState('single');
            } else if (images.length <= 8) {
              setRecentImagesState('multiple');
            } else {
              setRecentImagesState('many');
            }
          })
          .catch(error => {
            console.error('Garden Design: Failed to fetch garden design images after project change:', error);
            setRecentImagesState('empty');
          });
          
        // 根据当前标签页加载图片列表数据
        if (imageTab === 'all') {
          console.log('Garden Design: Loading all garden designs for project ID:', selectedProjectId);
          fetchGardenDesignList(selectedProjectId);
        } else if (imageTab === 'liked') {
          console.log('Garden Design: Loading liked garden designs for project ID:', selectedProjectId);
          fetchLikedGardenDesigns(selectedProjectId);
        } else if (imageTab === 'deleted') {
          console.log('Garden Design: Loading deleted garden designs for project ID:', selectedProjectId);
          fetchDeletedGardenDesigns(selectedProjectId);
        }
      }
    });
    
    // 每次组件挂载时，使用当前选中的项目ID加载数据
    if (currentProject) {
      console.log('Garden Design: Component mounted with current project, loading data for project ID:', currentProject.id);
      
      getGardenDesignImages(currentProject.id)
        .then(images => {
          console.log('Garden Design: Initial data load got images, count:', images.length);
          setRecentImages(images);
          
          // 根据图片数量设置状态
          if (images.length === 0) {
            setRecentImagesState('empty');
          } else if (images.length <= 4) {
            setRecentImagesState('single');
          } else if (images.length <= 8) {
            setRecentImagesState('multiple');
          } else {
            setRecentImagesState('many');
          }
        })
        .catch(error => {
          console.error('Garden Design: Failed to fetch initial garden design images:', error);
          setRecentImagesState('empty');
        });
        
      // 根据当前标签页加载图片列表数据
      if (imageTab === 'all') {
        fetchGardenDesignList(currentProject.id);
      } else if (imageTab === 'liked') {
        fetchLikedGardenDesigns(currentProject.id);
      } else if (imageTab === 'deleted') {
        fetchDeletedGardenDesigns(currentProject.id);
      }
    }
    
    // 清理订阅
    return () => {
      console.log('Garden Design: Cleaning up project_selected event listener');
      unsubscribe();
    };
  }, [on, imageTab, currentProject, fetchGardenDesignList, fetchLikedGardenDesigns, fetchDeletedGardenDesigns]);
  
  // 生成按钮
  const handleGenerate = async () => {
    try {
      // 验证是否有上传图片
      if (!uploadedImageUrl) {
        addNotification({
          type: 'warning',
          message: '请先上传或选择一张图片',
          duration: 5000
        });
        return;
      }
      
      // 验证是否选择了风格
      if (selectedTab === 'premade' && !selectedStyleId) {
        addNotification({
          type: 'warning',
          message: '请选择一种风格',
          duration: 5000
        });
        return;
      }
      
      // 获取项目ID - 首先尝试从当前项目获取
      let projectId = currentProject?.id;
      
      // 如果没有当前项目，尝试从localStorage获取
      if (!projectId) {
        const savedProjectId = localStorage.getItem('selectedProjectId');
        if (savedProjectId) {
          projectId = parseInt(savedProjectId, 10);
          console.log('Garden Design: Using project ID from localStorage:', projectId);
        }
      }
        
      // 如果仍然没有找到项目ID，显示错误
      if (!projectId) {
        addNotification({
          type: 'warning',
          message: '请先选择或创建一个项目',
          duration: 5000
        });
        return;
      }
      
      // 设置生成中状态
      setIsGenerating(true);
      
      console.log('Garden Design: Submitting generation request');
      console.log('- Image URL:', uploadedImageUrl);
      const styleType = selectedTab === 'premade' ? 'Classic styles' : 'Custom styles';
      console.log('- Style type:', styleType);
        
              // Prepare parameters
      let positiveWordsParam = '';
      let negativeWordsParam = '';
        
      if (selectedTab === 'premade') {
        console.log('- Preset style ID:', selectedStyleId);
        console.log('- Preset style name:', getSelectedStyle()?.name);
                  // For preset styles, only pass the style name
        positiveWordsParam = getSelectedStyle()?.name || '';
                  negativeWordsParam = ''; // For Classic styles, negative words are handled by the backend
      } else {
                  console.log('- Positive words:', positiveWords);
          console.log('- Negative words:', negativeWords);
                  // For custom styles, convert the word arrays to comma-separated strings
        positiveWordsParam = positiveWords.map(word => word.text).join(',');
        negativeWordsParam = negativeWords.map(word => word.text).join(',');
      }
        
      const structuralSimilarity = resemblancePercent.toString();
              console.log('- Structural similarity:', structuralSimilarity + '%');
        
              // Get image dimensions
      const imgElement = new window.Image();
        
      // 使用箭头函数保留this上下文
      imgElement.onload = () => {
        const width = imgElement.naturalWidth;
        const height = imgElement.naturalHeight;
        const sizeParam = `${width}*${height}`;
        console.log('- 图片尺寸:', sizeParam);
      
        // 调用API生成图片
        generateGardenDesign(
          uploadedImageUrl,
          sizeParam,
          styleType,
          positiveWordsParam,
          negativeWordsParam,
          structuralSimilarity,
          projectId
        )
        .then((response) => {
          console.log('Generation successful, returned data:', response);
          // 显示成功提示
          addNotification({
            type: 'success',
            message: 'Submission successful, your new garden is being generated',
            duration: 5000 // 5秒后自动消失
          });
            
          // 重新加载图片列表
          fetchGardenDesignList(projectId);
          
          // 刷新左侧最近图片
          if (projectId) {
            getGardenDesignImages(projectId)
              .then(images => {
                setRecentImages(images);
                
                // 根据图片数量设置状态
                if (images.length === 0) {
                  setRecentImagesState('empty');
                } else if (images.length <= 4) {
                  setRecentImagesState('single');
                } else if (images.length <= 8) {
                  setRecentImagesState('multiple');
                } else {
                  setRecentImagesState('many');
                }
              })
              .catch(error => {
                console.error('Failed to refresh recent images:', error);
              });
          }
          
          // 重置左半部分参数
          if (selectedTab === 'custom') {
            setPositiveWords([]);
            setNegativeWords([]);
            setPositiveInput('');
            setNegativeInput('');
          }
          setResemblancePercent(75); // 重置结构相似度
          setUploadedImage(false);
          setUploadedImageUrl(null);
          setPreviewImageUrl(null);
          setSelectedStyleId(null);
          
          // 重置生成中状态
          setIsGenerating(false);
        })
        .catch((error) => {
          console.error('生成失败:', error);
          // 重置生成中状态
          setIsGenerating(false);
            
          // 检查是否是订阅相关错误
          if (error.message && error.message.includes('active subscription')) {
            addNotification({
              type: 'warning',
              message: 'There are no active subscriptions, please check the annual discount subscription information.',
              duration: 7000 // 延长显示时间
            });
          } else {
            // 其他错误显示通用错误提示或服务器返回的消息
            addNotification({
              type: 'error',
              message: error.message || 'Failed to generate image, please try again',
              duration: 5000
            });
          }
        });
      };
        
      // 使用箭头函数保留this上下文
      imgElement.onerror = () => {
        console.error('无法加载图片以获取尺寸');
        // 重置生成中状态
        setIsGenerating(false);
        addNotification({
          type: 'error',
          message: 'Unable to load image, please upload again',
          duration: 5000
        });
      };
        
      // 设置图片src，触发onload事件
      imgElement.src = uploadedImageUrl;
    } catch (error) {
      console.error('Garden Design: Failed to generate image:', error);
      // 重置生成中状态
      setIsGenerating(false);
      addNotification({
        type: 'error',
        message: 'Failed to generate image, please try again',
        duration: 5000
      });
    }
  };
  
  // 获取用户自定义风格列表
  const fetchUserCustomStyles = useCallback(async () => {
    try {
      setIsLoadingStyles(true);
      const styles = await getUserCustomStyles();
      
      // 转换数据结构为组件所需的格式
      const formattedStyles = styles.map(style => {
        // 根据要求：如果positive_words不为空就展示positive_words，否则展示negative_words
        let previewText = '';
        if (style.positive_words && style.positive_words.length > 0) {
          previewText = style.positive_words.join(', ');
        } else if (style.negative_words && style.negative_words.length > 0) {
          previewText = style.negative_words.join(', ');
        }
        
        return {
          id: style.id,
          name: style.custom_style_name,
          preview: previewText,
          positive_words: style.positive_words,
          negative_words: style.negative_words
        };
      });
      
      setCustomStyles(formattedStyles);
    } catch (error) {
      console.error('获取自定义风格列表失败:', error);
    } finally {
      setIsLoadingStyles(false);
    }
  }, []);
  
  // 组件挂载时加载自定义风格列表
  useEffect(() => {
    fetchUserCustomStyles();
  }, [fetchUserCustomStyles]);
  
  return (
    <WithProjectCheck>
      <div className="w-full h-full overflow-hidden">
        <style jsx global>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0, 0, 0, 0.3);
          }
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          }
          
          /* 防止页面闪现滚动条 */
          html, body {
            overflow: hidden;
            height: 100%;
            width: 100%;
          }
          
          /* 确保主容器不会溢出 */
          #garden-design-root {
            overflow: hidden;
            height: 100%;
            width: 100%;
          }
        `}</style>
        
        <div id="garden-design-root" className="w-full h-full">
          {/* <h1 className="text-2xl font-bold mb-6">Images</h1> */}
          
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-1rem)] justify-start">
            {/* 左侧面板 */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:w-[48%] overflow-y-auto scrollbar-thin max-h-[calc(100vh-100px)]">
              {/* 最近图片 */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">1</div>
                  <h2 className="text-lg font-bold">Recent Images</h2>
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-500 relative"
                    onMouseEnter={() => setActiveTooltip('recent-images')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                    <Tooltip 
                      id="recent-images" 
                      text="Recent images you've generated or uploaded. You can drag these images to the upload area to reuse them as a base for new designs."
                    />
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  {renderRecentImages()}
                </div>
              </div>
              
              {/* 上传图片区域 */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">2</div>
                  <h2 className="text-lg font-bold">Upload Your Image</h2>
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-500 relative"
                    onMouseEnter={() => setActiveTooltip('upload-image')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                    <Tooltip 
                      id="upload-image" 
                      text="Upload an image of your current garden to use as a starting point. Square images with good lighting work best. Supported formats: JPG, PNG, WEBP."
                    />
                  </button>
                </div>
                
                <div className="text-sm text-gray-600 mb-3 bg-green-100 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-green-800">Tips for achieving optimal results:</h3>
                      <p className="text-sm text-green-700">Employ square-shaped images</p>
                      <p className="text-sm text-green-700">Guarantee excellent lighting conditions</p>
                      <p className="text-sm text-green-700">Maintain a high level of resolution</p>
                      <p className="text-sm text-green-700">Present a complete view of the garden</p>
                    </div>
                  </div>
                </div>
                
                {/* Upload Image Area */}
                {!uploadedImage ? (
                  <div 
                    ref={uploadAreaRef}
                    className={`border-2 border-dashed ${isDragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'} rounded-lg p-6 flex flex-col items-center justify-center transition-colors`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="w-12 h-12 mb-4 flex items-center justify-center bg-emerald-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-center mb-1">
                      {isDragOver ? 'Drop image to upload' : 'Drag and drop image here or click to upload'}
                    </p>
                    <p className="text-xs text-gray-500 text-center">Supports JPG, PNG, WEBP formats</p>
                    <p className="text-xs text-gray-500 text-center mt-1">Or drag an image from Recent Images section</p>
                    <label className="mt-4">
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileInputChange} />
                      <span className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition cursor-pointer">
                        Select File
                      </span>
                    </label>
                    
                    {/* Upload progress indicator */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 mb-3 relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        </div>
                        <p className="text-sm font-medium text-emerald-600">Uploading...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    ref={uploadAreaRef}
                    className={`border-2 border-dashed ${isDragOver ? 'border-emerald-500' : 'border-gray-300'} rounded-lg p-2 group cursor-pointer transition-colors relative`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={(e) => {
                      // Ensure click event only triggers on the div itself, not bubbling
                      if (e.currentTarget === e.target || e.target instanceof Node && e.currentTarget.contains(e.target)) {
                        const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) fileInput.click();
                      }
                    }}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-md">
                      <Image 
                        src={previewImageUrl || uploadedImageUrl || '/uploads/garden-sample.png'} 
                        alt="Uploaded Garden" 
                        fill
                        sizes="100%"
                        style={{objectFit: 'cover'}}
                        className="transition-transform group-hover:scale-105"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center ${isDragOver ? 'bg-black bg-opacity-40' : 'bg-black bg-opacity-0 group-hover:bg-opacity-40'} transition-all`}>
                        <p className={`text-white font-medium ${isDragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          {isDragOver ? 'Drop to replace image' : 'Click to change image'}
                        </p>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={handleFileInputChange} 
                    />
                    {uploadedImageUrl && (
                      <div className="mt-2 text-xs text-gray-500 truncate px-1">
                        <span className="font-medium">Image uploaded successfully</span>
                      </div>
                    )}
                    
                    {/* Upload progress indicator */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 mb-3 relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        </div>
                        <p className="text-sm font-medium text-emerald-600">Uploading...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Partial Redesign部分 */}
              {/* <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">3</div>
                  <h2 className="text-lg font-bold">Partial Redesign</h2>
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-500 relative"
                    onMouseEnter={() => setActiveTooltip('partial-redesign')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                    <Tooltip 
                      id="partial-redesign" 
                      text="Select specific areas of your garden to modify while keeping the rest unchanged. Use the brush tool to precisely indicate which parts you want to redesign."
                    />
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Steps to elevate the visualization of your garden:</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mr-2 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Utilize the brush tool to carefully pick out the specific areas within the garden that you wish to make adjustments to</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mr-2 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Take advantage of the zoom function for a closer look, and make use of the region fill and bucket tool to accurately define and fill in the boundaries of your garden, ensuring a more refined and detailed representation</span>
                    </li>
                  </ul>
                  
                  <button className="mt-4 px-4 py-1.5 border border-gray-300 bg-white rounded-lg text-sm flex items-center justify-center hover:bg-gray-50 transition w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Edit Garden Image
                  </button>
                </div>
              </div> */}
              
              {/* 选择风格 */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">3</div>
                  <h2 className="text-lg font-bold">Select Style</h2>
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-500 relative"
                    onMouseEnter={() => setActiveTooltip('select-style')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                    <Tooltip 
                      id="select-style" 
                      text="Choose from predefined garden styles or create your own custom style using positive and negative words. Different styles will significantly change the look of your garden."
                    />
                  </button>
                </div>
                
                <div className="flex mb-4 border-b border-gray-200">
                  <button 
                    className={`px-4 py-2 text-sm font-medium ${selectedTab === 'premade' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setSelectedTab('premade')}
                  >
                    Classic styles
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm font-medium ${selectedTab === 'custom' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setSelectedTab('custom')}
                  >
                    Custom styles
                  </button>
                </div>
                
                {/* 只在Classic styles页签下显示Choose a Style文本 */}
                {/* {selectedTab === 'premade' && (
                  <div className="ml-2 flex mb-5">
                    <span className="text-xs text-gray-700">Choose a Style:</span>
                  </div>
                )} */}

                {/* 根据选中的页签显示不同内容 */}
                {selectedTab === 'premade' ? (
                  <div>
                    <div className="ml-2 flex mb-3">
                      <span className="text-xs text-gray-700">Choose a Style:</span>
                      </div>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {gardenStyles.map((style) => (
                        <div 
                          key={style.id}
                          className={`border rounded-lg p-2 cursor-pointer transition ${
                            selectedStyleId === style.id 
                              ? 'border-emerald-600 bg-emerald-50 shadow-sm' 
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}
                          onClick={() => handleStyleSelect(style.id)}
                        >
                      <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                        <Image 
                              src={style.image}
                              alt={style.name}
                          fill
                          sizes="100%"
                          style={{objectFit: 'cover'}}
                              className={`transition-transform ${selectedStyleId === style.id ? 'scale-105' : 'hover:scale-105'}`}
                        />
                      </div>
                          <p className={`text-xs font-medium ${selectedStyleId === style.id ? 'text-emerald-700' : ''}`}>
                            {style.name}
                          </p>
                    </div>
                      ))}
                      </div>
                    {selectedStyleId && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <h4 className="text-sm font-bold text-emerald-700 mb-1">{getSelectedStyle()?.name}:</h4>
                        <p className="text-xs text-emerald-700">{getSelectedStyle()?.description}</p>
                    </div>
                    )}
                  </div>
                ) : (
                  /* 自定义风格内容 */
                  renderCustomStyleContent()
                )}
              </div>
              
              {/* 结构相似度 */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">4</div>
                  <h2 className="text-lg font-bold">Structural Similarity</h2>
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-500 relative"
                    onMouseEnter={() => setActiveTooltip('structural-resemblance')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                    <Tooltip 
                      id="structural-resemblance" 
                      text="Control how closely the generated image will match your original garden's layout. Higher values preserve more of the original structure, while lower values allow more creative freedom."
                    />
                  </button>
                  <div className="flex-grow"></div>
                  <button 
                    className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300"
                    onClick={resetResemblance}
                  >
                    Reset
                  </button>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Least Similarity</span>
                  <span>Highest Similarity</span>
                </div>
                
                <div 
                  ref={sliderRef}
                  className="relative h-2 bg-gray-200 rounded-full mb-2 cursor-pointer"
                  onClick={(e) => updateSliderPosition(e.clientX)}
                >
                  <div 
                    className="absolute h-full bg-emerald-600 rounded-full" 
                    style={{ width: `${resemblancePercent}%` }}
                  ></div>
                  <div 
                    className="absolute h-5 w-5 bg-white border-2 border-emerald-600 rounded-full top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
                    style={{ left: `${resemblancePercent}%`, marginLeft: "-10px" }}
                    onMouseDown={handleSliderMouseDown}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
                
                <div className="mt-2 text-sm font-medium text-center">
                  {resemblancePercent}%
                </div>
              </div>
              
              {/* 生成按钮 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">5</div>
                  <h2 className="text-lg font-bold">Generate</h2>
                </div>
                
                <button 
                  className={`w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center ${
                    (isGenerating || !uploadedImage || (!selectedStyleId && selectedTab === 'premade')) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isGenerating || !uploadedImage || (!selectedStyleId && selectedTab === 'premade')}
                  onClick={handleGenerate}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      Generate Your Garden Design
                    </>
                  )}
                </button>
              </div>
              

            </div>
            
            {/* 右侧面板 */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:w-[48%] max-h-[calc(100vh-100px)] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Images</h2>
                  
                  <div className="flex space-x-2">
                    {/* Tab buttons */}
                    <div className="flex rounded-md shadow-sm">
                      <button 
                        onClick={() => handleTabChange('all')}
                        className={`px-3 py-1.5 text-sm font-medium border ${
                          imageTab === 'all' 
                            ? 'bg-gray-800 text-white border-gray-800' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } rounded-l-md`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => handleTabChange('liked')}
                        className={`px-3 py-1.5 text-sm font-medium border-t border-b border-r ${
                          imageTab === 'liked' 
                            ? 'bg-gray-800 text-white border-gray-800' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Like
                      </button>
                      <button 
                        onClick={() => handleTabChange('deleted')}
                        className={`px-3 py-1.5 text-sm font-medium border-t border-b border-r ${
                          imageTab === 'deleted' 
                            ? 'bg-gray-800 text-white border-gray-800' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } rounded-r-md`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-green-800">Smart Tips:</h3>
                      <p className="text-sm text-green-700">Create your design easily by choosing a classic style. By setting positive words and negative words, you can find a different creative design result.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto">
                {renderImageList()}
              </div>
            </div>
          </div>
          
          {/* 保存风格对话框 */}
          {showSaveStyleDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-medium mb-4">Save Custom Style</h3>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Style Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter a name for your style"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      value={styleNameInput}
                      onChange={(e) => setStyleNameInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end bg-gray-50 px-5 py-3">
                  <button 
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 mr-2"
                    onClick={handleCloseSaveStyleDialog}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-md text-sm text-white ${
                      styleNameInput.trim() ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-300 cursor-not-allowed'
                    }`}
                    onClick={handleSaveStyle}
                    disabled={!styleNameInput.trim()}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 编辑风格对话框 */}
          {showEditStyleDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60]">
              <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-medium mb-4">Edit Custom Style</h3>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Style Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter a name for your style"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      value={editStyleNameInput}
                      onChange={(e) => setEditStyleNameInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end bg-gray-50 px-5 py-3">
                  <button 
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 mr-2"
                    onClick={() => {
                      setShowDeleteConfirmDialog(false);
                      setDeletingStyleId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-md text-sm text-white ${
                      editStyleNameInput.trim() ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-300 cursor-not-allowed'
                    }`}
                    onClick={handleUpdateStyle}
                    disabled={!editStyleNameInput.trim()}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 删除确认对话框 */}
          {showDeleteConfirmDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60]">
              <div className="bg-white rounded-lg shadow-xl w-80 overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-medium mb-4">Delete Style</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Are you sure you want to delete this style?
                  </p>
                  <p className="text-xs text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end bg-gray-50 px-5 py-3">
                  <button 
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 mr-2"
                    onClick={() => {
                      setShowDeleteConfirmDialog(false);
                      setDeletingStyleId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 rounded-md text-sm text-white bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteCustomStyle}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* 加载风格对话框 */}
          {showLoadStyleDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-[560px] overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-medium mb-4">Your Custom Styles</h3>
                  
                  <div className="mb-4">
                    <div className="flex items-center border-b border-gray-200 pb-2 mb-2">
                      <div className="w-1/4 font-medium text-sm text-gray-700">Name</div>
                      <div className="w-1/2 font-medium text-sm text-gray-700">Preview</div>
                      <div className="w-1/4 font-medium text-sm text-gray-700">Actions</div>
                    </div>
                    
                    {isLoadingStyles ? (
                      <div className="py-12 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <span className="ml-3 text-gray-600">Loading styles...</span>
                      </div>
                    ) : customStyles.length > 0 ? (
                      <div>
                        <div className="max-h-64 overflow-y-auto">
                          {customStyles
                            .slice((currentPage - 1) * stylesPerPage, currentPage * stylesPerPage)
                            .map(style => (
                              <div key={style.id} className="flex items-center py-2 border-b border-gray-100">
                                <div className="w-1/4 text-sm text-gray-700">{style.name}</div>
                                <div className="w-1/2 text-sm text-gray-500 truncate">{style.preview}</div>
                                <div className="w-1/4 flex items-center space-x-2">
                                  <button 
                                    className="p-1 text-gray-500 hover:text-emerald-600"
                                    onClick={() => handleLoadStyle(style.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="p-1 text-gray-500 hover:text-emerald-600"
                                    onClick={() => handleOpenEditStyleDialog(style.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="p-1 text-gray-500 hover:text-red-600"
                                    onClick={() => {
                                      setDeletingStyleId(style.id);
                                      setShowDeleteConfirmDialog(true);
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                        
                        {/* 分页控制 */}
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-xs text-gray-500">
                            Showing {Math.min((currentPage - 1) * stylesPerPage + 1, customStyles.length)} - {Math.min(currentPage * stylesPerPage, customStyles.length)} of {customStyles.length} items
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className={`px-2 py-1 text-xs rounded border ${
                                currentPage === 1
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                            {Array.from(
                              { length: Math.min(3, Math.ceil(customStyles.length / stylesPerPage)) },
                              (_, i) => i + 1
                            ).map(page => (
                              <button
                                key={page}
                                className={`px-2 py-1 text-xs rounded ${
                                  currentPage === page
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                                }`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            ))}
                            <button
                              className={`px-2 py-1 text-xs rounded border ${
                                currentPage >= Math.ceil(customStyles.length / stylesPerPage)
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                              onClick={() =>
                                setCurrentPage(prev => 
                                  Math.min(prev + 1, Math.ceil(customStyles.length / stylesPerPage))
                                )
                              }
                              disabled={currentPage >= Math.ceil(customStyles.length / stylesPerPage)}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <p>You haven't saved any custom styles yet.</p>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-500">
                      {customStyles.length}/100 styles
                    </div>
                  </div>
                </div>
                <div className="flex justify-end bg-gray-50 px-5 py-3">
                  <button 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                    onClick={handleCloseLoadStyleDialog}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 图片详情弹窗 */}
        {renderImageDetailModal()}
      </div>
    </WithProjectCheck>
  );
} 