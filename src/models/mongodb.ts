import { MongoClient, ObjectId } from 'mongodb';
import { IUser } from './users.model';

// for mongodb atlas
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@libraryapi.gdlba.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
// for local
const uri = 'mongodb://localhost:27017/library';

const client = new MongoClient(uri);

async function getAll(collectionName: string, condition = {}) {
  try {
    await client.connect();
    return await client.db().collection(collectionName).find(condition).toArray();
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function getById(collectionName: string, documentId: string) {
  try {
    await client.connect();
    return await client
      .db()
      .collection(collectionName)
      .findOne({ _id: new ObjectId(documentId) });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function getByField(collectionName: string, fieldName: string, fieldValue: string) {
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

async function create(collectionName: string, document: any) {
  try {
    await client.connect();
    return await client.db().collection(collectionName).insertOne(document);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function update(collectionName: string, documentId: string, updatedDocument: any) {
  try {
    await client.connect();
    return await client
      .db()
      .collection(collectionName)
      .findOneAndUpdate({ _id: new ObjectId(documentId) }, updatedDocument);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function deleteById(collectionName: string, documentId: string) {
  try {
    await client.connect();
    return await client
      .db()
      .collection(collectionName)
      .findOneAndDelete({ _id: new ObjectId(documentId) });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function createIndex(collectionName: string, indexFields: any) {
  try {
    await client.connect();
    return await client.db().collection(collectionName).createIndex(indexFields, { unique: true });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export { client, getAll, getById, getByField, create, update, deleteById, createIndex };
