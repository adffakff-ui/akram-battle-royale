#!/usr/bin/env python3
import os
import shutil
import base64
import hashlib
import zipfile
import subprocess

def main():
    print("=== Building Yemen Warrior APK ===")
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)

    # 1. Run npm run build
    print("1. Running npm run build...")
    subprocess.run(["npm", "run", "build"], check=True)

    dist_dir = os.path.join(root_dir, "dist")
    old_apk_path = os.path.join(root_dir, "public", "BattleRoyale.apk")
    temp_dir = "/tmp/apk_build"
    shutil.rmtree(temp_dir, ignore_errors=True)
    os.makedirs(temp_dir, exist_ok=True)

    # 2. Extract base Android files (classes.dex, AndroidManifest.xml, res/)
    print("2. Extracting Android base from template APK...")
    with zipfile.ZipFile(old_apk_path, "r") as z:
        for item in z.namelist():
            # Only keep Android runtime binaries and resources, not old web assets or META-INF
            if item.startswith("classes") or item == "AndroidManifest.xml" or item.startswith("res/"):
                z.extract(item, temp_dir)

    # 3. Copy dist assets into assets/www
    print("3. Copying new dist build into assets/www...")
    www_dir = os.path.join(temp_dir, "assets", "www")
    os.makedirs(www_dir, exist_ok=True)

    for root, dirs, files in os.walk(dist_dir):
        rel_root = os.path.relpath(root, dist_dir)
        target_root = os.path.join(www_dir, rel_root) if rel_root != "." else www_dir
        os.makedirs(target_root, exist_ok=True)
        for f in files:
            # Skip any recursive apk if present
            if f.endswith(".apk"):
                continue
            src = os.path.join(root, f)
            dst = os.path.join(target_root, f)
            shutil.copy2(src, dst)

    # 4. Generate Certificate and Key for signing if not existing
    cert_pem = "/tmp/yemen_cert.pem"
    key_pem = "/tmp/yemen_key.pem"
    if not os.path.exists(cert_pem) or not os.path.exists(key_pem):
        print("4. Generating RSA signing key...")
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:2048",
            "-keyout", key_pem, "-out", cert_pem,
            "-days", "10000", "-nodes",
            "-subj", "/C=YE/ST=Sanaa/L=Sanaa/O=Yemen/OU=Gaming/CN=YemenBattleRoyale"
        ], check=True)

    # 5. Build MANIFEST.MF
    print("5. Computing SHA-256 and SHA-1 digests for MANIFEST.MF...")
    all_files = []
    for root, dirs, files in os.walk(temp_dir):
        for f in sorted(files):
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, temp_dir).replace("\\", "/")
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

    # 6. Build CERT.SF
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
        # compute digest of individual entry in manifest
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

    # 8. Package final APK
    print("8. Packaging final signed APK...")
    output_apk = os.path.join(root_dir, "public", "BattleRoyale.apk")
    temp_apk = "/tmp/new_BattleRoyale.apk"

    with zipfile.ZipFile(temp_apk, "w", zipfile.ZIP_DEFLATED) as zout:
        # Write META-INF files first (standard jar/apk ordering)
        for meta_file in ["MANIFEST.MF", "BATTLERO.SF", "BATTLERO.RSA"]:
            m_path = os.path.join(meta_inf_dir, meta_file)
            if os.path.exists(m_path):
                zout.write(m_path, f"META-INF/{meta_file}")

        # Write all other files
        for root, dirs, files in os.walk(temp_dir):
            for f in sorted(files):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, temp_dir).replace("\\", "/")
                if rel_path.startswith("META-INF/"):
                    continue
                zout.write(full_path, rel_path)

    # Move to public/BattleRoyale.apk
    shutil.move(temp_apk, output_apk)
    size_mb = os.path.getsize(output_apk) / (1024 * 1024)
    print(f"=== APK Build Succeeded! ===")
    print(f"Output: {output_apk} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    main()
