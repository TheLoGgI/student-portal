import mongoose from "mongoose"

import { models } from "./models.js"

const { MONGODB_URL, NODE_ENV } = process.env

if (!MONGODB_URL) {
  if (NODE_ENV === "production") {
    throw new Error(
      "Please define the MONGODB_URL environment variable — pointing to your full connection string, including database name."
    )
  } else {
    throw new Error(
      "Please define the MONGODB_URL environment variable inside an .env file — pointing to your full connection string, including database name."
    )
  }
}

// We reuse any existing Mongoose db connection to avoid creating multiple
// connections in dev mode when Remix "purges the require cache" when reloading
// on file changes.
export default async function connectDb() {
  // Reuse the existing Mongoose connection if we have one...
  // https://mongoosejs.com/docs/api/connection.html#connection_Connection-readyState
  if (mongoose.connection.readyState > 0) {
    // ...but overwrite all models in development to ensure we pick up any changes made in schemas
    if (NODE_ENV === "development") {
      for (const model of models) {
        if (mongoose.connection.models[model.name]) {
          mongoose.connection.deleteModel(model.name)
        }
        mongoose.connection.model(model.name, model.schema, model.collection)
      }
    }

    return mongoose.connection
  }

  // If no connection exists yet, set up event logging...
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected, NODE_ENV=%s", NODE_ENV)
  })

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose DISCONNECTED, NODE_ENV=%s", NODE_ENV)
  })

  // ...and create a new connection:
  await mongoose.connect(MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })

  // "Models are always scoped to a single connection."
  // https://mongoosejs.com/docs/connections.html#multiple_connections
  // So we set them up here to avoid overwriting and getting errors in dev mode.
  for (const model of models) {
    mongoose.connection.model(model.name, model.schema, model.collection)
  }

  return mongoose.connection
}
