'use client';

import React, { useState, FormEvent, useRef, DragEvent, useEffect } from 'react';
import Image from 'next/image';

// 定义图片数据类型
interface ImageData {
  id: number;
  src: string;
  alt: string;
  date: string;
}

// 定义词汇标签类型
interface WordTag {
  id: number;
  text: string;
}

// 定义风格数据类型
interface GardenStyle {
  id: number;
  name: string;
  image: string;
  description: string;
}

export default function PhotoGenerator() {
  const [selectedTab, setSelectedTab] = useState('premade');
  const [uploadedImage, setUploadedImage] = useState(true); // 默认已上传图片状态，实际应用中默认为false
  const [recentImagesState, setRecentImagesState] = useState<'empty' | 'single' | 'multiple' | 'many'>('single'); // 默认显示单图状态
  const [debugInput, setDebugInput] = useState('');
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadAreaRef = useRef<HTMLDivElement>(null);
  
  // 结构相似度相关状态
  const [resemblancePercent, setResemblancePercent] = useState(75); // 默认75%
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
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
  
  // 删除确认对话框状态
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deletingStyleId, setDeletingStyleId] = useState<number | null>(null);
  
  // 用户自定义风格列表
  const [customStyles, setCustomStyles] = useState([
    { id: 1, name: 'Japanese Garden', preview: 'zen rock garden, moss covered stones, maple trees, minimalist design...' },
    { id: 2, name: 'English Cottage', preview: 'wildflowers, roses, lavender paths, rustic wooden gates, cottage perennials...' },
    { id: 3, name: 'Modern Minimalist', preview: 'geometric patterns, concrete planters, succulents, structured design...' },
    { id: 4, name: 'Tropical Paradise', preview: 'palm trees, exotic flowers, vibrant colors, banana leaves, natural pool...' },
    { id: 5, name: 'Mediterranean', preview: 'olive trees, terracotta pots, lavender, stone paths, warm sunlight...' },
    { id: 6, name: 'Woodland Retreat', preview: 'native trees, forest floor, ferns, moss patches, dappled sunlight...' },
    { id: 7, name: 'Desert Oasis', preview: 'cacti, succulents, rock garden, drought resistant plants, warm tones...' },
    { id: 8, name: 'French Formal', preview: 'geometric hedges, symmetrical design, gravel paths, classical statues...' },
    { id: 9, name: 'Cottage Herb', preview: 'herb garden, rustic wooden planters, informal layout, edible flowers...' },
    { id: 10, name: 'Zen Water', preview: 'koi pond, water lilies, bamboo fountains, meditation area, smooth stones...' },
    { id: 11, name: 'Rooftop Urban', preview: 'container gardens, city views, vertical gardens, outdoor seating, small trees...' },
    { id: 12, name: 'Fairy Garden', preview: 'miniature features, whimsical elements, moss paths, tiny flowers, magical...' },
    { id: 13, name: 'Coastal Garden', preview: 'grasses, driftwood, salt-tolerant plants, beach stones, sandy paths...' },
    { id: 14, name: 'Night Garden', preview: 'white flowers, silver foliage, moonlight reflection, soft lighting...' },
  ]);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const stylesPerPage = 5;
  
  // 预设词汇选项
  const positiveWordOptions: WordTag[] = [
    { id: 1, text: 'silver and white flowers' },
    { id: 2, text: 'gold accents' },
    { id: 3, text: 'ornamental perennials' },
    { id: 4, text: 'pale timber' },
    { id: 5, text: 'artistic sightlines' },
    { id: 6, text: 'hiding places' },
    { id: 7, text: 'monumental sculptures' }
  ];
  
  const negativeWordOptions: WordTag[] = [
    { id: 1, text: 'heavyweight materials' },
    { id: 2, text: 'corporate design' },
    { id: 3, text: 'artificial materials' },
    { id: 4, text: 'formal arrangements' },
    { id: 5, text: 'industrial elements' },
    { id: 6, text: 'historical references' }
  ];
  
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
  };
  
  // 处理关闭加载风格对话框
  const handleCloseLoadStyleDialog = () => {
    setShowLoadStyleDialog(false);
  };
  
  // 处理打开编辑风格对话框
  const handleOpenEditStyleDialog = (styleId: number) => {
    const styleToEdit = customStyles.find(style => style.id === styleId);
    if (styleToEdit) {
      setEditingStyleId(styleId);
      setEditStyleNameInput(styleToEdit.name);
      setShowEditStyleDialog(true);
      
      // 在实际应用中，这里会加载风格对应的正负向词汇
      // setPositiveWords([...]);
      // setNegativeWords([...]);
    }
  };
  
  // 处理关闭编辑风格对话框
  const handleCloseEditStyleDialog = () => {
    setShowEditStyleDialog(false);
    setEditingStyleId(null);
  };
  
  // 处理更新风格
  const handleUpdateStyle = () => {
    if (editStyleNameInput.trim() && editingStyleId) {
      // 在实际应用中，这里会调用API更新自定义风格
      console.log('更新风格ID:', editingStyleId);
      console.log('新风格名称:', editStyleNameInput);
      console.log('正向词汇:', positiveWords);
      console.log('负向词汇:', negativeWords);
      
      // 更新本地风格列表
      setCustomStyles(customStyles.map(style => 
        style.id === editingStyleId 
          ? { ...style, name: editStyleNameInput } 
          : style
      ));
      
      // 关闭对话框
      setShowEditStyleDialog(false);
      setEditingStyleId(null);
    }
  };
  
  // 处理加载风格
  const handleLoadStyle = (styleId: number) => {
    // 在实际应用中，这里会根据风格ID加载相应的风格数据
    console.log('加载风格ID:', styleId);
    
    // 关闭对话框
    setShowLoadStyleDialog(false);
  };
  
  // 处理删除自定义风格
  const handleDeleteCustomStyle = () => {
    if (deletingStyleId) {
      // 在实际应用中，这里会调用API删除风格
      console.log('删除风格ID:', deletingStyleId);
      setCustomStyles(customStyles.filter(style => style.id !== deletingStyleId));
      
      // 关闭对话框
      setShowDeleteConfirmDialog(false);
      setDeletingStyleId(null);
    }
  };
  
  // 处理保存风格
  const handleSaveStyle = () => {
    if (styleNameInput.trim()) {
      // 在实际应用中，这里会调用API保存自定义风格
      console.log('保存自定义风格:', styleNameInput);
      console.log('正向词汇:', positiveWords);
      console.log('负向词汇:', negativeWords);
      
      // 添加到自定义风格列表
      const newStyle = {
        id: Date.now(),
        name: styleNameInput,
        preview: 'mysterious shadows, authentic medieval architecture...' // 在实际应用中，这里会根据词汇生成预览文本
      };
      setCustomStyles([...customStyles, newStyle]);
      
      // 关闭对话框
      setShowSaveStyleDialog(false);
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
  const gardenStyles: GardenStyle[] = [
    {
      id: 1,
      name: "Japanese Zen Garden",
      image: "/uploads/garden-sample.png",
      description: "Minimalist design featuring carefully arranged rocks, gravel, and pruned plants to create a tranquil meditation space."
    },
    {
      id: 2,
      name: "English Cottage Garden",
      image: "/uploads/garden-sample.png", 
      description: "Lush, romantic garden with densely planted flowering perennials, climbing roses, and informal design."
    },
    {
      id: 3,
      name: "Modern Minimalist",
      image: "/uploads/garden-sample.png",
      description: "Clean lines, architectural plants, and simple color palette with emphasis on form and texture."
    },
    {
      id: 4,
      name: "Mediterranean Garden",
      image: "/uploads/garden-sample.png",
      description: "Drought-tolerant plants, terracotta elements, and gravel paths inspired by the Mediterranean climate."
    },
    {
      id: 5,
      name: "Tropical Paradise",
      image: "/uploads/garden-sample.png",
      description: "Lush foliage, vibrant flowers, and water features creating a resort-like atmosphere."
    },
    {
      id: 6,
      name: "French Formal Garden",
      image: "/uploads/garden-sample.png",
      description: "Symmetrical design with carefully manicured hedges, geometric patterns, and classical elements."
    },
    {
      id: 7,
      name: "Desert Landscape",
      image: "/uploads/garden-sample.png",
      description: "Featuring cacti, succulents, and rocky elements adapted to arid conditions."
    },
    {
      id: 8,
      name: "Woodland Garden",
      image: "/uploads/garden-sample.png",
      description: "Naturalistic design with native trees, shade-loving plants, and organic pathways."
    },
    {
      id: 9,
      name: "Contemporary Urban",
      image: "/uploads/garden-sample.png",
      description: "Innovative use of space with vertical gardens, container plants, and modern materials."
    },
    {
      id: 10,
      name: "Chinese Classical Garden",
      image: "/uploads/garden-sample.png",
      description: "Harmonious design with water features, ornate pavilions, and symbolic elements."
    }
  ];

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
      setUploadedImage(true);
      console.log(`将图片 ${imageSrc} 拖放到上传区域`);
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
        console.log('只支持图片文件');
        // 可以在这里添加错误提示
      }
    }
  };
  
  // 处理文件上传
  const handleFileUpload = (file: File) => {
    // 创建文件的预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        // 设置为已上传状态
        setUploadedImage(true);
        console.log('文件上传成功:', file.name);
        
        // 实际项目中这里会调用API将文件发送到服务器
        // 在这个示例中我们只是设置上传状态
      }
    };
    reader.readAsDataURL(file);
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
    
    // 控制图片上传状态
    if (debugInput.includes('2：有图')) {
      setUploadedImage(true);
      console.log("设置为已上传状态");
    } else if (debugInput.includes('2：空')) {
      setUploadedImage(false);
      console.log("设置为未上传状态");
    }
    
    // 控制最近图片状态
    if (debugInput.includes('1：空')) {
      setRecentImagesState('empty');
      console.log("设置为空状态");
    } else if (debugInput.includes('1：有图')) {
      setRecentImagesState('single');
      console.log("设置为单图状态");
    } else if (debugInput.includes('1：多图')) {
      setRecentImagesState('multiple');
      console.log("设置为多图状态");
    } else if (debugInput.includes('1:20图') || debugInput.includes('1:20图')) {
      setRecentImagesState('many');
      console.log("设置为20图状态");
    }
    
    // 清空输入框
    setDebugInput('');
    
    // 可以在控制台输出当前状态，方便调试
    console.log('Debug input:', debugInput);
    console.log('Uploaded image state:', uploadedImage);
    console.log('Recent images state:', recentImagesState);
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
        const imageData = imageDataMap[recentImagesState];
        
        // 单张图片不需要滚动容器
        if (recentImagesState === 'single') {
          return (
            <div className="grid grid-cols-4 gap-2">
              {imageData.map((image) => (
                <div 
                  key={image.id} 
                  className="relative aspect-square bg-gray-100 rounded-md overflow-hidden cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, image.src)}
                  onDragEnd={handleDragEnd}
                >
                  <Image 
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                    {image.date}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        
        // 多张图片需要滚动容器
        return (
          <div className="max-h-[20rem] overflow-y-auto pr-1">
            <div className="grid grid-cols-4 gap-2">
              {imageData.map((image) => (
                <div 
                  key={image.id} 
                  className="relative aspect-square bg-gray-100 rounded-md overflow-hidden cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, image.src)}
                  onDragEnd={handleDragEnd}
                >
                  <Image 
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                    {image.date}
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
  
  return (
    <div className="w-full h-full">
      {/* <h1 className="text-2xl font-bold mb-6">Images</h1> */}
      
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-3rem)]">
        {/* 左侧面板 */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex-1 overflow-y-auto">
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
                  <h3 className="text-sm font-medium text-green-800">Tips for the best results:</h3>
                  <p className="text-sm text-green-700">Use square images</p>
                  <p className="text-sm text-green-700">Ensure good lighting</p>
                  <p className="text-sm text-green-700">High resolution</p>
                  <p className="text-sm text-green-700">Full garden view</p>
                </div>
              </div>
            </div>
            
            {/* 上传图片状态 */}
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
                  {isDragOver ? 'Release to upload image' : 'Drop your image here or click to upload'}
                </p>
                <p className="text-xs text-gray-500 text-center">Supports JPG, PNG, WEBP</p>
                <label className="mt-4">
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileInputChange} />
                  <span className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition cursor-pointer">
                    Select File
                  </span>
                </label>
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
                  // 确保点击事件只在div内部触发，而不是冒泡
                  if (e.currentTarget === e.target || e.target instanceof Node && e.currentTarget.contains(e.target)) {
                    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
                    if (fileInput) fileInput.click();
                  }
                }}
              >
                <div className="relative aspect-video overflow-hidden rounded-md">
                  <Image 
                    src="/uploads/garden-sample.png" 
                    alt="Uploaded Garden" 
                    fill
                    sizes="100%"
                    style={{objectFit: 'cover'}}
                    className="transition-transform group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 flex items-center justify-center ${isDragOver ? 'bg-black bg-opacity-40' : 'bg-black bg-opacity-0 group-hover:bg-opacity-40'} transition-all`}>
                    <p className={`text-white font-medium ${isDragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                      {isDragOver ? 'Release to replace image' : 'Click to change image'}
                    </p>
                  </div>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleFileInputChange} 
                />
              </div>
            )}
          </div>
          
          {/* Partial Redesign部分 */}
          <div className="mb-8">
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
              <p className="text-sm text-gray-600 mb-3">Optionally enhance your garden visualization:</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mr-2 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Select areas you want to modify with the brush tool</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mr-2 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Use the zoom, region fill and bucket tool to precisely fill in your garden boundaries</span>
                </li>
              </ul>
              
              <button className="mt-4 px-4 py-1.5 border border-gray-300 bg-white rounded-lg text-sm flex items-center justify-center hover:bg-gray-50 transition w-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Garden Image
              </button>
            </div>
          </div>
          
          {/* 选择风格 */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">4</div>
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
              <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">5</div>
              <h2 className="text-lg font-bold">Structural Resemblance</h2>
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
              <span>Weakest Resemblance</span>
              <span>Strongest Resemblance</span>
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
              <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2">6</div>
              <h2 className="text-lg font-bold">Generate</h2>
            </div>
            
            <button 
              className={`w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center ${
                (!uploadedImage || (!selectedStyleId && selectedTab === 'premade')) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!uploadedImage || (!selectedStyleId && selectedTab === 'premade')}
              onClick={() => {
                // 在实际应用中，这里会调用API生成图片
                if (selectedTab === 'premade') {
                  console.log('生成图片，使用预设风格:', getSelectedStyle()?.name);
                } else {
                  console.log('生成图片，使用自定义风格。正向词:', positiveWords, '负向词:', negativeWords);
                }
                console.log('结构相似度:', resemblancePercent + '%');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              Generate Image
            </button>
          </div>
          
          {/* 调试区域 */}
          <div className="mt-8 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">调试工具</h3>
            <form onSubmit={handleDebugSubmit} className="flex flex-col space-y-2">
              <input
                type="text"
                value={debugInput}
                onChange={(e) => setDebugInput(e.target.value)}
                placeholder="输入'1：空'/'1：有图'/'1：多图'/'1:20图'或'2：有图'/'2：空'"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition"
              >
                提交调试命令
              </button>
            </form>
            <div className="mt-2 text-xs text-gray-500">
              <div>最近图片状态: {recentImagesState}</div>
              <div>当前上传图片状态: {uploadedImage ? '已上传' : '未上传'}</div>
            </div>
          </div>
        </div>
        
        {/* 右侧面板 */}
        <div className="bg-white rounded-lg shadow-sm flex-1 overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Images</h2>
              
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download All
                </button>
                
                <button className="p-1 text-emerald-600 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <button className="p-1 text-gray-500 hover:text-gray-700 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="bg-green-100 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Smart Tips:</h3>
                  <p className="text-sm text-green-700">Try both premade and custom styles for different creative results.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Yet</h3>
            <p className="text-sm text-gray-500 text-center mb-4">Upload an image and choose a style to get started</p>
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
                
                {customStyles.length > 0 ? (
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
                        显示 {Math.min((currentPage - 1) * stylesPerPage + 1, customStyles.length)} - {Math.min(currentPage * stylesPerPage, customStyles.length)} 共 {customStyles.length} 条
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
                          上一页
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
                          下一页
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
  );
} 