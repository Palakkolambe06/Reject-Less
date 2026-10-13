/**
 * RejectLess Circular Knowledge Engine
 * 
 * Provides domain-specific AI advice for recyclable materials, 6-point readiness criteria,
 * recipient matching rules, and handover lifecycle workflows.
 * Used as fallback and grounding layer when live API keys are pending or experiencing network/rate limits.
 */

export interface ChatContext {
  role?: string;
  batchId?: string;
  materialCategory?: string;
  quantity?: number;
  unit?: string;
  status?: string;
  readinessScore?: number;
  incompleteChecklistItems?: string[];
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'model';
  text: string;
}

export function generateRejectLessKnowledgeResponse(
  userQuery: string,
  context?: ChatContext,
  _history?: ChatHistoryItem[]
): string {
  const query = userQuery.toLowerCase().trim();

  // 1. Preparation of Cardboard / Paper
  if (
    query.includes('cardboard') ||
    query.includes('paper') ||
    query.includes('occ') ||
    (query.includes('prepare') && query.includes('box'))
  ) {
    return `### Recommended Preparation for Cardboard (OCC) Recycling:

To achieve a 100% score on the RejectLess 6-Point Readiness Gate and prevent dock rejection:

1. **Remove Contaminants:**
   - Strip off all non-paper materials: plastic strapping, packaging tape, bubble wrap, Styrofoam packing peanuts, and heavy staples.
   - Separate coated wax cartons or poly-lined mailers into a separate stream.

2. **Strict Zero-Grease & Zero-Food Rule:**
   - Any oil or grease stains (e.g. food delivery boxes, pizza containers) will ruin the pulp batch during recycling. Slice off stained portions or dispose of them as compostable/refuse.

3. **Moisture Protection:**
   - Wet cardboard loses tensile strength and develops mold. Store flat indoors or beneath heavy-duty waterproof tarpaulins until dispatch.

4. **Flatten & Package:**
   - Fully flatten and nest all corrugated boxes.
   - For volumes over **250 kg**, compact and bale using standard baling wire or stack securely on wooden pallets with stretch film.

5. **Verify on RejectLess:**
   - Head to the **/readiness** page, verify all 6 checklist items, and generate your certified readiness badge before making offers to paper mills!`;
  }

  // 2. Rejection Reasons / Why batches get rejected
  if (
    query.includes('why') && (query.includes('reject') || query.includes('turn down')) ||
    query.includes('reject my') ||
    query.includes('rejection') ||
    query.includes('causes of rejection')
  ) {
    return `### Primary Reasons Waste Batches Get Rejected at Recipient Docks:

In circular logistics, recipient facilities (mills, reclaimers, smelters) operate under strict material intake specifications. The top rejection causes on RejectLess are:

1. **Organic / Food / Oil Contamination:**
   - Even 1% food residue or engine grease can ruin an entire pulp vat or cause severe discoloration in recycled plastic pellets.

2. **Excess Moisture (>12% in Paper/Cardboard):**
   - Moisture degrades fiber length, adds uncompensated water weight, and risks fungal contamination during warehouse staging.

3. **Polymer Cross-Contamination in Plastics:**
   - Mixing PVC (#3) or PS (#6) with PET (#1) or HDPE (#2). PVC releases hydrochloric acid at PET melt temperatures, destroying extruder screws.

4. **Non-Compliant Packaging Format:**
   - Sending loose bulk material to a recycler that only has forklift capacity for baled or palletized cubes.

5. **Weight Below Intake Minimum:**
   - Facilities set minimum intake thresholds (e.g., 500 kg minimum for industrial reclaimers) to justify weighbridge processing costs.

6. **Missing Traceability / Readiness Sign-Off:**
   - RejectLess operates on *"AI Suggests, Humans Confirm"*. Batches without verified human dock inspection checklist certification will be flagged for re-inspection.`;
  }

  // 3. Information Needed Before Offering Batch
  if (
    query.includes('information') && query.includes('before offering') ||
    query.includes('what do i need') ||
    query.includes('create a batch') ||
    query.includes('offer a batch')
  ) {
    return `### Required Information Before Offering a Waste Batch:

To ensure automated matching and high recipient acceptance rates, make sure your batch includes:

1. **Certified Material Classification:**
   - Specific stream (e.g., *Clear PET Bottles*, *Industrial OCC Cardboard*, *HDPE Regrind*, *Clean Scrap Steel*). Use the **/ai-triage** camera tool to get automated classification suggestions.
2. **Verified Quantity & Units:**
   - Accurate net weight in kilograms (kg) or metric tons (t), measured via floor scale or weighbridge.
3. **Packaging Specification:**
   - Specify whether the material is *Baled*, *Boxed*, *Palletized*, *Drums*, or *Loose*.
4. **Cleanliness & Contamination Rating:**
   - Rate contamination percentage (<1% clean, 1-3% minor dust/labels, >5% dirty).
5. **Photo Documentation:**
   - At least 1-2 clear photographs showing the top layer and physical storage condition.
6. **Completed 6-Point Readiness Gate:**
   - Certified readiness check ensuring single-stream segregation and zero food/liquid contamination.
7. **Dock Access & Pickup Window:**
   - Pickup location, loading bay clearance, and available loading equipment (forklift, pallet jack, or ramp).`;
  }

  // 4. Batch Status Lifecycle Explanation
  if (
    query.includes('status') ||
    query.includes('lifecycle') ||
    query.includes('explain the status') ||
    query.includes('current status')
  ) {
    let contextNote = '';
    if (context?.batchId && context?.status) {
      contextNote = `\n\n*(Regarding active batch **${context.batchId}**: Its status is currently **${context.status}** with a readiness score of **${context.readinessScore ?? 'N/A'}%**.)*`;
    }

    return `### The RejectLess Batch Lifecycle Explained:

Each batch moves through a transparent, immutable chain of custody:

- **DRAFT:** Initial listing created by generator. Needs weight, photo, and packaging specification.
- **PREPARATION:** Sorting, contaminant stripping, or baling actively underway.
- **READY:** Passed all 6 criteria of the Readiness Gate. Certified ready for algorithmic recipient matching.
- **OFFERED:** Dispatched to a compatible recycler or reclaimer. Awaiting recipient review and acceptance.
- **ACCEPTED:** Recipient confirmed intake terms. Transport scheduling initiated.
- **SCHEDULED:** Logistics operator assigned. Pickup bay and arrival time window locked.
- **PICKED UP:** Loaded onto transport vehicle with driver custody transfer and dispatch slip.
- **HANDED OVER:** Delivered at recipient facility; weighbridge slip logged and intake receipt finalized.
- **REJECTED:** Returned or flagged during intake audit due to contamination or weight discrepancies.${contextNote}`;
  }

  // 5. Finding Suitable Recipients / Matching Rules
  if (
    query.includes('find a suitable recipient') ||
    query.includes('matching') ||
    query.includes('find a recipient') ||
    query.includes('how do i match') ||
    query.includes('how to find')
  ) {
    return `### How Recipient Matching Works in RejectLess:

RejectLess eliminates guesswork by using a **deterministic, rule-based matching engine**:

1. **Material Stream Compatibility:**
   - The engine checks whether the recipient facility holds certified permits for your exact material (e.g., Pulp & Paper Mill vs Polymer Reclaimer).

2. **Intake Capacity Bounds:**
   - Your batch weight is checked against the facility's minimum threshold and maximum storage headroom (e.g., 200 kg to 50,000 kg).

3. **Packaging Format Compliance:**
   - Recipient packaging capabilities (e.g. requires wire-bound bales vs accepts gaylord bulk boxes).

4. **Contamination Tolerance:**
   - Facilities with automated washlines tolerate up to 3% contamination, whereas direct re-pelletizers require <1%.

5. **Geospatial Proximity & Radius:**
   - Haversine distance is calculated between your generator facility and the recipient dock. Only facilities within their operating service radius (e.g. 35 km) are matched.

👉 **Next Step:** Open the **/recipients** page or click **"Find Matches"** directly from your Batch Details view to explore eligible facilities scored by compatibility!`;
  }

  // 6. Reuse vs Repair vs Recycling (Waste Hierarchy)
  if (
    query.includes('reuse') && query.includes('recycl') ||
    query.includes('difference between reuse and recycling') ||
    query.includes('waste hierarchy') ||
    query.includes('repair')
  ) {
    return `### The Difference Between Reuse, Repair, and Recycling:

Under the Circular Economy Waste Hierarchy, each strategy serves a different tier of material conservation:

1. **Reuse (Highest Environmental Value):**
   - **What it is:** Using a product or packaging component again in its original form and structure without mechanical shredding or chemical breakdown.
   - **Examples:** Wooden pallets refurbished for shipping, returnable glass bottles washed and refilled, intermediate bulk containers (IBC totes).
   - **Carbon Impact:** Minimal embodied carbon footprint—preserves 100% of the manufacturing energy.

2. **Repair & Refurbishment (Secondary Value):**
   - **What it is:** Restoring non-functioning or damaged items to working condition by replacing broken components or re-soldering.
   - **Examples:** Fixing broken pallet runners, rewiring electronics, re-sealing industrial drums.

3. **Recycling (Tertiary Recovery):**
   - **What it is:** Mechanically or chemically breaking down materials into raw feedstock to manufacture completely new products.
   - **Examples:** Shredding PET bottles into flakes, repulping corrugated cardboard into brown paper slurry, smelting scrap steel in an electric arc furnace.
   - **Carbon Impact:** Recovers material value and saves landfill space, but requires thermal or mechanical energy.

RejectLess prioritizes connecting materials to **reuse partners first** whenever structural integrity permits!`;
  }

  // 7. Plastics / Polymers Guidance
  if (
    query.includes('plastic') ||
    query.includes('pet') ||
    query.includes('hdpe') ||
    query.includes('polymer') ||
    query.includes('pvc')
  ) {
    return `### Plastics Recycling & Segregation Guidelines on RejectLess:

Plastics must be rigorously sorted by polymer type (Resin Identification Codes 1-7) to be accepted:

- **PET / PETE (Code 1):** Water bottles, beverage containers, clear thermoform trays. Must be emptied, rinsed, and labels removed if possible. Keep colored PET separate from clear PET.
- **HDPE (Code 2):** Milk jugs, detergent jugs, chemical drums, pipe offcuts. High economic value. Clean and drain all liquids.
- **LDPE (Code 4):** Clear shrink wrap, stretch film, pallet wrap. Must be clean and free of tape or food residue; bale into high-density cubes.
- **PP (Code 5):** Crates, automotive trim, battery casings, caps and closures. Highly recyclable when separated.
- ⚠️ **Strict Hazard - PVC (Code 3):** Must NEVER be mixed with PET or HDPE! Even trace PVC ruins an entire batch of recycled plastic.

💡 **Tip:** Use the RejectLess Vision tool at **/ai-triage** to upload a photograph and verify polymer category candidate suggestions.`;
  }

  // 8. Metals / Scrap
  if (query.includes('metal') || query.includes('aluminum') || query.includes('steel') || query.includes('copper') || query.includes('iron')) {
    return `### Metal Scrap Preparation & Intake Standards:

Metals enjoy infinite recyclability and immediate commercial demand:

1. **Segregate Ferrous from Non-Ferrous:**
   - Use a hand magnet: if it sticks, it is **Ferrous** (carbon steel, cast iron); if it does not stick, it is **Non-Ferrous** (aluminum, copper, brass, stainless steel). Non-ferrous carries significantly higher value per kilogram.
2. **Drain Fluids & Pressurized Vessels:**
   - Hydraulic lines, fuel tanks, and drums must be drained, vented, and visually empty.
   - Pressurized aerosol cans or propane cylinders cannot be baled due to explosion hazard at shredder docks.
3. **Packaging:**
   - Small scrap: Pallet boxes or steel bins.
   - Sheet metal / cuttings: Banded securely with steel strapping.`;
  }

  // 9. Glass Recycling
  if (query.includes('glass') || query.includes('cullet') || query.includes('bottle')) {
    return `### Glass Cullet Preparation & Color Separation:

Glass is 100% recyclable without loss of purity, provided it is uncontaminated:

1. **Color Sorting:**
   - Separate into **Flint (Clear)**, **Amber (Brown)**, and **Emerald (Green)**. Mixed-color glass ("three-mix") has drastically lower market value.
2. **Prohibited Glass Contaminants:**
   - **Ceramics, porcelain, Pyrex/heat-resistant glass, and window mirrors** have different melting temperatures and will form stones in new bottle glass. Never mix them into packaging cullet.
3. **Packaging:**
   - Secure in lined Gaylord boxes or bulk steel hoppers to ensure dock worker safety.`;
  }

  // 10. Default / Context-Enriched Response
  const roleName = context?.role ? ` as a **${context.role}**` : '';
  const batchInfo = context?.batchId
    ? ` Active batch context: **${context.batchId}** (${context.materialCategory || 'Material'} · ${context.status || 'Active'}).`
    : '';

  return `### RejectLess AI Circular Advisor:

Thank you for your inquiry${roleName}!${batchInfo}

Here is how RejectLess supports your circular recovery operations:

- **AI Material Classification (/ai-triage):** Upload photos of waste streams for instant open-weight Vision Transformer candidate suggestions. Remember: *AI suggests, humans confirm*.
- **6-Point Readiness Gate (/readiness):** Evaluate single-stream segregation, moisture levels, zero-food contamination, packaging formats, and weight thresholds before offering batches.
- **Deterministic Recipient Matching (/recipients):** Explore nearby certified recyclers and reclaimers scored by material compatibility and distance.
- **Traceable Handovers (/handovers):** Manage driver dispatch, custody transfers, weighbridge documentation, and digital bills of lading.

Could you clarify the specific material stream, packaging format, or batch workflow step you need assistance with?`;
}
