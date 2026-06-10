import React from 'react';

interface PlaceholderProps {
    title: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-gutter h-full text-center">
            <div className="bg-surface-container border border-outline-variant rounded-xl p-xl max-w-md w-full shadow-2xl relative overflow-hidden group">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[32px]">construction</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">{title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                    This section is currently under development. Please check back later!
                </p>
                <div className="h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Placeholder;
