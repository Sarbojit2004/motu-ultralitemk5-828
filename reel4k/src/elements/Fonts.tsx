import React from 'react';
import {staticFile} from 'remotion';

/** Self-hosted display faces, so a render never depends on network fonts. */
export const Fonts: React.FC = () => (
  <style>{`
    @font-face{font-family:'Anton';src:url('${staticFile('fonts/anton.woff2')}') format('woff2');font-weight:400;font-display:block;}
    @font-face{font-family:'Archivo Black';src:url('${staticFile('fonts/archivoblack.woff2')}') format('woff2');font-weight:400;font-display:block;}
    @font-face{font-family:'Oswald';src:url('${staticFile('fonts/oswald-var.woff2')}') format('woff2');font-weight:200 700;font-display:block;}
    @font-face{font-family:'Barlow Semi Condensed';src:url('${staticFile('fonts/barlowsc-500.woff2')}') format('woff2');font-weight:500;font-display:block;}
    @font-face{font-family:'Barlow Semi Condensed';src:url('${staticFile('fonts/barlowsc-700.woff2')}') format('woff2');font-weight:700;font-display:block;}
  `}</style>
);
