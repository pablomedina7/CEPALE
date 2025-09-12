// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Verificador V0:
 * - Ancla un hash (bytes32) y emite un evento con timestamp.
 * - Guarda el primer timestamp visto para cada hash.
 * - No almacena datos sensibles; sólo el hash y metadatos mínimos.
 */
contract PayAnchorV0 {
    event Anchored(bytes32 indexed hash, address indexed anchor, uint256 timestamp, string meta);

    mapping(bytes32 => uint256) public firstSeenAt;

    /**
     * @param h    Hash del comprobante (recomendado SHA-256 en 32 bytes, formateado 0x...).
     * @param meta Metadatos cortos (ej: "PYG|FACTURA|PDF" o "JSON|DONACION").
     */
    function anchor(bytes32 h, string calldata meta) external {
        // Si nunca se vio este hash, registra el primer timestamp
        if (firstSeenAt[h] == 0) {
            firstSeenAt[h] = block.timestamp;
        }
        emit Anchored(h, msg.sender, block.timestamp, meta);
    }

    function exists(bytes32 h) external view returns (bool) {
        return firstSeenAt[h] != 0;
    }

    function anchoredAt(bytes32 h) external view returns (uint256) {
        return firstSeenAt[h];
    }
}
