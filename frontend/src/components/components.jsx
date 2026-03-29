import { CardAdapter } from "../adapters/CardAdapter";
import { TextAdapter } from "../adapters/TextAdapter";
import { MapAdapter } from "../adapters/MapAdapter";

export const componentRegistry = {
  Card: CardAdapter,
  Text: TextAdapter,
  Map: MapAdapter
};