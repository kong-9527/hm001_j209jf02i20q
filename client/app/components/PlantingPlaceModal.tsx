import React, { useState, useEffect } from 'react';

// 定义种植位置接口
interface PlantingPlace {
  id: number;
  inOut: string;
  type: string;
  length: string;
  width: string;
  height: string;
  diameter: string;
  sunlight: string;
  soil: string;
  waterAccess: string;
  measurement: string;
}

// 定义弹窗属性接口
interface PlantingPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (place: PlantingPlace) => void;
  editData?: PlantingPlace | null;
  modalTitle?: string;
}

// 默认数据
const defaultData: PlantingPlace = {
  id: Date.now(),
  inOut: '', // 清空默认值
  type: '', // 清空默认值
  length: '',
  width: '',
  height: '',
  diameter: '',
  sunlight: '', // 清空默认值
  soil: '', // 清空默认值
  waterAccess: '', // 清空默认值
  measurement: 'inches' // 保留默认值为inches
};

// 定义错误信息接口
interface FormErrors {
  inOut?: string;
  type?: string;
  length?: string;
  width?: string;
  height?: string;
  diameter?: string;
  sunlight?: string;
  soil?: string;
  waterAccess?: string;
}

const PlantingPlaceModal: React.FC<PlantingPlaceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editData,
  modalTitle = "Add Planting Place"
}) => {
  // 使用state管理表单数据
  const [formData, setFormData] = useState<PlantingPlace>(defaultData);
  // 添加错误状态
  const [errors, setErrors] = useState<FormErrors>({});
  // 添加表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 监听isOpen和editData变化，重新初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // 如果是编辑模式，使用传入的数据
        setFormData({...editData});
      } else {
        // 如果是新增模式，重置为默认状态
        setFormData({...defaultData, id: Date.now()});
      }
      // 重置错误状态
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, editData]);

  // 处理表单字段更改
  const handleChange = (field: keyof PlantingPlace, value: string) => {
    // 创建新的表单数据对象
    const updatedFormData = {
      ...formData,
      [field]: value
    };

    // 如果更改的是"type"字段，清空与新类型无关的尺寸字段
    if (field === 'type') {
      if (value === 'square-pot') {
        // 方盆：清空diameter
        updatedFormData.diameter = '';
      } else if (value === 'round-pot') {
        // 圆盆：清空length和width
        updatedFormData.length = '';
        updatedFormData.width = '';
      } else if (value === 'raised-bed') {
        // 高床：清空diameter
        updatedFormData.diameter = '';
      } else if (value === 'ground') {
        // 地上种植：清空height和diameter
        updatedFormData.height = '';
        updatedFormData.diameter = '';
      }
    }

    // 清除相关字段的错误
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }

    setFormData(updatedFormData);
  };

  // 验证表单数据
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 检查必填字段
    if (!formData.inOut) {
      newErrors.inOut = "Please select indoor or outdoor";
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = "Please select a cultivation type";
      isValid = false;
    }

    // 根据cultivation类型验证尺寸字段
    if (formData.type === 'square-pot' || formData.type === 'raised-bed' || formData.type === 'ground') {
      if (!formData.length) {
        newErrors.length = "Length is required";
        isValid = false;
      }
      if (!formData.width) {
        newErrors.width = "Width is required";
        isValid = false;
      }
    }

    if (formData.type === 'square-pot' || formData.type === 'round-pot' || formData.type === 'raised-bed') {
      if (!formData.height) {
        newErrors.height = "Height is required";
        isValid = false;
      }
    }

    if (formData.type === 'round-pot') {
      if (!formData.diameter) {
        newErrors.diameter = "Diameter is required";
        isValid = false;
      }
    }

    if (!formData.sunlight) {
      newErrors.sunlight = "Please select sunlight condition";
      isValid = false;
    }

    if (!formData.soil) {
      newErrors.soil = "Please select soil type";
      isValid = false;
    }

    if (!formData.waterAccess) {
      newErrors.waterAccess = "Please select water access";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 处理保存操作
  const handleSave = () => {
    setIsSubmitting(true);
    
    // 验证表单
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // 创建一个新对象以避免直接修改state
    const dataToSave = { ...formData };
    
    // 根据cultivation类型清空不需要的字段
    if (dataToSave.type === 'square-pot') {
      // 方盆：保留length, width, height，清空diameter
      dataToSave.diameter = '';
    } else if (dataToSave.type === 'round-pot') {
      // 圆盆：保留diameter和height，清空length和width
      dataToSave.length = '';
      dataToSave.width = '';
    } else if (dataToSave.type === 'raised-bed') {
      // 高床：保留length, width, height，清空diameter
      dataToSave.diameter = '';
    } else if (dataToSave.type === 'ground') {
      // 地上种植：保留length和width，清空height和diameter
      dataToSave.height = '';
      dataToSave.diameter = '';
    }

    onSave(dataToSave);
    onClose();
  };

  // 如果弹窗未打开，则不渲染内容
  if (!isOpen) return null;

  // 获取按钮显示文本
  const saveButtonText = editData ? "Save Changes" : "Add To Place List";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl mx-4">
        <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
        
        {/* In/Out Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            In/Out
          </label>
          <div className="flex space-x-4">
            <label className={`flex items-center border rounded-md px-4 py-2 cursor-pointer ${formData.inOut === 'indoor' ? 'border-primary bg-green-50' : errors.inOut ? 'border-red-500' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="inOut"
                checked={formData.inOut === 'indoor'}
                onChange={() => handleChange('inOut', 'indoor')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.inOut === 'indoor' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.inOut === 'indoor' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Indoor</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-4 py-2 cursor-pointer ${formData.inOut === 'outdoor' ? 'border-primary bg-green-50' : errors.inOut ? 'border-red-500' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="inOut"
                checked={formData.inOut === 'outdoor'}
                onChange={() => handleChange('inOut', 'outdoor')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.inOut === 'outdoor' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.inOut === 'outdoor' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Outdoor</span>
            </label>
          </div>
          {errors.inOut && <p className="text-red-500 text-xs mt-1">{errors.inOut}</p>}
        </div>
        
        {/* Cultivation Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Cultivation
          </label>
          <div className={`flex flex-wrap gap-3 ${errors.type ? 'border border-red-500 p-2 rounded-md' : ''}`}>
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.type === 'square-pot' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="type"
                checked={formData.type === 'square-pot'}
                onChange={() => handleChange('type', 'square-pot')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === 'square-pot' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.type === 'square-pot' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <div className="flex items-center">
                <div className="bg-[#E6F7FF] h-6 w-6 rounded-sm mr-2 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="5" width="14" height="10" rx="1" fill="#BAE7FF" stroke="#0D6EFD" strokeWidth="1.5"/>
                    <path d="M3 5V3C3 1.89543 3.89543 1 5 1H11C12.1046 1 13 1.89543 13 3V5" stroke="#0D6EFD" strokeWidth="1.5"/>
                    <line x1="3" y1="8.25" x2="13" y2="8.25" stroke="#0D6EFD" strokeWidth="1.5"/>
                  </svg>
                </div>
                <span>Square Pot</span>
              </div>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.type === 'round-pot' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="type"
                checked={formData.type === 'round-pot'}
                onChange={() => handleChange('type', 'round-pot')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === 'round-pot' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.type === 'round-pot' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <div className="flex items-center">
                <div className="bg-[#F9E9FB] h-6 w-6 rounded-sm mr-2 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="8" cy="10.5" rx="7" ry="4.5" fill="#E9C7F9" stroke="#9C27B0" strokeWidth="1.5"/>
                    <path d="M3 10.5V7C3 4.79086 5.23858 3 8 3C10.7614 3 13 4.79086 13 7V10.5" stroke="#9C27B0" strokeWidth="1.5"/>
                    <line x1="5" y1="7.25" x2="11" y2="7.25" stroke="#9C27B0" strokeWidth="1.5"/>
                  </svg>
                </div>
                <span>Round Pot</span>
              </div>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.type === 'raised-bed' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="type"
                checked={formData.type === 'raised-bed'}
                onChange={() => handleChange('type', 'raised-bed')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === 'raised-bed' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.type === 'raised-bed' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <div className="flex items-center">
                <div className="bg-[#EDFAEF] h-6 w-10 rounded-sm mr-2 flex items-center justify-center">
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="5" width="20" height="10" rx="1" fill="#B7E4C7" stroke="#2D6A4F" strokeWidth="1.5"/>
                    <line x1="1" y1="8.25" x2="21" y2="8.25" stroke="#2D6A4F" strokeWidth="1.5"/>
                    <line x1="4" y1="1" x2="4" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                    <line x1="18" y1="1" x2="18" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                    <line x1="11" y1="1" x2="11" y2="5" stroke="#2D6A4F" strokeWidth="1.5"/>
                  </svg>
                </div>
                <span>Raised-bed</span>
              </div>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.type === 'ground' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="type"
                checked={formData.type === 'ground'}
                onChange={() => handleChange('type', 'ground')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === 'ground' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.type === 'ground' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <div className="flex items-center">
                <div className="bg-[#FFF3E0] h-6 w-6 rounded-sm mr-2 flex items-center justify-center">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 15C1 12 5 1 10 1C15 1 19 12 19 15" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M1 15H19" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5 10C6.5 8.5 8.5 8 10 8C11.5 8 13.5 8.5 15 10" stroke="#774D2B" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Ground</span>
              </div>
            </label>
          </div>
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
        </div>
        
        {/* Size Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Size
          </label>
          
          {/* Measurement Unit Selection */}
          <div className="flex space-x-4 mb-4">
            <label className={`flex items-center border rounded-md px-4 py-2 cursor-pointer ${formData.measurement === 'inches' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="measurement"
                checked={formData.measurement === 'inches'}
                onChange={() => handleChange('measurement', 'inches')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.measurement === 'inches' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.measurement === 'inches' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>inches</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-4 py-2 cursor-pointer ${formData.measurement === 'cm' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="measurement"
                checked={formData.measurement === 'cm'}
                onChange={() => handleChange('measurement', 'cm')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.measurement === 'cm' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.measurement === 'cm' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>cm</span>
            </label>
          </div>
          
          {/* Size Dimensions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Length - square-pot, raised-bed, ground需要 */}
            {(formData.type === 'square-pot' || formData.type === 'raised-bed' || formData.type === 'ground') && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Length
                </label>
                <input
                  type="text"
                  value={formData.length}
                  onChange={(e) => handleChange('length', e.target.value)}
                  className={`w-full border ${errors.length ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary`}
                  placeholder="Length"
                  required
                />
                {errors.length && <p className="text-red-500 text-xs mt-1">{errors.length}</p>}
              </div>
            )}
            
            {/* Width - square-pot, raised-bed, ground需要 */}
            {(formData.type === 'square-pot' || formData.type === 'raised-bed' || formData.type === 'ground') && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Width
                </label>
                <input
                  type="text"
                  value={formData.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className={`w-full border ${errors.width ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary`}
                  placeholder="Width"
                  required
                />
                {errors.width && <p className="text-red-500 text-xs mt-1">{errors.width}</p>}
              </div>
            )}
            
            {/* Height - square-pot, round-pot, raised-bed需要 */}
            {(formData.type === 'square-pot' || formData.type === 'round-pot' || formData.type === 'raised-bed') && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Height
                </label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className={`w-full border ${errors.height ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary`}
                  placeholder="Height"
                  required
                />
                {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
              </div>
            )}
            
            {/* Diameter - 只有round-pot需要 */}
            {formData.type === 'round-pot' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Diameter
                </label>
                <input
                  type="text"
                  value={formData.diameter}
                  onChange={(e) => handleChange('diameter', e.target.value)}
                  className={`w-full border ${errors.diameter ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary`}
                  placeholder="Diameter"
                  required
                />
                {errors.diameter && <p className="text-red-500 text-xs mt-1">{errors.diameter}</p>}
              </div>
            )}
            
            {/* 当没有选择cultivation类型时，显示所有字段 */}
            {formData.type === '' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Length</label>
                  <input
                    type="text"
                    value={formData.length}
                    onChange={(e) => handleChange('length', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Length"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Width</label>
                  <input
                    type="text"
                    value={formData.width}
                    onChange={(e) => handleChange('width', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Width"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Height"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Diameter</label>
                  <input
                    type="text"
                    value={formData.diameter}
                    onChange={(e) => handleChange('diameter', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Diameter"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Sunlight */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Sunlight
          </label>
          <div className={`flex flex-wrap gap-3 ${errors.sunlight ? 'border border-red-500 p-2 rounded-md' : ''}`}>
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.sunlight === 'full-sun' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="sunlight"
                checked={formData.sunlight === 'full-sun'}
                onChange={() => handleChange('sunlight', 'full-sun')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.sunlight === 'full-sun' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.sunlight === 'full-sun' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Full Sun</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.sunlight === 'partial-sun' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="sunlight"
                checked={formData.sunlight === 'partial-sun'}
                onChange={() => handleChange('sunlight', 'partial-sun')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.sunlight === 'partial-sun' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.sunlight === 'partial-sun' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Partial Sun</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.sunlight === 'partial-shade' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="sunlight"
                checked={formData.sunlight === 'partial-shade'}
                onChange={() => handleChange('sunlight', 'partial-shade')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.sunlight === 'partial-shade' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.sunlight === 'partial-shade' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Partial Shade</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.sunlight === 'full-shade' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="sunlight"
                checked={formData.sunlight === 'full-shade'}
                onChange={() => handleChange('sunlight', 'full-shade')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.sunlight === 'full-shade' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.sunlight === 'full-shade' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Full Shade</span>
            </label>
          </div>
          {errors.sunlight && <p className="text-red-500 text-xs mt-1">{errors.sunlight}</p>}
        </div>
        
        {/* Soil */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Soil
          </label>
          <div className={`flex flex-wrap gap-3 ${errors.soil ? 'border border-red-500 p-2 rounded-md' : ''}`}>
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.soil === 'clay' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="soil"
                checked={formData.soil === 'clay'}
                onChange={() => handleChange('soil', 'clay')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.soil === 'clay' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.soil === 'clay' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Clay (Sticky)</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.soil === 'loam' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="soil"
                checked={formData.soil === 'loam'}
                onChange={() => handleChange('soil', 'loam')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.soil === 'loam' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.soil === 'loam' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Loam (Balanced)</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.soil === 'sandy' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="soil"
                checked={formData.soil === 'sandy'}
                onChange={() => handleChange('soil', 'sandy')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.soil === 'sandy' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.soil === 'sandy' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Sandy (Gritty)</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.soil === 'silty' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="soil"
                checked={formData.soil === 'silty'}
                onChange={() => handleChange('soil', 'silty')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.soil === 'silty' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.soil === 'silty' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Silthy (Smooth)</span>
            </label>
          </div>
          {errors.soil && <p className="text-red-500 text-xs mt-1">{errors.soil}</p>}
        </div>
        
        {/* Water Access */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Water Access
          </label>
          <div className={`flex flex-wrap gap-3 ${errors.waterAccess ? 'border border-red-500 p-2 rounded-md' : ''}`}>
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.waterAccess === 'easy' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="waterAccess"
                checked={formData.waterAccess === 'easy'}
                onChange={() => handleChange('waterAccess', 'easy')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.waterAccess === 'easy' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.waterAccess === 'easy' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Easy</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.waterAccess === 'limited' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="waterAccess"
                checked={formData.waterAccess === 'limited'}
                onChange={() => handleChange('waterAccess', 'limited')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.waterAccess === 'limited' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.waterAccess === 'limited' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Limited</span>
            </label>
            
            <label className={`flex items-center border rounded-md px-3 py-2 cursor-pointer ${formData.waterAccess === 'rainfall' ? 'border-primary bg-green-50' : 'border-gray-300 hover:bg-green-50'}`}>
              <input
                type="radio"
                name="waterAccess"
                checked={formData.waterAccess === 'rainfall'}
                onChange={() => handleChange('waterAccess', 'rainfall')}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.waterAccess === 'rainfall' ? 'border-primary' : 'border-gray-300'}`}>
                {formData.waterAccess === 'rainfall' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span>Rainfall</span>
            </label>
          </div>
          {errors.waterAccess && <p className="text-red-500 text-xs mt-1">{errors.waterAccess}</p>}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end mt-6">
          <button 
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : saveButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantingPlaceModal;