#!/usr/bin/env python3
import os
import shutil
import base64
import hashlib
import zipfile
import subprocess
import struct

def align_and_write_zip(temp_dir, all_files, meta_dir, output_apk):
    """
    Writes a valid Android APK:
    - META-INF entries first (MANIFEST.MF, BATTLERO.SF, BATTLERO.RSA)
    - resources.arsc and res/*.png STORED (uncompressed) AND 4-byte aligned!
    - all other files DEFLATED
    """
    with zipfile.ZipFile(output_apk, "w") as zout:
        # 1. Write META-INF files first
        for meta_file in ["MANIFEST.MF", "BATTLERO.SF", "BATTLERO.RSA"]:
            m_path = os.path.join(meta_dir, meta_file)
            if os.path.exists(m_path):
                zout.write(m_path, f"META-INF/{meta_file}", compress_type=zipfile.ZIP_DEFLATED)

        # 2. Write all other files
        for rel_path, full_path in all_files:
            if rel_path.startswith("META-INF/"):
                continue

            with open(full_path, "rb") as fp:
                data = fp.read()

            info = zipfile.ZipInfo(rel_path)
            # resources.arsc and res/ PNGs MUST be uncompressed (ZIP_STORED) for Android mmap
            is_stored = rel_path.endswith(".arsc") or rel_path.startswith("res/")

            if is_stored:
                info.compress_type = zipfile.ZIP_STORED
                # Compute header length and ensure 4-byte alignment
                fn_len = len(rel_path.encode("utf-8"))
                fixed_hdr_len = 30 + fn_len
                cur_pos = zout.fp.tell()
                data_offset = cur_pos + fixed_hdr_len
                rem = data_offset % 4
                if rem != 0:
                    pad = 4 - rem
                    info.extra = b"\x00" * pad
            else:
                info.compress_type = zipfile.ZIP_DEFLATED

            zout.writestr(info, data)

