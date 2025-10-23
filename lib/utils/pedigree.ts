import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// ============================================================================
// PEDIGREE NODE TYPE
// ============================================================================

export type PedigreeNode = {
  id: string;
  name: string;
  registeredName?: string | null;
  breed?: string | null;
  sex?: string | null;
  registrationNumber?: string | null;
  dateOfBirth?: string | null;
  color?: string | null;
  profileImageUrl?: string | null;
  dam?: PedigreeNode | null;
  sire?: PedigreeNode | null;
  isManualEntry?: boolean; // True if this is a manual entry (not in system)
};

// ============================================================================
// FETCH PEDIGREE TREE
// ============================================================================

/**
 * Recursively fetch pedigree tree up to specified generations
 * Handles both linked animals (via damId/sireId) and manual entries
 * @param nodeId - Animal ID to start from
 * @param depth - Current depth in recursion
 * @param maxGens - Maximum generations to fetch
 * @returns Pedigree node with nested parents
 */
export async function fetchPedigree(
  nodeId: string | null,
  depth = 0,
  maxGens = 4
): Promise<PedigreeNode | null> {
  if (!nodeId || depth >= maxGens) return null;

  const [animal] = await db
    .select()
    .from(animals)
    .where(eq(animals.id, nodeId))
    .limit(1);

  if (!animal) return null;

  // Fetch dam - either linked animal or create manual entry node
  let dam: PedigreeNode | null = null;
  if (animal.damId) {
    // Dam is in the system - fetch recursively
    dam = await fetchPedigree(animal.damId, depth + 1, maxGens);
  } else if (animal.damName && animal.damRegisteredName) {
    // Dam is manual entry - create node without recursion
    dam = {
      id: `manual-dam-${animal.id}`, // Unique ID for manual entry
      name: animal.damName,
      registeredName: animal.damRegisteredName,
      breed: null,
      sex: 'female',
      registrationNumber: null,
      dateOfBirth: null,
      color: null,
      profileImageUrl: null,
      dam: null,
      sire: null,
      isManualEntry: true,
    };
  }

  // Fetch sire - either linked animal or create manual entry node
  let sire: PedigreeNode | null = null;
  if (animal.sireId) {
    // Sire is in the system - fetch recursively
    sire = await fetchPedigree(animal.sireId, depth + 1, maxGens);
  } else if (animal.sireName && animal.sireRegisteredName) {
    // Sire is manual entry - create node without recursion
    sire = {
      id: `manual-sire-${animal.id}`, // Unique ID for manual entry
      name: animal.sireName,
      registeredName: animal.sireRegisteredName,
      breed: null,
      sex: 'male',
      registrationNumber: null,
      dateOfBirth: null,
      color: null,
      profileImageUrl: null,
      dam: null,
      sire: null,
      isManualEntry: true,
    };
  }

  return {
    id: animal.id,
    name: animal.name,
    registeredName: animal.registeredName,
    breed: animal.breedId,
    sex: animal.sex,
    registrationNumber: animal.registrationNumber,
    dateOfBirth: animal.dateOfBirth?.toString() ?? null,
    color: animal.color,
    profileImageUrl: animal.profileImageUrl,
    dam,
    sire,
    isManualEntry: false,
  };
}

// ============================================================================
// CIRCULAR ANCESTRY DETECTION
// ============================================================================

/**
 * Check if candidateId is an ancestor of targetId
 * This prevents circular references in the pedigree tree
 * @param candidateId - Potential parent ID
 * @param targetId - Animal ID we're checking against
 * @returns true if circular relationship would be created
 */
export async function isAncestor(
  candidateId: string,
  targetId: string
): Promise<boolean> {
  if (!candidateId || candidateId === targetId) return true;

  const seen = new Set<string>();
  const queue = [candidateId];

  while (queue.length > 0) {
    const id = queue.shift()!;

    if (seen.has(id)) continue;
    seen.add(id);

    const [animal] = await db
      .select()
      .from(animals)
      .where(eq(animals.id, id))
      .limit(1);

    if (!animal) continue;

    // Check if this animal has the target as a parent
    if (animal.damId === targetId || animal.sireId === targetId) {
      return true;
    }

    // Add parents to queue for further checking
    if (animal.damId) queue.push(animal.damId);
    if (animal.sireId) queue.push(animal.sireId);
  }

  return false;
}

/**
 * Check if setting these parents would create a circular relationship
 * @param animalId - Animal whose parents we're updating
 * @param damId - Proposed mother ID
 * @param sireId - Proposed father ID
 * @returns Error message if circular, null if valid
 */
