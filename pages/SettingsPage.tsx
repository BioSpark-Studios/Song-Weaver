import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Settings, Theme } from '../types';
import { BuildingStorefrontIcon, ServerIcon } from '../components/IconComponents';

const Section: React.FC<{ title: string; description: string; children: React.ReactNode, icon?: React.ReactNode }> = ({ title, description, children, icon }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-700/50 pb-8 mb-8">
        <div className="md:col-span-1">
            <div className="flex items-center space-x-3">
                {icon && <div className="text-primary-accent">{icon}</div>}
                <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            </div>
            <p className="text-sm text-slate-400 mt-1 pl-8 md:pl-0">{description}</p>
        </div>
        <div className="md:col-span-2 space-y-4 bg-slate-800/50 p-6 rounded-lg">
            {children}
        </div>
    </div>
);

const Input: React.FC<{ label: string; name: keyof Settings; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; placeholder?: string, type?: string, as?: 'textarea' }> = 
({ label, name, value, onChange, placeholder, type="text", as }) => {
    const commonProps = {
        name: name,
        value: value,
        onChange: onChange,
        placeholder: placeholder,
        className: "w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
    };
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            {as === 'textarea' ? <textarea {...commonProps} rows={4} /> : <input {...commonProps} type={type} />}
        </div>
    );
};

const ImageInput: React.FC<{ label: string; value: string | null; onChange: (base64: string | null) => void; }> = ({ label, value, onChange }) => {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => onChange(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const id = `image-upload-${label.replace(/\s+/g, '-')}`;
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <input type="file" id={id} className="hidden" onChange={handleImageUpload} accept="image/*" />
            <div className="flex items-center space-x-4">
                <label htmlFor={id} className="cursor-pointer px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md text-sm">Choose File</label>
                {value && <img src={value} alt={label} className="h-12 w-12 object-contain rounded-md bg-slate-900 p-1" />}
                {value && <button onClick={() => onChange(null)} className="text-sm text-red-500 hover:underline">Remove</button>}
            </div>
        </div>
    );
};

const ThemeButton: React.FC<{theme: Theme, currentTheme: Theme, onSelect: (theme: Theme) => void, colorClass: string}> = 
({theme, currentTheme, onSelect, colorClass}) => (
    <button onClick={() => onSelect(theme)} className={`w-full p-4 rounded-lg border-2 transition-all ${currentTheme === theme ? 'border-primary-accent' : 'border-transparent hover:border-slate-600'}`}>
        <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full ${colorClass}`}></div>
            <span className="font-semibold capitalize text-slate-200">{theme}</span>
        </div>
    </button>
);


const SettingsPage: React.FC = () => {
    const { settings, saveSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState<Settings>(settings);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (name: keyof Settings, base64: string | null) => {
        setLocalSettings(prev => ({ ...prev, [name]: base64 }));
    };

    const handleThemeChange = (theme: Theme) => {
        setLocalSettings(prev => ({ ...prev, theme }));
    };

    const handleSave = () => {
        saveSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex-grow p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-primary hover:bg-primary-accent text-white font-semibold rounded-md transition-all duration-200"
                    >
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
                
                <Section title="Branding & Copyright" description="Customize names and copyright info. This will be used in exports and saved files.">
                    <Input label="Artist Name" name="artistName" value={localSettings.artistName} onChange={handleChange} placeholder="e.g., The Midnight Bloom" />
                    <Input label="Studio Name" name="studioName" value={localSettings.studioName} onChange={handleChange} placeholder="e.g., Bloom Records" />
                    <Input label="Album Name" name="albumName" value={localSettings.albumName} onChange={handleChange} placeholder="e.g., Echoes in the Static" />
                    <Input label="Copyright String" name="copyright" value={localSettings.copyright} onChange={handleChange} placeholder={`e.g., © ${new Date().getFullYear()} The Midnight Bloom`} />
                </Section>

                <Section title="Studio Details" description="Information about your studio or label. Included in the promo kit export." icon={<BuildingStorefrontIcon />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ImageInput label="Studio Logo" value={localSettings.studioLogo} onChange={(val) => handleImageChange('studioLogo', val)} />
                        <ImageInput label="Artist/Band Logo" value={localSettings.artistLogo} onChange={(val) => handleImageChange('artistLogo', val)} />
                    </div>
                    <Input as="textarea" label="Studio Bio" name="studioBio" value={localSettings.studioBio} onChange={handleChange} placeholder="A brief description of your studio or label." />
                    <Input label="Website" name="studioWebsite" type="url" value={localSettings.studioWebsite} onChange={handleChange} placeholder="https://example.com" />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Contact Email" name="studioEmail" type="email" value={localSettings.studioEmail} onChange={handleChange} placeholder="contact@example.com" />
                        <Input label="Contact Phone" name="studioPhone" type="tel" value={localSettings.studioPhone} onChange={handleChange} placeholder="(555) 123-4567" />
                    </div>
                </Section>
                
                <Section title="Appearance & Customization" description="Personalize the look and feel of the application.">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ThemeButton theme="cyan" currentTheme={localSettings.theme} onSelect={handleThemeChange} colorClass="bg-cyan-500" />
                            <ThemeButton theme="rose" currentTheme={localSettings.theme} onSelect={handleThemeChange} colorClass="bg-rose-500" />
                            <ThemeButton theme="emerald" currentTheme={localSettings.theme} onSelect={handleThemeChange} colorClass="bg-emerald-500" />
                        </div>
                    </div>
                    <ImageInput label="Splash Screen Background" value={localSettings.splashBackground} onChange={(val) => handleImageChange('splashBackground', val)} />
                </Section>

                <Section title="Server & Advanced Settings" description="Configure server addresses for advanced integrations with other tools or future applications." icon={<ServerIcon />}>
                    <Input label="Server Address" name="serverAddress" value={localSettings.serverAddress} onChange={handleChange} placeholder="http://localhost:5173" />
                </Section>

                <div className="flex justify-end mt-8">
                     <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-primary hover:bg-primary-accent text-white font-semibold rounded-md transition-all duration-200"
                    >
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;