import React, { ReactNode } from 'react';
import { P } from './GlossaryText';

export function DropCapText({ text }: { text: string }) {
  if (!text) return null;
  const match = text.match(/^([A-Z])(\S*)(.*)$/s);
  if (!match) return <>{text}</>;

  let [, first, wordTail, rest] = match;
  let smallCaps = '';
  let hasSpace = false;

  if (wordTail.length > 0) {
    // Multi-letter first word (e.g. "When", "Almighty", "Dearly", "Lord,")
    const punctMatch = wordTail.match(/^([A-Za-z]+)(.*)$/s);
    if (punctMatch) {
      smallCaps = punctMatch[1];
      rest = punctMatch[2] + rest;
    } else {
      smallCaps = wordTail;
    }
  } else {
    // Single-letter first word (e.g. "I", "O"). The word after the drop cap is the next word!
    const nextWordMatch = rest.match(/^(\s+)([A-Za-z]+)(.*)$/s);
    if (nextWordMatch) {
      hasSpace = true;
      smallCaps = nextWordMatch[2];
      rest = nextWordMatch[3];
    }
  }

  return (
    <>
      <span className="liturgical-drop-cap" aria-hidden="true">{first}</span>
      {hasSpace && ' '}
      {smallCaps && <span className="liturgical-small-caps">{smallCaps}</span>}
      {rest}
    </>
  );
}

export function BreviaryDivider({ label }: { label?: string }) {
  return (
    <div className="liturgical-rule select-none" aria-hidden="true">
      <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.25em] font-serif opacity-75">
        <span className="liturgical-fleuron text-sm">❦</span>
        <span className="liturgical-fleuron text-xs">✠</span>
        {label && <span className="font-semibold text-[10px] sm:text-[11px] tracking-[0.3em] opacity-80 px-1">{label}</span>}
        <span className="liturgical-fleuron text-xs">✠</span>
        <span className="liturgical-fleuron text-sm">❦</span>
      </div>
    </div>
  );
}

export interface VersiclePairProps {
  v: ReactNode;
  r: ReactNode;
  key?: React.Key;
  leaderLabel?: string;
  responseLabel?: string;
}

export function VersiclePair({ 
  v, 
  r, 
  leaderLabel = "Priest.", 
  responseLabel = "Answer." 
}: VersiclePairProps) {
  return (
    <div className="space-y-1">
      <P className="text-opacity-90 flex items-baseline gap-2.5">
        <span className="rubric select-none font-serif text-[0.95em] shrink-0 font-normal">{leaderLabel}</span>
        <span className="flex-1">{v}</span>
      </P>
      <P className="font-bold flex items-baseline gap-2.5">
        <span className="rubric select-none font-serif text-[0.95em] shrink-0 font-normal">{responseLabel}</span>
        <span className="flex-1">{r}</span>
      </P>
    </div>
  );
}