export async function validateParentLinks(
  animalId: string,
  damId: string | null,
  sireId: string | null
): Promise<string | null> {
  // Check if animal is being set as its own parent
  if (damId === animalId || sireId === animalId) {
    return 'An animal cannot be its own parent';
  }

  // Check if dam would create circular relationship
  if (damId && (await isAncestor(damId, animalId))) {
    return 'Setting this dam would create a circular relationship in the pedigree';
  }

  // Check if sire would create circular relationship
  if (sireId && (await isAncestor(sireId, animalId))) {
    return 'Setting this sire would create a circular relationship in the pedigree';
  }

  return null;
}

// ============================================================================
// SEX VALIDATION
// ============================================================================

/**
 * Validate that parent sex matches the role (dam=female, sire=male)
 * @param parentId - Parent animal ID
 * @param role - 'dam' or 'sire'
 * @returns Warning message if mismatch, null if valid
 */
export async function validateParentSex(
  parentId: string | null,
  role: 'dam' | 'sire'
): Promise<string | null> {
  if (!parentId) return null;

  const [parent] = await db
    .select()
    .from(animals)
    .where(eq(animals.id, parentId))
    .limit(1);

  if (!parent) return 'Parent animal not found';

  const expectedSex = role === 'dam' ? 'female' : 'male';
  if (parent.sex !== expectedSex) {
    return `Warning: This animal is ${parent.sex} but being set as ${role} (expected ${expectedSex})`;
  }

  return null;
}

// ============================================================================
// PEDIGREE TREE FLATTENING (FOR EXPORT)
// ============================================================================

export type FlatPedigreeRow = {
  generation: number;
  name: string;
  registeredName: string | null;
  registrationNumber: string | null;
  sex: string | null;
  breed: string | null;
  relationship: string;
  dateOfBirth: string | null;
  isManualEntry: boolean;
};

/**
 * Flatten pedigree tree into rows for CSV export
 * @param node - Root pedigree node
 * @param generation - Current generation (0 = subject)
 * @param relationship - Relationship to subject
 * @returns Array of flat rows
 */
export function flattenPedigree(
  node: PedigreeNode | null,
  generation = 0,
  relationship = 'Subject'
): FlatPedigreeRow[] {
  if (!node) return [];

  const rows: FlatPedigreeRow[] = [
    {
      generation,
      name: node.name,
      registeredName: node.registeredName ?? null,
      registrationNumber: node.registrationNumber ?? null,
      sex: node.sex ?? null,
      breed: node.breed ?? null,
      relationship,
      dateOfBirth: node.dateOfBirth ?? null,
      isManualEntry: node.isManualEntry ?? false,
    },
  ];

  // Add dam's lineage
  if (node.dam) {
    rows.push(
      ...flattenPedigree(
        node.dam,
        generation + 1,
        generation === 0 ? 'Dam' : `${relationship}'s Dam`
      )
    );
  }

  // Add sire's lineage
  if (node.sire) {
    rows.push(
      ...flattenPedigree(
        node.sire,
        generation + 1,
        generation === 0 ? 'Sire' : `${relationship}'s Sire`
      )
    );
  }

  return rows;
}

// ============================================================================
// PEDIGREE STATISTICS
// ============================================================================

/**
 * Calculate pedigree completeness statistics
 * @param node - Root pedigree node
 * @param maxGens - Maximum generations to analyze
 * @returns Statistics object
 */
export function calculatePedigreeStats(
  node: PedigreeNode | null,
  maxGens = 4
): {
  totalPossible: number;
  totalPresent: number;
  completeness: number;
  missingByGeneration: Record<number, number>;
} {
  if (!node) {
    return {
      totalPossible: 0,
      totalPresent: 0,
      completeness: 0,
      missingByGeneration: {},
    };
  }

  const missingByGeneration: Record<number, number> = {};
  let totalPresent = 0;
  let totalPossible = 0;

  function countNodes(n: PedigreeNode | null, gen: number) {
    if (gen >= maxGens) return;

    const possibleAtGen = Math.pow(2, gen);
    totalPossible += possibleAtGen;

    if (!n) {
      missingByGeneration[gen] = (missingByGeneration[gen] || 0) + 1;
      return;
    }

    totalPresent++;

    // Recursively count parents
    countNodes(n.dam ?? null, gen + 1);
    countNodes(n.sire ?? null, gen + 1);
  }

  countNodes(node, 0);

  return {
    totalPossible,
    totalPresent,
    completeness: totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0,
    missingByGeneration,
  };
}
