# Specification - Track: refine login proportions

## Overview
This track is a follow-up to the login design overhaul. The goal is to address feedback regarding the form being too wide and disproportionate. We will reduce the container width to 340px and meticulously refine internal padding, vertical spacing, font sizes, and icon scales to create a tight, professional, and visually balanced interface.

## Functional Requirements
- **Narrower Container:** Reduce the `login-container` max-width to `340px`.
- **Proportional Scaling:**
    - Slightly reduce font sizes for titles, labels, and button text to fit the narrower layout.
    - Scale down icons (Mail, Lock, Google) to maintain visual balance.
- **Internal Alignment & Spacing:**
    - Reduce internal card padding (currently `p-8 md:p-10`) to something more appropriate for 340px (e.g., `p-6`).
    - Tighten vertical gaps (`space-y-X`) between form groups and components.
    - Ensure perfect vertical alignment of labels, inputs, and feedback indicators.
- **Compact "Remember Me":** Refine the checkbox layout to take up less vertical and horizontal space while remaining accessible.

## Non-Functional Requirements
- **Visual Precision:** The layout must feel intentional and balanced on both high-resolution displays and mobile devices.
- **Design Consistency:** Maintain the "WildOut!" brand identity while improving density.

## Acceptance Criteria
- [ ] Login card width is restricted to 340px.
- [ ] Internal padding and gaps are reduced and feel proportional.
- [ ] All text and icons are scaled appropriately for the smaller container.
- [ ] Alignment is pixel-perfect across all form elements.
- [ ] Form remains highly usable and accessible on mobile.

## Out of Scope
- Backend logic changes.
- Addition of new login methods.
- Redesign of other authentication pages (unless they share the same components).
