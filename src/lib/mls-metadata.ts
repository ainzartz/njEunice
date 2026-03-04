import { prisma } from './prisma';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Updates the last successful MLS API call timestamp in the database.
 * This is used for the "Last date updated" field in the MLS Disclaimer.
 */
export async function updateMlsMetadata() {
  try {
    const now = new Date();
    await prisma.mlsMetadata.upsert({
      where: { id: 'singleton' },
      update: { lastUpdated: now },
      create: { id: 'singleton', lastUpdated: now },
    });
  } catch (error) {
    console.error('Failed to update MLS metadata timestamp:', error);
  }
}

/**
 * Retrieves the last successful MLS API call timestamp.
 */
export async function getMlsMetadata() {
  noStore();
  try {
    const metadata = await prisma.mlsMetadata.findUnique({
      where: { id: 'singleton' },
    });
    return metadata ? metadata.lastUpdated : null;
  } catch (error) {
    console.error('Failed to fetch MLS metadata timestamp:', error);
    return null;
  }
}
