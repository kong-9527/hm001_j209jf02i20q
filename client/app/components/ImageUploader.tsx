import React, { useState, useRef, useEffect } from 'react';
import { uploadImage } from '../services/uploadService';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string | null;
  className?: string;
  aspectRatio?: string; // 可选的纵横比设置
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded, 
  currentImage = null,
  className = '',
  aspectRatio = 'aspect-[4/3]' // 默认4:3比例
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当currentImage变化时更新预览
  useEffect(() => {
    setPreviewUrl(currentImage);
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // 验证文件大小 (限制为 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // 创建本地预览
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // 上传图片
      const imageUrl = await uploadImage(file);
      
      // 清理本地预览URL
      URL.revokeObjectURL(objectUrl);
      
      // 设置服务器返回的图片URL
      setPreviewUrl(imageUrl);
      
      // 通知父组件
      onImageUploaded(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreviewUrl(currentImage);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发上传
    setPreviewUrl(null);
    onImageUploaded(''); // 发送空字符串表示移除图片
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // 重置文件输入
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className={`relative w-full ${aspectRatio} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer overflow-hidden transition-all hover:border-gray-400`}
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Image preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90 transition-all"
              title="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">Click to upload image</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (max 5MB)</p>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-green-500 animate-spin"></div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader; 