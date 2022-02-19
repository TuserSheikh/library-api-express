import { MongoClient, ObjectId } from 'mongodb';

// for mongodb atlas
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@libraryapi.gdlba.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
// for local
const uri = 'mongodb://localhost:27017/library';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getAll(collectionName, condition = {}) {
  try {
    await client.connect();
    return await client.db().collection(collectionName).find(condition).toArray();
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function getById(collectionName, documentId) {
  try {
    await client.connect();
    return await client
      .db()
      .collection(collectionName)
      .findOne({ _id: ObjectId(documentId) });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function getByField(collectionName, fieldName, fieldValue) {
  try {
    await client.connect();
    return await client
      .db()
      .collection(collectionName)
      .findOne({ [fieldName]: fieldValue });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function create(collectionName, document) {
  try {
    await client.connect();
    return await client.db().collection(collectionName).insertOne(document);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function deleteById(collectionName, documentId) {
  try {
    await client.connect();
    return await client
      .db()
      .collection(collectionName)
      .findOneAndDelete({ _id: ObjectId(documentId) });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function createIndex(collectionName, indexField) {
  try {
    await client.connect();
    return await client
      .db()
      .collection(collectionName)
      .createIndex({ [indexField]: 1 });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export { client, getAll, getById, getByField, create, deleteById, createIndex };
