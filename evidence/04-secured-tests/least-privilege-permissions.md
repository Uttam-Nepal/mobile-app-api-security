# Least-Privilege Permission Check

## Objective

Check the browser permission states relevant to the mobile app and API security prototype.

## Method

Opened the prototype in Chrome's responsive device view using the iPhone SE viewport. Ran a JavaScript check using the Permissions API for geolocation, camera, microphone, and notifications. The script checked the existing states without requesting permission.

## Results

| Permission    | Observed state |
| ------------- | -------------- |
| Geolocation   | `prompt`       |
| Camera        | `prompt`       |
| Microphone    | `prompt`       |
| Notifications | `prompt`       |

## Security interpretation

The prototype currently provides sign-in and profile-viewing functionality, which does not require camera, microphone, geolocation, or notification access. Following the principle of least privilege, these permissions should not be requested unless a future feature genuinely needs them.

The observed `prompt` state means there is no recorded permission decision for this site. This check alone does not prove that the application never attempts to request a permission, so the code should also be checked for permission-requesting APIs.

## Evidence

- `browser-permission-states.png`

## Limitation

This is a browser-based permission-state check in Chrome's responsive device view, not a test of native Android or iOS application permissions.
