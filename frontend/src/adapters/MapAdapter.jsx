import { createAdapter, createActionHandler } from '@a2ui-bridge/react';
import  MapWidget  from '../widgets/MapWidget';

export const MapAdapter = createAdapter(MapWidget, {
  mapProps: (a2ui, ctx) => ({
    location: a2ui.location,
    locations: a2ui.locations,
    onClick: createActionHandler(a2ui.action, ctx), // AI handles clicks
  }),
});