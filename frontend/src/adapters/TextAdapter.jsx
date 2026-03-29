// src/adapters/TextAdapter.js
import { createAdapter } from '@a2ui-bridge/react';
import TextWidget from '../widgets/TextWidget';

export const TextAdapter = createAdapter(TextWidget, {
  mapProps: (a2ui) => ({
    /**
     * Priority for resolving the text value:
     * 1. a2ui.text.literalString (Standard Protocol/Normalized)
     * 2. a2ui.text (Direct string from backend)
     * 3. a2ui.content (Common fallback)
     */
    text: a2ui.text?.literalString || a2ui.text || a2ui.content || "",
  }),
});