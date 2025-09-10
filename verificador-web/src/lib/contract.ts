export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export const ABI = [
  "function anchor(bytes32 h, string meta)",
  "function exists(bytes32 h) view returns (bool)",
  "function anchoredAt(bytes32 h) view returns (uint256)",
  "event Anchored(bytes32 indexed hash, address indexed anchor, uint256 timestamp, string meta)"
] as const;
