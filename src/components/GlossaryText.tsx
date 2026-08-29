import React, { ReactNode } from 'react';

const glossaryData: Record<string, string> = {
  "holpen": "helped",
  "sundry": "various",
  "dissemble": "hide one's motives or feelings",
  "cloak": "hide or conceal",
  "erred": "made a mistake, gone astray",
  "miserable": "pitiful, in need of mercy",
  "endue": "endow, provide with a quality",
  "beseech": "beg, implore",
  "magnified": "praised highly",
  "requisite": "necessary",
  "unfeignedly": "sincerely, without pretense",
  "meet": "fitting, proper",
  "vouchsafe": "grant graciously",
  "health": "spiritual wholeness or salvation",
  "devices": "plans or schemes",
  "manifold": "many and various",
  "remission": "forgiveness, pardon",
  "quicunque vult": "Whosoever wishes (to be saved)",
  "cherubin": "cherubim, angelic beings",
  "seraphin": "seraphim, angelic beings",
  "sabaoth": "armies or hosts",
  "exhort": "strongly encourage or urge",
  "wherefore": "for what reason, why",
  "penitent": "feeling or showing sorrow for sin",
  "absolveth": "declares free from blame or sin",
  "hallowed": "made holy, consecrated",
  "trespasses": "sins or offenses",
  "shew": "show (archaic spelling)",
  "heritage": "property that is or may be inherited; an inheritance",
  "governor": "ruler",
  "catholic": "universal, all-embracing",
  "wheresoever": "wherever",
  "succour": "assistance and support in times of hardship",
  "oblations": "offerings made to God",
  "affiance": "trust, confidence",
  "bountifulness": "liberality in bestowing gifts"
};

function formatText(text: string): ReactNode {
  if (!text) return text;
  
  const terms = Object.keys(glossaryData).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
  
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  
  text.replace(regex, (match, p1, offset) => {
    if (offset > lastIndex) {
      parts.push(text.substring(lastIndex, offset));
    }
    const term = match.toLowerCase();
    parts.push(
      <span key={offset} className="group relative cursor-help border-b border-dotted border-black/30 dark:border-white/30 hover:border-black/60 dark:hover:border-white/60 transition-colors">
        {match}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[200px] text-center bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg whitespace-normal font-sans tracking-normal not-italic font-normal">
          {glossaryData[term]}
        </span>
      </span>
    );
    lastIndex = offset + match.length;
    return match;
  });
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts.length > 0 ? parts : text}</>;
}

export const processNode = (node: ReactNode): ReactNode => {
  if (typeof node === 'string') return formatText(node);
  if (Array.isArray(node)) return node.map((n, i) => <React.Fragment key={i}>{processNode(n)}</React.Fragment>);
  return node;
};

export const P = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  return <p className={className}>{processNode(children)}</p>;
};
