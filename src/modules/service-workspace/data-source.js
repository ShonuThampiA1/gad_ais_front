export function createServiceDataSource(handlers) {
    return {
        async listRecords() {
            return handlers.listRecords();
        },
        async initializeRecords(context) {
            return handlers.initializeRecords(context);
        },
        async createRecord(context, payload) {
            return handlers.createRecord(context, payload);
        },
        async updateRecord(updatedRecord) {
            return handlers.updateRecord(updatedRecord);
        },
    };
}
export function createServiceDataSourceRegistry(defaultDataSource) {
    let currentDataSource = defaultDataSource;
    return {
        getDataSource() {
            return currentDataSource;
        },
        setDataSource(dataSource) {
            currentDataSource = dataSource;
        },
        resetDataSource() {
            currentDataSource = defaultDataSource;
        },
    };
}
