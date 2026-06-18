export const STATIC_MR_ROUTE_PARAM = 'current';
export const STATIC_ADV_ROUTE_PARAM = 'current-advance';
const ACTIVE_MR_ID_KEY = 'mr_active_case_id';
const ACTIVE_ADV_ID_KEY = 'mr_active_advance_id';
const CREATE_MODE_KEY = 'mr_create_mode';
const CREATE_OFFICER_KEY = 'mr_create_officer';
const canUseSessionStorage = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
export const getActiveMrId = () => {
    if (!canUseSessionStorage())
        return '';
    return sessionStorage.getItem(ACTIVE_MR_ID_KEY) || '';
};
export const setActiveMrId = (mrId) => {
    if (!canUseSessionStorage())
        return;
    sessionStorage.setItem(ACTIVE_MR_ID_KEY, mrId);
};
export const getActiveAdvanceId = () => {
    if (!canUseSessionStorage())
        return '';
    return sessionStorage.getItem(ACTIVE_ADV_ID_KEY) || '';
};
export const setActiveAdvanceId = (advId) => {
    if (!canUseSessionStorage())
        return;
    sessionStorage.setItem(ACTIVE_ADV_ID_KEY, advId);
};
export const startCreateMrSession = (officer) => {
    if (!canUseSessionStorage())
        return;
    sessionStorage.removeItem(ACTIVE_MR_ID_KEY);
    sessionStorage.setItem(CREATE_MODE_KEY, '1');
    sessionStorage.setItem(CREATE_OFFICER_KEY, JSON.stringify(officer));
};
export const getCreateMrSession = () => {
    if (!canUseSessionStorage())
        return null;
    if (sessionStorage.getItem(CREATE_MODE_KEY) !== '1')
        return null;
    const raw = sessionStorage.getItem(CREATE_OFFICER_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch (_a) {
        return null;
    }
};
export const clearCreateMrSession = () => {
    if (!canUseSessionStorage())
        return;
    sessionStorage.removeItem(CREATE_MODE_KEY);
    sessionStorage.removeItem(CREATE_OFFICER_KEY);
};
