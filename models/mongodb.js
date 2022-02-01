import { MongoClient, ObjectId } from 'mongodb';

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@libraryapi.gdlba.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getAll(collectionName) {
  try {
    await client.connect();
    return await client.db().collection(collectionName).find().toArray();
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

export { getAll, getById };
