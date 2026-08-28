import chromadb


# Create a persistent local Chroma database.
# The database files will be stored inside ./chroma_db
client = chromadb.PersistentClient(
    path="./chroma_db"
)


# Create the collection if it does not already exist.
collection = client.get_or_create_collection(
    name="day13_documents"
)


# Store four short text documents.
collection.upsert(
    ids=[
        "doc1",
        "doc2",
        "doc3",
        "doc4",
    ],

    documents=[
        "Basketball players try to score points by shooting the ball into the hoop.",

        "Python is a programming language commonly used for artificial intelligence.",

        "Dogs are popular pets that enjoy playing and spending time with people.",

        "Machine learning allows computers to learn patterns from data.",
    ],
)


# Check how many documents are stored.
document_count = collection.count()

print(
    f"Number of documents stored: {document_count}"
)


# Query the vector database using semantic similarity.
results = collection.query(
    query_texts=[
        "How do computers learn from information?"
    ],
    n_results=2,
)


print("\nMost relevant documents:")

for document in results["documents"][0]:
    print("-", document)