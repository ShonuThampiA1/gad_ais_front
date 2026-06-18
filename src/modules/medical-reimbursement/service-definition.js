import { defineServiceWorkspace } from '@/modules/service-workspace/definition';
export const MR_WORKSPACE = defineServiceWorkspace({
    serviceKey: 'medical-reimbursement',
    workspaceTabs: ['SUMMARY', 'TREATMENT NOTE', 'ANNEXURES', 'ADVANCE NOTES', 'CERTIFICATE', 'FINAL NOTE', 'MOVEMENT REGISTER'],
    creationLockedTabs: ['SUMMARY', 'TREATMENT NOTE', 'ANNEXURES', 'ADVANCE NOTES', 'CERTIFICATE', 'FINAL NOTE', 'STATUS TRACKER'],
    documentTypes: [
        { label: 'Estimate', value: 'ESTIMATE' },
        { label: 'Discharge Summary', value: 'DISCHARGE' },
        { label: 'Essentiality Certificate (Signed)', value: 'EC_SIGNED' },
        { label: 'Prescription', value: 'PRESCRIPTION' },
        { label: 'Lab', value: 'LAB' },
        { label: 'GO', value: 'GO' },
        { label: 'Other', value: 'OTHER' },
    ],
});
export const MR_WORKSPACE_TABS = MR_WORKSPACE.workspaceTabs;
export const MR_CREATION_LOCKED_TABS = MR_WORKSPACE.creationLockedTabs;
export const MR_MEDICAL_SYSTEMS = ['Allopathy', 'Ayurveda', 'Homeopathy', 'Siddha', 'Unani', 'Naturopathy', 'Yoga'];
export const MR_DOC_TYPES = [...(MR_WORKSPACE.documentTypes || [])];
export function buildMrOfficerInfoItems(args) {
    return [
        { label: 'Administrative Department', value: args.administrativeDepartment || 'Not recorded', span: 3 },
        { label: 'Cadre', value: args.cadre || 'Not recorded', span: 3 },
        { label: 'Grade / Level', value: [args.grade, args.level ? `Level ${args.level}` : ''].filter(Boolean).join(' / ') || 'Not recorded', span: 3 },
        { label: 'Basic Pay', value: args.basicPay || 'Not recorded', span: 3 },
        { label: 'Contact Number', value: args.mobile || 'Not recorded', span: 6 },
        { label: 'Email Address', value: args.email || 'Not recorded', span: 6 },
        { label: 'Office / Present Posting Address', value: args.officeAddress || 'Not recorded', span: 6 },
        { label: 'Residential Address', value: args.residentialAddress || 'Not recorded', span: 6 },
    ];
}
export function buildMrCreationDefinition(args) {
    const claimSectionFields = [
        {
            kind: 'choice',
            key: 'applicantType',
            label: 'Applicant Type',
            span: 'half',
            columns: 2,
            options: [
                { label: 'Self', value: 'SELF' },
                { label: 'Dependent', value: 'DEPENDENT' },
            ],
            value: args.createClaimFor,
            onChange: (value) => args.onChangeClaimFor(value),
        },
        {
            kind: 'choice',
            key: 'treatmentMode',
            label: 'Mode of Medical Attendance',
            span: 'half',
            columns: 2,
            options: [
                { label: 'In-patient Treatment', value: 'IN', hint: 'Hospital admission or in-patient care' },
                { label: 'Out-patient Treatment', value: 'OUT', hint: 'Consultation without hospital admission' },
            ],
            value: args.createDraft.hospitalised ? 'IN' : 'OUT',
            onChange: (value) => {
                if (value === 'IN') {
                    args.onChangeHospitalised(true);
                    return;
                }
                args.onResetOutpatient();
            },
        },
    ];
    const patientInstitutionFields = [
        ...(args.createClaimFor === 'DEPENDENT'
            ? [{
                    kind: 'select',
                    key: 'dependent',
                    label: 'Dependent',
                    span: 'full',
                    value: args.createDependentId,
                    onChange: args.onChangeDependentId,
                    options: [{ label: 'Select dependent', value: '' }, ...args.dependentOptions],
                }]
            : []),
        ...(args.createClaimFor === 'DEPENDENT' && args.dependentCard
            ? [{ kind: 'custom', key: 'dependentCard', span: 'full', content: args.dependentCard }]
            : []),
        ...(args.createDraft.hospitalised
            ? [
                {
                    kind: 'choice',
                    key: 'institutionType',
                    label: 'Institution Type',
                    span: 'full',
                    options: [
                        { label: 'Government', value: 'Government' },
                        { label: 'Private', value: 'Private' },
                        { label: 'Foreign', value: 'Foreign' },
                    ],
                    value: args.createDraft.hospitalType,
                    onChange: args.onChangeHospitalType,
                },
                {
                    kind: 'choice',
                    key: 'withinKerala',
                    label: 'Was the treatment within Kerala?',
                    span: 'full',
                    columns: 2,
                    options: [
                        { label: 'Yes, within Kerala', value: 'YES' },
                        { label: 'No, outside Kerala', value: 'NO' },
                    ],
                    value: args.createDraft.withinState ? 'YES' : 'NO',
                    onChange: (value) => args.onChangeWithinState(value === 'YES'),
                },
                ...(args.institutionNameField ? [{ kind: 'custom', key: 'institutionName', span: 'half', content: args.institutionNameField }] : []),
                ...(args.institutionAddressField ? [{ kind: 'custom', key: 'institutionAddress', span: 'half', content: args.institutionAddressField }] : []),
            ]
            : []),
    ];
    const treatmentFields = [
        {
            kind: 'choice',
            key: 'medicalSystem',
            label: 'System of Medicine',
            span: 'full',
            options: MR_MEDICAL_SYSTEMS.map((system) => ({ label: system, value: system })),
            value: args.createDraft.medicalType,
            onChange: args.onChangeMedicalType,
        },
        {
            kind: 'input',
            key: 'startDate',
            label: 'Start Date',
            span: 'half',
            type: 'date',
            value: args.createDraft.fromDate,
            onChange: args.onChangeFromDate,
        },
        {
            kind: 'input',
            key: 'endDate',
            label: 'End Date',
            span: 'half',
            type: 'date',
            value: args.createDraft.toDate,
            onChange: args.onChangeToDate,
        },
    ];
    const definition = {
        sections: [
            { id: 'claim-for', title: '1. Claim For', fields: claimSectionFields },
            { id: 'patient-institution', title: '2. Patient and Institution', fields: patientInstitutionFields },
            { id: 'treatment', title: '3. Treatment', fields: treatmentFields },
        ],
        summaryItems: [
            { label: 'Applicant', value: args.createApplicantName || 'Pending' },
            { label: 'Profile', value: args.createApplicantMeta || 'Pending' },
            { label: 'Treatment Start', value: args.createDraft.fromDate || 'Pending' },
            { label: 'Institution', value: args.createDraft.hospitalised ? `${args.createDraft.hospitalName || 'Pending'} (${args.createDraft.hospitalType})` : 'Out-patient treatment' },
        ],
    };
    return definition;
}
