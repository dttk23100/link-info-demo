# Link Info Demo

A page that shows what a normal link can learn without permissions or forms:
public IP / approximate geolocation, browser/OS, screen, timezone, language,
GPU, canvas hash, local WebRTC IP, and a browser fingerprint.

The page sends a JSON capture to `/api/collect`; the server stores the latest
captures in a public GitHub Gist. `/dossier.html` is the server-side view.

This is standard web tracking/fingerprinting, not malware. It does not read
passwords, cookies from other sites, files, camera/mic, or exact GPS.
