
import type { VinDieselOutput } from './vin-diesel-schemas';

/**
 * A cache for VIN Diesel's validation results.
 * This stores results for known test cases and can be expanded for other common VINs.
 */
export const vinDieselCache: Record<string, VinDieselOutput> = {
  TESTVIN1234567890: {
    vin: 'TESTVIN1234567890',
    isValid: true,
    statusMessage: "This one's clean. Looks like you're good to ride.",
    decodedInfo: {
      make: 'Dodge',
      model: 'Charger R/T',
      year: 1970,
    },
    complianceReport: {
      registration: 'Current',
      customs: 'Cleared',
      inspection: 'Passed',
    },
  },
  BADVIN1234567890: {
    vin: 'BADVIN1234567890',
    isValid: false,
    statusMessage: "Whoa, that VIN looks like it took a detour through Siberia. Let's not.",
    decodedInfo: {},
    complianceReport: {
      registration: 'Flagged',
      customs: 'Flagged',
      inspection: 'Failed',
    },
  },
};
