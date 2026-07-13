export const sharedPackageName = "@egog/shared";

export * from "./snapshot/index.js";

export { giwaTestnet } from "./chain/giwa.js";
export { pluralize } from "./text/pluralize.js";
export {
  buildParticipationTypedData,
  buildSerializableParticipationTypedData,
  hashParticipationTypedData,
  participationTypes,
  type ParticipationMessage,
} from "./eip712/participation.js";
