import { getDb, tokens } from '@wiretap/db';
import { eq, isNull } from 'drizzle-orm';
import { createHttpPublicClient } from '@wiretap/utils/shared';
import { config } from 'dotenv';

config({ path: '.env.local' });

const main = async () => {
  if (!process.env.SERVER_ALCHEMY_API_KEY || !process.env.DATABASE_URL) {
    throw new Error('SERVER_ALCHEMY_API_KEY and DATABASE_URL must be set');
  }

  const db = getDb({ databaseUrl: process.env.DATABASE_URL });

  const tokensWithoutImageUrl = await db
    .select({ id: tokens.id, tokenAddress: tokens.address })
    .from(tokens)
    .where(isNull(tokens.imageUrl));

  const totalTokens = tokensWithoutImageUrl.length;
  console.log(`Processing ${totalTokens} tokens without image URL...`);

  for (const [i, token] of tokensWithoutImageUrl.entries()) {
    const client = createHttpPublicClient({
      transportUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.SERVER_ALCHEMY_API_KEY}`
    });

    const imageUrl = (await client.readContract({
      address: token.tokenAddress as `0x${string}`,
      abi: [
        {
          name: 'imageUrl',
          type: 'function',
          inputs: [],
          outputs: [{ type: 'string' }]
        }
      ],
      functionName: 'imageUrl'
    })) as string | null;

    if (!imageUrl) {
      console.warn(`No imageUrl for token ${token.tokenAddress}. Skipping...`);
      continue;
    }

    await db
      .update(tokens)
      .set({ imageUrl: imageUrl })
      .where(eq(tokens.id, token.id));

    console.log(
      `${i + 1}/${totalTokens} - Updated image URL for ${token.tokenAddress}`
    );
  }
};

main();
