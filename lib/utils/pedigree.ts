import { db } from '@/lib/db';
import { animals, manualPedigreeEntries } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

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
 * Fetch manual pedigree entries for an animal and build nodes
 * @param animalId - Animal ID to fetch entries for
 * @param position - Position in tree ('dam', 'sire', 'dam.dam', etc.)
 * @returns Map of position to PedigreeNode
 */
async function fetchManualEntries(animalId: string): Promise<Map<string, PedigreeNode>> {
  const entries = await db
    .select()
    .from(manualPedigreeEntries)
    .where(eq(manualPedigreeEntries.animalId, animalId));

  console.log(`🔍 Fetched ${entries.length} manual pedigree entries for animal ${animalId}:`, 
    entries.map(e => ({ position: e.position, name: e.name }))
  );

  const manualNodes = new Map<string, PedigreeNode>();

  // First pass: Create all nodes
  for (const entry of entries) {
    manualNodes.set(entry.position, {
      id: entry.id,
      name: entry.name,
      registeredName: entry.registeredName,
      breed: entry.breed,
      sex: entry.sex,
      registrationNumber: entry.registrationNumber,
      dateOfBirth: entry.dateOfBirth?.toString() ?? null,
      color: entry.color,
      profileImageUrl: null,
      dam: null,
      sire: null,
      isManualEntry: true,
    });
  }

  // Second pass: Link children to parents
  for (const [position, node] of manualNodes.entries()) {
    const damPosition = `${position}.dam`;
    const sirePosition = `${position}.sire`;
    
    if (manualNodes.has(damPosition)) {
      node.dam = manualNodes.get(damPosition)!;
      console.log(`🔗 Linked ${damPosition} to ${position}`);
    }
    
    if (manualNodes.has(sirePosition)) {
      node.sire = manualNodes.get(sirePosition)!;
      console.log(`🔗 Linked ${sirePosition} to ${position}`);
    }
  }

  return manualNodes;
}

/**
 * Recursively fetch pedigree tree up to specified generations
 * Handles both linked animals (via damId/sireId) and manual entries from database
 * @param nodeId - Animal ID to start from
 * @param depth - Current depth in recursion
 * @param maxGens - Maximum generations to fetch
 * @param rootAnimalId - Root animal ID (for fetching manual entries)
 * @param currentPath - Current path in tree (e.g., 'dam', 'dam.sire')
 * @param manualEntriesMap - Pre-fetched manual entries map (passed through recursion)
 * @returns Pedigree node with nested parents
 */
export async function fetchPedigree(
  nodeId: string | null,
  depth = 0,
  maxGens = 4,
  rootAnimalId?: string,
  currentPath = '',
  manualEntriesMap?: Map<string, PedigreeNode>
): Promise<PedigreeNode | null> {
  if (!nodeId || depth >= maxGens) return null;

  // Fetch manual entries for root animal only once at the start
  const manualEntries = manualEntriesMap || (rootAnimalId && depth === 0 
    ? await fetchManualEntries(rootAnimalId) 
    : new Map<string, PedigreeNode>());

  const [animal] = await db
    .select()
    .from(animals)
    .where(eq(animals.id, nodeId))
    .limit(1);

  if (!animal) return null;

  // Determine paths for dam and sire
  const damPath = currentPath ? `${currentPath}.dam` : 'dam';
  const sirePath = currentPath ? `${currentPath}.sire` : 'sire';

  console.log(`🔍 Depth ${depth}, checking paths:`, { damPath, sirePath, hasManualDam: manualEntries.has(damPath), hasManualSire: manualEntries.has(sirePath) });

  // Fetch dam - check manual entries first, then linked animals
  let dam: PedigreeNode | null = null;
  if (manualEntries.has(damPath)) {
    console.log(`✅ Found manual dam at ${damPath}:`, manualEntries.get(damPath)?.name);
    dam = manualEntries.get(damPath)!;
  } else if (animal.damId) {
    console.log(`🔄 Recursing for dam: ${animal.damId}`);
    dam = await fetchPedigree(animal.damId, depth + 1, maxGens, rootAnimalId, damPath, manualEntries);
  }

  // Fetch sire - check manual entries first, then linked animals
  let sire: PedigreeNode | null = null;
  if (manualEntries.has(sirePath)) {
    console.log(`✅ Found manual sire at ${sirePath}:`, manualEntries.get(sirePath)?.name);
    sire = manualEntries.get(sirePath)!;
  } else if (animal.sireId) {
    console.log(`🔄 Recursing for sire: ${animal.sireId}`);
    sire = await fetchPedigree(animal.sireId, depth + 1, maxGens, rootAnimalId, sirePath, manualEntries);
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
 * Check if targetId is a descendant of candidateId
 * This prevents circular references in the pedigree tree
 * @param candidateId - Potential parent ID (the animal we want to set as parent)
 * @param targetId - Animal ID we're editing (the child)
 * @returns true if circular relationship would be created
 */
export async function isDescendant(
  candidateId: string,
  targetId: string
): Promise<boolean> {
  if (!candidateId || !targetId || candidateId === targetId) return true;

  // Check if targetId is a descendant of candidateId
  // Start from targetId and traverse DOWN the tree (to children)
  const seen = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (seen.has(currentId)) continue;
    seen.add(currentId);

    // If we find the candidate in the descendants, it's circular
    if (currentId === candidateId) {
      return true;
    }

    // Find all animals that have currentId as a parent (children of currentId)
    const children = await db
      .select()
      .from(animals)
      .where(
        or(
          eq(animals.damId, currentId),
          eq(animals.sireId, currentId)
        )
      );

    // Add children to queue to continue searching
    for (const child of children) {
      if (!seen.has(child.id)) {
        queue.push(child.id);
      }
    }
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
  if (damId && (await isDescendant(damId, animalId))) {
    return 'Setting this dam would create a circular relationship in the pedigree';
  }

  // Check if sire would create circular relationship
  if (sireId && (await isDescendant(sireId, animalId))) {
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
