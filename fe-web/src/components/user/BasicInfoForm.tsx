import React, { useState } from 'react';

interface BasicInfoFormProps {
    onSubmit: (data: any) => void;
    initialData?: {
        id?: string;
        roles?: string[];
        gender?: string;
        phone?: string;
        bio?: string;
        avatarUrl?: string;
    };
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = useState({

        id: initialData?.id || '',
        roles: initialData?.roles || [] as string[],
        gender: initialData?.gender || '',
        phone: initialData?.phone || '',
        bio: initialData?.bio || ''
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRoleToggle = (role: string) => {
        setFormData(prev => {
            const roles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles };
        });
    };



    return (
        <div className="w-[616px] bg-white rounded-[16px] shadow-sm border border-[#e6e6e6] pt-[40px] px-[80px] pb-[40px] mx-auto my-8 relative flex flex-col items-center" >
            {/* Avatar Section */}
            < div className="flex flex-col items-center mb-[32px] w-full" >
                <div className="relative w-[90px] h-[90px] rounded-full overflow-hidden border border-[#e6e6e6] bg-[#e6e6e6]">
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#b3b3b3]">
                            {/* Optional: Add an icon here if needed, otherwise it's just a gray background */}
                        </div>
                    )}
                </div>
                <label className="cursor-pointer">
                    <span className="text-[#009bcd] text-[14px] mt-2 font-normal hover:underline block">變更</span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
            </div >

            {/* Divider */}
            < div className="w-full h-[1px] bg-[#e6e6e6] mb-[32px]" ></div >

            <div className="flex flex-col gap-[24px] w-full">
                {/* ID */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                    <label className="text-[14px] text-[#191919] text-left">ID</label>
                    <input
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        className="w-full border-b border-[#009bcd] pb-2 text-[16px] text-[#191919] focus:outline-none"
                        placeholder=""
                    />
                </div>





                {/* Roles */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                    <label className="text-[14px] text-[#191919] text-left">角色</label>
                    <div className="flex gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div
                                className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${formData.roles.includes('photographer') ? 'border-[#009bcd] bg-white' : 'border-[#b3b3b3]'}`}
                                onClick={() => handleRoleToggle('photographer')}
                            >
                                {formData.roles.includes('photographer') && <div className="w-3 h-3 bg-[#009bcd]" />}
                            </div>
                            <span className="text-[16px] text-[#191919]">攝影師</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div
                                className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${formData.roles.includes('model') ? 'border-[#009bcd] bg-white' : 'border-[#b3b3b3]'}`}
                                onClick={() => handleRoleToggle('model')}
                            >
                                {formData.roles.includes('model') && <div className="w-3 h-3 bg-[#009bcd]" />}
                            </div>
                            <span className="text-[16px] text-[#191919]">模特兒</span>
                        </label>
                    </div>
                </div>

                {/* Gender Removed */}

                {/* Phone */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                    <label className="text-[14px] text-[#191919] text-left">手機號碼</label>
                    <div className="flex justify-between items-center border-b border-[#009bcd] pb-2 w-[454px]">
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full text-[16px] text-[#191919] focus:outline-none bg-transparent"
                            placeholder="請輸入手機號碼"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                    <label className="text-[14px] text-[#191919] text-left">簡介</label>
                    <div className="relative w-[454px]">
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            maxLength={200}
                            className="w-full h-[200px] border border-[#009bcd] rounded-lg p-3 text-[16px] text-[#666666] focus:outline-none resize-none"
                            placeholder=""
                        />
                        <span className="absolute bottom-2 right-2 text-[12px] text-[#b3b3b3]">{formData.bio.length} / 200</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-[48px] flex justify-center">
                <button
                    onClick={() => onSubmit({ ...formData, avatarPreview })}
                    className="w-[140px] h-[48px] rounded-full bg-gradient-to-r from-[#F2994A] to-[#009bcd] text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg"
                >
                    儲存
                </button>
            </div>
        </div >
    );
};

export default BasicInfoForm;
