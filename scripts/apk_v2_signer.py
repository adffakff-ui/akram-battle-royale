#!/usr/bin/env python3
import os
import struct
import hashlib
import subprocess

def compute_apk_v2_digest(section1, section2, section3):
    """
    Computes top-level APK digest using SHA-256 for Section 1, Section 2, Section 3.
    Section 3 must have its central directory offset set to len(section1).
    """
    chunks = []
    for sec in [section1, section2, section3]:
        for i in range(0, len(sec), 1048576):
            chunks.append(sec[i:i+1048576])

    chunk_hashes = b""
    for chunk in chunks:
        prefix = b"\xa5" + struct.pack("<I", len(chunk))
        chunk_hashes += hashlib.sha256(prefix + chunk).digest()

    top_digest = hashlib.sha256(b"\x5a" + struct.pack("<I", len(chunks)) + chunk_hashes).digest()
    return top_digest

def build_apk_v2_signer(digest, cert_der, pub_der, key_pem):
    # 1. Digests block
    # uint32 algo_id (0x0103 = SHA256withRSA)
    algo_id = 0x0103
    digest_entry = struct.pack("<II", algo_id, len(digest)) + digest
    digests_block = struct.pack("<I", len(digest_entry)) + digest_entry
    digests_block = struct.pack("<I", len(digests_block)) + digests_block

    # 2. Certificates block
    cert_entry = struct.pack("<I", len(cert_der)) + cert_der
    certs_block = struct.pack("<I", len(cert_entry)) + cert_entry

    # 3. Additional attributes (empty)
    attrs_block = struct.pack("<I", 0)

    # 4. Signed data
    signed_data = digests_block + certs_block + attrs_block
    signed_data_prefixed = struct.pack("<I", len(signed_data)) + signed_data

    # 5. Sign the signed_data using OpenSSL with RSA private key (SHA-256)
    proc = subprocess.Popen(
        ["openssl", "dgst", "-sha256", "-sign", key_pem],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    signature_bytes, err = proc.communicate(input=signed_data)
    if proc.returncode != 0 or len(signature_bytes) != 256:
        raise RuntimeError(f"OpenSSL signature failed: {err.decode('utf-8', errors='ignore')}")

    # 6. Signatures block
    sig_entry = struct.pack("<II", algo_id, len(signature_bytes)) + signature_bytes
    signatures_block = struct.pack("<I", len(sig_entry)) + sig_entry
    signatures_block = struct.pack("<I", len(signatures_block)) + signatures_block

    # 7. Public key block
    pubkey_block = struct.pack("<I", len(pub_der)) + pub_der

    # 8. Single Signer block
    signer_data = signed_data_prefixed + signatures_block + pubkey_block
    signer_data = struct.pack("<I", len(signer_data)) + signer_data

    # 9. Signers sequence
    v2_value = struct.pack("<I", len(signer_data)) + signer_data
    return v2_value

def sign_apk_v2(input_apk_path, output_apk_path, cert_pem, key_pem):
    with open(input_apk_path, "rb") as f:
        data = f.read()

    # Find ZIP End of Central Directory (EOCD)
    eocd_idx = data.rfind(b"\x50\x4b\x05\x06")
    if eocd_idx == -1:
        raise ValueError("Invalid ZIP: EOCD not found")

    cd_size = struct.unpack("<I", data[eocd_idx+12:eocd_idx+16])[0]
    cd_offset = struct.unpack("<I", data[eocd_idx+16:eocd_idx+20])[0]

    section1 = data[:cd_offset]
    section2 = data[cd_offset:cd_offset+cd_size]

    # Section 3 is EOCD, with its CD offset field set to len(section1)
    section3 = bytearray(data[eocd_idx:])
    struct.pack_into("<I", section3, 16, len(section1))

    # Compute top-level digest
    digest = compute_apk_v2_digest(section1, section2, bytes(section3))

    # Extract DER certificate and public key
    subprocess.run(["openssl", "x509", "-in", cert_pem, "-outform", "DER", "-out", "/tmp/temp_cert.der"], check=True)
    with open("/tmp/temp_cert.der", "rb") as f:
        cert_der = f.read()

    subprocess.run(["openssl", "x509", "-in", cert_pem, "-pubkey", "-noout", "-out", "/tmp/temp_pub.pem"], check=True)
    subprocess.run(["openssl", "rsa", "-pubin", "-in", "/tmp/temp_pub.pem", "-outform", "DER", "-out", "/tmp/temp_pub.der"], check=True)
    with open("/tmp/temp_pub.der", "rb") as f:
        pub_der = f.read()

    # Build v2 value
    v2_val = build_apk_v2_signer(digest, cert_der, pub_der, key_pem)

    # Build ID-value pair for ID 0x7109871a
    pair_id = 0x7109871a
    pair_content = struct.pack("<I", pair_id) + v2_val
    pair_len = len(pair_content)
    id_value_pairs = struct.pack("<Q", pair_len) + pair_content

    # Pad so total block length is multiple of 4096 (standard alignment)
    # Total block layout:
    # 8 bytes: block_size
    # N bytes: id_value_pairs
    # 8 bytes: block_size
    # 16 bytes: magic ("APK Sig Block 42")
    # block_size = len(id_value_pairs) + padding + 8 + 16 (excluding the first 8-byte length)
    base_size = len(id_value_pairs) + 24
    rem = (base_size + 8) % 4096
    pad_len = (4096 - rem) % 4096
    if pad_len > 12: # padding pair ID 0x42726577 (padding)
        pad_data = b"\x00" * (pad_len - 12)
        pad_pair = struct.pack("<QI", len(pad_data) + 4, 0x42726577) + pad_data
        id_value_pairs += pad_pair
    elif pad_len > 0:
        # small padding
        pass

    block_size = len(id_value_pairs) + 24
    magic = b"APK Sig Block 42"
    apk_signing_block = (
        struct.pack("<Q", block_size) +
        id_value_pairs +
        struct.pack("<Q", block_size) +
        magic
    )

    new_cd_offset = len(section1) + len(apk_signing_block)
    # Update EOCD with new CD offset
    new_eocd = bytearray(data[eocd_idx:])
    struct.pack_into("<I", new_eocd, 16, new_cd_offset)

    # Write output APK
    with open(output_apk_path, "wb") as f_out:
        f_out.write(section1)
        f_out.write(apk_signing_block)
        f_out.write(section2)
        f_out.write(new_eocd)

    print(f"Successfully signed APK with v2 signature! Size: {os.path.getsize(output_apk_path)} bytes")

if __name__ == "__main__":
    import sys
    inp = sys.argv[1]
    out = sys.argv[2]
    cert = sys.argv[3]
    key = sys.argv[4]
    sign_apk_v2(inp, out, cert, key)
