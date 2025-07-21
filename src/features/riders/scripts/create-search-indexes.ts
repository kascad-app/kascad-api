import { connect, connection } from "mongoose";

/**
 * Script to create optimized indexes for rider search
 * Run with: npx ts-node src/features/riders/scripts/create-search-indexes.ts
 */

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kascad";

const searchIndexes = [
  { key: { "status.status": 1 }, name: "idx_status_active" },

  {
    key: { "identity.country": 1, "preferences.sports": 1 },
    name: "idx_country_sports",
  },
  {
    key: { "identity.gender": 1, "availibility.isAvailable": 1 },
    name: "idx_gender_available",
  },
  {
    key: { "preferences.sports": 1, "availibility.contractType": 1 },
    name: "idx_sports_contract",
  },

  { key: { "identity.country": 1, "identity.city": 1 }, name: "idx_location" },

  { key: { "identity.birthDate": 1 }, name: "idx_birthdate" },

  { key: { "identity.languageSpoken": 1 }, name: "idx_languages" },

  { key: { "preferences.networks": 1 }, name: "idx_social_networks" },

  {
    key: { "availibility.isAvailable": 1, "availibility.contractType": 1 },
    name: "idx_availability",
  },

  { key: { "views.lastMonthViews": -1 }, name: "idx_popularity" },

  { key: { createdAt: -1 }, name: "idx_created_date" },

  {
    key: {
      "preferences.sports": 1,
      "identity.country": 1,
      "availibility.isAvailable": 1,
    },
    name: "idx_advanced_search",
  },

  {
    key: { "identity.birthDate": 1, "preferences.sports": 1 },
    name: "idx_age_sports",
  },

  { key: { "identifier.username": 1 }, name: "idx_username", sparse: true },
  { key: { "identity.bio": 1 }, name: "idx_bio", sparse: true },
];

const textIndex = {
  key: {
    "identity.firstName": "text",
    "identity.lastName": "text",
    "identity.fullName": "text",
    "identity.bio": "text",
    "identifier.username": "text",
  },
  name: "idx_text_search",
  weights: {
    "identity.firstName": 10,
    "identity.lastName": 10,
    "identity.fullName": 8,
    "identifier.username": 6,
    "identity.bio": 1,
  },
};

async function createSearchIndexes() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connect(MONGODB_URI);

    const db = connection.db;
    const ridersCollection = db.collection("riders");

    console.log("📊 Checking existing indexes...");
    const existingIndexes = await ridersCollection.indexes();
    const existingIndexNames = existingIndexes.map((idx) => idx.name);

    console.log("Existing indexes:", existingIndexNames);

    console.log("🔍 Creating search indexes...");

    for (const indexSpec of searchIndexes) {
      if (!existingIndexNames.includes(indexSpec.name)) {
        try {
          await ridersCollection.createIndex(indexSpec.key, {
            name: indexSpec.name,
            sparse: indexSpec.sparse || false,
            background: true,
          });
          console.log(`✅ Index created: ${indexSpec.name}`);
        } catch (error) {
          console.error(`❌ Error creating index ${indexSpec.name}:`, error);
        }
      } else {
        console.log(`⏭️  Index already exists: ${indexSpec.name}`);
      }
    }

    if (!existingIndexNames.includes(textIndex.name)) {
      try {
        await ridersCollection.createIndex(textIndex.key, {
          name: textIndex.name,
          weights: textIndex.weights,
          background: true,
        });
        console.log(`✅ Text index created: ${textIndex.name}`);
      } catch (error) {
        console.error(`❌ Error creating text index: ${error}`);
      }
    } else {
      console.log(`⏭️  Text index already exists: ${textIndex.name}`);
    }

    console.log("📈 Analyzing collection statistics...");
    const stats = await ridersCollection.stats();
    console.log(`📝 Documents: ${stats.count}`);
    console.log(`💾 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(
      `🗂️  Index: ${stats.totalIndexSize ? (stats.totalIndexSize / 1024 / 1024).toFixed(2) + " MB" : "N/A"}`,
    );

    console.log("✅ Search indexes creation completed successfully!");
  } catch (error) {
    console.error("❌ Error creating search indexes:", error);
    process.exit(1);
  } finally {
    await connection.close();
    console.log("🔌 Connection closed");
  }
}

async function dropAllIndexes() {
  try {
    await connect(MONGODB_URI);
    const db = connection.db;
    const ridersCollection = db.collection("riders");

    console.log("🗑️  Dropping all indexes (except _id)...");
    await ridersCollection.dropIndexes();
    console.log("✅ Indexes dropped");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.close();
  }
}

// Run the script
if (require.main === module) {
  const command = process.argv[2];

  if (command === "drop") {
    console.log("🚨 Dropping indexes...");
    dropAllIndexes();
  } else {
    console.log("🚀 Starting search indexes creation...");
    createSearchIndexes();
  }
}

export { createSearchIndexes, dropAllIndexes };
