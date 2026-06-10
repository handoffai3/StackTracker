import React, { useState, useRef, useEffect } from 'react';

const AddMemberDropdown = ({ unassignedProfiles, onAddSeat, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredProfiles = unassignedProfiles.filter(p => 
        (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (userId) => {
        onAddSeat(userId);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled || unassignedProfiles.length === 0}
                className="w-full mt-md bg-[#10131A] hover:bg-[#161B28] border border-dashed border-[#2D3748] hover:border-[#3B82F6] disabled:border-[#2D3748] disabled:opacity-50 disabled:cursor-not-allowed text-primary font-label-md text-label-md py-2 rounded-lg flex items-center justify-center gap-xs transition-colors"
            >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Member
            </button>

            {isOpen && (
                <div className="absolute z-[100] left-0 right-0 top-full mt-1 bg-[#161B28] border border-[#2D3748] rounded-xl shadow-2xl overflow-hidden animate-in">
                    <div className="p-sm border-b border-[#2D3748]">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search team..."
                                autoFocus
                                className="w-full bg-[#10131A] border border-[#2D3748] focus:border-[#3B82F6] focus:ring-0 rounded-lg pl-8 pr-3 py-1.5 font-body-md text-body-md text-on-surface transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                        {filteredProfiles.length > 0 ? (
                            <ul className="py-1">
                                {filteredProfiles.map((profile) => (
                                    <li key={profile.id}>
                                        <button
                                            onClick={() => handleSelect(profile.id)}
                                            className="w-full px-sm py-2 hover:bg-[#10131A] flex items-center gap-sm transition-colors text-left"
                                        >
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt={profile.full_name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-[10px] font-bold shrink-0">
                                                    {(profile.full_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-body-md text-body-md text-on-surface truncate">
                                                    {profile.full_name || 'Unknown User'}
                                                </p>
                                                <p className="font-label-md text-[10px] text-on-surface-variant truncate">
                                                    {profile.email}
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-md text-center">
                                <p className="font-body-md text-body-md text-on-surface-variant">No members found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddMemberDropdown;
