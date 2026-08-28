import os
from pathlib import Path

import chromadb

from dotenv import load_dotenv
from google import genai
from google.genai import types


# --------------------------------------------------
# Get the location of the adk-agents folder
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent


# --------------------------------------------------
# Load environment variables
# --------------------------------------------------

load_dotenv(
    BASE_DIR / "my_agent" / ".env"
)

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError(
        "GOOGLE_API_KEY was not found."
    )


# --------------------------------------------------
# Create Gemini client
# --------------------------------------------------

gemini_client = genai.Client(
    api_key=api_key
)


# --------------------------------------------------
# Connect to Chroma
# --------------------------------------------------

chroma_client = chromadb.PersistentClient(
    path=str(
        BASE_DIR / "chroma_db"
    )
)


collection = chroma_client.get_collection(
    name="knowledge_base"
)


# --------------------------------------------------
# Create embedding for user's query
# --------------------------------------------------

def create_query_embedding(
    query: str
) -> list[float]:

    result = gemini_client.models.embed_content(
        model="gemini-embedding-001",

        contents=query,

        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=768,
        ),
    )

    return result.embeddings[0].values


# --------------------------------------------------
# Retrieve relevant chunks
# --------------------------------------------------

def retrieve(
    query: str,
    top_k: int = 3,
    max_distance: float = 0.24,
) -> dict:

    # Turn the user's question into an embedding
    query_embedding = create_query_embedding(
        query
    )


    # Search Chroma for the closest chunks
    results = collection.query(
        query_embeddings=[
            query_embedding
        ],

        n_results=top_k,

        include=[
            "documents",
            "metadatas",
            "distances",
        ],
    )


    # Get results for the first query
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]


    # --------------------------------------------------
    # Show exactly what Chroma retrieved
    # --------------------------------------------------

    print("\nRetrieved chunks:")

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances,
    ):

        print("\n----------------------")

        print(
            f"Source: {metadata.get('source')}"
        )

        print(
            f"Chunk: {metadata.get('chunk')}"
        )

        print(
            f"Distance: {distance}"
        )

        print(
            f"Text: {document}"
        )


    # --------------------------------------------------
    # Show distances separately
    # --------------------------------------------------

    print("\nRetrieved distances:")

    for distance in distances:
        print(distance)


    # --------------------------------------------------
    # Filter out weak matches
    # --------------------------------------------------

    relevant_chunks = []

    sources = []


    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances,
    ):

        # Smaller distance means more similar
        if distance <= max_distance:

            relevant_chunks.append(
                document
            )


            source = metadata.get(
                "source",
                "Unknown source"
            )


            # Avoid duplicate filenames
            if source not in sources:
                sources.append(
                    source
                )


    # --------------------------------------------------
    # Nothing relevant was found
    # --------------------------------------------------

    if not relevant_chunks:

        return {
            "found": False,
            "context": "",
            "sources": [],
        }


    # --------------------------------------------------
    # Combine relevant chunks into one context
    # --------------------------------------------------

    context = "\n\n".join(
        relevant_chunks
    )


    return {
        "found": True,
        "context": context,
        "sources": sources,
    }


# --------------------------------------------------
# Build grounded RAG prompt
# --------------------------------------------------

def build_prompt(
    query: str,
    context: str,
) -> str:

    prompt = f"""
You are a helpful assistant.

Answer the user's question using ONLY the
information provided in the context below.

Do not use outside knowledge.

Do not guess or invent information.

If the context does not contain enough
information to answer the question, say:

"I don't have enough information in the
knowledge base to answer that."

CONTEXT:

{context}


QUESTION:

{query}


ANSWER:
"""

    return prompt


# --------------------------------------------------
# Generate final standalone RAG answer
# --------------------------------------------------

def answer_question(
    query: str
) -> dict:

    # First retrieve relevant knowledge
    retrieval = retrieve(
        query
    )


    # Stop if Chroma did not find anything relevant
    if not retrieval["found"]:

        return {
            "answer": (
                "I couldn't find relevant information "
                "in the knowledge base."
            ),

            "sources": [],
        }


    # Create grounded prompt
    prompt = build_prompt(
        query,
        retrieval["context"],
    )


    # Ask Gemini to answer
    response = gemini_client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )


    return {
        "answer": response.text,
        "sources": retrieval["sources"],
    }


# --------------------------------------------------
# Test the standalone RAG pipeline
# --------------------------------------------------

if __name__ == "__main__":

    print("\n--------------------------------")
    print("REAL QUESTION")
    print("--------------------------------")


    real_question = (
        "What is the refund policy?"
    )


    result = answer_question(
        real_question
    )


    print("\nAnswer:")
    print(
        result["answer"]
    )


    print("\nSources:")
    print(
        result["sources"]
    )


    print("\n--------------------------------")
    print("UNRELATED QUESTION")
    print("--------------------------------")


    nonsense_question = (
        "What color are the dragons on Mars?"
    )


    result = answer_question(
        nonsense_question
    )


    print("\nAnswer:")
    print(
        result["answer"]
    )


    print("\nSources:")
    print(
        result["sources"]
    )