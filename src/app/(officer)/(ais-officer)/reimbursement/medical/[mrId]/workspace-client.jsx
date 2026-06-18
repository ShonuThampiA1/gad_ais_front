'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, AlertCircle, BarChart3, Building2, CalendarDays, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, ClipboardList, Download, FileCheck, FileCheck2, FileText, History, IndianRupee, LayoutList, Loader2, Pill, Plus, Save, Stethoscope, Upload, UserCircle2 } from 'lucide-react';
import { getMrDataSource } from '@/modules/medical-reimbursement/data-source';
import { FinalClaimDocument, buildFinalClaimDocumentData } from '@/modules/medical-reimbursement/final-document';
import styles from '@/modules/medical-reimbursement/mr.module.css';
import { buildMrCreationDefinition, buildMrOfficerInfoItems, MR_CREATION_LOCKED_TABS, MR_DOC_TYPES, MR_MEDICAL_SYSTEMS, MR_WORKSPACE_TABS } from '@/modules/medical-reimbursement/service-definition';
import { WorkspaceChoiceGroup, WorkspaceEmptyState, WorkspaceFactGrid, WorkspaceField, WorkspaceFormGrid, WorkspaceIdentityCard, WorkspaceInfoGrid, WorkspacePanel, WorkspaceSection, WorkspaceStatusBadge } from '@/modules/service-workspace/ui';
import { advancePaid, billsTotal, missingItems, rupee } from '@/modules/medical-reimbursement/utils';
import { STATIC_MR_ROUTE_PARAM, clearCreateMrSession, getActiveMrId, getCreateMrSession, setActiveMrId } from '@/modules/medical-reimbursement/session';
function LockIcon() {
    return (<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5 8V6a5 5 0 0 1 10 0v2h.5A1.5 1.5 0 0 1 17 9.5v7A1.5 1.5 0 0 1 15.5 18h-11A1.5 1.5 0 0 1 3 16.5v-7A1.5 1.5 0 0 1 4.5 8H5Zm2 0h6V6a3 3 0 1 0-6 0v2Z" clipRule="evenodd"/>
    </svg>);
}
function renderCreateSectionField(field) {
    const wrapClass = `${styles.createField} ${field.span === 'full' ? styles.createFieldGridFull : ''}`.trim();
    if (field.kind === 'choice') {
        return (<div key={field.key} className={wrapClass}>
        <label>{field.label}</label>
        <WorkspaceChoiceGroup options={field.options} value={field.value} onChange={field.onChange} columns={field.columns || 'auto'}/>
      </div>);
    }
    if (field.kind === 'select') {
        return (<div key={field.key} className={wrapClass}>
        <label>{field.label}</label>
        <select className={styles.createInput} value={field.value} onChange={(event) => field.onChange(event.target.value)}>
          {field.options.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
        </select>
      </div>);
    }
    if (field.kind === 'custom') {
        return (<div key={field.key} className={wrapClass}>
        {field.content}
      </div>);
    }
    return (<div key={field.key} className={wrapClass}>
      <label>{field.label}</label>
      <input type={field.type || 'text'} className={styles.createInput} placeholder={field.placeholder} value={field.value} onChange={(event) => field.onChange(event.target.value)}/>
    </div>);
}
function renderCreateSection(section) {
    return (<div key={section.id} className={styles.createSectionCard}>
      <div className={styles.createSectionHead}>
        <div>
          <div className={styles.createSectionTitle}>{section.title}</div>
        </div>
      </div>
      <div className={styles.createFieldGrid}>
        {section.fields.map(renderCreateSectionField)}
      </div>
    </div>);
}
export default function MRCaseWorkspaceClient() {
    var _a, _b, _c;
    const router = useRouter();
    const search = useSearchParams();
    const dataSource = getMrDataSource();
    const [activeMrId, setActiveMrIdState] = useState('');
    const [active, setActive] = useState(search.get('create') === '1' ? 'CREATION' : search.get('tab') || 'SUMMARY');
    const [sub, setSub] = useState('Bills');
    const [toast, setToast] = useState('');
    const [createOfficer, setCreateOfficer] = useState(null);
    const [createSaving, setCreateSaving] = useState(false);
    const [createClaimFor, setCreateClaimFor] = useState('SELF');
    const [createDependentId, setCreateDependentId] = useState('');
    const [createDeclaration, setCreateDeclaration] = useState(false);
    const [createDraft, setCreateDraft] = useState({
        hospitalised: true,
        withinState: true,
        hospitalType: 'Government',
        medicalType: 'Allopathy',
        hospitalName: '',
        hospitalAddress: '',
        fromDate: '',
        toDate: '',
    });
    const [docType, setDocType] = useState('DISCHARGE');
    const [docDraftMeta, setDocDraftMeta] = useState({
        title: '',
        referenceNo: '',
        issueDate: new Date().toISOString().slice(0, 10),
        remarks: '',
    });
    const [treatmentDraft, setTreatmentDraft] = useState({
        placeOfIllness: '',
        hospitalised: true,
        withinState: true,
        hospitalType: 'Government',
        hospitalName: '',
        hospitalAddress: '',
        fromDate: '',
        toDate: '',
        diagnosis: '',
        medicalType: 'Allopathy',
    });
    const [hospitalQuery, setHospitalQuery] = useState('');
    const [hospitalOptions, setHospitalOptions] = useState([]);
    const [hospitalLoading, setHospitalLoading] = useState(false);
    const [hospitalFocused, setHospitalFocused] = useState(false);
    const skipAutocompleteRef = useRef(false);
    const [billEditId, setBillEditId] = useState('');
    const [billDraft, setBillDraft] = useState(null);
    const billUploadRef = useRef(null);
    const docUploadRef = useRef(null);
    const estimateUploadRef = useRef(null);
    const ecSignedUploadRef = useRef(null);
    const [advanceFormOpen, setAdvanceFormOpen] = useState(false);
    const [advancePreview, setAdvancePreview] = useState(false);
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [estimateFileName, setEstimateFileName] = useState('');
    const [estimateReferenceNo, setEstimateReferenceNo] = useState('');
    const [estimateGstNo, setEstimateGstNo] = useState('');
    const [estimateHospitalName, setEstimateHospitalName] = useState('');
    const [pendingEcUpload, setPendingEcUpload] = useState(null);
    const [cases, setCases] = useState([]);
    const [ecMeta, setEcMeta] = useState({
        amaName: '',
        amaDesignation: '',
        regNo: '',
        institutionName: '',
        institutionAddress: '',
        signatureName: '',
        certificateDate: new Date().toISOString().slice(0, 10),
    });
    useEffect(() => {
        setActiveMrIdState(getActiveMrId());
        const createSession = getCreateMrSession();
        if (createSession) {
            setCreateOfficer(createSession);
            setActive('CREATION');
        }
    }, []);
    useEffect(() => {
        let cancelled = false;
        const hydrate = async () => {
            const nextCases = await dataSource.listCases();
            if (!cancelled)
                setCases(nextCases);
        };
        hydrate();
        return () => {
            cancelled = true;
        };
    }, [dataSource]);
    const c = cases.find((x) => x.mrId === activeMrId);
    useEffect(() => {
        var _a, _b;
        if (!c)
            return;
        setTreatmentDraft({
            placeOfIllness: c.treatment.placeOfIllness || '',
            hospitalised: c.treatment.hospitalised,
            withinState: c.treatment.withinState,
            hospitalType: c.treatment.hospitalType || 'Government',
            hospitalName: c.treatment.hospitalName || '',
            hospitalAddress: c.treatment.hospitalAddress || '',
            fromDate: c.treatment.fromDate || '',
            toDate: c.treatment.toDate || '',
            diagnosis: ((_a = c.treatment.diagnosis) === null || _a === void 0 ? void 0 : _a.split(' | ')[0]) || '',
            medicalType: ((_b = c.treatment.diagnosis) === null || _b === void 0 ? void 0 : _b.includes(' | ')) ? c.treatment.diagnosis.split(' | ')[1] : 'Allopathy',
        });
        setHospitalQuery(c.treatment.hospitalName || '');
        setEcMeta({
            amaName: c.officer.fullName,
            amaDesignation: c.officer.designation,
            regNo: '',
            institutionName: c.treatment.hospitalName || 'Government Hospital',
            institutionAddress: c.treatment.hospitalAddress || c.officer.officeAddress,
            signatureName: c.officer.fullName,
            certificateDate: new Date().toISOString().slice(0, 10),
        });
    }, [c === null || c === void 0 ? void 0 : c.mrId]);
    useEffect(() => {
        return () => {
            if (pendingEcUpload === null || pendingEcUpload === void 0 ? void 0 : pendingEcUpload.previewUrl) {
                URL.revokeObjectURL(pendingEcUpload.previewUrl);
            }
        };
    }, [pendingEcUpload]);
    useEffect(() => {
        const canSearch = c ? treatmentDraft.hospitalised : createOfficer ? createDraft.hospitalised : false;
        if (!canSearch || !hospitalFocused)
            return;
        if (skipAutocompleteRef.current) {
            skipAutocompleteRef.current = false;
            return;
        }
        const q = hospitalQuery.trim();
        if (q.length < 3) {
            setHospitalOptions([]);
            return;
        }
        const ctrl = new AbortController();
        const timer = window.setTimeout(async () => {
            setHospitalLoading(true);
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=6&q=${encodeURIComponent(`${q} hospital`)}`;
                const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
                const data = await res.json();
                const opts = Array.isArray(data)
                    ? data.map((item) => { var _a; return ({ name: String((item === null || item === void 0 ? void 0 : item.name) || ((_a = item === null || item === void 0 ? void 0 : item.display_name) === null || _a === void 0 ? void 0 : _a.split(',')[0]) || 'Hospital'), address: String((item === null || item === void 0 ? void 0 : item.display_name) || '') }); })
                    : [];
                setHospitalOptions(opts.filter((o) => o.address));
            }
            catch (_a) {
                if (!ctrl.signal.aborted)
                    setHospitalOptions([]);
            }
            finally {
                if (!ctrl.signal.aborted)
                    setHospitalLoading(false);
            }
        }, 320);
        return () => {
            ctrl.abort();
            window.clearTimeout(timer);
        };
    }, [hospitalQuery, hospitalFocused, treatmentDraft.hospitalised, createDraft.hospitalised, c === null || c === void 0 ? void 0 : c.mrId, createOfficer]);
    const createDependent = createOfficer === null || createOfficer === void 0 ? void 0 : createOfficer.dependents.find((item) => item.personId === createDependentId);
    const createApplicantName = createClaimFor === 'SELF' ? (createOfficer === null || createOfficer === void 0 ? void 0 : createOfficer.fullName) || '' : (createDependent === null || createDependent === void 0 ? void 0 : createDependent.fullName) || '';
    const createApplicantMeta = createClaimFor === 'SELF'
        ? [createOfficer === null || createOfficer === void 0 ? void 0 : createOfficer.serviceType, createOfficer === null || createOfficer === void 0 ? void 0 : createOfficer.designation, (createOfficer === null || createOfficer === void 0 ? void 0 : createOfficer.penNumber) ? `PEN ${createOfficer.penNumber}` : ''].filter(Boolean).join(' | ')
        : createDependent
            ? [createDependent.relation, createDependent.gender, createDependent.dob ? `DOB ${createDependent.dob}` : ''].filter(Boolean).join(' | ')
            : 'Select dependent to continue';
    const createBlocked = !createOfficer ||
        !createDraft.fromDate ||
        !createDeclaration ||
        (createClaimFor === 'DEPENDENT' && !createDependent) ||
        (createDraft.hospitalised && !createDraft.hospitalName);
    const { sections: createSections, summaryItems: createSummaryItems } = buildMrCreationDefinition({
        createClaimFor,
        createDependentId,
        createApplicantName,
        createApplicantMeta,
        createDraft,
        dependentOptions: ((createOfficer === null || createOfficer === void 0 ? void 0 : createOfficer.dependents) || []).map((item) => ({
            label: `${item.relationType}: ${item.fullName}`,
            value: item.personId,
        })),
        onChangeClaimFor: (value) => setCreateClaimFor(value),
        onChangeDependentId: (value) => setCreateDependentId(value),
        onChangeHospitalised: (value) => setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { hospitalised: value }))),
        onResetOutpatient: () => {
            setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { hospitalised: false, hospitalName: '', hospitalAddress: '' })));
            setHospitalQuery('');
            setHospitalOptions([]);
        },
        onChangeHospitalType: (value) => setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { hospitalType: value }))),
        onChangeWithinState: (value) => setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { withinState: value }))),
        onChangeMedicalType: (value) => setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { medicalType: value }))),
        onChangeFromDate: (value) => setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { fromDate: value }))),
        onChangeToDate: (value) => setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { toDate: value }))),
        dependentCard: createClaimFor === 'DEPENDENT' && createDependent ? (<div className={styles.createDependentPanel}>
        <div className={styles.createDependentName}>{createDependent.fullName}</div>
        <div className={styles.createSectionMeta}>Dependent selected for this reimbursement request.</div>
        <div className={styles.createDependentGrid}>
          <div><span>Relationship</span><strong>{createDependent.relation || createDependent.relationType || 'Not recorded'}</strong></div>
          <div><span>Gender</span><strong>{createDependent.gender || 'Not recorded'}</strong></div>
          <div><span>Date of Birth</span><strong>{createDependent.dob || 'Not recorded'}</strong></div>
        </div>
      </div>) : undefined,
        institutionNameField: createDraft.hospitalised ? (<>
        <label>Institution Name</label>
        <input className={styles.createInput} placeholder="Type hospital / institution name" value={hospitalQuery} onChange={(event) => {
                const value = event.target.value;
                setHospitalQuery(value);
                setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { hospitalName: value })));
            }} onFocus={() => setHospitalFocused(true)} onBlur={() => window.setTimeout(() => setHospitalFocused(false), 140)}/>
        {hospitalFocused && (hospitalLoading || hospitalOptions.length > 0) && (<div className={styles.createSuggestMenu}>
            {hospitalLoading && <div className="p-3 text-sm text-slate-500">Searching hospitals...</div>}
            {!hospitalLoading && hospitalOptions.map((opt) => (<button key={`${opt.name}-${opt.address}`} type="button" className={styles.createSuggestItem} onMouseDown={(event) => {
                        event.preventDefault();
                        skipAutocompleteRef.current = true;
                        setHospitalQuery(opt.name);
                        setHospitalOptions([]);
                        setHospitalFocused(false);
                        setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { hospitalName: opt.name, hospitalAddress: opt.address })));
                    }}>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{opt.name}</div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{opt.address}</div>
              </button>))}
          </div>)}
      </>) : undefined,
        institutionAddressField: createDraft.hospitalised ? (<>
        <label>Institution Address</label>
        <input className={styles.createInput} placeholder="Hospital / institution full address" value={createDraft.hospitalAddress} onChange={(event) => setCreateDraft((prev) => (Object.assign(Object.assign({}, prev), { hospitalAddress: event.target.value })))}/>
      </>) : undefined,
    });
    const submitCreation = async () => {
        if (!createOfficer || createBlocked || createSaving)
            return;
        setCreateSaving(true);
        window.setTimeout(async () => {
            const created = await dataSource.createCase(createOfficer, {
                patient: {
                    claimFor: createClaimFor,
                    dependentPersonId: createClaimFor === 'DEPENDENT' ? createDependent === null || createDependent === void 0 ? void 0 : createDependent.personId : undefined,
                    name: createClaimFor === 'SELF' ? createOfficer.fullName : (createDependent === null || createDependent === void 0 ? void 0 : createDependent.fullName) || 'Dependent',
                    relation: createClaimFor === 'SELF' ? 'Self' : (createDependent === null || createDependent === void 0 ? void 0 : createDependent.relation) || 'Dependent',
                },
                treatment: {
                    placeOfIllness: '',
                    hospitalised: createDraft.hospitalised,
                    withinState: createDraft.withinState,
                    hospitalType: createDraft.hospitalType,
                    hospitalName: createDraft.hospitalised ? createDraft.hospitalName : 'Not hospitalised',
                    hospitalAddress: createDraft.hospitalised ? (createDraft.hospitalAddress || createDraft.hospitalName) : '',
                    fromDate: createDraft.fromDate,
                    toDate: createDraft.toDate,
                    diagnosis: createDraft.medicalType,
                },
            });
            setCases(await dataSource.listCases());
            clearCreateMrSession();
            setActiveMrId(created.mrId);
            setActiveMrIdState(created.mrId);
            setCreateOfficer(null);
            setActive('SUMMARY');
            setCreateSaving(false);
            setToast('MR created. Continue with the next sections.');
            setTimeout(() => setToast(''), 1800);
        }, 700);
    };
    if (!c && createOfficer) {
        return (<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/70 px-4 py-5 transition-colors duration-300 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:text-gray-100 sm:px-5 lg:px-6">
        {toast && <div className={styles.mrToast}>{toast}</div>}
        {createSaving && (<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <div className="rounded-2xl border border-indigo-100 bg-white px-6 py-5 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-300"/>
              <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Creating MR case</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Preparing your workspace...</div>
            </div>
          </div>)}
        <div className="mx-auto mb-4 max-w-[1440px]">
          <button type="button" onClick={() => {
                clearCreateMrSession();
                router.push('/reimbursement/medical');
            }} className={styles.mrBackButton}>
            <ChevronLeft size={16}/>
            <span>Back to Requests</span>
          </button>
        </div>

        <div className="mx-auto mb-8 grid max-w-[1440px] gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-5 xl:self-start">
            <div className="overflow-hidden rounded-[24px] border border-indigo-200 bg-white shadow-sm dark:border-indigo-900/60 dark:bg-slate-800/95">
              <div className="border-b border-indigo-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <LayoutList size={16} className="text-indigo-600 dark:text-indigo-300"/>
                  Sections
                </div>
              </div>
              <div className="space-y-1.5 p-3">
                <button type="button" className="w-full rounded-xl border border-indigo-300 bg-indigo-50/90 px-3 py-2.5 text-left text-slate-900 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/20 dark:text-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300">
                      <Plus size={16}/>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium tracking-[0.08em] text-slate-400 dark:text-slate-500">00</div>
                      <div className="text-sm font-medium">CREATION</div>
                    </div>
                  </div>
                </button>
                {MR_CREATION_LOCKED_TABS.map((tab, index) => (<button key={tab} type="button" disabled className="w-full cursor-not-allowed rounded-xl border border-transparent px-3 py-2.5 text-left text-slate-400 opacity-55 dark:text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                        <LockIcon />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium tracking-[0.08em]">{String(index + 1).padStart(2, '0')}</div>
                        <div className="text-sm font-medium">{tab}</div>
                      </div>
                    </div>
                  </button>))}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-5 overflow-hidden rounded-[20px] border border-indigo-200 bg-white shadow-sm dark:border-indigo-900/60 dark:bg-slate-800">
              <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                    <Plus size={16}/>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium tracking-[0.08em] text-slate-400 dark:text-slate-500">STEP 0</div>
                    <div className="text-base font-medium leading-tight text-slate-900 dark:text-slate-100">Creation</div>
                  </div>
                </div>
                <div className={styles.trackerSummaryBadge}>Create MR first</div>
              </div>
            </div>

            <WorkspaceSection eyebrow="Create Request" title="Medical Reimbursement Case" icon={<FileText size={18}/>} className={styles.animateFadeIn} bodyClassName={styles.createSectionShellBody}>
              <WorkspaceIdentityCard kicker="Officer Profile" name={createOfficer.fullName || 'Officer profile'} meta={[createOfficer.designation, createOfficer.serviceType, createOfficer.penNumber ? `PEN ${createOfficer.penNumber}` : ''].filter(Boolean).join(' | ') || 'Officer details'} avatar={<UserCircle2 size={30}/>} badge={<WorkspaceStatusBadge>Profile Loaded</WorkspaceStatusBadge>}>
                <WorkspaceInfoGrid items={buildMrOfficerInfoItems({
                administrativeDepartment: createOfficer.administrativeDepartment,
                cadre: createOfficer.cadre,
                grade: createOfficer.grade,
                level: createOfficer.level,
                basicPay: createOfficer.basicPay ? rupee(createOfficer.basicPay) : 'Not recorded',
                mobile: createOfficer.mobile,
                email: createOfficer.email,
                officeAddress: createOfficer.officeAddress || createOfficer.officePostingAddress,
                residentialAddress: createOfficer.residentialAddress,
            })}/>
              </WorkspaceIdentityCard>

              <div className={styles.createFlowBody}>
                <div className={styles.createFlowMain}>
                  {createSections.map(renderCreateSection)}
                </div>

                <div className={styles.createFlowAside}>
                  <div className={styles.createSummaryCard}>
                    <div className={styles.createSummaryHeader}>
                      <div>
                        <div className={styles.createSectionTitle}>Creation Summary</div>
                        <div className={styles.createSectionMeta}>Live review before MR number generation.</div>
                      </div>
                    </div>
                    <div className={styles.summaryPillRow}>
                      <span className={styles.summaryPill}>{createClaimFor === 'SELF' ? 'Self Claim' : 'Dependent Claim'}</span>
                      <span className={styles.summaryPill}>{createDraft.medicalType}</span>
                      <span className={styles.summaryPill}>{createDraft.withinState ? 'Within Kerala' : 'Outside Kerala'}</span>
                    </div>
                    <div className={`${styles.createSummaryGrid} mt-3`}>
                      {createSummaryItems.map((item) => (<div key={item.label} className={styles.createSummaryItem}><span>{item.label}</span><strong>{item.value}</strong></div>))}
                    </div>
                  </div>

                  <div className={styles.createHelpBox}>
                    Saving creates the MR number and unlocks Summary, Treatment Note, Annexures, Advance Notes, Certificate, Final Note, and Status Tracker.
                  </div>
                </div>
              </div>

              <div className="border-t border-indigo-100 bg-white px-5 py-5 dark:border-indigo-900/50 dark:bg-slate-800">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <label className="flex max-w-2xl cursor-pointer items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500" checked={createDeclaration} onChange={(event) => setCreateDeclaration(event.target.checked)}/>
                    I confirm the entered details and want to create this medical reimbursement request.
                  </label>
                  <button className={styles.modernBtnPrimary} onClick={submitCreation} disabled={createBlocked || createSaving}>
                    {createSaving ? <Loader2 size={18} className="mr-2 animate-spin"/> : <Save size={18} className="mr-2"/>}
                    Save and Create MR
                  </button>
                </div>
                {createBlocked && (<div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Complete required fields: applicant, start date, hospital name when hospitalised, and confirmation.
                  </div>)}
              </div>
            </WorkspaceSection>
          </div>
        </div>
      </div>);
    }
    if (!c) {
        return <div className={styles.mrShell}><div className={styles.container}>Case not found. Open a case from the Medical Reimbursement list first.</div></div>;
    }
    const updateCase = async (nextCase, message) => {
        await dataSource.updateCase(nextCase);
        setCases((prev) => prev.map((item) => item.mrId === nextCase.mrId ? nextCase : item));
        if (message) {
            setToast(message);
            setTimeout(() => setToast(''), 1800);
        }
    };
    const openFinalPreview = () => {
        if (['Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status)) {
            setToast(`Final claim is already ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            return;
        }
        setActiveMrId(c.mrId);
        router.push(`/reimbursement/medical/${STATIC_MR_ROUTE_PARAM}/final/preview`);
    };
    const addBill = () => {
        const mock = {
            id: crypto.randomUUID(),
            fileName: `bill-${c.bills.length + 1}.pdf`,
            invoiceNo: `INV-${Math.floor(Math.random() * 999)}`,
            gstNo: `GST-${Math.floor(Math.random() * 999)}`,
            billDate: new Date().toISOString().slice(0, 10),
            hospitalName: c.treatment.hospitalName,
            totalAmount: 11000,
            taxAmount: 300,
            status: 'Extracted',
            duplicateFlag: c.bills.some((b) => b.invoiceNo === 'INV-111'),
        };
        updateCase(Object.assign(Object.assign({}, c), { bills: [...c.bills, mock], lastUpdated: new Date().toISOString(), movement: [{ id: crypto.randomUUID(), action: 'Bill extracted', at: new Date().toISOString() }, ...c.movement] }), 'Bill extracted');
    };
    const addDoc = () => {
        var _a;
        updateCase(Object.assign(Object.assign({}, c), { docs: [{
                    id: crypto.randomUUID(),
                    type: docType,
                    fileName: `${docType.toLowerCase()}-${Date.now()}.pdf`,
                    uploadedAt: new Date().toISOString(),
                    title: docDraftMeta.title || ((_a = MR_DOC_TYPES.find((d) => d.value === docType)) === null || _a === void 0 ? void 0 : _a.label) || docType,
                    referenceNo: docDraftMeta.referenceNo,
                    issueDate: docDraftMeta.issueDate,
                    remarks: docDraftMeta.remarks,
                }, ...c.docs], lastUpdated: new Date().toISOString(), movement: [{ id: crypto.randomUUID(), action: `${docType} uploaded`, at: new Date().toISOString() }, ...c.movement] }), docType === 'EC_SIGNED' ? 'EC uploaded' : 'Saved');
    };
    const parseAmount = (x) => {
        const n = Number(String(x).replace(/[^\d.]/g, ''));
        return Number.isFinite(n) ? n : 0;
    };
    const extractMockBill = (fileName) => {
        const stamp = Date.now().toString().slice(-5);
        const total = 8000 + Math.floor(Math.random() * 24000);
        const tax = Math.round(total * 0.05);
        return {
            id: crypto.randomUUID(),
            fileName,
            invoiceNo: `INV-${stamp}`,
            gstNo: `32ABCDE${stamp.slice(0, 3)}Z5`,
            billDate: new Date().toISOString().slice(0, 10),
            hospitalName: c.treatment.hospitalName || treatmentDraft.hospitalName || 'Hospital',
            totalAmount: total,
            taxAmount: tax,
            status: 'Extracted',
            duplicateFlag: c.bills.some((b) => b.invoiceNo === `INV-${stamp}`),
        };
    };
    const onBillUpload = (e) => {
        var _a;
        if (['Advance Submitted', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status)) {
            setToast(`Bills cannot be edited while case is ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            e.target.value = '';
            return;
        }
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const extracted = extractMockBill(file.name);
        updateCase(Object.assign(Object.assign({}, c), { bills: [extracted, ...c.bills], lastUpdated: new Date().toISOString(), movement: [{ id: crypto.randomUUID(), action: `Bill uploaded and extracted: ${file.name}`, at: new Date().toISOString() }, ...c.movement] }), 'Bill extracted');
        setBillEditId(extracted.id);
        setBillDraft(extracted);
        e.target.value = '';
    };
    const onDocUpload = (e) => {
        var _a, _b;
        if (['Advance Submitted', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status)) {
            setToast(`Documents cannot be edited while case is ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            e.target.value = '';
            return;
        }
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        updateCase(Object.assign(Object.assign({}, c), { docs: [{
                    id: crypto.randomUUID(),
                    type: docType,
                    fileName: file.name,
                    uploadedAt: new Date().toISOString(),
                    title: docDraftMeta.title || ((_b = MR_DOC_TYPES.find((d) => d.value === docType)) === null || _b === void 0 ? void 0 : _b.label) || docType,
                    referenceNo: docDraftMeta.referenceNo,
                    issueDate: docDraftMeta.issueDate,
                    remarks: docDraftMeta.remarks,
                }, ...c.docs], lastUpdated: new Date().toISOString(), movement: [{ id: crypto.randomUUID(), action: `${docType} uploaded (${file.name})`, at: new Date().toISOString() }, ...c.movement] }), 'Document uploaded');
        setDocDraftMeta({
            title: '',
            referenceNo: '',
            issueDate: new Date().toISOString().slice(0, 10),
            remarks: '',
        });
        e.target.value = '';
    };
    const onSignedEcUpload = (e) => {
        var _a;
        if (['Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status)) {
            setToast(`Certificate cannot be updated while case is ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            e.target.value = '';
            return;
        }
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        if (pendingEcUpload === null || pendingEcUpload === void 0 ? void 0 : pendingEcUpload.previewUrl) {
            URL.revokeObjectURL(pendingEcUpload.previewUrl);
        }
        setPendingEcUpload({
            fileName: file.name,
            previewUrl: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
        });
        setToast('Signed EC ready for preview confirmation');
        setTimeout(() => setToast(''), 1800);
        e.target.value = '';
    };
    const confirmSignedEcUpload = () => {
        if (!pendingEcUpload)
            return;
        updateCase(Object.assign(Object.assign({}, c), { docs: [
                { id: crypto.randomUUID(), type: 'EC_SIGNED', fileName: pendingEcUpload.fileName, uploadedAt: pendingEcUpload.uploadedAt },
                ...c.docs.filter((doc) => doc.type !== 'EC_SIGNED'),
            ], lastUpdated: new Date().toISOString(), movement: [{ id: crypto.randomUUID(), action: `Signed EC uploaded (${pendingEcUpload.fileName})`, at: new Date().toISOString() }, ...c.movement] }), 'Signed EC uploaded');
        URL.revokeObjectURL(pendingEcUpload.previewUrl);
        setPendingEcUpload(null);
    };
    const cancelSignedEcUpload = () => {
        if (!pendingEcUpload)
            return;
        URL.revokeObjectURL(pendingEcUpload.previewUrl);
        setPendingEcUpload(null);
    };
    const startBillEdit = (b) => {
        if (['Advance Submitted', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status)) {
            setToast(`Bill review is disabled while case is ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            return;
        }
        setBillEditId(b.id);
        setBillDraft(Object.assign({}, b));
    };
    const saveBillEdit = () => {
        if (['Advance Submitted', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status)) {
            setToast(`Bill updates are disabled while case is ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            return;
        }
        if (!billDraft)
            return;
        updateCase(Object.assign(Object.assign({}, c), { bills: c.bills.map((b) => (b.id === billDraft.id ? billDraft : b)), lastUpdated: new Date().toISOString(), movement: [{ id: crypto.randomUUID(), action: `Bill updated: ${billDraft.fileName}`, at: new Date().toISOString() }, ...c.movement] }), 'Bill saved');
        setBillEditId('');
        setBillDraft(null);
    };
    const saveTreatment = () => {
        if (['Advance Submitted', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status)) {
            setToast(`Treatment details are locked while case is ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            return;
        }
        if (!treatmentDraft.diagnosis.trim() || !treatmentDraft.fromDate || !treatmentDraft.placeOfIllness.trim()) {
            setToast('Diagnosis, place of illness, and treatment start date are required.');
            setTimeout(() => setToast(''), 2000);
            return;
        }
        if (treatmentDraft.hospitalised && !treatmentDraft.hospitalName.trim()) {
            setToast('Hospital name is required for hospitalised treatment.');
            setTimeout(() => setToast(''), 2000);
            return;
        }
        updateCase(Object.assign(Object.assign({}, c), { treatment: Object.assign(Object.assign({}, treatmentDraft), { diagnosis: `${treatmentDraft.diagnosis} | ${treatmentDraft.medicalType}`, hospitalName: treatmentDraft.hospitalised ? treatmentDraft.hospitalName : 'Not hospitalised', hospitalAddress: treatmentDraft.hospitalised ? treatmentDraft.hospitalAddress : '' }), lastUpdated: new Date().toISOString(), movement: [{ id: crypto.randomUUID(), action: 'Treatment note updated', at: new Date().toISOString() }, ...c.movement] }), 'Treatment saved');
    };
    const submitAdvanceRequest = () => {
        if (['Advance Submitted', 'Advance Paid', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status)) {
            setToast(`Advance request is not editable while case is ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            return;
        }
        const amt = parseAmount(advanceAmount);
        if (!amt || !estimateFileName) {
            setToast('Advance amount and estimate document are required.');
            setTimeout(() => setToast(''), 1800);
            return;
        }
        const adv = {
            advId: crypto.randomUUID(),
            advNo: `ADV-MR-2026-${String(Math.floor(Math.random() * 9999)).padStart(6, '0')}`,
            amount: amt,
            status: 'Submitted',
            estimateDocId: estimateFileName,
            signed: false,
            submittedAt: new Date().toISOString(),
        };
        updateCase(Object.assign(Object.assign({}, c), { advances: [adv, ...c.advances], status: 'Advance Submitted', movement: [{ id: crypto.randomUUID(), action: `Advance request submitted (${rupee(amt)})`, at: new Date().toISOString() }, ...c.movement] }), 'Advance submitted');
        setAdvanceFormOpen(false);
        setAdvancePreview(false);
        setAdvanceAmount('');
        setEstimateFileName('');
        setEstimateReferenceNo('');
        setEstimateGstNo('');
        setEstimateHospitalName('');
    };
    const escapeHtml = (value) => value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    const downloadEssentialityCertificate = () => {
        var _a;
        const renderedRows = [...c.bills];
        while (renderedRows.length < 5) {
            renderedRows.push({
                id: crypto.randomUUID(),
                fileName: '',
                invoiceNo: '',
                gstNo: '',
                billDate: '',
                hospitalName: '',
                totalAmount: 0,
                taxAmount: 0,
                status: 'Extracted',
                duplicateFlag: false,
            });
        }
        const departmentLabel = c.officer.administrativeDepartment || c.officer.serviceType || 'Department';
        const treatmentFrom = formatDMY(c.treatment.fromDate || '');
        const treatmentTo = formatDMY(c.treatment.toDate || '');
        const diagnosisLabel = treatmentDraft.diagnosis || ((_a = c.treatment.diagnosis) === null || _a === void 0 ? void 0 : _a.split(' | ')[0]) || '-';
        const hospitalLine = treatmentDraft.hospitalName || c.treatment.hospitalName || ecMeta.institutionName || 'Hospital / Dispensary';
        const hospitalizationNote = c.treatment.hospitalised
            ? 'It is Certified that the case required Hospitalisation for the period stated above.'
            : 'It is Certified that the case did not require Hospitalisation but is one of prolonged matter requiring medical attendance of the Out-Patient spreading over a period of more than 10 days.';
        const rowsHtml = renderedRows
            .slice(0, 4)
            .map((b, i) => {
            const amount = Number(b.totalAmount) || 0;
            const rupees = Math.floor(amount);
            const paise = Math.round((amount - rupees) * 100);
            return `<tr>
  <td>${escapeHtml(b.fileName || '')}</td>
  <td>${escapeHtml(b.invoiceNo || '')}</td>
  <td>${escapeHtml(b.hospitalName || '')}</td>
  <td class="right">${amount ? escapeHtml(String(rupees)) : ''}</td>
  <td class="right">${amount ? escapeHtml(String(paise).padStart(2, '0')) : ''}</td>
</tr>`;
        })
            .join('');
        const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Essentiality Certificate - ${escapeHtml(c.mrNo)}</title>
  <style>
    body { margin:0; background:#eef2ff; font-family:"Segoe UI", Arial, sans-serif; color:#334155; }
    .page { padding:28px; }
    .shell { max-width:920px; margin:0 auto; border:1px solid #c7d2fe; border-radius:22px; overflow:hidden; background:#ffffff; box-shadow:0 18px 40px rgba(79,70,229,0.10); }
    .accent { height:8px; background:#4f46e5; }
    .shell-head { padding:18px 22px 14px; border-bottom:1px solid #e0e7ff; }
    .head-table { width:100%; border-collapse:collapse; }
    .head-title { font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#4338ca; }
    .head-subtitle { margin-top:6px; font-size:13px; line-height:1.5; color:#64748b; }
    .chip-wrap { text-align:right; vertical-align:top; }
    .chip { display:inline-block; padding:8px 14px; border:1px solid #c7d2fe; border-radius:999px; background:#eef2ff; color:#4338ca; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; }
    .doc { margin:18px; border:1px solid #c7d2fe; border-radius:18px; background:#f8fafc; padding:22px; }
    .title-block { text-align:center; margin-bottom:18px; }
    .annexure { font-size:11px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:#475569; }
    .form-title { margin-top:6px; font-size:18px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:#312e81; }
    .sub-label { margin-top:6px; font-size:10px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#64748b; }
    p { margin:0 0 12px; font-size:13px; line-height:1.75; color:#475569; }
    .highlight { font-weight:700; color:#0f172a; }
    .panel { margin-top:14px; border:1px solid #c7d2fe; border-radius:14px; background:#ffffff; padding:14px 16px; }
    .panel-label { font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#64748b; }
    .panel-value { margin-top:8px; font-size:13px; font-weight:700; color:#0f172a; }
    .table-wrap { margin-top:16px; border:1px solid #c7d2fe; border-radius:14px; overflow:hidden; background:#ffffff; }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:10px 12px; font-size:12px; vertical-align:top; border-bottom:1px solid #e0e7ff; color:#334155; }
    th { background:#eef2ff; text-align:left; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#475569; }
    tr:last-child td { border-bottom:none; }
    .right { text-align:right; }
    .summary { margin-top:14px; border:1px solid #c7d2fe; border-radius:14px; background:#ffffff; padding:14px 16px; }
    .summary-value { margin-top:8px; font-size:14px; font-weight:700; color:#0f172a; }
    .sign-grid { width:100%; border-collapse:separate; border-spacing:18px 0; margin-top:28px; }
    .sign-card { border:1px solid #c7d2fe; border-radius:14px; background:#ffffff; padding:16px; height:170px; vertical-align:top; }
    .sign-label { font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#64748b; }
    .sign-line-fill { margin-top:22px; border-bottom:1px dashed #94a3b8; height:18px; }
    .signature-name { margin-top:34px; border-top:1px solid #94a3b8; padding-top:10px; font-size:13px; font-weight:700; color:#0f172a; }
    .seal-space { margin-top:22px; border:1px dashed #94a3b8; border-radius:10px; height:110px; text-align:center; vertical-align:middle; color:#94a3b8; font-size:13px; }
    .seal-space span { display:inline-block; margin-top:45px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="shell">
      <div class="accent"></div>
      <div class="shell-head">
        <table class="head-table">
          <tr>
            <td>
              <div class="head-title">System Generated Preview</div>
              <div class="head-subtitle">Officer can compare the signed upload against the generated essentiality certificate</div>
            </td>
            <td class="chip-wrap">
              <span class="chip">Essentiality Certificate</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="doc">
        <div class="title-block">
          <div class="annexure">Annexure 1</div>
          <div class="form-title">Form of Essentiality Certificate</div>
          <div class="sub-label">System Generated Contents</div>
        </div>

        <p>
          Certify that Shri/Smt. <span class="highlight">${escapeHtml(c.officer.fullName)}</span> employed in the
          <span class="highlight"> ${escapeHtml(departmentLabel)}</span> Department has been under treatment in the hospital/Dispensary or at his/her residence
          <span class="highlight"> ${escapeHtml(hospitalLine)}</span> for the period from
          <span class="highlight"> ${escapeHtml(treatmentFrom)}</span> to
          <span class="highlight"> ${escapeHtml(treatmentTo)}</span> and that the under mentioned medicines prescribed by me in this connection were essential for the recovery/Prevention of serious deterioration in the condition of the patient.
        </p>
        <p>
          The medicines were not in the stock in hospital or not stocked in the hospital supply to the Government Servant. They do not include preparatory preparations for which cheaper substance or equal therapeutic value or available preparations which are primary foods, tonic toilet preparations or disinfectants.
        </p>
        <p>${escapeHtml(hospitalizationNote)}</p>

        <div class="panel">
          <div class="panel-label">Patient has been suffering from</div>
          <div class="panel-value">${escapeHtml(diagnosisLabel)}</div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width:28%;">Trade Brand</th>
                <th style="width:28%;">Chemical / Pharmacological</th>
                <th style="width:24%;">Description</th>
                <th style="width:10%;" class="right">Rs.</th>
                <th style="width:10%;" class="right">Ps.</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>

        <div class="summary">
          <div class="panel-label">Supporting bills considered</div>
          <div class="summary-value">${escapeHtml(String(c.bills.length))} bill(s) totaling INR ${escapeHtml(String(billsTotal(c)))}</div>
        </div>

        <table class="sign-grid" role="presentation">
          <tr>
            <td class="sign-card">
              <div class="sign-label">Date</div>
              <div class="sign-line-fill"></div>
              <div class="sign-label" style="margin-top:18px;">Place</div>
              <div class="sign-line-fill"></div>
              <div class="signature-name">Name and Signature of Authorized Medical Attendant</div>
            </td>
            <td class="sign-card" style="border-style:dashed;">
              <div class="sign-label">Official Seal</div>
              <div class="seal-space"><span>Seal Space</span></div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;
        const docHtml = `<!doctype html><html><head><meta charset="utf-8"></head><body>${html.replace(/^<!doctype html>[\s\S]*?<body>/i, '').replace(/<\/body>\s*<\/html>\s*$/i, '')}</body></html>`;
        const blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${c.mrNo}-essentiality-certificate.doc`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setToast('Essentiality Certificate downloaded');
        setTimeout(() => setToast(''), 1800);
    };
    const checks = missingItems(c);
    const selectedDependent = c.patient.claimFor === 'DEPENDENT'
        ? c.officer.dependents.find((d) => d.personId === c.patient.dependentPersonId)
        : undefined;
    const formatDMY = (v) => {
        if (!v)
            return '-';
        const [y, m, d] = v.slice(0, 10).split('-');
        if (!y || !m || !d)
            return v;
        return `${d}-${m}-${y}`;
    };
    const tabMeta = {
        SUMMARY: { icon: UserCircle2, caption: 'Case overview' },
        'TREATMENT NOTE': { icon: Stethoscope, caption: 'Treatment details' },
        ANNEXURES: { icon: FileText, caption: 'Bills and documents' },
        'ADVANCE NOTES': { icon: IndianRupee, caption: 'Advance request' },
        CERTIFICATE: { icon: Pill, caption: 'Essentiality certificate' },
        'FINAL NOTE': { icon: ClipboardCheck, caption: 'Final note' },
        'MOVEMENT REGISTER': { icon: Activity, caption: 'Case status', label: 'STATUS TRACKER' },
    };
    const workflowTabs = [...MR_WORKSPACE_TABS];
    const activeStepIndex = workflowTabs.indexOf(active);
    const previousStep = activeStepIndex > 0 ? workflowTabs[activeStepIndex - 1] : null;
    const nextStep = activeStepIndex < workflowTabs.length - 1 ? workflowTabs[activeStepIndex + 1] : null;
    const unreadinessCount = checks.length;
    const visibleDocs = c.docs.filter((d) => d.type !== 'EC_SIGNED');
    const signedEcDocs = c.docs.filter((d) => d.type === 'EC_SIGNED');
    const diagnosisText = treatmentDraft.diagnosis.split(' | ')[0] || 'Medical treatment';
    const billTotalAmount = c.bills.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0) || 0;
    const advanceTotalAmount = c.advances.reduce((acc, a) => acc + (Number(a.amount) || 0), 0) || 0;
    const signedEcDoc = signedEcDocs[0];
    const treatmentPeriodLabel = treatmentDraft.fromDate
        ? `${formatDMY(treatmentDraft.fromDate)}${treatmentDraft.toDate ? ` to ${formatDMY(treatmentDraft.toDate)}` : ''}`
        : 'Not recorded';
    const finalDocumentData = buildFinalClaimDocumentData(Object.assign(Object.assign({}, c), { treatment: Object.assign(Object.assign({}, c.treatment), { placeOfIllness: treatmentDraft.placeOfIllness, hospitalised: treatmentDraft.hospitalised, withinState: treatmentDraft.withinState, hospitalType: treatmentDraft.hospitalType, hospitalName: treatmentDraft.hospitalName, hospitalAddress: treatmentDraft.hospitalAddress, fromDate: treatmentDraft.fromDate, toDate: treatmentDraft.toDate, diagnosis: `${treatmentDraft.diagnosis} | ${treatmentDraft.medicalType}` }) }));
    const dependentMeta = [
        (selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.relation) || c.patient.relation,
        (selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.gender) && selectedDependent.gender !== '—' ? `Gender: ${selectedDependent.gender}` : null,
        (selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.dob) && selectedDependent.dob !== '—' ? `DOB: ${formatDMY(selectedDependent.dob)}` : null,
    ].filter(Boolean);
    const finalStageReached = Boolean(c.finalClaim.submittedAt) || ['Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status);
    const hasAdvanceRequest = c.advances.length > 0 || ['Advance Submitted', 'Advance Paid'].includes(c.status);
    const requestTracking = [
        {
            label: 'Case Created',
            detail: `MR ${c.mrNo} opened`,
            at: c.createdAt,
            done: true,
            optional: false,
            skipped: false,
        },
        {
            label: 'Advance Request (Optional)',
            detail: c.advances[0]
                ? `${rupee(c.advances[0].amount)} requested`
                : finalStageReached
                    ? 'Advance not requested for this case'
                    : 'Optional step. Submit only if advance is required',
            at: (_a = c.advances[0]) === null || _a === void 0 ? void 0 : _a.submittedAt,
            done: hasAdvanceRequest,
            optional: true,
            skipped: !hasAdvanceRequest && finalStageReached,
        },
        {
            label: 'Essentiality Certificate',
            detail: signedEcDocs.length > 0 ? 'Signed EC available in case file' : 'Signed EC pending',
            at: (_b = signedEcDocs[0]) === null || _b === void 0 ? void 0 : _b.uploadedAt,
            done: signedEcDocs.length > 0,
            optional: false,
            skipped: false,
        },
        {
            label: 'Final Submission',
            detail: c.finalClaim.submittedAt ? 'Final claim submitted' : 'Awaiting final submission',
            at: c.finalClaim.submittedAt,
            done: Boolean(c.finalClaim.submittedAt),
            optional: false,
            skipped: false,
        },
        {
            label: 'Settlement',
            detail: c.status === 'Paid & Closed' ? 'Reimbursement settled and closed' : 'Under processing',
            at: c.status === 'Paid & Closed' ? c.lastUpdated : undefined,
            done: c.status === 'Paid & Closed',
            optional: false,
            skipped: false,
        },
    ];
    const isFinalLocked = ['Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status);
    const isTreatmentLocked = ['Advance Submitted', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status);
    const isAnnexuresLocked = ['Advance Submitted', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status);
    const isAdvanceLocked = ['Advance Submitted', 'Advance Paid', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status);
    const isCertificateLocked = ['Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status);
    const canSaveDraft = !['Advance Submitted', 'Final Submitted', 'Approved', 'Paid & Closed'].includes(c.status);
    const canSubmitFinal = !isFinalLocked && checks.length === 0;
    const statusHelpText = isFinalLocked
        ? `This request is ${c.status.toLowerCase()} and is available in view-only mode.`
        : c.status === 'Advance Submitted'
            ? 'Advance request is submitted. Core case fields are temporarily locked until the advance workflow progresses.'
            : c.status === 'Advance Paid'
                ? 'Advance is paid. Continue with final claim preparation; advance request fields stay locked.'
                : 'Editable draft mode.';
    const goToStep = (step) => {
        if (!step)
            return;
        setActive((current) => current === step ? '' : step);
    };
    const saveDraftOnly = () => {
        if (!canSaveDraft) {
            setToast(`Draft update is disabled while case is ${c.status.toLowerCase()}.`);
            setTimeout(() => setToast(''), 1800);
            return;
        }
        updateCase(Object.assign(Object.assign({}, c), { lastUpdated: new Date().toISOString() }), 'Draft saved');
    };
    const readinessLinks = checks.map((issue) => {
        const upper = issue.toUpperCase();
        if (upper.includes('DISCHARGE') || upper.includes('BILL') || upper.includes('GST'))
            return { issue, step: 'ANNEXURES' };
        if (upper.includes('ADVANCE'))
            return { issue, step: 'ADVANCE NOTES' };
        if (upper.includes('CERTIFICATE') || upper.includes('EC'))
            return { issue, step: 'CERTIFICATE' };
        if (upper.includes('TREATMENT') || upper.includes('HOSPITAL') || upper.includes('DATE'))
            return { issue, step: 'TREATMENT NOTE' };
        return { issue, step: 'FINAL NOTE' };
    });
    const stepIssueCount = workflowTabs.reduce((acc, step) => {
        acc[step] = readinessLinks.filter((item) => item.step === step).length;
        return acc;
    }, {});
    const officerInitial = c.officer.fullName.trim().charAt(0).toUpperCase() || 'O';
    const completedSteps = workflowTabs.filter((step) => (stepIssueCount[step] || 0) === 0).length;
    const renderWorkflowToggle = (tab) => {
        const meta = tabMeta[tab];
        const Icon = meta.icon;
        const index = workflowTabs.indexOf(tab);
        const isActive = active === tab;
        const issues = stepIssueCount[tab] || 0;
        return (<button key={tab} type="button" className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${isActive ? 'border-indigo-300 bg-indigo-50/90 text-slate-900 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/20 dark:text-slate-100' : 'border-transparent bg-transparent text-slate-700 hover:border-indigo-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900/50'}`} onClick={() => goToStep(tab)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${isActive ? 'border-indigo-200 bg-white text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300' : 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
              <Icon size={16}/>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium tracking-[0.08em] text-slate-400 dark:text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                <span className={`text-sm font-medium ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200'}`}>{meta.label || tab}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {issues > 0 ? (<span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                {issues}
              </span>) : (<CheckCircle size={14} className={`${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-emerald-500 dark:text-emerald-400'}`}/>)}
            <ChevronDown className={`${isActive ? 'rotate-180 text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'} transition-transform`} size={16}/>
          </div>
        </div>
      </button>);
    };
    const activeMeta = active ? tabMeta[active] : null;
    const ActiveStepIcon = (activeMeta === null || activeMeta === void 0 ? void 0 : activeMeta.icon) || Activity;
    return (<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/70 px-4 py-5 transition-colors duration-300 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:text-gray-100 sm:px-5 lg:px-6">
      {toast && <div className={styles.mrToast}>{toast}</div>}
      <div className="mx-auto mb-4 max-w-[1440px]">
        <button type="button" onClick={() => router.push('/reimbursement/medical')} className={styles.mrBackButton}>
          <ChevronLeft size={16}/>
          <span>Back to Requests</span>
        </button>
      </div>
      <div className="mx-auto mb-5 max-w-[1440px] rounded-2xl border border-indigo-200 bg-white/95 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-indigo-900/60 dark:bg-slate-800/95 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">Status Note:</span> {statusHelpText}
      </div>

      {billEditId && billDraft && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.48)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border-2 border-indigo-200 bg-white shadow-2xl dark:border-indigo-900/60 dark:bg-slate-900">
            <div className="bg-gradient-to-r from-white via-indigo-50 to-sky-50 px-6 py-4 border-b border-indigo-200 text-slate-900 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Review Bill Details</h3>
            </div>

            <fieldset disabled={isAnnexuresLocked} className={`grid gap-5 p-6 lg:grid-cols-[1.05fr_0.95fr] ${isAnnexuresLocked ? 'opacity-70' : ''}`}>
              <div className="rounded-2xl border border-indigo-100 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-4 border-b border-indigo-100 pb-3 dark:border-slate-700">
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">Extracted Bill Data</div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={styles.modernFormGroup}>
                    <label className={styles.modernLabel}>Invoice No</label>
                    <input className={styles.modernInput} value={billDraft.invoiceNo} onChange={(e) => setBillDraft(Object.assign(Object.assign({}, billDraft), { invoiceNo: e.target.value }))}/>
                  </div>
                  <div className={styles.modernFormGroup}>
                    <label className={styles.modernLabel}>GST No</label>
                    <input className={styles.modernInput} value={billDraft.gstNo} onChange={(e) => setBillDraft(Object.assign(Object.assign({}, billDraft), { gstNo: e.target.value }))}/>
                  </div>
                  <div className={styles.modernFormGroup}>
                    <label className={styles.modernLabel}>Bill Date</label>
                    <input type="date" className={styles.modernInput} value={billDraft.billDate} onChange={(e) => setBillDraft(Object.assign(Object.assign({}, billDraft), { billDate: e.target.value }))}/>
                  </div>
                  <div className={styles.modernFormGroup}>
                    <label className={styles.modernLabel}>Amount (Rs)</label>
                    <input type="number" className={styles.modernInput} value={billDraft.totalAmount} onChange={(e) => setBillDraft(Object.assign(Object.assign({}, billDraft), { totalAmount: Number(e.target.value) || 0 }))}/>
                  </div>
                  <div className={styles.modernFormGroup}>
                    <label className={styles.modernLabel}>Tax Amount</label>
                    <input type="number" className={styles.modernInput} value={billDraft.taxAmount} onChange={(e) => setBillDraft(Object.assign(Object.assign({}, billDraft), { taxAmount: Number(e.target.value) || 0 }))}/>
                  </div>
                  <div className={styles.modernFormGroup}>
                    <label className={styles.modernLabel}>Hospital Name</label>
                    <input className={styles.modernInput} value={billDraft.hospitalName} onChange={(e) => setBillDraft(Object.assign(Object.assign({}, billDraft), { hospitalName: e.target.value }))}/>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/40">
                <div className="mb-4 border-b border-indigo-100 pb-3 dark:border-slate-700">
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">Quick Preview</div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="rounded-xl border border-indigo-100 px-4 py-3 dark:border-slate-700">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Source File</div>
                    <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{billDraft.fileName}</div>
                  </div>
                  <div className="rounded-xl border border-indigo-100 px-4 py-3 dark:border-slate-700">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Hospital / Vendor</div>
                    <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{billDraft.hospitalName || '-'}</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-indigo-100 px-4 py-3 dark:border-slate-700">
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Invoice</div>
                      <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{billDraft.invoiceNo || '-'}</div>
                    </div>
                    <div className="rounded-xl border border-indigo-100 px-4 py-3 dark:border-slate-700">
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">GST</div>
                      <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{billDraft.gstNo || '-'}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-indigo-100 px-4 py-3 dark:border-slate-700">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Total</div>
                    <div className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">{rupee(billDraft.totalAmount || 0)}</div>
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end gap-3 border-t border-indigo-100 bg-slate-50/80 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/60">
              <button className={styles.modernBtnSecondary} onClick={() => { setBillEditId(''); setBillDraft(null); }}>Cancel</button>
              <button className={styles.modernBtnPrimary} onClick={saveBillEdit} disabled={isAnnexuresLocked}>Save Bill</button>
            </div>
          </div>
        </div>)}

      <div className="mx-auto mb-8 grid max-w-[1440px] gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-5 xl:self-start">
          <div className="overflow-hidden rounded-[24px] border border-indigo-200 bg-white shadow-sm dark:border-indigo-900/60 dark:bg-slate-800/95">
            <div className="border-b border-indigo-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                <LayoutList size={16} className="text-indigo-600 dark:text-indigo-300"/>
                Sections
              </div>
            </div>
            <div className="space-y-1.5 p-3">
              {workflowTabs.map(renderWorkflowToggle)}
            </div>
            <div className="border-t border-indigo-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <BarChart3 size={13}/>
                    Progress
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{Math.max(activeStepIndex + 1, 0)}/{workflowTabs.length}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <AlertCircle size={13}/>
                    Issues
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{readinessLinks.length}</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 transition-all" style={{ width: `${(completedSteps / workflowTabs.length) * 100}%` }}/>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {!active && (<div className={`rounded-[28px] border border-dashed border-indigo-200 bg-white px-6 py-8 text-center text-sm text-slate-500 shadow-sm dark:border-indigo-900/50 dark:bg-slate-800/70 dark:text-slate-400 ${styles.animateFadeIn}`}>
              Select a section to continue.
            </div>)}

          {active && activeMeta && (<div className="mb-5 overflow-hidden rounded-[20px] border border-indigo-200 bg-white shadow-sm dark:border-indigo-900/60 dark:bg-slate-800">
              <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                    <ActiveStepIcon size={16}/>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium tracking-[0.08em] text-slate-400 dark:text-slate-500">STEP {activeStepIndex + 1}</div>
                    <div className="text-base font-medium leading-tight text-slate-900 dark:text-slate-100">{activeMeta.label || active}</div>
                  </div>
                </div>
                <button type="button" onClick={() => goToStep(active)} className="inline-flex items-center gap-2 self-start rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  Close
                  <ChevronDown size={16} className="rotate-180"/>
                </button>
              </div>
            </div>)}

        {active === 'SUMMARY' && (<div className="animateFadeIn">
            <div className="overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white shadow-xl dark:border-indigo-900/60 dark:bg-slate-800">
              <div className="border-b border-indigo-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
                      Medical Reimbursement
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">Medical Reimbursement Summary</h3>
                  </div>
                  <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${c.status === 'Paid & Closed' || c.status === 'Approved'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'
                : c.status === 'Final Submitted' || c.status === 'Advance Paid'
                    ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-300'
                    : c.status === 'Draft'
                        ? 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'}`}>
                    {c.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="overflow-hidden rounded-xl border border-indigo-200 dark:border-slate-700">
                  <div className="border-b border-indigo-200 bg-indigo-50/60 px-4 py-3 dark:border-slate-700 dark:bg-indigo-950/20">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
                      Case Identification
                    </div>
                  </div>
                  <div className="divide-y divide-indigo-100 dark:divide-slate-700">
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">MR Number</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{c.mrNo}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Date of Application</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{new Date(c.createdAt).toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Patient / Claimant</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.patient.name}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Nature of Claim</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.patient.claimFor === 'SELF' ? 'Self claim' : c.patient.relation}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Status</div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${c.status === 'Paid & Closed' || c.status === 'Approved'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'
                : c.status === 'Final Submitted' || c.status === 'Advance Paid'
                    ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-300'
                    : c.status === 'Draft'
                        ? 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'}`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Readiness</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{unreadinessCount > 0 ? 'Pending items need attention' : 'Ready for further processing'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-indigo-200 dark:border-slate-700">
                  <div className="border-b border-indigo-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
                      Treatment Details
                    </div>
                  </div>
                  <div className="divide-y divide-indigo-100 dark:divide-slate-700">
                    <div className="grid md:grid-cols-[240px_minmax(0,1fr)]">
                      <div className="border-b border-indigo-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Diagnosis / Ailment</div>
                      </div>
                      <div className="px-4 py-3 text-sm leading-6 text-slate-900 dark:text-slate-100">{diagnosisText || '-'}</div>
                    </div>
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">System of Medicine</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{treatmentDraft.medicalType || '-'}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Mode of Treatment</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{treatmentDraft.hospitalised ? 'Hospitalised' : 'Outpatient'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-indigo-200 dark:border-slate-700">
                  <div className="border-b border-indigo-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
                      Personal Details
                    </div>
                  </div>
                  <div className="divide-y divide-indigo-100 dark:divide-slate-700">
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Name of Employee</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.officer.fullName}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Designation</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.officer.designation}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">PEN</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.officer.penNumber}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Department</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.officer.administrativeDepartment}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Grade & Level</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.officer.grade} | Level {c.officer.level}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Basic Pay</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{rupee(c.officer.basicPay || 0)}</div>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Mobile</div>
                      <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.officer.mobile}</div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-indigo-200 dark:border-slate-700">
                  <div className="border-b border-indigo-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
                      Financial Details
                    </div>
                  </div>
                  <div className="divide-y divide-indigo-100 dark:divide-slate-700">
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Claim Amount</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{rupee(billTotalAmount)}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Advance Amount</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{rupee(advanceTotalAmount)}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Number of Bills</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{c.bills.length}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Supporting Documents</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{visibleDocs.length + signedEcDocs.length}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2">
                      <div className="border-b border-indigo-100 px-4 py-3 dark:border-slate-700 md:border-b-0 md:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Pending Items</div>
                        <div className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">{unreadinessCount}</div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Readiness</div>
                        <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">{unreadinessCount > 0 ? 'Pending items need attention' : 'Ready for further processing'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {readinessLinks.length > 0 && (<div className="mt-4 overflow-hidden rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <div className="border-b border-amber-200 bg-amber-50/70 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                        Items Requiring Attention
                      </div>
                    </div>
                    <div className="divide-y divide-amber-100 dark:divide-amber-900/30">
                      {readinessLinks.slice(0, 6).map((item, idx) => (<button key={`${item.issue}-${idx}`} type="button" onClick={() => goToStep(item.step)} className="flex w-full items-center justify-between bg-white px-4 py-3 text-left text-sm transition hover:bg-amber-50 dark:bg-slate-900 dark:hover:bg-amber-950/20">
                          <span className="text-slate-800 dark:text-slate-100">{item.issue}</span>
                          <span className="ml-4 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">Resolve</span>
                        </button>))}
                    </div>
                  </div>)}
              </div>
            </div>
          </div>)}


        {active === 'TREATMENT NOTE' && (<WorkspaceSection eyebrow="Treatment Note" title="Treatment Details" icon={<Stethoscope size={18}/>} className={styles.animateFadeIn} bodyClassName={styles.workspaceSectionCompactBody}>
            <fieldset disabled={isTreatmentLocked} className={`space-y-5 p-5 ${isTreatmentLocked ? 'opacity-70' : ''}`}>
              <div className={`${styles.noteSheet} ${styles.sectionCanvas}`}>
                <div className={styles.noteBlock}>
                  <div className={styles.noteBlockHeader}>
                    <div>
                      <div className={styles.noteBlockTitle}>Diagnosis</div>
                    </div>
                    <div className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {treatmentDraft.medicalType}
                    </div>
                  </div>

                  <WorkspaceFormGrid>
                    <WorkspaceField label="Diagnosis" span={12}>
                      <input className={styles.modernInput} value={diagnosisText} onChange={(e) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { diagnosis: e.target.value }))} placeholder="e.g. Viral fever"/>
                    </WorkspaceField>
                    <WorkspaceField label="System of Medicine" span={12}>
                        <WorkspaceChoiceGroup options={MR_MEDICAL_SYSTEMS.map((system) => ({ label: system, value: system }))} value={treatmentDraft.medicalType} onChange={(value) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { medicalType: value }))}/>
                    </WorkspaceField>
                    <WorkspaceField label="Place of Illness" span={6}>
                      <input className={styles.modernInput} value={treatmentDraft.placeOfIllness} onChange={(e) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { placeOfIllness: e.target.value }))} placeholder="Town / district"/>
                    </WorkspaceField>
                    <WorkspaceField label="Treatment Mode" span={6}>
                      <WorkspaceChoiceGroup options={[
                { label: 'In-patient Treatment', value: 'IN' },
                { label: 'Out-patient Treatment', value: 'OUT' },
            ]} value={treatmentDraft.hospitalised ? 'IN' : 'OUT'} onChange={(value) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { hospitalised: value === 'IN' }))} columns={2}/>
                    </WorkspaceField>
                  </WorkspaceFormGrid>
                </div>

                <div className={styles.noteBlock}>
                  <div className={styles.noteBlockHeader}>
                    <div>
                      <div className={styles.noteBlockTitle}>Treatment Period</div>
                    </div>
                  </div>
                  <WorkspaceFormGrid>
                    <WorkspaceField label="Start Date" span={6}>
                      <input type="date" className={styles.modernInput} value={treatmentDraft.fromDate} onChange={(e) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { fromDate: e.target.value }))}/>
                    </WorkspaceField>
                    <WorkspaceField label="End Date" span={6}>
                      <input type="date" className={styles.modernInput} value={treatmentDraft.toDate} onChange={(e) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { toDate: e.target.value }))}/>
                    </WorkspaceField>
                    <WorkspaceField label="Was the treatment within Kerala?" span={12}>
                      <WorkspaceChoiceGroup options={[
                { label: 'Yes, within Kerala', value: 'YES' },
                { label: 'No, outside Kerala', value: 'NO' },
            ]} value={treatmentDraft.withinState ? 'YES' : 'NO'} onChange={(value) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { withinState: value === 'YES' }))} columns={2}/>
                    </WorkspaceField>
                  </WorkspaceFormGrid>
                </div>

                <div className={`${styles.noteBlock} ${styles.noteBlockSoft}`}>
                  <div className={styles.noteBlockHeader}>
                    <div>
                      <div className={styles.noteBlockTitle}>Hospital / Facility</div>
                    </div>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {treatmentDraft.hospitalised ? 'Required' : 'Optional'}
                    </span>
                  </div>

                  <WorkspaceFormGrid>
                    <WorkspaceField label="Institution Type" span={12}>
                      <WorkspaceChoiceGroup options={[
                { label: 'Government', value: 'Government' },
                { label: 'Private', value: 'Private' },
                { label: 'Foreign', value: 'Foreign' },
            ]} value={treatmentDraft.hospitalType} onChange={(value) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { hospitalType: value }))}/>
                    </WorkspaceField>

                    <WorkspaceField label="Institution Name" span={12}>
                      <input className={styles.modernInput} value={treatmentDraft.hospitalName} onFocus={() => setHospitalFocused(true)} onBlur={() => window.setTimeout(() => setHospitalFocused(false), 120)} onChange={(e) => {
                setHospitalQuery(e.target.value);
                setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { hospitalName: e.target.value }));
            }} placeholder="Enter hospital / institution name"/>
                      {treatmentDraft.hospitalised && hospitalFocused && (hospitalLoading || hospitalOptions.length > 0) && (<div className={styles.treatmentSuggestMenu}>
                          {hospitalLoading && <div className="px-3 py-2 text-sm text-slate-500">Searching hospitals...</div>}
                          {!hospitalLoading && hospitalOptions.map((option, index) => (<button key={`${option.name}-${index}`} type="button" className={styles.treatmentSuggestItem} onMouseDown={() => {
                        skipAutocompleteRef.current = true;
                        setHospitalQuery(option.name);
                        setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { hospitalName: option.name, hospitalAddress: option.address }));
                        setHospitalOptions([]);
                    }}>
                              <div className="text-sm font-semibold text-slate-800">{option.name}</div>
                              <div className="mt-0.5 text-xs text-slate-500">{option.address}</div>
                            </button>))}
                        </div>)}
                    </WorkspaceField>

                    <WorkspaceField label="Institution Address" span={12}>
                      <textarea className={`${styles.modernInput} ${styles.treatmentTextarea}`} rows={4} value={treatmentDraft.hospitalAddress} onChange={(e) => setTreatmentDraft(Object.assign(Object.assign({}, treatmentDraft), { hospitalAddress: e.target.value }))} placeholder="Address"/>
                    </WorkspaceField>
                  </WorkspaceFormGrid>
                </div>
              </div>
            </fieldset>

            <div className="border-t border-indigo-100 bg-slate-50/70 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  {isTreatmentLocked
                ? `Treatment details are locked while case is ${c.status.toLowerCase()}.`
                : 'Save section changes.'}
                </div>
                <button className={styles.modernBtnPrimary} onClick={saveTreatment} disabled={isTreatmentLocked}>
                  <Save size={18} className="mr-2"/>
                  Save Treatment Details
                </button>
              </div>
            </div>
          </WorkspaceSection>)}


        {active === 'ANNEXURES' && (<WorkspaceSection eyebrow="Annexures" title="Bills and Documents" icon={<FileText size={18}/>} className={styles.animateFadeIn} bodyClassName={styles.workspaceSectionCompactBody}>
            <input type="file" ref={billUploadRef} style={{ display: 'none' }} accept=".pdf,.jpg,.png" onChange={onBillUpload}/>
            <input type="file" ref={docUploadRef} style={{ display: 'none' }} accept=".pdf,.jpg,.png" onChange={onDocUpload}/>

            <fieldset disabled={isAnnexuresLocked} className={`space-y-5 p-5 ${isAnnexuresLocked ? 'opacity-70' : ''}`}>
              <div className={`${styles.noteSheet} ${styles.sectionCanvas}`}>
                <div className={styles.noteBlock}>
                  <div className={styles.noteBlockHeader}>
                  <div>
                    <div className={styles.noteBlockTitle}>Upload Center</div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700">{c.bills.length} bills</span>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700">{visibleDocs.length} docs</span>
                  </div>
                </div>

                <div className={styles.segmentedToggle}>
                  <button type="button" className={`${styles.segmentedToggleButton} ${sub === 'Bills' ? styles.segmentedToggleButtonActive : ''}`} onClick={() => setSub('Bills')}>
                    Bills
                  </button>
                  <button type="button" className={`${styles.segmentedToggleButton} ${sub === 'Documents' ? styles.segmentedToggleButtonActive : ''}`} onClick={() => setSub('Documents')}>
                    Documents
                  </button>
                </div>

                {sub === 'Bills' ? (<div className={styles.noteBlockSoft}>
                    <div className="flex flex-col gap-3 border-b border-indigo-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className={styles.noteBlockTitle}>Bill Register</div>
                      </div>
                      <button className={styles.compactActionButton} onClick={() => { var _a; return (_a = billUploadRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={isAnnexuresLocked}>
                        <Upload size={15}/>
                        Upload Bill
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {c.bills.length === 0 ? (<div className="rounded-xl border border-dashed border-indigo-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          No bills uploaded yet.
                        </div>) : (c.bills.map((b) => (<div key={b.id} className={styles.recordRow}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="text-sm font-bold uppercase tracking-[0.08em] text-slate-900">{b.invoiceNo || 'Bill record'}</div>
                                <div className="mt-1 text-xs text-slate-500">{b.fileName}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${b.status === 'Extracted' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{b.status}</span>
                                <button className={styles.compactSecondaryButton} onClick={() => startBillEdit(b)} disabled={isAnnexuresLocked}>Review</button>
                              </div>
                            </div>
                            <div className={styles.noteGrid3}>
                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Hospital</div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">{b.hospitalName || '-'}</div>
                              </div>
                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">GST No</div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">{b.gstNo || '-'}</div>
                              </div>
                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Amount</div>
                                <div className="mt-1 text-sm font-semibold text-emerald-600">{rupee(b.totalAmount || 0)}</div>
                              </div>
                            </div>
                          </div>)))}
                    </div>
                  </div>) : (<div className={styles.noteBlockSoft}>
                    <div className="flex flex-col gap-3 border-b border-indigo-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className={styles.noteBlockTitle}>Document Register</div>
                      </div>
                      <button className={styles.compactActionButton} onClick={() => { var _a; return (_a = docUploadRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={isAnnexuresLocked}>
                        <Upload size={15}/>
                        Upload Document
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className={styles.modernFormGroup}>
                        <label className={styles.modernLabel}>Document Type</label>
                        <select className={styles.modernSelect} value={docType} onChange={(e) => setDocType(e.target.value)}>
                          {MR_DOC_TYPES.filter((item) => item.value !== 'EC_SIGNED').map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
                        </select>
                      </div>
                      <div className={styles.modernFormGroup}>
                        <label className={styles.modernLabel}>Reference No</label>
                        <input className={styles.modernInput} value={docDraftMeta.referenceNo} onChange={(e) => setDocDraftMeta(Object.assign(Object.assign({}, docDraftMeta), { referenceNo: e.target.value }))} placeholder="Reference number"/>
                      </div>
                      <div className={styles.modernFormGroup}>
                        <label className={styles.modernLabel}>Document Title</label>
                        <input className={styles.modernInput} value={docDraftMeta.title} onChange={(e) => setDocDraftMeta(Object.assign(Object.assign({}, docDraftMeta), { title: e.target.value }))} placeholder="Short title"/>
                      </div>
                      <div className={styles.modernFormGroup}>
                        <label className={styles.modernLabel}>Issue Date</label>
                        <input type="date" className={styles.modernInput} value={docDraftMeta.issueDate} onChange={(e) => setDocDraftMeta(Object.assign(Object.assign({}, docDraftMeta), { issueDate: e.target.value }))}/>
                      </div>
                      <div className="sm:col-span-2">
                        <div className={styles.modernFormGroup}>
                          <label className={styles.modernLabel}>Remarks</label>
                          <textarea className={`${styles.modernInput} min-h-[112px] resize-none`} value={docDraftMeta.remarks} onChange={(e) => setDocDraftMeta(Object.assign(Object.assign({}, docDraftMeta), { remarks: e.target.value }))} placeholder="Remarks"/>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {visibleDocs.length === 0 ? (<div className="rounded-xl border border-dashed border-indigo-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          No supporting documents uploaded yet.
                        </div>) : (visibleDocs.map((d) => {
                    var _a, _b;
                    return (<div key={d.id} className={styles.recordRow}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="text-sm font-bold uppercase tracking-[0.08em] text-slate-900">{d.title || ((_a = MR_DOC_TYPES.find((item) => item.value === d.type)) === null || _a === void 0 ? void 0 : _a.label) || d.type}</div>
                                <div className="mt-1 text-xs text-slate-500">{d.fileName}</div>
                              </div>
                              <button className={styles.compactDangerButton} onClick={() => updateCase(Object.assign(Object.assign({}, c), { docs: c.docs.filter((x) => x.id !== d.id) }), 'Doc deleted')} disabled={isAnnexuresLocked}>
                                Delete
                              </button>
                            </div>
                            <div className={styles.noteGrid3}>
                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Type</div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">{((_b = MR_DOC_TYPES.find((item) => item.value === d.type)) === null || _b === void 0 ? void 0 : _b.label) || d.type}</div>
                              </div>
                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Reference</div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">{d.referenceNo || '-'}</div>
                              </div>
                              <div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Issue Date</div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">{formatDMY(d.issueDate)}</div>
                              </div>
                            </div>
                            {d.remarks && (<div className="mt-3 border-t border-indigo-100 pt-3 text-sm text-slate-600">
                                {d.remarks}
                              </div>)}
                          </div>);
                }))}
                    </div>
                  </div>)}
                </div>
              </div>
            </fieldset>
          </WorkspaceSection>)}

        {active === 'ADVANCE NOTES' && (<WorkspaceSection eyebrow="Advance Notes" title="Advance Request" icon={<IndianRupee size={18}/>} className={styles.animateFadeIn} bodyClassName={styles.workspaceSectionCompactBody} badge={(<button className={styles.modernBtnSecondary} onClick={() => { setAdvanceFormOpen(!advanceFormOpen); if (advanceFormOpen)
                setAdvancePreview(false); }} disabled={isAdvanceLocked}>
                 {advanceFormOpen ? 'Cancel Request' : 'Request Advance'}
               </button>)}>

             {advanceFormOpen && (<fieldset disabled={isAdvanceLocked} className={`space-y-5 p-5 ${isAdvanceLocked ? 'opacity-70' : ''}`}>
                 <div className="rounded-2xl border-2 border-indigo-200 bg-white p-5 shadow-sm dark:border-indigo-900/60 dark:bg-slate-900/40">
                   <div className="mb-4 border-b border-indigo-100 pb-3 dark:border-slate-700">
                     <div className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">Advance Details</div>
                   </div>

                   <div className="grid gap-4 md:grid-cols-2">
                     <div className={styles.modernFormGroup}>
                       <label className={styles.modernLabel}>Advance Amount (Rs)</label>
                       <input type="number" className={styles.modernInput} value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)}/>
                     </div>
                     <div className={styles.modernFormGroup}>
                       <label className={styles.modernLabel}>Estimate Reference No</label>
                       <input className={styles.modernInput} value={estimateReferenceNo} onChange={e => setEstimateReferenceNo(e.target.value)} placeholder="Estimate / letter no"/>
                     </div>
                     <div className={styles.modernFormGroup}>
                       <label className={styles.modernLabel}>Hospital Name</label>
                       <input className={styles.modernInput} value={estimateHospitalName} onChange={e => setEstimateHospitalName(e.target.value)} placeholder="Hospital for estimate"/>
                     </div>
                     <div className={styles.modernFormGroup}>
                       <label className={styles.modernLabel}>GST No</label>
                       <input className={styles.modernInput} value={estimateGstNo} onChange={e => setEstimateGstNo(e.target.value)} placeholder="GST number if available"/>
                     </div>
                     <div className="md:col-span-2">
                       <label className={styles.modernLabel}>Estimate Document</label>
                       <div className="flex gap-3">
                         <input type="file" ref={estimateUploadRef} style={{ display: 'none' }} onChange={(e) => {
                    var _a;
                    if ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) {
                        setEstimateFileName(e.target.files[0].name);
                        setToast('Estimate document attached');
                        setTimeout(() => setToast(''), 2000);
                    }
                }}/>
                         <button className={styles.modernBtnSecondary} onClick={() => { var _a; return (_a = estimateUploadRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} style={{ flex: 1 }}>
                           <Upload size={16}/> {estimateFileName || 'Upload Estimate'}
                         </button>
                       </div>
                     </div>
                   </div>

                   <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-indigo-100 pt-4 dark:border-slate-700">
                     <button className={styles.modernBtnSecondary} onClick={() => setAdvancePreview(!advancePreview)} disabled={!advanceAmount || !estimateFileName}>
                       {advancePreview ? 'Hide Preview' : 'Preview Request'}
                     </button>
                     <button className={styles.modernBtnPrimary} onClick={submitAdvanceRequest} disabled={!advanceAmount || !estimateFileName || !advancePreview}>
                       Submit Advance Request
                     </button>
                   </div>
                 </div>

                 <div className="rounded-2xl border-2 border-indigo-200 bg-white p-5 shadow-sm dark:border-indigo-900/60 dark:bg-slate-900/40">
                   <div className="mb-4 border-b border-indigo-100 pb-3 dark:border-slate-700">
                     <div className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">Submission Preview</div>
                   </div>

                   {!advancePreview ? (<div className="rounded-xl border border-dashed border-indigo-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                       Complete the advance details and open preview to review the full request.
                     </div>) : (<div className="space-y-4 text-sm">
                       <div className="rounded-xl border border-indigo-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                         <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Applicant</div>
                         <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{c.officer.fullName}</div>
                         <div className="mt-1 text-slate-500 dark:text-slate-400">{c.officer.designation} | PEN {c.officer.penNumber}</div>
                       </div>

                       <div className="grid gap-4 md:grid-cols-2">
                         <div className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                           <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Patient</div>
                           <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{c.patient.name}</div>
                           <div className="mt-1 text-slate-500 dark:text-slate-400">{c.patient.claimFor === 'SELF' ? 'Self treatment' : c.patient.relation}</div>
                         </div>
                         <div className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                           <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Advance Amount</div>
                           <div className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">{rupee(parseAmount(advanceAmount || '0'))}</div>
                         </div>
                       </div>

                       <div className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                         <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Treatment Summary</div>
                         <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{diagnosisText} | {treatmentDraft.medicalType}</div>
                         <div className="mt-1 text-slate-500 dark:text-slate-400">{treatmentDraft.hospitalised ? 'Hospitalised' : 'Outpatient'} treatment at {treatmentDraft.hospitalName || estimateHospitalName || 'Hospital not set'}</div>
                         <div className="mt-1 text-slate-500 dark:text-slate-400">Period: {formatDMY(treatmentDraft.fromDate)} to {formatDMY(treatmentDraft.toDate)}</div>
                       </div>

                       <div className="grid gap-4 md:grid-cols-3">
                         <div className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                           <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Estimate File</div>
                           <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{estimateFileName || '-'}</div>
                         </div>
                         <div className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                           <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Reference No</div>
                           <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{estimateReferenceNo || '-'}</div>
                         </div>
                         <div className="rounded-xl border border-indigo-100 p-4 dark:border-slate-700">
                           <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">GST No</div>
                           <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{estimateGstNo || '-'}</div>
                         </div>
                       </div>

                       <div className="rounded-xl border border-indigo-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                         <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Financial Context</div>
                         <div className="mt-2 text-slate-700 dark:text-slate-300">Current bills available in case file: {c.bills.length} totaling {rupee(billTotalAmount)}</div>
                         <div className="mt-1 text-slate-700 dark:text-slate-300">Previous advance paid/requested: {rupee(advanceTotalAmount)}</div>
                       </div>
                     </div>)}
                 </div>
               </fieldset>)}

             {c.advances.length === 0 ? (<div className="px-5 pb-5">
                 <WorkspaceEmptyState>No advance requests made.</WorkspaceEmptyState>
               </div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 20px 20px' }}>
                 {c.advances.map(a => (<div key={a.advId} className={styles.modernStatCard} style={{ justifyContent: 'space-between' }}>
                     <div>
                       <div className={styles.modernValue}>{rupee(a.amount)}</div>
                       <div className={styles.modernLabel}>Status: <span className={styles.modernBadgeInfo}>{a.status}</span></div>
                     </div>
                     <div className={styles.modernLabel}>Requested on {new Date(a.submittedAt || new Date()).toLocaleDateString()}</div>
                   </div>))}
               </div>)}
           </WorkspaceSection>)}

        {active === 'CERTIFICATE' && (<WorkspaceSection eyebrow="Certificate" title="Essentiality Certificate" icon={<FileCheck size={18}/>} className={styles.animateFadeIn} bodyClassName={styles.workspaceSectionCompactBody}>

            <div className="space-y-5 p-5">
              <div className="rounded-2xl border-2 border-indigo-200 bg-white p-5 shadow-[0_16px_32px_rgba(79,70,229,0.08)] dark:border-indigo-900/60 dark:bg-slate-900/40">
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-indigo-100 pb-3 dark:border-slate-700">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">System Generated Preview</div>
                  </div>
                  <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    Essentiality Certificate
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-slate-50 p-5 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-300">
                  <div className="mb-4 text-center">
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">Annexure 1</div>
                    <div className="mt-1 text-base font-bold uppercase tracking-[0.18em] text-indigo-900 dark:text-indigo-300">Form of Essentiality Certificate</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">System generated contents</div>
                  </div>
                  <p>
                    Certify that Shri/Smt. <span className="font-semibold text-slate-900 dark:text-slate-100">{c.officer.fullName}</span> employed in the
                    <span className="font-semibold text-slate-900 dark:text-slate-100"> {c.officer.administrativeDepartment || c.officer.serviceType}</span> Department has been under treatment in the hospital/Dispensary or at his/her residence
                    <span className="font-semibold text-slate-900 dark:text-slate-100"> {treatmentDraft.hospitalName || ecMeta.institutionName || ' Hospital / Dispensary'}</span> for the period from
                    <span className="font-semibold text-slate-900 dark:text-slate-100"> {formatDMY(treatmentDraft.fromDate)}</span> to
                    <span className="font-semibold text-slate-900 dark:text-slate-100"> {formatDMY(treatmentDraft.toDate)}</span> and that the under mentioned medicines prescribed by me in this connection were essential for the recovery/Prevention of serious deterioration in the condition of the patient.
                  </p>
                  <p className="mt-3">
                    The medicines were not in the stock in hospital or not stocked in the hospital supply to the Government Servant. They do not include preparatory preparations for which cheaper substance or equal therapeutic value or available preparations which are primary foods, tonic toilet preparations or disinfectants.
                  </p>
                  <p className="mt-3">
                    {treatmentDraft.hospitalised
                ? 'It is Certified that the case required Hospitalisation for the period stated above.'
                : 'It is Certified that the case did not require Hospitalisation but is one of prolonged matter requiring medical attendance of the Out-Patient spreading over a period of more than 10 days.'}
                  </p>
                  <div className="mt-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Patient has been suffering from</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{diagnosisText}</div>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-xl border border-indigo-100 bg-white dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="grid grid-cols-[1.4fr_1.4fr_1fr_0.6fr_0.5fr] border-b border-indigo-100 bg-indigo-50/60 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <div className="px-3 py-2">Trade Brand</div>
                      <div className="px-3 py-2">Chemical / Pharmacological</div>
                      <div className="px-3 py-2">Description</div>
                      <div className="px-3 py-2 text-right">Rs.</div>
                      <div className="px-3 py-2 text-right">Ps.</div>
                    </div>
                    {(c.bills.length ? c.bills : [{ id: 'empty', fileName: '', invoiceNo: '', gstNo: '', billDate: '', hospitalName: '', totalAmount: 0, taxAmount: 0, status: 'Extracted', duplicateFlag: false }]).slice(0, 4).map((bill) => {
                const amount = Number(bill.totalAmount) || 0;
                const rupees = Math.floor(amount);
                const paise = Math.round((amount - rupees) * 100);
                return (<div key={bill.id} className="grid grid-cols-[1.4fr_1.4fr_1fr_0.6fr_0.5fr] border-b border-indigo-50 text-xs text-slate-700 last:border-b-0 dark:border-slate-700 dark:text-slate-300">
                          <div className="px-3 py-2">{bill.fileName || '-'}</div>
                          <div className="px-3 py-2">{bill.invoiceNo || '-'}</div>
                          <div className="px-3 py-2">{bill.hospitalName || '-'}</div>
                          <div className="px-3 py-2 text-right">{amount ? rupees : '-'}</div>
                          <div className="px-3 py-2 text-right">{amount ? String(paise).padStart(2, '0') : '-'}</div>
                        </div>);
            })}
                  </div>
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Supporting bills considered</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{c.bills.length} bill(s) totaling {rupee(billTotalAmount)}</div>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div className="rounded-xl border border-indigo-100 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Date</div>
                      <div className="mt-6 border-b border-dashed border-slate-400 pb-2 text-sm text-slate-400 dark:border-slate-600"> </div>
                      <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Place</div>
                      <div className="mt-6 border-b border-dashed border-slate-400 pb-2 text-sm text-slate-400 dark:border-slate-600"> </div>
                      <div className="mt-8 border-t border-slate-400 pt-2 text-sm font-semibold text-slate-900 dark:border-slate-600 dark:text-slate-100">
                        Name and Signature of Authorized Medical Attendant
                      </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-indigo-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Official Seal</div>
                      <div className="mt-6 flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-600 dark:text-slate-500">
                        Seal Space
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border-2 border-indigo-200 bg-white p-5 shadow-sm dark:border-indigo-900/60 dark:bg-slate-900/40">
                  <div className="mb-4 flex flex-col gap-3 border-b border-indigo-100 pb-3 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">Certificate Actions</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button className={styles.modernBtnSecondary} onClick={downloadEssentialityCertificate}>
                        <Download size={18}/>
                        Download Generated EC
                      </button>
                      <input type="file" ref={ecSignedUploadRef} style={{ display: 'none' }} accept=".pdf,.jpg,.png" onChange={onSignedEcUpload}/>
                      <button className={styles.modernBtnPrimary} onClick={() => { var _a; return (_a = ecSignedUploadRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={isCertificateLocked}>
                        <Upload size={18}/>
                        Upload Signed EC
                      </button>
                    </div>
                  </div>

                  <div className={`rounded-2xl border px-4 py-4 text-sm font-medium ${pendingEcUpload ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-300' : signedEcDocs.length > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'}`}>
                    {pendingEcUpload
                ? `Signed EC selected: ${pendingEcUpload.fileName}. Verify the preview below and confirm upload.`
                : signedEcDocs.length > 0
                    ? 'Signed Essentiality Certificate uploaded and available in the case file.'
                    : 'Signed Essentiality Certificate is pending upload.'}
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-indigo-100 bg-slate-50/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="mb-4 border-b border-indigo-100 pb-3 dark:border-slate-700">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">Uploaded Signed Certificate Preview</div>
                  </div>

                  {pendingEcUpload ? (<div className="space-y-4">
                      <div className="rounded-xl border border-indigo-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Selected File</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{pendingEcUpload.fileName}</div>
                      </div>

                      <div className="h-[620px] overflow-auto rounded-2xl border border-indigo-100 bg-white dark:border-slate-700 dark:bg-slate-900/60">
                        {/\.(png|jpg|jpeg|webp)$/i.test(pendingEcUpload.fileName) ? (<img src={pendingEcUpload.previewUrl} alt="Signed EC preview" className="w-full h-auto bg-slate-50 dark:bg-slate-950/40"/>) : (<iframe src={pendingEcUpload.previewUrl} title="Signed EC preview" className="h-[620px] w-full bg-white dark:bg-slate-950/40"/>)}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button className={styles.modernBtnSecondary} onClick={cancelSignedEcUpload}>
                          Cancel
                        </button>
                        <button className={styles.modernBtnPrimary} onClick={confirmSignedEcUpload}>
                          Confirm Upload
                        </button>
                      </div>
                    </div>) : signedEcDocs.length > 0 ? (<div className="rounded-xl border border-indigo-100 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Uploaded File</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{signedEcDocs[0].fileName}</div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Uploaded on {new Date(signedEcDocs[0].uploadedAt || new Date().toISOString()).toLocaleString()}</div>
                    </div>) : (<div className="rounded-xl border border-dashed border-indigo-200 bg-white px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                      Upload a signed certificate to preview and confirm it here.
                    </div>)}
                </div>

                <WorkspacePanel title="Key Certificate Data" soft>
                  <WorkspaceFactGrid items={[
                { label: 'Officer / Claimant', value: c.officer.fullName },
                { label: 'Patient', value: `${c.patient.name} (${c.patient.claimFor === 'SELF' ? 'Self' : c.patient.relation})` },
                { label: 'Treatment Period', value: `${formatDMY(treatmentDraft.fromDate)} to ${formatDMY(treatmentDraft.toDate)}` },
            ]}/>
                </WorkspacePanel>
              </div>
            </div>
          </WorkspaceSection>)}

        {active === 'FINAL NOTE' && (<WorkspaceSection eyebrow="Final Note" title="Final Claim Submission Note" icon={<ClipboardCheck size={18}/>} bodyClassName={styles.workspaceSectionCompactBody}>

            <div className="bg-slate-50 p-6 md:p-8">
              <FinalClaimDocument data={finalDocumentData}/>

              <div className="hidden">
              {/* PDF Document Container */}
              <div className={styles.govFormSheet}>

                {/* PDF Top Border Gradient */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-200 via-sky-200 to-indigo-200"></div>

                {/* Header */}
                <div className={styles.govFormHead}>
                  <h2>Form of Application for Claiming Reimbursement of Cost of Treatment or Medical Attendance</h2>
                  <p>(See Rule 7)</p>
                </div>

                <div className={styles.govFormTable}>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>1.</div><div className={styles.govFormLabel}>Name and office held (in block letters)</div><div className={styles.govFormValue}><div>{c.officer.fullName}</div><div>{c.officer.designation}</div><div>{c.officer.serviceType}</div></div></div>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>2.</div><div className={styles.govFormLabel}>Residential address</div><div className={styles.govFormValue}><div>{c.officer.residentialAddress || c.officer.officeAddress || '-'}</div>{c.officer.officePostingAddress ? <div>Present posting: {c.officer.officePostingAddress}</div> : null}</div></div>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>3.</div><div className={styles.govFormLabel}>Name of Patient and relationship with the Member</div><div className={styles.govFormValue}>{c.patient.claimFor === 'SELF' ? <><div>SELF</div><div>Member treated directly</div></> : <><div>{(selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.fullName) || c.patient.name}</div><div>{dependentMeta.join(' | ')}</div></>}</div></div>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>4.</div><div className={styles.govFormLabel}>Place at which the the Member / Spouse / family member fell ill</div><div className={styles.govFormValue}>{treatmentDraft.placeOfIllness || 'N.A.'}</div></div>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>5.</div><div className={styles.govFormLabel}>Whether hospitalised or not</div><div className={styles.govFormValue}><div>{treatmentDraft.hospitalised ? 'Hospitalised' : 'Not hospitalised'}</div><div>Period: {treatmentPeriodLabel}</div></div></div>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>6.</div><div className={styles.govFormLabel}>If hospitalised within the state, whether in Govt. hospital or Empanelled Private hospital with name of hospital and address</div><div className={styles.govFormValue}><div>{treatmentDraft.withinState ? 'Within state' : 'Outside state'}</div><div>{treatmentDraft.hospitalName || 'N.A.'}</div><div>{treatmentDraft.hospitalAddress || 'Address not recorded'}</div></div></div>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>7.</div><div className={styles.govFormLabel}>Empanelled Authority</div><div className={styles.govFormValue}><div>{treatmentDraft.hospitalType || 'N.A.'}</div><div>{treatmentDraft.hospitalised ? 'Hospital admission details recorded' : 'Out-patient / non-admission treatment'}</div></div></div>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>8.</div><div className={styles.govFormLabel}>In the case of treatment abroad, whether certificate of the authority mentioned in rule 6 of the scheme is attached</div><div className={styles.govFormValue}>{treatmentDraft.withinState ? 'Not applicable. Treatment recorded within India.' : 'No treatment-abroad certificate attached.'}</div></div>
                  <div className={styles.govFormRow}><div className={styles.govFormNo}>9.</div><div className={styles.govFormLabel}>Cost of treatment (List of medicines, cash memos and essentiality certificate should be attached)</div><div className={styles.govFormValue}><div>{c.bills.length} bill(s), {visibleDocs.length} supporting document(s)</div><div>Net claim: {rupee(billsTotal(c) - advancePaid(c))}</div></div></div>
                </div>

                <div className={styles.govFormDeclaration}>
                  <div className={styles.govFormDeclarationTitle}>Declaration</div>
                  <div className={styles.govFormDeclarationText}>
                    I hereby declare that the statements given above are true to the best of my knowledge and belief and the person for whom medical expenditure has been incurred is wholly dependent on me.
                  </div>
                </div>

                <div className={styles.govFormFooter}>
                  <div className={styles.govFormFooterBlock}>
                    <div className={styles.govFormFooterLine}><span>Place :</span><span>{treatmentDraft.placeOfIllness || 'N.A.'}</span></div>
                    <div className={styles.govFormFooterLine}><span>Date :</span><span>{new Date().toLocaleDateString('en-GB')}</span></div>
                  </div>
                  <div className={`${styles.govFormFooterBlock} ${styles.govFormSignature}`}>
                    <div className={styles.govFormSignatureLine}></div>
                    <div className={styles.govFormSignatureLabel}>Name of the Officer</div>
                    <div className={styles.govFormValue}>{c.officer.fullName}</div>
                  </div>
                </div>

                <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:m-0 break-before-page">
                  <div className="border-b border-indigo-200 p-6 text-center bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900 text-white print:bg-white print:text-slate-900 print:border-b-2 print:border-slate-800">
                    <h2 className="text-2xl font-bold uppercase tracking-widest mb-0.5 text-indigo-50 print:text-slate-900">Medical Reimbursement Claim</h2>
                    <p className="text-indigo-200 font-bold tracking-widest uppercase text-xs print:text-slate-600">Government of Kerala</p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-indigo-950/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-indigo-500/30 text-[11px] font-bold text-indigo-100 tracking-widest print:border-slate-300 print:text-slate-800 print:bg-white">
                      REFERENCE NO: {c.mrNo}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* 1. Officer Details */}
                    <section>
                      <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-5 pb-2 border-b-2 border-indigo-100 tracking-wide uppercase print:border-slate-300 print:text-slate-900">
                        <UserCircle2 className="w-5 h-5 text-indigo-600 print:text-slate-600"/> 1. Officer Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Name of Officer</span><span className="font-medium text-slate-900">{c.officer.fullName}</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Designation</span><span className="font-medium text-slate-900">{c.officer.designation}</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Service / Cadre</span><span className="font-medium text-slate-900">{c.officer.serviceType} / {c.officer.cadre}</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">PEN Number</span><span className="font-medium text-slate-900">{c.officer.penNumber}</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Basic Pay</span><span className="font-medium text-slate-900">{rupee(c.officer.basicPay)}</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Department</span><span className="font-medium text-slate-900">{c.officer.administrativeDepartment}</span></div>
                      </div>
                    </section>

                    {/* 2. Patient & Treatment Details */}
                    <section>
                      <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-5 pb-2 border-b-2 border-indigo-100 tracking-wide uppercase print:border-slate-300 print:text-slate-900">
                        <Building2 className="w-5 h-5 text-indigo-600 print:text-slate-600"/> 2. Patient & Treatment Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Claimed For</span><span className="font-medium text-slate-900">{c.patient.claimFor === 'SELF' ? 'Self' : 'Dependent'}</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Patient Name</span><span className="font-medium text-slate-900">{(selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.fullName) || c.patient.name} {c.patient.claimFor !== 'SELF' ? `(${dependentMeta.join(', ')})` : ''}</span></div>
                        <div className="md:col-span-2"><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Diagnosis & System</span><span className="font-medium text-slate-900">{diagnosisText || 'Not specified'}</span></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm pl-4 border-l-2 border-slate-200">
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Hospital Name</span><span className="font-medium text-slate-900">{treatmentDraft.hospitalName || '-'}</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Hospital Type</span><span className="font-medium text-slate-900">{treatmentDraft.hospitalType} ({treatmentDraft.withinState ? 'Within State' : 'Outside State'})</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Treatment Period</span><span className="font-medium text-slate-900">{treatmentPeriodLabel}</span></div>
                        <div><span className="text-indigo-900/60 block text-[10px] font-bold uppercase tracking-widest mb-1 print:text-slate-500">Hospitalisation</span><span className="font-medium text-slate-900">{treatmentDraft.hospitalised ? 'Required Hospitalisation' : 'Outpatient / Not Hospitalised'}</span></div>
                      </div>
                    </section>

                    {/* 3. Expenditure & Bills */}
                    <section>
                      <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-5 pb-2 border-b-2 border-indigo-100 tracking-wide uppercase print:border-slate-300 print:text-slate-900">
                        <ClipboardList className="w-5 h-5 text-indigo-600 print:text-slate-600"/> 3. Expenditure & Bills
                      </h3>

                      <div className="overflow-x-auto rounded-lg border border-slate-200 mb-6">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Sl.No</th>
                              <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Bill Ref & Date</th>
                              <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Hospital/Vendor</th>
                              <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wider">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {c.bills.length > 0 ? (c.bills.map((b, i) => (<tr key={b.id}>
                                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                                  <td className="px-4 py-3 text-slate-900 font-medium">{b.invoiceNo} <span className="text-slate-500 text-xs ml-1 block">{formatDMY(b.billDate)}</span></td>
                                  <td className="px-4 py-3 text-slate-700">{b.hospitalName}</td>
                                  <td className="px-4 py-3 text-slate-900 font-medium text-right">{b.totalAmount}</td>
                                </tr>))) : (<tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No bills recorded.</td></tr>)}
                          </tbody>
                          <tfoot className="bg-slate-50 border-t border-slate-200">
                            <tr>
                              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-slate-700">Gross Total Claim:</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900">{rupee(billsTotal(c))}</td>
                            </tr>
                            <tr>
                              <td colSpan={3} className="px-4 py-3 text-right font-medium text-slate-500">Less: Advance Received:</td>
                              <td className="px-4 py-3 text-right font-medium text-slate-700">- {rupee(advancePaid(c))}</td>
                            </tr>
                            <tr className="bg-indigo-50/50">
                              <td colSpan={3} className="px-4 py-4 text-right font-bold text-indigo-900 text-base border-t border-indigo-100">Net Payable Claim Amount:</td>
                              <td className="px-4 py-4 text-right font-bold text-indigo-700 text-lg border-t border-indigo-100">{rupee(billsTotal(c) - advancePaid(c))}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </section>

                    {/* 4. Document Check & Declarations */}
                    <section>
                      <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-5 pb-2 border-b-2 border-indigo-100 tracking-wide uppercase print:border-slate-300 print:text-slate-900">
                        <FileCheck2 className="w-5 h-5 text-indigo-600 print:text-slate-600"/> 4. Annexures & Declarations
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Attached Documents</h4>
                          <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Original Bills / Receipts ({c.bills.length} items)</li>
                            <li className="flex items-center gap-2">
                              {visibleDocs.some((d) => d.type === 'EC_SIGNED') ? <CheckCircle2 className="w-4 h-4 text-green-600"/> : <div className="w-4 h-4 rounded-full border-2 border-slate-300"/>}
                              Essentiality Certificate (Signed)
                            </li>
                            <li className="flex items-center gap-2">
                              {visibleDocs.some((d) => d.type === 'DISCHARGE') ? <CheckCircle2 className="w-4 h-4 text-green-600"/> : <div className="w-4 h-4 rounded-full border-2 border-slate-300"/>}
                              Discharge Summary
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Additional Documents ({visibleDocs.filter((d) => !['EC_SIGNED', 'DISCHARGE'].includes(d.type)).length})</li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                          <h4 className="font-semibold mb-2 uppercase tracking-wide">Declaration</h4>
                          <p className="mb-2">I hereby declare that the statements made in the application are true to the best of my knowledge and belief.</p>
                          <p>I further declare that the amount claimed herein has not been claimed elsewhere or from any other insurance scheme.</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <div className={styles.dossierSectionStack}>
                  <div className={styles.summaryShowcase}>
                    <div className={styles.summarySpotlight}>
                      <div className={styles.summarySpotlightHeader}>
                        <div>
                          <div className={styles.summarySpotlightTitle}>Case Summary</div>
                          <div className={styles.summarySpotlightMeta}>Structured view of claimant, patient, diagnosis, and treatment record.</div>
                        </div>
                        <div className={styles.summaryPillRow}>
                          <span className={styles.summaryPill}>{c.status}</span>
                          <span className={styles.summaryPill}>{c.patient.claimFor === 'SELF' ? 'Self Claim' : 'Dependent Claim'}</span>
                          <span className={styles.summaryPill}>{treatmentDraft.medicalType || 'Allopathy'}</span>
                        </div>
                      </div>
                      <div className={styles.summaryFactGrid}>
                        <div className={styles.summaryFactCard}><span>Patient</span><strong>{c.patient.claimFor === 'SELF' ? c.officer.fullName : (selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.fullName) || c.patient.name}</strong></div>
                        <div className={styles.summaryFactCard}><span>Relationship</span><strong>{c.patient.claimFor === 'SELF' ? 'Self' : dependentMeta.join(' | ')}</strong></div>
                        <div className={styles.summaryFactCard}><span>Diagnosis</span><strong>{diagnosisText || 'Not recorded'}</strong></div>
                        <div className={styles.summaryFactCard}><span>Treatment Period</span><strong>{treatmentPeriodLabel}</strong></div>
                        <div className={styles.summaryFactCard}><span>Hospital</span><strong>{treatmentDraft.hospitalName || 'Not recorded'}</strong></div>
                        <div className={styles.summaryFactCard}><span>Place of Illness</span><strong>{treatmentDraft.placeOfIllness || 'N.A.'}</strong></div>
                      </div>
                    </div>
                    <div className={styles.summarySectionStack}>
                      <div className={styles.summarySideCard}>
                        <div className={styles.noteBlockTitle}>Officer Details</div>
                        <div className={styles.summaryFactGrid}>
                          <div className={styles.summaryFactCard}><span>Officer</span><strong>{c.officer.fullName}</strong></div>
                          <div className={styles.summaryFactCard}><span>Designation</span><strong>{c.officer.designation}</strong></div>
                          <div className={styles.summaryFactCard}><span>Service</span><strong>{c.officer.serviceType}</strong></div>
                          <div className={styles.summaryFactCard}><span>Residential Address</span><strong>{c.officer.residentialAddress || c.officer.officeAddress || '-'}</strong></div>
                        </div>
                      </div>
                      <div className={styles.summarySideCard}>
                        <div className={styles.noteBlockTitle}>Claim Totals</div>
                        <div className={styles.summaryFactGrid}>
                          <div className={styles.summaryFactCard}><span>Gross Amount</span><strong>{rupee(billsTotal(c))}</strong></div>
                          <div className={styles.summaryFactCard}><span>Advance Paid</span><strong>{rupee(advancePaid(c))}</strong></div>
                          <div className={styles.summaryFactCard}><span>Net Claim</span><strong>{rupee(billsTotal(c) - advancePaid(c))}</strong></div>
                          <div className={styles.summaryFactCard}><span>Annexures</span><strong>{c.bills.length} bill(s) | {visibleDocs.length} doc(s)</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.noteGrid2}>
                    <div className={`${styles.noteBlock} ${styles.noteBlockSoft}`}>
                      <div className={styles.noteBlockHeader}>
                        <div>
                          <div className={styles.noteBlockTitle}>Bills Attached</div>
                          <div className={styles.noteBlockMeta}>Every extracted bill included in the claim file.</div>
                        </div>
                        <div className={styles.noteBlockMeta}>{c.bills.length} item(s)</div>
                      </div>
                      <div className={styles.dossierList}>
                        {c.bills.length === 0 ? (<div className={styles.dossierStatus}>No bills have been attached.</div>) : (c.bills.map((b) => (<div key={b.id} className={styles.dossierRow}>
                              <div className={styles.dossierRowMain}>
                                <div className={styles.dossierRowTitle}>{b.invoiceNo || 'Bill reference not recorded'}</div>
                                <div className={styles.dossierRowMeta}>{b.hospitalName} | {formatDMY(b.billDate)}</div>
                                <div className={styles.dossierRowMeta}>{b.fileName || 'Scanned bill uploaded'}</div>
                              </div>
                              <div className={styles.dossierRowAmount}>{rupee(b.totalAmount)}</div>
                            </div>)))}
                      </div>
                    </div>

                    <div className={`${styles.noteBlock} ${styles.noteBlockSoft}`}>
                      <div className={styles.noteBlockHeader}>
                        <div>
                          <div className={styles.noteBlockTitle}>Supporting Documents</div>
                          <div className={styles.noteBlockMeta}>Uploaded documents and signed certificate status.</div>
                        </div>
                        <div className={styles.noteBlockMeta}>{visibleDocs.length} item(s)</div>
                      </div>
                      <div className={styles.dossierStatus}>
                        <div className={styles.dossierRowTitle}>Signed Essentiality Certificate</div>
                        <div className={styles.dossierRowMeta}>{signedEcDoc ? `${signedEcDoc.fileName} attached` : 'Pending signed upload'}</div>
                      </div>
                      <div className={styles.dossierList}>
                        {visibleDocs.length === 0 ? (<div className={styles.dossierStatus}>No supporting documents have been attached.</div>) : (visibleDocs.map((d) => (<div key={d.id} className={styles.dossierRow}>
                              <div className={styles.dossierRowMain}>
                                <div className={styles.dossierRowTitle}>{d.title || d.type.replaceAll('_', ' ')}</div>
                                <div className={styles.dossierRowMeta}>{d.fileName}</div>
                                <div className={styles.dossierRowMeta}>{d.referenceNo || 'No reference'} | {formatDMY(d.issueDate)}</div>
                              </div>
                            </div>)))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.certificateLayout}>
                    <div className={styles.certificatePanel}>
                      <div className={styles.noteBlockTitle}>Essentiality Certificate Preview</div>
                      <div className={styles.summaryFactGrid}>
                        <div className={styles.summaryFactCard}><span>Diagnosis</span><strong>{diagnosisText || 'Not recorded'}</strong></div>
                        <div className={styles.summaryFactCard}><span>Medical System</span><strong>{treatmentDraft.medicalType || 'Allopathy'}</strong></div>
                        <div className={styles.summaryFactCard}><span>Institution</span><strong>{ecMeta.institutionName || treatmentDraft.hospitalName || 'Not recorded'}</strong></div>
                        <div className={styles.summaryFactCard}><span>Certificate Date</span><strong>{formatDMY(ecMeta.certificateDate)}</strong></div>
                        <div className={styles.summaryFactCard}><span>Treatment Period</span><strong>{treatmentPeriodLabel}</strong></div>
                        <div className={styles.summaryFactCard}><span>Institution Address</span><strong>{ecMeta.institutionAddress || treatmentDraft.hospitalAddress || 'Not recorded'}</strong></div>
                      </div>
                    </div>
                    <div className={styles.certificatePanel}>
                      <div className={styles.noteBlockTitle}>Certificate Attachment</div>
                      <div className={styles.certificateStatus}>
                        <div className={styles.dossierRowTitle}>{signedEcDoc ? 'Signed certificate available' : 'Signed certificate pending'}</div>
                        <div className={styles.dossierRowMeta}>{signedEcDoc ? signedEcDoc.fileName : 'Upload a signed certificate to include it in the final file.'}</div>
                      </div>
                      <div className={styles.summaryFactGrid}>
                        <div className={styles.summaryFactCard}><span>Authorized Doctor</span><strong>{ecMeta.amaName || c.officer.fullName}</strong></div>
                        <div className={styles.summaryFactCard}><span>Designation</span><strong>{ecMeta.amaDesignation || c.officer.designation}</strong></div>
                        <div className={styles.summaryFactCard}><span>Registration No.</span><strong>{ecMeta.regNo || 'Not recorded'}</strong></div>
                        <div className={styles.summaryFactCard}><span>Signature Name</span><strong>{ecMeta.signatureName || c.officer.fullName}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden">

                {/* Meta */}
                <div className="mb-8 flex items-start justify-between text-sm font-medium text-gray-700">
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-3">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-indigo-600">MR Number</span>
                    <strong className="text-xl text-slate-900">{c.mrNo}</strong>
                  </div>
                  <div className="text-right">
                    <div className="mb-1"><span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Date:</span> {new Date().toLocaleDateString('en-GB')}</div>
                    <div><span className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Status:</span> {c.status}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-8 text-[15px] leading-relaxed text-gray-800">

                  {/* Officer Details */}
                  <div className="border border-indigo-100 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-white via-indigo-50 to-sky-50 px-5 py-3 border-b border-indigo-200 text-slate-900 dark:border-slate-700">
                      <div className="font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">1. Applicant Details</div>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Name & Designation</span>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{c.officer.fullName}</div>
                        <div className="text-indigo-700 dark:text-indigo-400 font-medium">{c.officer.designation}</div>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Service Profile</span>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{c.officer.serviceType} | PEN: {c.officer.penNumber}</div>
                        <div className="text-slate-600 dark:text-slate-400">{c.officer.cadre} (Basic Pay: ₹{((_c = c.officer.basicPay) === null || _c === void 0 ? void 0 : _c.toLocaleString()) || 'N/A'})</div>
                      </div>
                      <div className="col-span-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Claim For</span>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{c.patient.name} <span className="font-medium text-indigo-600 dark:text-indigo-400">({c.patient.claimFor === 'SELF' ? 'Self' : c.patient.relation})</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Treatment Details */}
                  <div className="border border-indigo-100 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-white via-indigo-50 to-sky-50 px-5 py-3 border-b border-indigo-200 text-slate-900 dark:border-slate-700">
                      <div className="font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">2. Treatment Details</div>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div className="col-span-2">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Diagnosis & System</span>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{treatmentDraft.diagnosis.split(' | ')[0] || 'Medical treatment'}</div>
                        <div className="text-indigo-700 dark:text-indigo-400 font-medium">{treatmentDraft.medicalType || 'Allopathy'} System</div>
                      </div>
                      <div className="col-span-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Institution</span>
                        <div className="font-medium text-slate-900 dark:text-slate-200">
                          {treatmentDraft.hospitalised ? 'Hospitalised Treatment' : 'Outpatient Treatment'} at <strong>{treatmentDraft.hospitalName || 'Unspecified Facility'}</strong>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5">{treatmentDraft.hospitalType} Facility | {treatmentDraft.hospitalAddress || 'Address not provided'}</div>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Start Date</span>
                        <div className="font-medium text-slate-900 dark:text-slate-200">{formatDMY(treatmentDraft.fromDate) || 'Not recorded'}</div>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">End Date</span>
                        <div className="font-medium text-slate-900 dark:text-slate-200">{formatDMY(treatmentDraft.toDate) || 'Not recorded'}</div>
                      </div>
                    </div>
                  </div>


                  <div className="border border-indigo-100 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-white via-indigo-50 to-sky-50 px-5 py-3 border-b border-indigo-200 text-slate-900 dark:border-slate-700">
                      <div className="font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">3. Supporting Documents</div>
                    </div>
                    <div className="p-5 space-y-4 text-sm">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bills</div>
                          <div className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{c.bills.length}</div>
                        </div>
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Documents</div>
                          <div className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{visibleDocs.length}</div>
                        </div>
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Signed EC</div>
                          <div className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{signedEcDocs.length > 0 ? 'Available' : 'Pending'}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {visibleDocs.length === 0 ? (<div className="rounded-lg border border-dashed border-indigo-200 px-4 py-4 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            No supporting documents have been attached.
                          </div>) : (visibleDocs.map((d) => {
                var _a;
                return (<div key={d.id} className="rounded-lg border border-indigo-100 px-4 py-3 dark:border-slate-700">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-slate-100">{d.title || ((_a = MR_DOC_TYPES.find((item) => item.value === d.type)) === null || _a === void 0 ? void 0 : _a.label) || d.type}</div>
                                  <div className="mt-1 text-slate-500 dark:text-slate-400">{d.fileName}</div>
                                </div>
                                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                                  <div>{d.referenceNo || 'No reference'}</div>
                                  <div className="mt-1">{formatDMY(d.issueDate)}</div>
                                </div>
                              </div>
                              {d.remarks && <div className="mt-2 border-t border-slate-100 pt-2 text-slate-600 dark:border-slate-700 dark:text-slate-300">{d.remarks}</div>}
                            </div>);
            }))}
                      </div>
                    </div>
                  </div>
                  {/* Financials */}
                  <div className="space-y-4 rounded-xl border border-indigo-100 bg-slate-50 p-6">
                    <div className="mb-4 text-lg font-bold uppercase tracking-wide text-slate-900">4. Financial Summary</div>

                    <div className="flex items-center justify-between text-gray-700">
                      <span className="font-medium">Total Claim Amount Evaluated</span>
                      <strong className="text-lg">₹{(c.bills.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0) || 0).toLocaleString()}</strong>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <span className="font-medium">Advance Paid / Deducted</span>
                      <strong className="text-lg text-rose-600">- ₹{(c.advances.reduce((acc, a) => acc + (Number(a.amount) || 0), 0) || 0).toLocaleString()}</strong>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-indigo-200 pt-5 text-indigo-900">
                      <span className="font-bold text-lg uppercase tracking-wider">Net Amount Payable</span>
                      <strong className="text-2xl font-extrabold">₹{((c.bills.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0) || 0) - (c.advances.reduce((acc, a) => acc + (Number(a.amount) || 0), 0) || 0)).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="mt-24 flex items-end justify-between border-t border-gray-200 pt-8">
                    <div className="text-sm text-gray-500 font-medium">Generated by KARMASRI System</div>
                    <div className="text-center">
                      <div className="mb-2 w-64 border-b-2 border-slate-300"></div>
                      <div className="text-sm font-bold uppercase tracking-widest text-slate-700">Signature of Authorized Officer</div>
                    </div>
                  </div>

                </div>
              </div>
              </div>
              </div>
            </div>

            <div className="border-t border-indigo-100 bg-white px-5 py-5">
              <div className={`${styles.govFormActionBox} rounded-2xl border border-indigo-200 bg-slate-50 p-5 shadow-sm`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700">
                      Submission Check
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-900">
                      {isFinalLocked
                ? `This request is ${c.status.toLowerCase()}.`
                : unreadinessCount > 0
                    ? `${unreadinessCount} item(s) must be resolved before final submission.`
                    : 'All required sections are complete. The claim is ready for final submission.'}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Review the final note and use the links below only if something still needs correction.
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button className={styles.modernBtnSecondary} onClick={saveDraftOnly} disabled={!canSaveDraft}>
                      Save Draft
                    </button>
                    <button disabled={!canSubmitFinal} className={styles.modernBtnPrimary} title={checks.map((c) => typeof c === 'string' ? c : c.msg).join(', ')} onClick={openFinalPreview}>
                      {isFinalLocked ? c.status : unreadinessCount > 0 ? 'Resolve Pending Items' : 'Submit Final Claim'}
                    </button>
                  </div>
                </div>

                {unreadinessCount > 0 && !isFinalLocked && (<div className="mt-5 border-t border-indigo-100 pt-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      Pending Items
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {readinessLinks.map((item, idx) => (<button key={`${item.issue}-${idx}`} type="button" onClick={() => goToStep(item.step)} className="flex items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/20 dark:hover:bg-amber-950/35">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">{item.issue}</div>
                            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                              Resolve in {item.step}
                            </div>
                          </div>
                          <ChevronRight size={16} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300"/>
                        </button>))}
                    </div>
                  </div>)}
              </div>
            </div>
          </WorkspaceSection>)}

        {active === 'MOVEMENT REGISTER' && (<WorkspaceSection eyebrow="Status Tracker" title="Case Progress Timeline" icon={<History size={18}/>} className={styles.animateFadeIn} bodyClassName={styles.workspaceSectionCompactBody}>

            <div className="space-y-4 p-4 md:p-5">
              <div className={styles.noteSheet}>
                <WorkspacePanel title="Status Tracker" meta="Progression of the reimbursement file from creation to settlement." badge={<WorkspaceStatusBadge>{c.status}</WorkspaceStatusBadge>}>

                  <div className={styles.timelineList}>
                    {requestTracking.map((step, idx) => (<div key={step.label} className={styles.timelineItem}>
                        <div className={`${styles.timelineDot} ${step.done ? styles.timelineDotDone : step.optional ? styles.timelineDotOptional : styles.timelineDotPending}`}>
                          {idx + 1}
                        </div>
                        <div className={styles.timelineCard}>
                          <div className={styles.timelineCardHeader}>
                            <div className={styles.timelineTitle}>{step.label}</div>
                            <span className={`${styles.trackerStatusPill} ${step.done
                    ? styles.trackerStatusDone
                    : step.optional
                        ? step.skipped
                            ? styles.trackerStatusSkipped
                            : styles.trackerStatusOptional
                        : styles.trackerStatusPending}`}>
                              {step.done ? (step.optional ? 'Availed' : 'Done') : step.optional ? (step.skipped ? 'Skipped' : 'Optional') : 'Pending'}
                            </span>
                          </div>
                          <div className={styles.timelineDetail}>{step.detail}</div>
                          <div className={styles.timelineTimeRow}>
                            <span className={styles.timelineTime}>{step.at ? new Date(step.at).toLocaleString() : 'Awaiting action'}</span>
                          </div>
                        </div>
                      </div>))}
                  </div>
                </WorkspacePanel>

                <WorkspacePanel title="Status Log" meta="Event log captured against the case file." badge={<WorkspaceStatusBadge>{c.movement.length} entries</WorkspaceStatusBadge>}>

                  {c.movement.length === 0 ? (<WorkspaceEmptyState>No movements recorded yet.</WorkspaceEmptyState>) : (<div className={styles.timelineList}>
                      {c.movement.map((m, idx) => (<div key={m.id} className={styles.timelineItem}>
                          <div className={`${styles.timelineDot} ${styles.timelineDotDone}`}>
                            {String(c.movement.length - idx).padStart(2, '0')}
                          </div>
                          <div className={styles.timelineCard}>
                            <div className={styles.timelineCardHeader}>
                              <div className={styles.timelineTitle}>{m.action}</div>
                              <span className={styles.timelineTime}>{new Date(m.at).toLocaleString()}</span>
                            </div>
                            <div className={styles.trackerEventLabel}>Status Tracker Note</div>
                          </div>
                        </div>))}
                    </div>)}
                </WorkspacePanel>
              </div>
            </div>
          </WorkspaceSection>)}

        </div>
      </div>

      {active && (<div className={styles.mrStepNavigator}>
          <button className={styles.modernBtnSecondary} onClick={() => goToStep(previousStep)} disabled={!previousStep}>
            <ChevronLeft className={styles.tabIcon} size={18}/>
            Previous
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: 500 }}>
            <CalendarDays size={18}/>
            <span>Step {activeStepIndex + 1} of {workflowTabs.length}</span>
          </div>
          <button className={styles.modernBtnSecondary} onClick={() => goToStep(nextStep)} disabled={!nextStep}>
            Next
            <ChevronRight className={styles.tabIcon} size={18}/>
          </button>
        </div>)}

    </div>);
}
