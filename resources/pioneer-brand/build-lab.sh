#!/bin/sh
# Builds the bundles the gateway serves on module pages:
#   ph-kit.css = the ATA kit (kit/, copied verbatim) + the Pioneer Healthcare components (ph-ui.css)
#   lab-kit.css = ph-kit.css + the laboratory layout (lab.css)
cd "$(dirname "$0")" && cat kit/tokens.css kit/ui-v2.css kit/standard.css kit/ata-ui.css ph-ui.css > ph-kit.css && cat ph-kit.css lab.css > lab-kit.css
cat ph-kit.css clinical.css > clinical-kit.css
