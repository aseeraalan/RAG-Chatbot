import os
from pathlib import Path

import chromadb
from dotenv import load_dotenv
from google import genai
from google.genai import types


# --------------------------------------------------
# Load environment variables
# --------------------------------------------------

load_dotenv("my_agent/.env")

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("GOOGLE_API_KEY was not found.")


# --------------------------------------------------
# Create Gemini client
# --------------------------------------------------

gemini_client = genai.Client(
    api_key=api_key
)


# --------------------------------------------------
# Create Chroma client
# --------------------------------------------------

chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)


# We are generating embeddings ourselves with Gemini,
# so Chroma should not create its own embeddings.
collection = chroma_client.get_or_create_collection(
    name="knowledge_base",
    embedding_function=None,
)


# --------------------------------------------------
# Check starting Chroma count
# --------------------------------------------------

starting_count = collection.count()

print(
    f"Chunks before ingestion: {starting_count}"
)


# --------------------------------------------------
# Folder containing our .txt documents
# --------------------------------------------------

DOCUMENT_FOLDER = Path("./knowledge_base")


# --------------------------------------------------
# Chunking function
# --------------------------------------------------

def chunk_text(
    text: str, #Acme Technologies develops software tools for small businesses.
    chunk_size: int = 400, #10
    overlap: int = 75, #2
) -> list[str]:

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


# --------------------------------------------------
# Generate a Gemini embedding
# --------------------------------------------------

def create_embedding(text: str) -> list[float]:

    result = gemini_client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=768,
        ),
    )

    return result.embeddings[0].values


# --------------------------------------------------
# Read all .txt files
# --------------------------------------------------

text_files = list(
    DOCUMENT_FOLDER.glob("*.txt")
)

if not text_files:
    raise ValueError(
        "No .txt files were found in the knowledge_base folder."
    )


# --------------------------------------------------
# Process every file
# --------------------------------------------------

for file_path in text_files:

    print(
        f"\nReading: {file_path.name}"
    )

    text = file_path.read_text(
        encoding="utf-8"
    )

    chunks = chunk_text(text)

    print(
        f"Created {len(chunks)} chunks."
    )

 
    # ----------------------------------------------
    # Embed and store every chunk
    # ----------------------------------------------

    for chunk_number, chunk in enumerate(chunks):

        print(
            f"Embedding chunk {chunk_number + 1}..."
        )

        embedding = create_embedding(
            chunk
        )


        chunk_id = (
            f"{file_path.stem}_chunk_{chunk_number}"
        )


        collection.upsert(
            ids=[
                chunk_id
            ],

            embeddings=[
                embedding
            ],

            documents=[
                chunk
            ],

            metadatas=[
                {
                    "source": file_path.name,
                    "chunk": chunk_number,
                }
            ],
        )


# --------------------------------------------------
# Check ending Chroma count
# --------------------------------------------------

ending_count = collection.count()

new_chunks = ending_count - starting_count


# --------------------------------------------------
# Show final results
# --------------------------------------------------

print(
    "\nFinished ingesting documents."
)

print(
    f"Chunks before ingestion: {starting_count}"
)

print(
    f"Chunks after ingestion: {ending_count}"
)

print(
    f"New chunks added: {new_chunks}"
)