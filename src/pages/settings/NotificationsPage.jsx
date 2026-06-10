import React from 'react';
import { useNotificationPreferences } from '../../hooks/useSettings';
import ToggleRow from '../../components/settings/ToggleRow';

const NotificationsPage = () => {
    const {
        prefs, togglePref, saving,
        isLoading, role,
        toastMessage, toastType, dismissToast
    } = useNotificationPreferences();

    if (isLoading) {
        return (
            <div className="space-y-lg animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-md">
                        <div className="space-y-sm">
                            <div className="h-4 bg-[#2D3748] rounded w-48" />
                            <div className="h-3 bg-[#2D3748] rounded w-72" />
                        </div>
                        <div className="w-11 h-6 bg-[#2D3748] rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Toast */}
            {toastMessage && (
                <div
                    className={`fixed top-20 right-8 z-[200] flex items-center gap-sm px-md py-sm rounded-xl border shadow-2xl animate-slide-in ${
                        toastType === 'success'
                            ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                            : 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {toastType === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="font-body-md text-body-md">{toastMessage}</span>
                    <button onClick={dismissToast} className="ml-sm hover:opacity-70">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            )}

            {/* Info Note */}
            <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl p-md mb-xl flex items-start gap-sm">
                <span className="material-symbols-outlined text-[#3B82F6] text-[20px] mt-0.5 shrink-0">info</span>
                <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Note:</strong> Email notifications require additional setup. These preferences will be applied when email delivery is configured by your admin.
                </p>
            </div>

            <div className="space-y-xl">
                {/* Section 1 — Renewal Alerts */}
                <div>
                    <h3 className="font-headline-sm text-[18px] text-on-surface font-bold mb-xs">Renewal Alerts</h3>
                    <p className="font-body-md text-on-surface-variant mb-sm">Get notified about upcoming subscription renewals.</p>
                    <div className="bg-[#10131A] border border-[#2D3748] rounded-xl px-lg divide-y divide-[#2D3748]/50">
                        <ToggleRow
                            label="30-day renewal reminder"
                            description="Email me 30 days before a subscription renewal date."
                            checked={prefs.renew_30_days}
                            onChange={() => togglePref('renew_30_days')}
                            saving={saving.renew_30_days}
                        />
                        <ToggleRow
                            label="7-day renewal reminder"
                            description="Email me 7 days before a subscription renewal date."
                            checked={prefs.renew_7_days}
                            onChange={() => togglePref('renew_7_days')}
                            saving={saving.renew_7_days}
                        />
                        <ToggleRow
                            label="Renewal day alert"
                            description="Email me on the day a subscription renews."
                            checked={prefs.renew_on_day}
                            onChange={() => togglePref('renew_on_day')}
                            saving={saving.renew_on_day}
                        />
                    </div>
                </div>

                {/* Section 2 — Approval Alerts */}
                <div>
                    <h3 className="font-headline-sm text-[18px] text-on-surface font-bold mb-xs">Approval Alerts</h3>
                    <p className="font-body-md text-on-surface-variant mb-sm">Stay informed about tool request approvals.</p>
                    <div className="bg-[#10131A] border border-[#2D3748] rounded-xl px-lg divide-y divide-[#2D3748]/50">
                        <ToggleRow
                            label="Request approved"
                            description="Notify me when my tool request is approved."
                            checked={prefs.request_approved}
                            onChange={() => togglePref('request_approved')}
                            saving={saving.request_approved}
                        />
                        <ToggleRow
                            label="Request rejected"
                            description="Notify me when my tool request is rejected."
                            checked={prefs.request_rejected}
                            onChange={() => togglePref('request_rejected')}
                            saving={saving.request_rejected}
                        />
                        {/* Only visible to admin and manager */}
                        {(role === 'admin' || role === 'manager') && (
                            <ToggleRow
                                label="New request notifications"
                                description="Notify managers when a new tool request is submitted."
                                checked={prefs.new_request_notify}
                                onChange={() => togglePref('new_request_notify')}
                                saving={saving.new_request_notify}
                            />
                        )}
                    </div>
                </div>

                {/* Section 3 — Reports */}
                <div>
                    <h3 className="font-headline-sm text-[18px] text-on-surface font-bold mb-xs">Reports</h3>
                    <p className="font-body-md text-on-surface-variant mb-sm">Automated spend and usage summaries.</p>
                    <div className="bg-[#10131A] border border-[#2D3748] rounded-xl px-lg divide-y divide-[#2D3748]/50">
                        <ToggleRow
                            label="Weekly spend summary"
                            description="Send me a weekly spend summary every Monday morning."
                            checked={prefs.weekly_report}
                            onChange={() => togglePref('weekly_report')}
                            saving={saving.weekly_report}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
