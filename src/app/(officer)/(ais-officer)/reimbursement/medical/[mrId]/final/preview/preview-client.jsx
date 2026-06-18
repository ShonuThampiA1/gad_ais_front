'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText, CheckCircle2, FileCheck2 } from 'lucide-react';
import styles from '@/modules/medical-reimbursement/mr.module.css';
import { getMrDataSource } from '@/modules/medical-reimbursement/data-source';
import { FinalClaimDocument, buildFinalClaimDocumentData } from '@/modules/medical-reimbursement/final-document';
import { rupee } from '@/modules/medical-reimbursement/utils';
import { STATIC_MR_ROUTE_PARAM, getActiveMrId, setActiveMrId } from '@/modules/medical-reimbursement/session';
export default function FinalPreviewClient() {
    const router = useRouter();
    const dataSource = getMrDataSource();
    const [activeMrId, setActiveMrIdState] = useState('');
    const [cases, setCases] = useState([]);
    const [confirm, setConfirm] = useState(false);
    const [otp, setOtp] = useState(false);
    const [receipt, setReceipt] = useState(false);
    useEffect(() => {
        setActiveMrIdState(getActiveMrId());
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
    const caseData = cases.find((item) => item.mrId === activeMrId);
    const documentData = useMemo(() => (caseData ? buildFinalClaimDocumentData(caseData) : null), [caseData]);
    if (!caseData || !documentData) {
        return (<div className={styles.mrShell}>
        <div className={styles.container}>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Case not found.</h2>
            <p className="mt-2 text-slate-500">Return to the workspace and open a valid reimbursement file.</p>
          </div>
        </div>
      </div>);
    }
    const submit = async () => {
        const claimNo = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
        const updatedCase = Object.assign(Object.assign({}, caseData), { status: 'Final Submitted', finalClaim: Object.assign(Object.assign({}, caseData.finalClaim), { claimNo, submittedAt: new Date().toISOString() }), movement: [
                { id: crypto.randomUUID(), action: `Final claim submitted (Ref: ${claimNo})`, at: new Date().toISOString() },
                ...caseData.movement,
            ] });
        await dataSource.updateCase(updatedCase);
        setCases((prev) => prev.map((item) => item.mrId === updatedCase.mrId ? updatedCase : item));
        setReceipt(true);
    };
    const updatedCase = receipt ? cases.find((item) => item.mrId === caseData.mrId) : null;
    return (<div className={`${styles.mrShell} min-h-screen bg-slate-100 py-8`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between no-print">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Final Submission Preview</div>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Medical reimbursement claim preview</h1>
            <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-600">
              Review the final document and annexures before eSign and submission.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className={styles.mrBackButton} onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4"/>
              Return to Final Note
            </button>
            <button className={`${styles.btnSecondary} bg-white shadow-sm`} onClick={() => window.print()}>
              <FileText className="h-4 w-4"/> Print Preview
            </button>
          </div>
        </div>

        <FinalClaimDocument data={documentData} includeAnnexures/>

        {!receipt && (<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm no-print">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-[13px] leading-6 text-slate-600">
                Confirm that the final claim note and enclosed records are in order before initiating Aadhaar eSign.
              </p>
              <button className={`${styles.btnPrimary} px-6 py-2.5 text-sm shadow-sm`} onClick={() => setConfirm(true)}>
                Sign and Submit Claim
              </button>
            </div>
          </div>)}
      </div>

      {confirm && (<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900">Confirm final submission</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You are about to submit the reimbursement claim for <span className="font-semibold text-slate-900">{rupee(documentData.netAmount)}</span>.
              </p>
            </div>
            <div className="flex justify-end gap-3 bg-slate-50 p-6">
              <button className={`${styles.btnSecondary} bg-white shadow-sm`} onClick={() => setConfirm(false)}>
                Cancel
              </button>
              <button className={`${styles.btnPrimary} shadow-sm`} onClick={() => {
                setConfirm(false);
                setOtp(true);
            }}>
                Proceed to eSign
              </button>
            </div>
          </div>
        </div>)}

      {otp && (<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
                <FileCheck2 className="h-6 w-6"/>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Aadhaar eSign verification</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enter the 6-digit OTP sent to the Aadhaar-linked mobile number to digitally sign this claim.
              </p>
            </div>
            <div className="p-6">
              <input type="text" maxLength={6} className="mb-6 w-full rounded-2xl border border-slate-300 px-4 py-4 text-center font-mono text-2xl tracking-[0.45em] shadow-sm focus:border-slate-500 focus:ring-slate-500" placeholder="------" autoFocus/>
              <button className={`${styles.btnPrimary} w-full justify-center py-3 text-base shadow-sm`} onClick={() => {
                setOtp(false);
                submit();
            }}>
                Verify and Submit
              </button>
              <button className="mt-4 w-full text-sm font-medium text-slate-500 hover:text-slate-700" onClick={() => setOtp(false)}>
                Cancel process
              </button>
            </div>
          </div>
        </div>)}

      {receipt && updatedCase && (<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-2xl">
            <div className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8"/>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900">Claim submitted</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The medical reimbursement claim has been signed successfully and moved for further processing.
              </p>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Claim tracking number</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{updatedCase.finalClaim.claimNo}</div>
                </div>
                <div className="mt-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Submitted at</div>
                  <div className="mt-1 text-sm font-medium text-slate-700">
                    {new Date(updatedCase.finalClaim.submittedAt || '').toLocaleString()}
                  </div>
                </div>
              </div>

              <button className={`${styles.btnPrimary} mt-6 w-full justify-center py-3 text-base shadow-sm`} onClick={() => {
                setActiveMrId(caseData.mrId);
                router.push(`/reimbursement/medical/${STATIC_MR_ROUTE_PARAM}`);
            }}>
                Return to Workspace
              </button>
            </div>
          </div>
        </div>)}
    </div>);
}
