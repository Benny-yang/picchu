import React, { useState, useEffect } from 'react';
import MainHeader from '../components/layout/MainHeader';
import { activityService } from '../services/activityService';

interface CreateActivityPageProps {
    currentUser?: any;
}

const CreateActivityPage: React.FC<CreateActivityPageProps> = ({ currentUser }) => {
    // Basic form state - can be expanded later based on Figma details
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        city: '',
        location: '',
        capacity: '',
        roles: [] as string[],
        tags: [] as string[],
        images: [] as { file?: File; preview: string; isExisting?: boolean }[],
    });

    const [currentTag, setCurrentTag] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const id = params.get('id');

        if (mode === 'edit' && id) {
            setIsEditMode(true);
            const fetchActivity = async () => {
                try {
                    const data = await activityService.getById(Number(id));
                    const activityTags = data.tags
                        ? (typeof data.tags === 'string' ? data.tags.split(',') : data.tags)
                        : [];

                    // Parse eventTime (e.g., "2026-02-16T03:30:00+08:00")
                    let dateStr = '';
                    let timeStr = '';
                    if (data.eventTime) {
                        const dateObj = new Date(data.eventTime);
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        dateStr = `${year}-${month}-${day}`; // yyyy-mm-dd format for input type="date"
                        timeStr = `${hours}:${minutes}`;
                    } else if (data.date) {
                        dateStr = data.date.split(' ')[0];
                        timeStr = data.date.split(' ')[1]?.slice(0, 5) || '';
                    }

                    // Existing images
                    const existingImages = (data.images || []).map((url: string) => ({
                        preview: url.startsWith('http') ? url : `http://localhost:8080/${url}`,
                        isExisting: true,
                        url: url // Keep original (relative or absolute) to send back? 
                        // Actually better to send back the full URL if our backend logic checks for "http" prefix.
                        // Or sending relative path is fine if we update backend to check for relative too?
                        // Backend checks `imgStr[:4] == "http"`. 
                        // So we MUST send full URL for existing images to be preserved.
                        // Wait, if it's relative "uploads/...", it won't be preserved by backend logic.
                        // Let's ensure we send full URL.
                    })).map((img: any) => ({
                        ...img,
                        url: img.preview // Use the full preview URL as the value to send back
                    }));

                    // Parse location to check for city prefix
                    let cityGuess = data.city || '';
                    let locationDetail = data.location || '';

                    if (!cityGuess && (locationDetail.includes('市') || locationDetail.includes('縣'))) {
                        cityGuess = locationDetail.substring(0, 3);
                    }

                    if (cityGuess && locationDetail.startsWith(cityGuess)) {
                        locationDetail = locationDetail.substring(cityGuess.length).trim();
                    }

                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        date: dateStr,
                        time: timeStr,
                        city: cityGuess,
                        location: locationDetail,
                        capacity: String(data.maxParticipants || ''),
                        roles: data.roles || [],
                        tags: activityTags,
                        images: existingImages,
                    });
                } catch (error) {
                    console.error('Failed to fetch activity for editing:', error);
                    alert('無法載入活動資料');
                }
            };
            fetchActivity();
        }
    }, []);

    const CITIES = [
        "基隆市", "新北市", "臺北市", "桃園市",
        "新竹縣", "新竹市", "宜蘭縣", "苗栗縣",
        "臺中市", "彰化縣", "南投縣", "雲林縣",
        "嘉義縣", "嘉義市", "臺南市", "高雄市",
        "花蓮縣", "屏東縣", "臺東縣", "澎湖縣",
        "金門縣", "連江縣",
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (role: string) => {
        setFormData(prev => {
            const roles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles };
        });
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isComposing) {
            e.preventDefault();
            const tag = currentTag.trim();
            if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                setCurrentTag('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const totalImages = formData.images.length + newFiles.length;

            if (totalImages > 5) {
                alert('最多只能上傳 5 張照片');
                // ... logic to limit ...
            } else {
                const newImages = newFiles.map(file => ({
                    file,
                    preview: URL.createObjectURL(file),
                    isExisting: false
                }));
                setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
            }
        }
        e.target.value = '';
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            if (!newImages[indexToRemove].isExisting) {
                URL.revokeObjectURL(newImages[indexToRemove].preview);
            }
            newImages.splice(indexToRemove, 1);
            return { ...prev, images: newImages };
        });
    };

    const setAsCover = (index: number) => {
        if (index === 0) return;
        setFormData(prev => {
            const newImages = [...prev.images];
            const selectedImage = newImages[index];
            newImages.splice(index, 1);
            newImages.unshift(selectedImage);
            return { ...prev, images: newImages };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Convert new images to base64, keep existing as strings
            const imagePromises = formData.images.map(img => {
                if (img.isExisting) {
                    return Promise.resolve(img.preview); // Use the URL
                }
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve(base64);
                    };
                    if (img.file) {
                        reader.readAsDataURL(img.file);
                    } else {
                        resolve(''); // Should not happen
                    }
                });
            });
            const imageList = await Promise.all(imagePromises);

            // Format eventTime with local timezone offset to ensure backend parses it correctly
            // Create a date object from the user's input (which is in local time)
            const dateTimeStr = `${formData.date}T${formData.time}:00`;
            const dateObj = new Date(dateTimeStr);

            // Get timezone offset in minutes (e.g., -480 for UTC+8)
            const timezoneOffset = -dateObj.getTimezoneOffset();
            const diff = timezoneOffset >= 0 ? '+' : '-';
            const pad = (n: number) => Math.floor(Math.abs(n)).toString().padStart(2, '0');
            const offsetStr = `${diff}${pad(timezoneOffset / 60)}:${pad(timezoneOffset % 60)}`;

            // Construct ISO string with offset (e.g., 2026-02-16T16:00:00+08:00)
            const eventTimeWithOffset = `${dateTimeStr}${offsetStr}`;

            // Ensure capacity is a valid number, default to 1 only if 0 or invalid
            const capacityNum = Number(formData.capacity);
            const maxParticipants = capacityNum > 0 ? capacityNum : 1;


            const payload = {
                title: formData.title,
                description: formData.description,
                eventTime: eventTimeWithOffset,
                location: `${formData.city} ${formData.location}`.trim(),
                maxParticipants: maxParticipants,
                tags: formData.tags.join(','),
                roles: formData.roles,
                images: imageList,
            };



            const params = new URLSearchParams(window.location.search);
            const editId = params.get('id');

            if (isEditMode && editId) {
                await activityService.update(Number(editId), payload);
                alert('活動更新成功！');
                window.location.href = '?view=profile';
            } else {
                await activityService.create(payload);
                alert('活動已成功建立！');
                window.location.href = '?view=activities';
            }
        } catch (error: any) {
            alert((isEditMode ? '更新' : '建立') + '失敗：' + (error.message || '未知錯誤'));
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F7F7F7] flex flex-col">
            <MainHeader activePage="create-activity" currentUser={currentUser} />

            <div className="max-w-[800px] mx-auto w-full px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h1 className="text-[32px] font-bold text-[#666666] mb-8 text-center font-['Noto_Sans'] leading-[1.25]">{isEditMode ? '編輯活動' : '我要開團'}</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                活動名稱
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="請輸入活動名稱"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009bcd] transition-all bg-gray-50 hover:bg-white"
                                required
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    日期
                                </label>
                                <input
                                    type="text"
                                    name="date"
                                    placeholder="yyyy/mm/dd"
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => {
                                        if (!e.target.value) e.target.type = "text";
                                    }}
                                    min={(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; })()}
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009bcd] transition-all bg-gray-50 hover:bg-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    時間
                                </label>
                                <select
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009bcd] transition-all bg-gray-50 hover:bg-white appearance-none"
                                    required
                                >
                                    <option value="" disabled>請選擇時間</option>
                                    {Array.from({ length: 24 }).flatMap((_, i) => {
                                        const hour = i.toString().padStart(2, '0');
                                        return [`${hour}:00`, `${hour}:30`];
                                    }).filter(time => {
                                        // In edit mode, show all times so user can keep existing time
                                        if (isEditMode) return true;
                                        // If date is today, filter out past times (use local date)
                                        const now = new Date();
                                        const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                        if (formData.date === todayLocal) {
                                            const [hours, minutes] = time.split(':').map(Number);
                                            const timeDate = new Date();
                                            timeDate.setHours(hours, minutes, 0, 0);
                                            return timeDate > now;
                                        }
                                        return true;
                                    }).map(time => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Location & City */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    縣市
                                </label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009bcd] transition-all bg-gray-50 hover:bg-white appearance-none"
                                    required
                                >
                                    <option value="" disabled>請選擇縣市</option>
                                    {CITIES.map(city => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    地點
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="請輸入詳細地點"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009bcd] transition-all bg-gray-50 hover:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Roles & Capacity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    需求角色
                                </label>
                                <div className="flex gap-6">
                                    {['photographer', 'model'].map((role) => (
                                        <label key={role} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative w-6 h-6">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={formData.roles.includes(role)}
                                                    onChange={() => handleRoleChange(role)}
                                                />
                                                <div className="absolute inset-0 border-2 border-[#B3B3B3] rounded-[2px] bg-white group-hover:border-[#009bcd] peer-checked:bg-[#009bcd] peer-checked:border-[#009bcd] transition-all"></div>
                                                <svg className="absolute inset-0 w-6 h-6 text-white transform scale-0 peer-checked:scale-100 transition-transform pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span className="text-sm text-[#191919] select-none">
                                                {role === 'photographer' ? '攝影師' : '模特兒'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    需求人數(最多10人)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    placeholder=""
                                    min="1"
                                    max="10"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009bcd] transition-all bg-gray-50 hover:bg-white"
                                />
                            </div>
                        </div>

                        {/* Shooting Style (Tags) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                拍攝風格
                            </label>
                            <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-[#009bcd] focus-within:bg-white transition-all min-h-[50px] flex flex-wrap gap-2 items-center">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="bg-[#E0F4FA] text-[#009bcd] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-[#007ea6] focus:outline-none"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleTagInputKeyDown}
                                    onCompositionStart={() => setIsComposing(true)}
                                    onCompositionEnd={() => setIsComposing(false)}
                                    placeholder={
                                        formData.tags.length >= 5
                                            ? "已達標籤上限 (5)"
                                            : (formData.tags.length === 0 ? "輸入風格標籤 (按 Enter 新增)" : "")
                                    }
                                    disabled={formData.tags.length >= 5}
                                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm min-w-[120px] p-0 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                活動內容
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="請輸入詳細的活動內容..."
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009bcd] transition-all bg-gray-50 hover:bg-white h-32 resize-none"
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                活動照片 (最多5張)
                            </label>

                            <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-5 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative aspect-square rounded-[8px] overflow-hidden border border-[#E6E6E6] group">
                                            <img src={image.preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />

                                            {/* Cover Badge or Set Cover Button */}
                                            {index === 0 ? (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center backdrop-blur-sm">
                                                    封面照片
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setAsCover(index)}
                                                    className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#009bcd]/80"
                                                >
                                                    設為封面
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/20 rounded-full hover:bg-black/50 transition-colors"
                                            >
                                                {/* Close Icon */}
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Button - Show if less than 5 images */}
                                    {formData.images.length < 5 && (
                                        <label className="aspect-square rounded-[8px] border border-[#E6E6E6] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                                            <input
                                                type="file"
                                                className="hidden"
                                                multiple
                                                accept="image/png, image/jpeg, image/gif"
                                                onChange={handleImageChange}
                                            />
                                            {/* Plus Icon */}
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 5V19" stroke="#B3B3B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M5 12H19" stroke="#B3B3B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </label>
                                    )}
                                </div>
                                <p className="text-sm text-[#FFAF3C]">
                                    最多選擇5張圖片，每張不超過 10 MB
                                </p>
                            </div>
                        </div>









                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-[#191919] text-white py-3.5 rounded-full font-bold hover:bg-[#333333] transition-colors shadow-lg shadow-gray-200"
                            >
                                {isEditMode ? '更新活動' : '發布活動'}
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default CreateActivityPage;
