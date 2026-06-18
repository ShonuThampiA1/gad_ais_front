import type { ReactNode } from 'react';

export type WorkspaceFieldSpan = 'half' | 'full';

export type WorkspaceChoiceOption<T extends string = string> = {
  label: string;
  value: T;
  hint?: string;
};

export type WorkspaceConfigField =
  | {
      kind: 'choice';
      key: string;
      label: string;
      span?: WorkspaceFieldSpan;
      columns?: 'auto' | 2;
      options: WorkspaceChoiceOption[];
      value: string;
      onChange: (value: string) => void;
    }
  | {
      kind: 'input';
      key: string;
      label: string;
      span?: WorkspaceFieldSpan;
      type?: 'text' | 'date';
      placeholder?: string;
      value: string;
      onChange: (value: string) => void;
    }
  | {
      kind: 'select';
      key: string;
      label: string;
      span?: WorkspaceFieldSpan;
      value: string;
      onChange: (value: string) => void;
      options: Array<{ label: string; value: string }>;
    }
  | {
      kind: 'custom';
      key: string;
      span?: WorkspaceFieldSpan;
      content: ReactNode;
    };

export type WorkspaceSectionConfig = {
  id: string;
  title: string;
  fields: WorkspaceConfigField[];
};

export type WorkspaceSummaryItem = {
  label: string;
  value: ReactNode;
};
