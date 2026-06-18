import React from 'react';
import shared from './ui.module.css';
function cx(...parts) {
    return parts.filter(Boolean).join(' ');
}
function spanClass(span) {
    if (span === 12)
        return shared.span12;
    if (span === 6)
        return shared.span6;
    if (span === 4)
        return shared.span4;
    return shared.span3;
}
export function WorkspaceStatusBadge({ children, className }) {
    return <div className={cx(shared.statusBadge, className)}>{children}</div>;
}
export function WorkspaceSection({ eyebrow, title, icon, badge, meta, children, className, bodyClassName, }) {
    return (<div className={cx(shared.sectionShell, className)}>
      <div className={shared.sectionHeader}>
        <div className={shared.sectionHeaderMain}>
          {icon ? <div className={shared.sectionIcon}>{icon}</div> : null}
          <div>
            <div className={shared.sectionEyebrow}>{eyebrow}</div>
            <div className={shared.sectionTitle}>{title}</div>
            {meta ? <div className={shared.sectionMeta}>{meta}</div> : null}
          </div>
        </div>
        {badge}
      </div>
      <div className={cx(shared.sectionBody, bodyClassName)}>{children}</div>
    </div>);
}
export function WorkspaceIdentityCard({ kicker, name, meta, avatar, badge, children, }) {
    return (<div className={shared.identityCard}>
      <div className={shared.identityHeader}>
        <div className={shared.identityMain}>
          {avatar ? <div className={shared.identityAvatar}>{avatar}</div> : null}
          <div>
            <div className={shared.identityKicker}>{kicker}</div>
            <div className={shared.identityName}>{name}</div>
            {meta ? <div className={shared.identityMeta}>{meta}</div> : null}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </div>);
}
export function WorkspaceInfoGrid({ items, }) {
    return (<div className={shared.infoGrid}>
      {items.map((item) => (<div key={`${item.label}-${String(item.value)}`} className={cx(shared.infoItem, spanClass(item.span || 3))}>
          <span className={shared.infoLabel}>{item.label}</span>
          <strong className={shared.infoValue}>{item.value}</strong>
        </div>))}
    </div>);
}
export function WorkspaceFormGrid({ children }) {
    return <div className={shared.formGrid}>{children}</div>;
}
export function WorkspaceField({ label, span = 12, children, }) {
    return (<div className={cx(shared.formField, spanClass(span))}>
      <label className={shared.fieldLabel}>{label}</label>
      {children}
    </div>);
}
export function WorkspaceChoiceGroup({ options, value, onChange, columns = 'auto', }) {
    return (<div className={cx(shared.choiceGrid, columns === 2 && shared.choiceTwoCol)}>
      {options.map((option) => (<button key={option.value} type="button" className={cx(shared.choiceButton, value === option.value && shared.choiceButtonActive)} onClick={() => onChange(option.value)}>
          <span className={shared.choiceContent}>
            <span className={shared.choiceText}>{option.label}</span>
            {option.hint ? <span className={shared.choiceHint}>{option.hint}</span> : null}
          </span>
        </button>))}
    </div>);
}
export function WorkspacePanel({ title, meta, badge, children, soft = false, }) {
    return (<div className={cx(shared.panel, soft && shared.panelSoft)}>
      <div className={shared.panelHeader}>
        <div>
          <div className={shared.panelTitle}>{title}</div>
          {meta ? <div className={shared.panelMeta}>{meta}</div> : null}
        </div>
        {badge}
      </div>
      {children}
    </div>);
}
export function WorkspaceFactGrid({ items, }) {
    return (<div className={shared.factGrid}>
      {items.map((item) => (<div key={`${item.label}-${String(item.value)}`} className={shared.factCard}>
          <span className={shared.factLabel}>{item.label}</span>
          <strong className={shared.factValue}>{item.value}</strong>
        </div>))}
    </div>);
}
export function WorkspaceEmptyState({ children }) {
    return <div className={shared.emptyState}>{children}</div>;
}
export const workspaceUi = shared;
