'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getMrDataSource } from '@/modules/medical-reimbursement/data-source';
import styles from '@/modules/medical-reimbursement/mr.module.css';
import { rupee } from '@/modules/medical-reimbursement/utils';
import { STATIC_MR_ROUTE_PARAM, getActiveAdvanceId, getActiveMrId, setActiveMrId } from '@/modules/medical-reimbursement/session';
export default function AdvancePreviewClient() {
    const router = useRouter();
    const dataSource = getMrDataSource();
    const [activeMrId, setActiveMrIdState] = useState('');
    const [activeAdvId, setActiveAdvIdState] = useState('');
    const [cases, setCases] = useState([]);
    const [confirm, setConfirm] = useState(false);
    const [otp, setOtp] = useState(false);
    const [receipt, setReceipt] = useState(false);
    useEffect(() => {
        setActiveMrIdState(getActiveMrId());
        setActiveAdvIdState(getActiveAdvanceId());
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
    const adv = c === null || c === void 0 ? void 0 : c.advances.find((a) => a.advId === activeAdvId);
    if (!c || !adv)
        return <div className={styles.mrShell}><div className={styles.container}>Advance not found. Open an advance from the case page first.</div></div>;
    const submit = async () => {
        const updatedCase = Object.assign(Object.assign({}, c), { advances: c.advances.map((a) => a.advId === adv.advId ? Object.assign(Object.assign({}, a), { status: 'Submitted', submittedAt: new Date().toISOString(), signed: true }) : a), movement: [{ id: crypto.randomUUID(), action: 'Advance submitted', at: new Date().toISOString() }, ...c.movement] });
        await dataSource.updateCase(updatedCase);
        setCases((prev) => prev.map((item) => item.mrId === updatedCase.mrId ? updatedCase : item));
        setReceipt(true);
    };
    return <div className={styles.mrShell}><div className={styles.container}><div className={styles.paper}>
    <h2 className="text-xl font-semibold">Advance Request Preview Sheet</h2><div className={styles.bodyText}>MR No: {c.mrNo} | Advance No: {adv.advNo}</div>
    <ol className="list-decimal pl-5 text-sm space-y-1 mt-3">
      <li>Name and office held: {c.officer.fullName}, {c.officer.designation}</li><li>Service: {c.officer.serviceType}</li><li>Present posting / office address: {c.officer.officePostingAddress}</li><li>Residential address: {c.officer.residentialAddress}</li><li>Patient name: {c.patient.name}</li><li>Relationship: {c.patient.relation}</li><li>Place of illness: {c.treatment.placeOfIllness}</li><li>Hospitalized: {c.treatment.hospitalised ? 'Yes' : 'No'}; {c.treatment.hospitalName}, {c.treatment.hospitalAddress}, {c.treatment.hospitalType}</li><li>Period: {c.treatment.fromDate} to {c.treatment.toDate || '-'}</li><li>Advance amount requested: {rupee(adv.amount)}</li><li>Annexures: estimate document</li>
    </ol>
    <p className={`mt-3 ${styles.bodyText}`}>Declaration: I certify that the details are correct.</p>
    <div className="mt-4 flex gap-2"><button className={styles.btnSecondary} onClick={() => window.print()}>Download Preview</button><button className={styles.btnPrimary} onClick={() => setConfirm(true)}>Submit with OTP eSign</button></div>
  </div>
  {confirm && <div className="fixed inset-0 bg-black/40 grid place-items-center"><div className={styles.modalCard}><h4 className={styles.labelText}>Are you sure?</h4><p className={styles.bodyText}>Amount {rupee(adv.amount)} with estimate attachment.</p><div className="flex gap-2 mt-2"><button className={styles.btnSecondary} onClick={() => setConfirm(false)}>Cancel</button><button className={styles.btnPrimary} onClick={() => { setConfirm(false); setOtp(true); }}>Continue</button></div></div></div>}
  {otp && <div className="fixed inset-0 bg-black/40 grid place-items-center"><div className={styles.modalCard}><h4 className={styles.labelText}>Enter OTP</h4><input className={`${styles.field} my-2`} placeholder="123456"/><div><button className={styles.btnPrimary} onClick={() => { setOtp(false); submit(); }}>Verify & Submit</button></div></div></div>}
  {receipt && <div className="fixed inset-0 bg-black/40 grid place-items-center"><div className={styles.modalCard}><h4 className={styles.labelText}>Receipt</h4><p className={styles.bodyText}>{adv.advNo}</p><p className={styles.bodyText}>{new Date().toLocaleString()}</p><p className={styles.bodyText}>Signed by {c.officer.fullName}</p><button className={styles.mrBackButton} onClick={() => { setActiveMrId(c.mrId); router.push(`/reimbursement/medical/${STATIC_MR_ROUTE_PARAM}`); }}><ChevronLeft size={16}/>Back to Case</button></div></div>}
  </div></div>;
}
