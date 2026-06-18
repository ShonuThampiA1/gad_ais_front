import { notFound } from 'next/navigation';
const quickFacts = [
    ['Entry route', '/reimbursement/medical'],
    ['Main work file', 'workspace-client.jsx'],
    ['Save / load bridge', 'getMrDataSource()'],
    ['Screen setup', 'service-definition.js'],
];
const guideSections = [
    {
        step: '1',
        title: 'Start on the MR list page',
        route: '/reimbursement/medical',
        file: 'src/app/(officer)/(ais-officer)/reimbursement/medical/page.jsx',
        points: [
            'Loads officer details and MR case list',
            'Shows existing MR cases',
            'Lets the user open a case or start a new one',
        ],
    },
    {
        step: '2',
        title: 'Create a new case or open an existing one',
        route: 'session.js decides current mode',
        file: 'src/modules/medical-reimbursement/session.js',
        points: [
            'New case mode stores create session values',
            'Open case mode stores active case id',
            'The route stays simple while the selected ids live in browser session',
        ],
    },
    {
        step: '3',
        title: 'Work inside the MR workspace',
        route: '/reimbursement/medical/current',
        file: 'src/app/(officer)/(ais-officer)/reimbursement/medical/[mrId]/workspace-client.jsx',
        points: [
            'This is the main screen of the module',
            'Most user actions and UI logic live here',
            'If behavior changes, this file is usually the first place to inspect',
        ],
    },
    {
        step: '4',
        title: 'Move through the tabs',
        route: 'defined by service-definition.js',
        file: 'src/modules/medical-reimbursement/service-definition.js',
        points: [
            'Creation, Summary, Treatment Note, Annexures',
            'Advance Notes, Certificate, Final Note, Movement Register',
            'Tab order and create-form structure come from this file',
        ],
    },
    {
        step: '5',
        title: 'Open preview screens before submit',
        route: 'advance preview / final preview',
        file: 'preview-client.jsx files',
        points: [
            'Advance preview uses active case id and active advance id',
            'Final preview uses active case id',
            'These screens are the final user check before submit',
        ],
    },
    {
        step: '6',
        title: 'Save through one bridge',
        route: 'getMrDataSource()',
        file: 'src/modules/medical-reimbursement/data-source.js',
        points: [
            'UI does not talk to mock storage directly',
            'Mock works now through the same bridge',
            'Later, API calls should be connected here',
        ],
    },
];
const tabCards = [
    ['CREATION', 'Used while starting a new case'],
    ['SUMMARY', 'Quick overview of the selected case'],
    ['TREATMENT NOTE', 'Illness, treatment, hospital, and timing details'],
    ['ANNEXURES', 'Bills and supporting files'],
    ['ADVANCE NOTES', 'Advance claim area'],
    ['CERTIFICATE', 'Certificate details and related checks'],
    ['FINAL NOTE', 'Final review before submission'],
    ['MOVEMENT REGISTER', 'Status history and movement tracking'],
];
const sessionCards = [
    {
        title: 'New case mode',
        keys: 'mr_create_mode + mr_create_officer',
        route: '/reimbursement/medical/current?create=1',
        note: 'Used only when starting a brand new MR case',
    },
    {
        title: 'Open case mode',
        keys: 'mr_active_case_id',
        route: '/reimbursement/medical/current',
        note: 'Used for the main workspace and final preview',
    },
    {
        title: 'Advance preview mode',
        keys: 'mr_active_case_id + mr_active_advance_id',
        route: '/reimbursement/medical/current/advance/current-advance/preview',
        note: 'Used only while opening advance preview',
    },
];
const starterMap = [
    {
        what: 'Case list screen',
        where: 'medical/page.jsx',
        how: 'Shows all MR cases and opens the next screen',
    },
    {
        what: 'Main workspace',
        where: 'medical/[mrId]/workspace-client.jsx',
        how: 'Runs the full MR workflow inside tabs',
    },
    {
        what: 'Screen and tab setup',
        where: 'medical-reimbursement/service-definition.js',
        how: 'Controls tabs, create fields, and structure',
    },
    {
        what: 'Save and load bridge',
        where: 'medical-reimbursement/data-source.js',
        how: 'One place to plug mock now and API later',
    },
    {
        what: 'Temporary development data',
        where: 'medical-reimbursement/mockStore.js',
        how: 'Used until backend integration is ready',
    },
    {
        what: 'Officer API data cleanup',
        where: 'medical-reimbursement/mapper.js',
        how: 'Converts API officer data into UI-ready values',
    },
    {
        what: 'Browser session handling',
        where: 'medical-reimbursement/session.js',
        how: 'Stores selected ids while moving between screens',
    },
    {
        what: 'Final printable document',
        where: 'medical-reimbursement/final-document.jsx',
        how: 'Builds the final claim document view',
    },
];
const editCards = [
    ['Tabs and create fields', 'service-definition.js'],
    ['Main workspace behavior', 'workspace-client.jsx'],
    ['Shared reusable UI', 'service-workspace/ui.jsx'],
    ['Shared reusable styles', 'service-workspace/ui.module.css'],
    ['MR-only styles', 'medical-reimbursement/mr.module.css'],
    ['API connection', 'medical-reimbursement/data-source.js'],
    ['Mock data', 'medical-reimbursement/mockStore.js'],
    ['Officer mapping', 'medical-reimbursement/mapper.js'],
    ['Final printable page', 'medical-reimbursement/final-document.jsx'],
    ['Session flow', 'medical-reimbursement/session.js'],
];
const routeRows = [
    ['/reimbursement/medical', 'MR list / control center', 'medical/page.jsx'],
    ['/reimbursement/medical/current', 'workspace shell route', 'medical/[mrId]/page.jsx'],
    ['/reimbursement/medical/current?create=1', 'workspace create mode', 'medical/[mrId]/workspace-client.jsx'],
    ['/reimbursement/medical/current/advance/current-advance/preview', 'advance preview', 'medical/[mrId]/advance/[advId]/preview/preview-client.jsx'],
    ['/reimbursement/medical/current/final/preview', 'final preview', 'medical/[mrId]/final/preview/preview-client.jsx'],
];
const fileRows = [
    ['src/modules/service-workspace', 'Shared reusable building blocks for multiple services'],
    ['src/modules/medical-reimbursement', 'MR-specific logic, mapping, styles, and helpers'],
    ['src/app/(officer)/(ais-officer)/reimbursement/medical', 'MR route files and screens'],
    ['original_workspace.jsx', 'Old reference only'],
];
const layers = [
    {
        name: 'Shared reusable base',
        color: 'border-sky-200 bg-sky-50',
        purpose: 'Common parts future services can reuse',
        files: [
            'src/modules/service-workspace/ui.jsx',
            'src/modules/service-workspace/ui.module.css',
            'src/modules/service-workspace/config.js',
            'src/modules/service-workspace/data-source.js',
            'src/modules/service-workspace/definition.js',
        ],
    },
    {
        name: 'MR-specific layer',
        color: 'border-indigo-200 bg-indigo-50',
        purpose: 'Medical reimbursement rules and files',
        files: [
            'src/modules/medical-reimbursement/types.js',
            'src/modules/medical-reimbursement/mapper.js',
            'src/modules/medical-reimbursement/service-definition.js',
            'src/modules/medical-reimbursement/data-source.js',
            'src/modules/medical-reimbursement/mockStore.js',
            'src/modules/medical-reimbursement/session.js',
            'src/modules/medical-reimbursement/final-document.jsx',
            'src/modules/medical-reimbursement/mr.module.css',
        ],
    },
    {
        name: 'Actual pages',
        color: 'border-emerald-200 bg-emerald-50',
        purpose: 'What the user actually opens',
        files: [
            'src/app/(officer)/(ais-officer)/reimbursement/medical/page.jsx',
            'src/app/(officer)/(ais-officer)/reimbursement/medical/[mrId]/page.jsx',
            'src/app/(officer)/(ais-officer)/reimbursement/medical/[mrId]/workspace-client.jsx',
            'src/app/(officer)/(ais-officer)/reimbursement/medical/[mrId]/advance/[advId]/preview/preview-client.jsx',
            'src/app/(officer)/(ais-officer)/reimbursement/medical/[mrId]/final/preview/preview-client.jsx',
        ],
    },
];
const contractRows = [
    ['listCases()', 'Get all MR cases'],
    ['initializeCases(officer)', 'Prepare first-load case data'],
    ['createCase(officer, payload)', 'Create a new draft MR case'],
    ['updateCase(updatedCase)', 'Save changes to one case'],
];
const componentRows = [
    ['WorkspaceSection', 'Big section wrapper'],
    ['WorkspaceIdentityCard', 'Top identity card'],
    ['WorkspaceInfoGrid', 'Read-only details grid'],
    ['WorkspaceField', 'Label plus field area'],
    ['WorkspaceChoiceGroup', 'Radio-like choice buttons'],
    ['WorkspacePanel', 'Smaller content box'],
    ['WorkspaceFactGrid', 'Small facts / metric cards'],
    ['WorkspaceStatusBadge', 'Status pill'],
];
const apiRows = [
    ['GET /officer/officer-preview', 'Get officer details used by MR'],
    ['GET /mr', 'Get MR case list'],
    ['GET /mr/bootstrap', 'Optional first-load payload'],
    ['POST /mr', 'Create draft MR case'],
    ['PUT /mr/:mrId', 'Save one MR case'],
];
const sampleAdapter = String.raw `setMrDataSource(
  createMrDataSource({
    listCases: async () => { ... },
    initializeCases: async (officer) => { ... },
    createCase: async (officer, payload) => { ... },
    updateCase: async (updatedCase) => { ... },
  }),
);`;
const apiWriteRows = [
    ['src/modules/medical-reimbursement/data-source.js', 'Main place to connect MR screens to backend API'],
    ['src/modules/medical-reimbursement/mapper.js', 'If API response shape needs cleanup before UI uses it'],
    ['src/modules/medical-reimbursement/types.js', 'If backend data requires new MR types or payload types'],
];
const sampleGetCode = String.raw `// write inside: src/modules/medical-reimbursement/data-source.js
import { createMrDataSource, setMrDataSource } from '@/modules/medical-reimbursement/data-source';

const apiMrDataSource = createMrDataSource({
  listCases: async () => {
    const response = await fetch('/api/mr', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to load MR cases');
    }

    return response.json();
  },

  initializeCases: async (officer) => {
    const response = await fetch(\`/api/mr/bootstrap?pen=\${officer.penNumber}\`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to initialize MR cases');
    }

    return response.json();
  },
});`;
const samplePostCode = String.raw `// write inside: src/modules/medical-reimbursement/data-source.js
const apiMrDataSource = createMrDataSource({
  createCase: async (officer, payload) => {
    const response = await fetch('/api/mr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officerPenNumber: officer.penNumber,
        officerName: officer.name,
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create MR case');
    }

    return response.json();
  },
});`;
const samplePutCode = String.raw `// write inside: src/modules/medical-reimbursement/data-source.js
const apiMrDataSource = createMrDataSource({
  updateCase: async (updatedCase) => {
    const response = await fetch(\`/api/mr/\${updatedCase.mrId}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCase),
    });

    if (!response.ok) {
      throw new Error('Failed to update MR case');
    }

    return response.json();
  },
});

setMrDataSource(apiMrDataSource);`;
const newServiceSteps = [
    'Create types.js for that service',
    'Create mapper.js to clean API data',
    'Create data-source.js for save/load',
    'Create service-definition.js for tabs and create fields',
    'Add mockStore.js only if backend is not ready',
    'Build routes using shared workspace components',
    'Keep service-specific rules inside that service folder',
];
const dbPrinciplesRows = [
    ['One shared request base', 'Keep common fields for all services in one parent request table'],
    ['Service-specific detail tables', 'MR, travel, leave, request each get their own detail table linked by request_id'],
    ['Master tables', 'Statuses, tabs, document types, institution types, medicine systems, service types should come from masters'],
    ['Configurable text', 'Declarations, essentiality text, certificate text, and static note text should come from config tables'],
    ['JSON for flexible UI config', 'Use jsonb for field definitions, workflow rules, and section configs that can change'],
];
const dbCoreRows = [
    ['service_request', 'Common base row for every service request in the system'],
    ['service_request_party', 'Applicant / patient / dependent / related person mapping'],
    ['service_request_status_history', 'Lifecycle movement and status tracking'],
    ['service_request_document', 'Uploaded files and generated files'],
    ['service_request_note', 'Officer / section / system notes'],
    ['service_request_action', 'Approval, return, verify, forward actions'],
    ['service_request_config_text', 'Configurable declarations, notes, certificate sentences'],
    ['service_request_ui_config', 'Optional per-service UI config in jsonb'],
];
const dbMasterRows = [
    ['mst_service_type', 'medical reimbursement, travel reimbursement, service request, leave, etc.'],
    ['mst_request_status', 'draft, submitted, verified, returned, sanctioned, rejected, closed'],
    ['mst_request_stage', 'creation, summary, treatment, annexure, certificate, final, movement'],
    ['mst_document_type', 'bill, prescription, essentiality certificate, discharge summary, sanction order'],
    ['mst_institution_type', 'government, private, foreign'],
    ['mst_medicine_system', 'allopathy, ayurveda, homeopathy, etc.'],
    ['mst_relation_type', 'self, spouse, child, parent, dependent'],
    ['mst_action_type', 'save, submit, approve, reject, return, forward'],
    ['mst_text_template_type', 'declaration, essentiality, note, certificate, undertaking'],
];
const postgresSchema = String.raw `-- =========================================
-- 1. MASTER TABLES
-- =========================================
create table mst_service_type (
  service_type_id bigserial primary key,
  service_code varchar(50) not null unique,
  service_name varchar(150) not null,
  active boolean not null default true
);

create table mst_request_status (
  status_id bigserial primary key,
  status_code varchar(50) not null unique,
  status_name varchar(150) not null,
  display_order int not null default 0,
  active boolean not null default true
);

create table mst_request_stage (
  stage_id bigserial primary key,
  stage_code varchar(50) not null unique,
  stage_name varchar(150) not null,
  display_order int not null default 0,
  active boolean not null default true
);

create table mst_document_type (
  document_type_id bigserial primary key,
  service_type_id bigint references mst_service_type(service_type_id),
  document_code varchar(60) not null,
  document_name varchar(150) not null,
  required_by_default boolean not null default false,
  active boolean not null default true,
  unique (service_type_id, document_code)
);

create table mst_institution_type (
  institution_type_id bigserial primary key,
  institution_type_code varchar(50) not null unique,
  institution_type_name varchar(100) not null,
  active boolean not null default true
);

create table mst_medicine_system (
  medicine_system_id bigserial primary key,
  medicine_system_code varchar(50) not null unique,
  medicine_system_name varchar(100) not null,
  active boolean not null default true
);

create table mst_relation_type (
  relation_type_id bigserial primary key,
  relation_code varchar(50) not null unique,
  relation_name varchar(100) not null,
  active boolean not null default true
);

create table mst_action_type (
  action_type_id bigserial primary key,
  action_code varchar(50) not null unique,
  action_name varchar(100) not null,
  active boolean not null default true
);

create table mst_text_template_type (
  template_type_id bigserial primary key,
  template_type_code varchar(50) not null unique,
  template_type_name varchar(100) not null,
  active boolean not null default true
);

-- =========================================
-- 2. COMMON BASE TABLE FOR ALL SERVICES
-- =========================================
create table service_request (
  request_id bigserial primary key,
  service_type_id bigint not null references mst_service_type(service_type_id),
  request_no varchar(100) not null unique,
  officer_id bigint,
  officer_pen varchar(50),
  applicant_name varchar(200),
  current_status_id bigint not null references mst_request_status(status_id),
  current_stage_id bigint references mst_request_stage(stage_id),
  title varchar(250),
  summary text,
  submitted_at timestamptz,
  closed_at timestamptz,
  created_by bigint,
  updated_by bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index idx_service_request_service_type on service_request(service_type_id);
create index idx_service_request_status on service_request(current_status_id);
create index idx_service_request_officer_pen on service_request(officer_pen);

create table service_request_party (
  request_party_id bigserial primary key,
  request_id bigint not null references service_request(request_id) on delete cascade,
  relation_type_id bigint references mst_relation_type(relation_type_id),
  party_role varchar(50) not null,
  person_name varchar(200) not null,
  person_identifier varchar(100),
  mobile_no varchar(30),
  email varchar(150),
  details jsonb not null default '{}'::jsonb
);

create table service_request_status_history (
  history_id bigserial primary key,
  request_id bigint not null references service_request(request_id) on delete cascade,
  status_id bigint not null references mst_request_status(status_id),
  stage_id bigint references mst_request_stage(stage_id),
  action_type_id bigint references mst_action_type(action_type_id),
  remarks text,
  acted_by bigint,
  acted_at timestamptz not null default now(),
  extra_data jsonb not null default '{}'::jsonb
);

create table service_request_document (
  request_document_id bigserial primary key,
  request_id bigint not null references service_request(request_id) on delete cascade,
  document_type_id bigint references mst_document_type(document_type_id),
  file_name varchar(255) not null,
  file_path text,
  mime_type varchar(100),
  file_size bigint,
  is_generated boolean not null default false,
  uploaded_by bigint,
  uploaded_at timestamptz not null default now(),
  document_meta jsonb not null default '{}'::jsonb
);

create table service_request_note (
  note_id bigserial primary key,
  request_id bigint not null references service_request(request_id) on delete cascade,
  note_type varchar(50) not null,
  note_title varchar(200),
  note_body text not null,
  created_by bigint,
  created_at timestamptz not null default now(),
  note_meta jsonb not null default '{}'::jsonb
);

create table service_request_action (
  request_action_id bigserial primary key,
  request_id bigint not null references service_request(request_id) on delete cascade,
  action_type_id bigint not null references mst_action_type(action_type_id),
  from_status_id bigint references mst_request_status(status_id),
  to_status_id bigint references mst_request_status(status_id),
  from_stage_id bigint references mst_request_stage(stage_id),
  to_stage_id bigint references mst_request_stage(stage_id),
  action_remarks text,
  action_by bigint,
  action_at timestamptz not null default now(),
  action_meta jsonb not null default '{}'::jsonb
);

-- =========================================
-- 3. CONFIGURABLE TEXT / DECLARATIONS
-- =========================================
create table service_request_config_text (
  config_text_id bigserial primary key,
  service_type_id bigint not null references mst_service_type(service_type_id),
  template_type_id bigint not null references mst_text_template_type(template_type_id),
  template_code varchar(80) not null,
  template_title varchar(200) not null,
  template_text text not null,
  language_code varchar(10) not null default 'en',
  version_no int not null default 1,
  active boolean not null default true,
  unique (service_type_id, template_type_id, template_code, version_no)
);

create table service_request_ui_config (
  ui_config_id bigserial primary key,
  service_type_id bigint not null references mst_service_type(service_type_id),
  config_code varchar(80) not null,
  config_json jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  unique (service_type_id, config_code)
);

-- =========================================
-- 4. MR-SPECIFIC DETAIL TABLE
-- =========================================
create table mr_request_detail (
  request_id bigint primary key references service_request(request_id) on delete cascade,
  claim_for varchar(50),
  patient_name varchar(200),
  relation_type_id bigint references mst_relation_type(relation_type_id),
  diagnosis text,
  treatment_mode varchar(30),
  treatment_within_kerala boolean,
  institution_type_id bigint references mst_institution_type(institution_type_id),
  institution_name varchar(250),
  institution_address text,
  medicine_system_id bigint references mst_medicine_system(medicine_system_id),
  treatment_start_date date,
  treatment_end_date date,
  total_claim_amount numeric(14,2),
  total_admissible_amount numeric(14,2),
  mr_meta jsonb not null default '{}'::jsonb
);

create table mr_bill_detail (
  mr_bill_id bigserial primary key,
  request_id bigint not null references mr_request_detail(request_id) on delete cascade,
  bill_no varchar(100),
  bill_date date,
  bill_amount numeric(14,2),
  admissible_amount numeric(14,2),
  bill_category varchar(80),
  bill_meta jsonb not null default '{}'::jsonb
);`;
function CompactTable({ headers, rows }) {
    return (<div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-left">
            {headers.map((header) => (<th key={header} className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">
                {header}
              </th>))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (<tr key={`${row[0]}-${index}`} className="align-top">
              {row.map((cell, cellIndex) => (<td key={`${cellIndex}-${cell}`} className="border-b border-slate-100 px-4 py-3 text-slate-700 last:border-b-0">
                  <span className={cell.includes('/') || cell.includes('.ts') || cell.includes('.js') || cell.includes('.tsx') || cell.includes('.jsx') || cell.includes('(') ? 'font-mono text-[13px] break-all' : ''}>
                    {cell}
                  </span>
                </td>))}
            </tr>))}
        </tbody>
      </table>
    </div>);
}
function DiagramNode({ title, text, tone = 'slate', }) {
    const toneMap = {
        slate: 'border-slate-200 bg-white',
        sky: 'border-sky-200 bg-sky-50',
        indigo: 'border-indigo-200 bg-indigo-50',
        emerald: 'border-emerald-200 bg-emerald-50',
    };
    return (<div className={`rounded-2xl border p-5 ${toneMap[tone]}`}>
      <div className="text-[17px] font-semibold leading-7 text-slate-950">{title}</div>
      <div className="mt-2 text-[15px] leading-7 text-slate-600">{text}</div>
    </div>);
}
function GuideCard({ step, title, route, file, points, }) {
    return (<div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-base font-bold text-white">
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-semibold tracking-tight text-slate-950">{title}</div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Route / trigger</div>
              <div className="mt-2 font-mono text-[13px] break-all text-slate-800">{route}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Main file</div>
              <div className="mt-2 font-mono text-[13px] break-all text-slate-800">{file}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {points.map((point) => (<div key={point} className="flex gap-3 text-[15px] leading-7 text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500"/>
                <span>{point}</span>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
function DetailBlock({ title, summary, children, }) {
    return (<details className="group rounded-2xl border border-slate-200 bg-white open:shadow-sm">
      <summary className="cursor-pointer list-none px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="mt-1 text-sm text-slate-600">{summary}</div>
          </div>
          <div className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 group-open:text-slate-600">
            Open
          </div>
        </div>
      </summary>
      <div className="border-t border-slate-200 px-5 py-5">{children}</div>
    </details>);
}
export default function MedicalReimbursementDevDocsPage() {
    if (process.env.NODE_ENV !== 'development') {
        notFound();
    }
    return (<div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-white via-sky-50 to-indigo-50 px-6 py-8 sm:px-8">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Development Only</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">MR Developer Map</h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
              Beginner-friendly guide to the Medical Reimbursement module. Read top to bottom to understand how the module starts, moves, saves, and can be reused.
            </p>
          </div>

          <div className="space-y-10 px-6 py-8 sm:px-8">
            <section className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-4">
                {quickFacts.map(([label, value]) => (<div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                    <div className="mt-3 font-mono text-[14px] break-all text-slate-900">{value}</div>
                  </div>))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Start to end guide</h2>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">This is the recommended learning order for the module.</p>
              </div>
              <div className="space-y-4">
                {guideSections.map((section, index) => (<div key={section.step} className="space-y-3">
                    <GuideCard {...section}/>
                    {index !== guideSections.length - 1 ? (<div className="flex justify-center text-2xl font-semibold text-slate-300">v</div>) : null}
                  </div>))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Workspace tabs</h2>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">These are the main sections inside one MR case.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {tabCards.map(([title, note], index) => (<div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sm font-bold text-sky-700">
                        {index + 1}
                      </div>
                      <div className="text-lg font-semibold text-slate-950">{title}</div>
                    </div>
                    <div className="mt-3 text-[15px] leading-7 text-slate-600">{note}</div>
                  </div>))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Browser session used by MR</h2>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">These values help the module remember what the user is working on.</p>
              </div>
              <div className="space-y-3">
                {sessionCards.map((item) => (<div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="text-lg font-semibold leading-7 text-slate-950">{item.title}</div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] leading-6 break-all text-slate-700">
                        {item.keys}
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] leading-6 break-all text-slate-500">
                        {item.route}
                      </div>
                    </div>
                    <div className="mt-3 text-[15px] leading-7 text-slate-600">{item.note}</div>
                  </div>))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">What to open when you want to change something</h2>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">This is the fastest lookup section for daily development work.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {editCards.map(([task, file]) => (<div key={task} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Want to change</div>
                    <div className="mt-2 text-[17px] font-semibold leading-7 text-slate-950">{task}</div>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] break-all text-slate-700">
                      {file}
                    </div>
                  </div>))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Small visual map</h2>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">This gives the architecture in one glance.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                  <DiagramNode title="Shared reusable base" text="service-workspace/*" tone="sky"/>
                  <div className="hidden text-center text-2xl font-semibold text-slate-300 lg:block">{'>'}</div>
                  <DiagramNode title="MR setup" text="types.js, service-definition.js, data-source.js, session.js" tone="indigo"/>
                  <div className="hidden text-center text-2xl font-semibold text-slate-300 lg:block">{'>'}</div>
                  <DiagramNode title="MR pages" text="list page, workspace, preview pages" tone="emerald"/>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                  <DiagramNode title="UI screens" text="page.jsx and workspace-client.jsx" tone="sky"/>
                  <div className="hidden text-center text-2xl font-semibold text-slate-300 lg:block">{'>'}</div>
                  <DiagramNode title="Save / load bridge" text="getMrDataSource()" tone="indigo"/>
                  <div className="hidden text-center text-2xl font-semibold text-slate-300 lg:block">{'>'}</div>
                  <DiagramNode title="Mock now / API later" text="mockStore.js today, backend adapter later" tone="emerald"/>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Main file map</h2>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">Use this before opening code if you are unsure what a file owns.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {starterMap.map((item) => (<div key={item.what} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="text-[17px] font-semibold leading-7 text-slate-950">{item.what}</div>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] break-all text-slate-700">
                      {item.where}
                    </div>
                    <div className="mt-3 text-[15px] leading-7 text-slate-600">{item.how}</div>
                  </div>))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">More details</h2>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">Open only what you need.</p>
              </div>

              <div className="space-y-4">
                <DetailBlock title="Routes" summary="Which URL opens which MR screen.">
                  <CompactTable headers={['Route', 'Purpose', 'File']} rows={routeRows}/>
                </DetailBlock>

                <DetailBlock title="Folder places" summary="Which folder should hold which kind of code.">
                  <CompactTable headers={['Location', 'Meaning']} rows={fileRows}/>
                </DetailBlock>

                <DetailBlock title="Project layers" summary="Shared base, MR-specific layer, and actual pages.">
                  <div className="grid gap-4 md:grid-cols-3">
                    {layers.map((layer) => (<div key={layer.name} className={`rounded-2xl border p-4 ${layer.color}`}>
                        <div className="text-sm font-semibold text-slate-900">{layer.name}</div>
                        <div className="mt-2 text-sm text-slate-700">{layer.purpose}</div>
                        <div className="mt-3 space-y-2">
                          {layer.files.map((file) => (<div key={file} className="rounded-xl border border-white/80 bg-white/80 px-3 py-2 font-mono text-[12px] break-all text-slate-800">
                              {file}
                            </div>))}
                        </div>
                      </div>))}
                  </div>
                </DetailBlock>

                <DetailBlock title="Save / load methods" summary="The four functions the MR UI uses for reading and saving.">
                  <CompactTable headers={['Method', 'Use']} rows={contractRows}/>
                </DetailBlock>

                <DetailBlock title="Reusable shared components" summary="Shared parts other services should reuse.">
                  <CompactTable headers={['Component', 'Purpose']} rows={componentRows}/>
                </DetailBlock>

                <DetailBlock title="API integration" summary="How to replace local mock storage with real backend API calls.">
                  <div className="space-y-4">
                    <CompactTable headers={['Write Here', 'Purpose']} rows={apiWriteRows}/>
                    <CompactTable headers={['Endpoint', 'Purpose']} rows={apiRows}/>
                    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
                      <div className="font-semibold text-white">Simple example</div>
                      <pre className="mt-3 overflow-x-auto">{sampleAdapter}</pre>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
                        <div className="font-semibold text-white">Sample GET code</div>
                        <pre className="mt-3 overflow-x-auto">{sampleGetCode}</pre>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
                        <div className="font-semibold text-white">Sample POST code</div>
                        <pre className="mt-3 overflow-x-auto">{samplePostCode}</pre>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
                        <div className="font-semibold text-white">Sample PUT code</div>
                        <pre className="mt-3 overflow-x-auto">{samplePutCode}</pre>
                      </div>
                    </div>
                  </div>
                </DetailBlock>

                <DetailBlock title="PostgreSQL base design" summary="Reusable database structure for MR and future services.">
                  <div className="space-y-4">
                    <CompactTable headers={['Design rule', 'Why']} rows={dbPrinciplesRows}/>
                    <CompactTable headers={['Core table', 'Role']} rows={dbCoreRows}/>
                    <CompactTable headers={['Master table', 'Use']} rows={dbMasterRows}/>
                    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
                      <div className="font-semibold text-white">Base PostgreSQL schema</div>
                      <pre className="mt-3 overflow-x-auto">{postgresSchema}</pre>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="text-[17px] font-semibold leading-7 text-slate-950">How to use this structure</div>
                      <div className="mt-3 space-y-2 text-[15px] leading-7 text-slate-700">
                        <div>1. Every service starts with one row in <span className="font-mono text-[13px]">service_request</span>.</div>
                        <div>2. Service-specific data goes into its own detail table like <span className="font-mono text-[13px]">mr_request_detail</span>.</div>
                        <div>3. Status flow stays generic in <span className="font-mono text-[13px]">service_request_status_history</span> and <span className="font-mono text-[13px]">service_request_action</span>.</div>
                        <div>4. All static sentences like declaration, essentiality text, certificate wording, undertakings should live in <span className="font-mono text-[13px]">service_request_config_text</span>.</div>
                        <div>5. UI-level configurable structure like tabs, required docs, field visibility, and section order can live in <span className="font-mono text-[13px]">service_request_ui_config</span> as <span className="font-mono text-[13px]">jsonb</span>.</div>
                        <div>6. Future services like travel reimbursement should create their own detail tables linked by the same <span className="font-mono text-[13px]">request_id</span>.</div>
                      </div>
                    </div>
                  </div>
                </DetailBlock>

                <DetailBlock title="Create the next service" summary="How to create another service on the same shared base.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {newServiceSteps.map((step, index) => (<div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Step {index + 1}</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">{step}</div>
                      </div>))}
                  </div>
                </DetailBlock>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>);
}
