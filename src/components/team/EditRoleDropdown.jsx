import React, { useState, useRef, useEffect } from 'react';

const EditRoleDropdown = ({ currentRole, onUpdateRole, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const roles = ['admin', 'manager', 'developer'];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (role) => {
        if (role !== currentRole) {
            onUpdateRole(role);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex items-center gap-1 px-2 py-1 hover:bg-[#2D3748] rounded text-on-surface-variant transition-colors disabled:opacity-50"
                title={disabled ? "Cannot edit this role" : "Edit Role"}
            >
                <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-[#161B28] border border-[#2D3748] ring-1 ring-black ring-opacity-5 z-50 animate-in">
                    <div className="py-1">
                        {roles.map((role) => (
                            <button
                                key={role}
                                onClick={() => handleSelect(role)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    role === currentRole
                                        ? 'bg-[#3B82F6]/10 text-[#3B82F6] font-semibold'
                                        : 'text-on-surface hover:bg-[#2D3748]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="capitalize">{role}</span>
                                    {role === currentRole && (
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditRoleDropdown;
