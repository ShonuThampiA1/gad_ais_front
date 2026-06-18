import styles from '@/modules/medical-reimbursement/mr.module.css';
import { advancePaid, billsTotal, rupee } from '@/modules/medical-reimbursement/utils';
const formatDMY = (value) => {
    if (!value)
        return '-';
    const [y, m, d] = value.slice(0, 10).split('-');
    if (!y || !m || !d)
        return value;
    return `${d}-${m}-${y}`;
};
const formatDateTime = (value) => {
    if (!value)
        return '-';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('en-IN');
};
const documentTypeLabel = (type) => {
    switch (type) {
        case 'DISCHARGE':
            return 'Discharge Summary';
        case 'ESTIMATE':
            return 'Estimate';
        case 'EC_SIGNED':
            return 'Essentiality Certificate (Signed)';
        case 'GO':
            return 'Government Order';
        case 'PRESCRIPTION':
            return 'Prescription';
        case 'LAB':
            return 'Lab Report';
        default:
            return 'Supporting Document';
    }
};
export function buildFinalClaimDocumentData(caseData) {
    const selectedDependent = caseData.patient.claimFor === 'DEPENDENT'
        ? caseData.officer.dependents.find((dependent) => dependent.personId === caseData.patient.dependentPersonId)
        : undefined;
    const [diagnosisTextRaw, treatmentSystemRaw] = (caseData.treatment.diagnosis || '').split(' | ');
    const visibleDocs = caseData.docs.filter((doc) => doc.type !== 'EC_SIGNED');
    const signedEcDoc = caseData.docs.find((doc) => doc.type === 'EC_SIGNED');
    return {
        caseData,
        patientDisplayName: (selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.fullName) || caseData.patient.name || caseData.officer.fullName,
        patientRelationLabel: caseData.patient.claimFor === 'SELF' ? 'Self' : (selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.relation) || caseData.patient.relation || 'Dependent',
        claimantGender: selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.gender,
        claimantDob: selectedDependent === null || selectedDependent === void 0 ? void 0 : selectedDependent.dob,
        claimTypeLabel: caseData.patient.claimFor === 'SELF' ? 'Self Claim' : 'Dependent Claim',
        diagnosisText: (diagnosisTextRaw === null || diagnosisTextRaw === void 0 ? void 0 : diagnosisTextRaw.trim()) || 'Medical treatment',
        treatmentSystem: (treatmentSystemRaw === null || treatmentSystemRaw === void 0 ? void 0 : treatmentSystemRaw.trim()) || 'Allopathy',
        treatmentPeriodLabel: caseData.treatment.fromDate
            ? `${formatDMY(caseData.treatment.fromDate)}${caseData.treatment.toDate ? ` to ${formatDMY(caseData.treatment.toDate)}` : ''}`
            : 'Not recorded',
        placeOfIllness: caseData.treatment.placeOfIllness || 'Not recorded',
        hospitalName: caseData.treatment.hospitalName || 'Not recorded',
        hospitalAddress: caseData.treatment.hospitalAddress || 'Address not recorded',
        hospitalTypeLabel: `${caseData.treatment.hospitalType || 'Not recorded'}${caseData.treatment.withinState ? ' | Within State' : ' | Outside State'}`,
        hospitalisationLabel: caseData.treatment.hospitalised ? 'Hospitalised treatment' : 'Outpatient / non-hospitalised treatment',
        grossAmount: billsTotal(caseData),
        advanceAmount: advancePaid(caseData),
        netAmount: billsTotal(caseData) - advancePaid(caseData),
        visibleDocs,
        signedEcDoc,
        declarationDate: new Date().toLocaleDateString('en-GB'),
    };
}
export function FinalClaimDocument({ data, includeAnnexures = false, }) {
    const { caseData } = data;
    const applicantRows = [
        ['Name of Officer', caseData.officer.fullName],
        ['Designation', caseData.officer.designation || '-'],
        ['PEN Number', caseData.officer.penNumber || '-'],
        ['AIS Number', caseData.officer.aisNumber || '-'],
        ['Service', caseData.officer.serviceType || '-'],
        ['Cadre', caseData.officer.cadre || '-'],
        ['Grade', caseData.officer.grade || '-'],
        ['Level', caseData.officer.level || '-'],
        ['Basic Pay', rupee(caseData.officer.basicPay)],
        ['Administrative Department', caseData.officer.administrativeDepartment || '-'],
        ['Agency', caseData.officer.agency || '-'],
        ['District / State', [caseData.officer.district, caseData.officer.state].filter(Boolean).join(' / ') || '-'],
        ['Posting Type', caseData.officer.postingTypes || '-'],
        ['Order Number', caseData.officer.orderNo || '-'],
        ['Date of Joining / Posting', formatDMY(caseData.officer.startDate)],
        ['Official Email', caseData.officer.email || '-'],
        ['Mobile Number', caseData.officer.mobile || '-'],
        ['Office Address', caseData.officer.officeAddress || '-'],
        ['Residential Address', caseData.officer.residentialAddress || '-'],
    ];
    const claimantRows = [
        ['Claim Type', data.claimTypeLabel],
        ['Patient / Claimant Name', data.patientDisplayName],
        ['Relationship', data.patientRelationLabel],
        ['Gender', data.claimantGender && data.claimantGender !== '—' ? data.claimantGender : caseData.patient.claimFor === 'SELF' ? '-' : 'Not recorded'],
        ['Date of Birth', data.claimantDob && data.claimantDob !== '—' ? formatDMY(data.claimantDob) : caseData.patient.claimFor === 'SELF' ? '-' : 'Not recorded'],
    ];
    const treatmentRows = [
        ['Diagnosis', data.diagnosisText],
        ['Medical System', data.treatmentSystem],
        ['Treatment Period', data.treatmentPeriodLabel],
        ['Place of Illness', data.placeOfIllness],
        ['Treatment Mode', data.hospitalisationLabel],
        ['Hospital / Institution', data.hospitalName],
        ['Hospital Category', data.hospitalTypeLabel],
        ['Hospital Address', data.hospitalAddress],
    ];
    return (<div className={styles.noteSheet} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm print:rounded-none print:shadow-none">
        <div className={styles.lightSectionHeader}>
          <div className="w-full text-center">
            <div className={styles.lightSectionEyebrow}>Government of Kerala</div>
            <h1 className={`${styles.summarySpotlightTitle} mt-2 uppercase tracking-[0.06em]`}>Medical Reimbursement Final Claim</h1>
            <p className={`${styles.summarySpotlightMeta} mt-2 leading-6`}>
              Final reimbursement request prepared for scrutiny, sanction, and settlement under the applicable medical reimbursement rules.
            </p>
          </div>
        </div>

        <div className="border-b border-indigo-100 bg-slate-50 px-8 py-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <HeaderMeta label="Reference No." value={caseData.mrNo}/>
            <HeaderMeta label="Status" value={caseData.status}/>
            <HeaderMeta label="Claim Type" value={data.claimTypeLabel}/>
            <HeaderMeta label="Date" value={data.declarationDate}/>
          </div>
        </div>

        <div className="space-y-5 px-8 py-7">
          <DocumentSection title="1. Applicant Details">
            <DetailTable rows={applicantRows} twoColumn/>
          </DocumentSection>

          <DocumentSection title="2. Claimant Details">
            <DetailTable rows={claimantRows} twoColumn/>
          </DocumentSection>

          <DocumentSection title="3. Hospital and Treatment Details">
            <DetailTable rows={treatmentRows} twoColumn/>
          </DocumentSection>

          <DocumentSection title="4. Financial Position">
            <div className="overflow-hidden border border-indigo-100 bg-white">
              <table className="min-w-full border-collapse text-[13px]">
                <tbody>
                  <tr>
                    <td className="w-[70%] border-t border-indigo-100 bg-slate-50 px-4 py-3 font-semibold text-slate-700 first:border-t-0">
                      Total admissible bill amount
                    </td>
                    <td className="border-l border-t border-indigo-100 px-4 py-3 text-right font-semibold text-slate-900 first:border-t-0">
                      {rupee(data.grossAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-t border-indigo-100 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
                      Less: medical advance already drawn
                    </td>
                    <td className="border-l border-t border-indigo-100 px-4 py-3 text-right font-semibold text-rose-700">
                      - {rupee(data.advanceAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-t border-indigo-100 bg-indigo-50/60 px-4 py-4 text-[13px] font-bold uppercase tracking-[0.08em] text-indigo-900">
                      Net amount claimed
                    </td>
                    <td className="border-l border-t border-indigo-100 bg-indigo-50/60 px-4 py-4 text-right text-[14px] font-bold text-indigo-900">
                      {rupee(data.netAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-[12px] text-slate-500">
              Calculation: Gross bill amount minus medical advance paid.
            </div>
          </DocumentSection>

          <DocumentSection title="5. Bill Schedule">
            <div className="overflow-x-auto border border-indigo-100 bg-white">
              <table className="min-w-full border-collapse text-[13px]">
                <thead className="bg-slate-50">
                  <tr>
                    <BillHeader>Sl. No.</BillHeader>
                    <BillHeader>Invoice / Date</BillHeader>
                    <BillHeader>Hospital / Vendor</BillHeader>
                    <BillHeader align="right">Amount</BillHeader>
                  </tr>
                </thead>
                <tbody>
                  {caseData.bills.length === 0 ? (<tr>
                      <td colSpan={4} className="border-t border-indigo-100 px-4 py-8 text-center text-slate-500">
                        No bills are attached to this claim.
                      </td>
                    </tr>) : (caseData.bills.map((bill, index) => (<tr key={bill.id}>
                        <BillCell>{index + 1}</BillCell>
                        <BillCell>
                          <div className="font-semibold text-slate-900">{bill.invoiceNo || 'Invoice not recorded'}</div>
                          <div className="mt-1 text-[12px] text-slate-500">{formatDMY(bill.billDate)}</div>
                        </BillCell>
                        <BillCell>{bill.hospitalName || 'Hospital not recorded'}</BillCell>
                        <BillCell align="right">{rupee(bill.totalAmount)}</BillCell>
                      </tr>)))}
                </tbody>
              </table>
            </div>
          </DocumentSection>

          <DocumentSection title="6. Annexure Register">
            <div className="overflow-x-auto border border-indigo-100 bg-white">
                <table className="min-w-full border-collapse text-[13px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <BillHeader>Annexure</BillHeader>
                      <BillHeader>Reference</BillHeader>
                      <BillHeader>Particulars</BillHeader>
                      <BillHeader align="center">Status</BillHeader>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <BillCell>Bill Receipts</BillCell>
                      <BillCell>{caseData.bills.length} item(s)</BillCell>
                      <BillCell>Scanned medical bills enclosed with the claim file.</BillCell>
                      <BillCell align="center">
                        {caseData.bills.length > 0 ? <span className="font-bold text-green-600">✓</span> : ''}
                      </BillCell>
                    </tr>
                    <tr>
                      <BillCell>Signed Essentiality Certificate</BillCell>
                      <BillCell>{data.signedEcDoc ? data.signedEcDoc.referenceNo || '-' : '-'}</BillCell>
                      <BillCell>{data.signedEcDoc ? data.signedEcDoc.fileName : 'Signed certificate to be enclosed before submission.'}</BillCell>
                      <BillCell align="center">
                        {data.signedEcDoc ? <span className="font-bold text-green-600">✓</span> : ''}
                      </BillCell>
                    </tr>
                  {data.visibleDocs.length === 0 ? (<tr>
                      <td colSpan={4} className="border-t border-indigo-100 px-4 py-8 text-center text-slate-500">
                        No additional supporting documents have been uploaded.
                      </td>
                    </tr>) : (data.visibleDocs.map((doc) => (<tr key={doc.id}>
                        <BillCell>{doc.title || documentTypeLabel(doc.type)}</BillCell>
                        <BillCell>{doc.referenceNo || '-'}</BillCell>
                        <BillCell>{[doc.fileName, formatDMY(doc.issueDate), doc.remarks].filter(Boolean).join(' | ')}</BillCell>
                        <BillCell align="center">
                          <span className="font-bold text-green-600">✓</span>
                        </BillCell>
                      </tr>)))}
                </tbody>
              </table>
            </div>
          </DocumentSection>

          <DocumentSection title="7. Declaration">
            <div className="space-y-5 text-[13px] leading-7 text-slate-700">
              <p>
                Certified that the claim relates to medical attendance and treatment received by <span className="font-semibold text-slate-900">{data.patientDisplayName}</span> and that the particulars furnished in this request are based on the records enclosed in the case file.
              </p>
              <p>
                It is further declared that the expenditure claimed has not been preferred elsewhere and that the amount now claimed is the admissible balance after adjustment of any medical advance already drawn.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <SignatureLine label="Place" value={data.placeOfIllness}/>
              <SignatureLine label="Date" value={data.declarationDate}/>
              <SignatureLine label="Name of Officer" value={caseData.officer.fullName}/>
              <SignatureLine label="Designation" value={caseData.officer.designation}/>
            </div>
          </DocumentSection>
        </div>
      </section>

      {includeAnnexures && (<div className="mt-8 space-y-8">
          {caseData.bills.map((bill, index) => (<AnnexurePage key={bill.id} title={`Bill Annexure ${index + 1}`} fileName={bill.fileName || `Bill ${index + 1}`} rows={[
                    ['Invoice Number', bill.invoiceNo || 'Not recorded'],
                    ['Bill Date', formatDMY(bill.billDate)],
                    ['Hospital / Vendor', bill.hospitalName || 'Not recorded'],
                    ['Amount', rupee(bill.totalAmount)],
                ]}/>))}
          {data.signedEcDoc ? (<AnnexurePage key={data.signedEcDoc.id} title="Essentiality Certificate Preview" fileName={data.signedEcDoc.fileName} rows={[
                    ['Document Type', data.signedEcDoc.title || documentTypeLabel(data.signedEcDoc.type)],
                    ['Reference Number', data.signedEcDoc.referenceNo || 'Not recorded'],
                    ['Issue Date', formatDMY(data.signedEcDoc.issueDate)],
                    ['Uploaded At', formatDateTime(data.signedEcDoc.uploadedAt)],
                ]}/>) : null}
          {data.visibleDocs.map((doc, index) => (<AnnexurePage key={doc.id} title={`Document Annexure ${index + 1}`} fileName={doc.fileName} rows={[
                    ['Document Type', doc.title || documentTypeLabel(doc.type)],
                    ['Reference Number', doc.referenceNo || 'Not recorded'],
                    ['Issue Date', formatDMY(doc.issueDate)],
                    ['Uploaded At', formatDateTime(doc.uploadedAt)],
                ]}/>))}
        </div>)}
    </div>);
}
function DocumentSection({ title, children }) {
    return (<section className="border-t border-indigo-100 pt-5 first:border-t-0 first:pt-0">
      <div className="pb-3">
        <div className={styles.noteBlockTitle}>{title}</div>
      </div>
      <div>{children}</div>
    </section>);
}
function HeaderMeta({ label, value }) {
    return (<div className="border-l-2 border-indigo-100 bg-white px-3 py-2 text-left">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-slate-900">{value}</div>
    </div>);
}
function DetailTable({ rows, twoColumn = false, emphasizeLastRow = false, }) {
    const normalizedRows = twoColumn && rows.length > 0
        ? rows.reduce((acc, row, index) => {
            if (index % 2 === 0)
                acc.push([row]);
            else
                acc[acc.length - 1].push(row);
            return acc;
        }, [])
        : rows.map((row) => [row, null]);
    return (<div className="overflow-hidden border border-indigo-100 bg-white">
      <table className="min-w-full border-collapse text-[13px]">
        <tbody>
          {normalizedRows.map((pair, index) => {
            const first = pair[0];
            const second = pair[1];
            const isLast = index === normalizedRows.length - 1;
            return (<tr key={`${first === null || first === void 0 ? void 0 : first[0]}-${index}`}>
                <td className="w-[18%] border-t border-indigo-100 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 first:border-t-0">
                  {first === null || first === void 0 ? void 0 : first[0]}
                </td>
                <td className={`border-l border-t border-indigo-100 px-4 py-3 text-[14px] font-semibold text-slate-900 first:border-t-0 ${emphasizeLastRow && isLast ? 'bg-indigo-50/60 font-bold text-[14px] text-indigo-900' : ''}`}>
                  {first === null || first === void 0 ? void 0 : first[1]}
                </td>
                {second ? (<>
                    <td className="w-[18%] border-l border-t border-indigo-100 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 first:border-t-0">
                      {second[0]}
                    </td>
                    <td className={`border-l border-t border-indigo-100 px-4 py-3 text-[14px] font-semibold text-slate-900 first:border-t-0 ${emphasizeLastRow && isLast ? 'bg-indigo-50/60 font-bold text-[14px] text-indigo-900' : ''}`}>
                      {second[1]}
                    </td>
                  </>) : (<>
                    <td className="border-l border-t border-indigo-100 bg-slate-50 px-4 py-3 first:border-t-0"/>
                    <td className="border-l border-t border-indigo-100 px-4 py-3 first:border-t-0"/>
                  </>)}
              </tr>);
        })}
        </tbody>
      </table>
    </div>);
}
function BillHeader({ children, align = 'left' }) {
    return (<th className={`border-t border-indigo-100 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}>
      {children}
    </th>);
}
function BillCell({ children, align = 'left' }) {
    return (<td className={`border-t border-indigo-100 px-4 py-3 align-top text-[13px] font-medium text-slate-900 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}>
      {children}
    </td>);
}
function SignatureLine({ label, value }) {
    return (<div>
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</div>
      <div className="mt-4 border-b border-slate-400 pb-2 text-[14px] font-semibold text-slate-900">{value}</div>
    </div>);
}
function AnnexurePage({ title, fileName, rows, }) {
    return (<section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm break-before-page print:rounded-none print:shadow-none">
      <div className={styles.lightSectionHeader}>
        <div>
          <div className={styles.noteBlockTitle}>{title}</div>
          <div className={styles.noteBlockMeta}>{fileName}</div>
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="rounded-xl border border-dashed border-indigo-200 px-6 py-8">
          <div className="text-center">
            <div className={styles.lightSectionEyebrow}>Uploaded Document Summary</div>
          </div>
          <div className="mt-6 overflow-hidden border border-indigo-100 bg-white">
            <table className="min-w-full border-collapse text-[13px]">
              <tbody>
                {rows.map(([label, value], index) => (<tr key={`${label}-${index}`}>
                    <td className="w-[34%] border-t border-indigo-100 bg-slate-50 px-4 py-3 font-semibold text-slate-700 first:border-t-0">{label}</td>
                    <td className="border-l border-t border-indigo-100 px-4 py-3 text-slate-900 first:border-t-0">{value}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>);
}
