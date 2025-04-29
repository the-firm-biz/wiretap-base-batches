import { eq } from 'drizzle-orm';
import { tokenCreatorEntities, walletAddresses } from '../schema/accounts.js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { lower } from '../utils/pg-helpers.js';

export async function getOrCreateWalletByAddress(
  db: NeonHttpDatabase,
  address: `0x${string}`,
  name: string | null = null
) {
  // TODO: this should be a transaction (use pooled Neon connection)
  const [existingWallet] = await db
    .select()
    .from(walletAddresses)
    .where(eq(lower(walletAddresses.address), address.toLowerCase()));
  if (existingWallet) {
    return existingWallet;
  }

  const [tokenCreatorEntity] = await db
    .insert(tokenCreatorEntities)
    .values({ name })
    .returning();
  if (!tokenCreatorEntity) {
    throw new Error('Failed to create token creator entity');
  }
  const [insertedWallet] = await db
    .insert(walletAddresses)
    .values({
      address: address,
      tokenCreatorEntityId: tokenCreatorEntity.id
    })
    .returning();
  if (!insertedWallet) {
    throw new Error('getOrCreateWalletByAddress returned an empty array');
  }
  return insertedWallet;
}