def main():
    print("=== Building Official Yemen Warrior APK ===")
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)

    # 1. Run npm run build
    print("1. Running npm run build...")
    subprocess.run(["npm", "run", "build"], check=True)

    dist_dir = os.path.join(root_dir, "dist")
    temp_dir = "/tmp/apk_build_official"
    shutil.rmtree(temp_dir, ignore_errors=True)
    os.makedirs(temp_dir, exist_ok=True)

    # 2. Extract base Android files from working backup template
    # (classes.dex, AndroidManifest.xml, resources.arsc, res/drawable/ic_launcher.png)
    print("2. Extracting Android core files (classes.dex, resources.arsc, AndroidManifest.xml, res/)...")
    template_apk = os.path.join(root_dir, "BattleRoyale_backup.apk")
    if not os.path.exists(template_apk):
        template_apk = os.path.join(root_dir, "android-build", "bin", "unaligned.apk")

    with zipfile.ZipFile(template_apk, "r") as z:
        for item in ["AndroidManifest.xml", "classes.dex", "resources.arsc", "res/drawable/ic_launcher.png"]:
            z.extract(item, temp_dir)

    ff_icon = os.path.join(root_dir, "public", "freefire_icon.png")
    if os.path.exists(ff_icon):
        shutil.copy2(ff_icon, os.path.join(temp_dir, "res", "drawable", "ic_launcher.png"))

    # 3. Copy dist assets into assets/www
    print("3. Copying dist assets into assets/www...")
    www_dir = os.path.join(temp_dir, "assets", "www")
    os.makedirs(www_dir, exist_ok=True)

    for root, dirs, files in os.walk(dist_dir):
        rel_root = os.path.relpath(root, dist_dir)
        target_root = os.path.join(www_dir, rel_root) if rel_root != "." else www_dir
        os.makedirs(target_root, exist_ok=True)
        for f in files:
            if f.endswith(".apk"):
                continue
            src = os.path.join(root, f)
            dst = os.path.join(target_root, f)
            shutil.copy2(src, dst)

    # Guard registerSW.js against file:// protocol exceptions in Android WebView
    sw_reg = os.path.join(www_dir, "registerSW.js")
    if os.path.exists(sw_reg):
        with open(sw_reg, "w") as fp:
            fp.write("if('serviceWorker' in navigator && window.location.protocol.startsWith('http')) { window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(()=>{}); }); }")

    # 4. Extract official signing certificate and key from release.keystore
    print("4. Loading original release keystore...")
    keystore_path = os.path.join(root_dir, "android-build", "release.keystore")
    cert_pem = "/tmp/orig_cert.pem"
    key_pem = "/tmp/orig_key.pem"

    subprocess.run([
        "openssl", "pkcs12", "-in", keystore_path,
        "-passin", "pass:123456", "-nodes", "-nocerts", "-out", key_pem
    ], check=True)

    subprocess.run([
        "openssl", "pkcs12", "-in", keystore_path,
        "-passin", "pass:123456", "-nokeys", "-clcerts", "-out", cert_pem
    ], check=True)

    # 5. Build MANIFEST.MF
    print("5. Computing SHA-256 and SHA-1 digests...")
    all_files = []
    for root, dirs, files in os.walk(temp_dir):
        for f in sorted(files):
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, temp_dir).replace("\\", "/")
            if rel_path.startswith("META-INF/"):
                continue
            all_files.append((rel_path, full_path))

    all_files.sort(key=lambda x: x[0])

    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: 1.0 (Android)",
        ""
    ]

    file_digests_sha1 = {}
    file_digests_sha256 = {}

    for rel_path, full_path in all_files:
        with open(full_path, "rb") as fp:
            content = fp.read()
        sha1_val = base64.b64encode(hashlib.sha1(content).digest()).decode("ascii")
        sha256_val = base64.b64encode(hashlib.sha256(content).digest()).decode("ascii")

        file_digests_sha1[rel_path] = sha1_val
        file_digests_sha256[rel_path] = sha256_val

        manifest_lines.append(f"Name: {rel_path}")
        manifest_lines.append(f"SHA-256-Digest: {sha256_val}")
        manifest_lines.append(f"SHA1-Digest: {sha1_val}")
        manifest_lines.append("")

    manifest_content = "\r\n".join(manifest_lines).encode("utf-8")
    meta_inf_dir = os.path.join(temp_dir, "META-INF")
    os.makedirs(meta_inf_dir, exist_ok=True)
    manifest_path = os.path.join(meta_inf_dir, "MANIFEST.MF")
    with open(manifest_path, "wb") as fp:
        fp.write(manifest_content)

    # 6. Build BATTLERO.SF
    print("6. Creating Signature file BATTLERO.SF...")
    manifest_sha1 = base64.b64encode(hashlib.sha1(manifest_content).digest()).decode("ascii")
    manifest_sha256 = base64.b64encode(hashlib.sha256(manifest_content).digest()).decode("ascii")

    sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Android)",
        f"SHA-256-Digest-Manifest: {manifest_sha256}",
        f"SHA1-Digest-Manifest: {manifest_sha1}",
        ""
    ]

    for rel_path, _ in all_files:
        entry_lines = [
            f"Name: {rel_path}",
            f"SHA-256-Digest: {file_digests_sha256[rel_path]}",
            f"SHA1-Digest: {file_digests_sha1[rel_path]}",
            ""
        ]
        entry_bytes = "\r\n".join(entry_lines).encode("utf-8")
        entry_sha1 = base64.b64encode(hashlib.sha1(entry_bytes).digest()).decode("ascii")
        entry_sha256 = base64.b64encode(hashlib.sha256(entry_bytes).digest()).decode("ascii")

        sf_lines.append(f"Name: {rel_path}")
        sf_lines.append(f"SHA-256-Digest: {entry_sha256}")
        sf_lines.append(f"SHA1-Digest: {entry_sha1}")
        sf_lines.append("")

    sf_content = "\r\n".join(sf_lines).encode("utf-8")
    sf_path = os.path.join(meta_inf_dir, "BATTLERO.SF")
    with open(sf_path, "wb") as fp:
        fp.write(sf_content)

    # 7. Sign BATTLERO.SF using OpenSSL PKCS7 -> BATTLERO.RSA
    print("7. Signing BATTLERO.SF into BATTLERO.RSA...")
    rsa_path = os.path.join(meta_inf_dir, "BATTLERO.RSA")
    subprocess.run([
        "openssl", "smime", "-sign",
        "-in", sf_path,
        "-out", rsa_path,
        "-outform", "DER",
        "-signer", cert_pem,
        "-inkey", key_pem,
        "-nodetach"
    ], check=True)

    # 8. Package final APK with 4-byte alignment
    print("8. Packaging final 4-byte aligned and signed APK...")
    output_apk = os.path.join(root_dir, "public", "BattleRoyale.apk")
    temp_apk = "/tmp/new_aligned_BattleRoyale.apk"

    align_and_write_zip(temp_dir, all_files, meta_inf_dir, temp_apk)

    # 9. Apply APK Signature Scheme v2 (required for Android 11+ PackageInstaller)
    print("9. Applying APK Signature Scheme v2 block...")
    import sys
    sys.path.append(os.path.join(root_dir, "scripts"))
    from apk_v2_signer import sign_apk_v2
    v2_apk = "/tmp/v2_final_BattleRoyale.apk"
    sign_apk_v2(temp_apk, v2_apk, cert_pem, key_pem)

    # Move to public/BattleRoyale.apk and root BattleRoyale.apk
    shutil.copy2(v2_apk, output_apk)
    shutil.copy2(v2_apk, os.path.join(root_dir, "BattleRoyale.apk"))

    size_mb = os.path.getsize(output_apk) / (1024 * 1024)
    print(f"=== APK Build Succeeded (v1 + v2 Signed)! ===")
    print(f"Output: {output_apk} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    main()

