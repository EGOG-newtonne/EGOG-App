export const sharedPackageName = "@egog/shared";

export { giwaTestnet } from "./chain/giwa.js";
export {
  buildParticipationTypedData,
  hashParticipationTypedData,
  participationTypes,
  type ParticipationMessage,
} from "./eip712/participation.js";
