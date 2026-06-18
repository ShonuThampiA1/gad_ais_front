import type { ReactNode } from 'react';
import type { WorkspaceSectionConfig, WorkspaceSummaryItem } from './config';

export type ServiceDocumentType<TValue extends string = string> = {
  label: string;
  value: TValue;
};

export type ServiceInfoItem = {
  label: string;
  value: ReactNode;
  span?: 12 | 6 | 4 | 3;
};

export type ServiceCreationDefinition = {
  sections: WorkspaceSectionConfig[];
  summaryItems: WorkspaceSummaryItem[];
};

export type ServiceWorkspaceDefinition<TTab extends string = string, TDocType extends string = string> = {
  serviceKey: string;
  workspaceTabs: readonly TTab[];
  creationLockedTabs: readonly string[];
  documentTypes?: readonly ServiceDocumentType<TDocType>[];
};

export function defineServiceWorkspace<TTab extends string, TDocType extends string = string>(
  definition: ServiceWorkspaceDefinition<TTab, TDocType>,
): ServiceWorkspaceDefinition<TTab, TDocType>;
