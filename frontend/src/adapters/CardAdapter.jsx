import { createAdapter } from '@a2ui-bridge/react';
import  CardWidget  from '../widgets/CardWidget';

// 1. Wrap your CardWidget
export const CardAdapter = createAdapter(CardWidget, {
  mapProps: (a2ui, ctx) => ({
    children: ctx.children, // Automatically handles nesting
  }),
});