import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

const clientId = "195326385802c0608eeeb5be3e013035";
export const client = createThirdwebClient({ clientId });
export const chain = defineChain(11155111);
export const CONTRACT_ADDRESS = "0xB07825b02b1Eb35d07f8a4d42d7dDc1E4D72476A";
export const TOKEN_CONTRACT_ADDRESS = '0x463e7AbCe0C85C9e608f9c4F49cf7625EEE79172'
