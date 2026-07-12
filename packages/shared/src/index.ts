export const sharedPackageName = "@egog/shared";

export * from "./snapshot/index.js";

export { giwaTestnet } from "./chain/giwa.js";
export {
  buildParticipationTypedData,
  buildSerializableParticipationTypedData,
  hashParticipationTypedData,
  participationTypes,
  type ParticipationMessage,
} from "./eip712/participation.js";
