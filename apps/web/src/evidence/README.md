# Evidence Module

Browser compatibility re-export for research session, evidence bundle, and deterministic integrity receipt helpers from `packages/core`.

UI-specific session download, upload, state-restore, receipt export, and local receipt verification wiring lives in `apps/web/src/ui/`. Receipt verification is non-mutating and checksum-limited; it does not add a network, identity, provider, or execution surface.
