import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

const clientId = "195326385802c0608eeeb5be3e013035";
export const client = createThirdwebClient({ clientId });
export const chain = defineChain(11155111);