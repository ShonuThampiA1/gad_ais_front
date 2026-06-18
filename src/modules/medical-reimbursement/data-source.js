import { createServiceDataSource, createServiceDataSourceRegistry } from '@/modules/service-workspace/data-source';
import { createCase, initCases, loadCases, upsertCase } from './mockStore';
const wrapServiceDataSource = (dataSource) => ({
    listCases: () => dataSource.listRecords(),
    initializeCases: (officer) => dataSource.initializeRecords(officer),
    createCase: (officer, payload) => dataSource.createRecord(officer, payload),
    updateCase: (updatedCase) => dataSource.updateRecord(updatedCase),
});
const unwrapMrDataSource = (dataSource) => createServiceDataSource({
    listRecords: () => dataSource.listCases(),
    initializeRecords: (officer) => dataSource.initializeCases(officer),
    createRecord: (officer, payload) => dataSource.createCase(officer, payload),
    updateRecord: (updatedCase) => dataSource.updateCase(updatedCase),
});
const mockMrDataSource = createServiceDataSource({
    listRecords: () => loadCases(),
    initializeRecords: (officer) => initCases(officer),
    createRecord: (officer, payload) => createCase(officer, payload),
    updateRecord: (updatedCase) => {
        upsertCase(updatedCase);
        return updatedCase;
    },
});
const registry = createServiceDataSourceRegistry(mockMrDataSource);
let currentMrDataSource = wrapServiceDataSource(registry.getDataSource());
export const createMrDataSource = (handlers) => wrapServiceDataSource(createServiceDataSource({
    listRecords: handlers.listCases,
    initializeRecords: handlers.initializeCases,
    createRecord: handlers.createCase,
    updateRecord: handlers.updateCase,
}));
export const getMrDataSource = () => currentMrDataSource;
export const setMrDataSource = (dataSource) => {
    registry.setDataSource(unwrapMrDataSource(dataSource));
    currentMrDataSource = dataSource;
};
export const resetMrDataSource = () => {
    registry.resetDataSource();
    currentMrDataSource = wrapServiceDataSource(registry.getDataSource());
};
