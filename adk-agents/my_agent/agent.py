from google.adk.agents.llm_agent import Agent

from rag_pipeline import retrieve


# Mock order database
orders = {
    "1001": "processing",
    "1002": "shipped",
    "1003": "delivered",
    "1004": "cancelled",
}


def get_order_status(order_id: str) -> dict:
    """
    Returns the current status of an order.

    Args:
        order_id (str): The ID of the order to look up.

    Returns:
        dict: Information about the order and its current status.
    """

    order_status = orders.get(order_id)

    if order_status is None:
        return {
            "status": "error",
            "message": f"Order {order_id} was not found.",
        }

    return {
        "status": "success",
        "order_id": order_id,
        "order_status": order_status,
    }


def search_knowledge_base(query: str) -> dict:
    """
    Searches the company knowledge base for relevant information.

    Use this tool when the user asks a question about company
    information, policies, refunds, customer support, account help,
    FAQs, or other information stored in the knowledge base.

    Args:
        query (str): The user's question to search for.

    Returns:
        dict: Retrieved context and source documents if relevant
        information is found.
    """

    result = retrieve(query)

    if not result["found"]:
        return {
            "found": False,
            "message": (
                "No relevant information was found "
                "in the knowledge base."
            ),
            "context": "",
            "sources": [],
        }

    return {
        "found": True,
        "context": result["context"],
        "sources": result["sources"],
    }


root_agent = Agent(
    model="gemini-3.6-flash",

    name="root_agent",

    description=(
        "A restricted customer service assistant that only answers "
        "questions using the order-status system or the company "
        "knowledge base."
    ),

    instruction="""
    You are a restricted customer service assistant.

    You are ONLY allowed to answer questions using information
    returned by one of your available tools.

    You have two tools available:

    1. get_order_status

    Use get_order_status when the user asks about the status
    of a specific order.

    You must use the tool to determine the order status.

    Never guess, assume, or invent an order status.

    If the order does not exist, tell the user that the order
    could not be found.


    2. search_knowledge_base

    Use search_knowledge_base when the user asks about company
    information, including:

    - refund policies
    - company information
    - customer support
    - account help
    - frequently asked questions
    - company policies
    - information that may exist in the company knowledge base

    When search_knowledge_base returns relevant information,
    answer the question using ONLY the returned context.

    Do not add information that is not explicitly supported
    by the retrieved context.


    IMPORTANT RESTRICTIONS:

    You must NOT answer questions using your own general knowledge,
    training data, assumptions, guesses, or outside information.

    You must NOT answer questions that are unrelated to the company,
    its knowledge base, or order statuses.

    You must NOT attempt to solve an unrelated question even if you
    know the answer.

    You must NOT use general knowledge to fill in missing information.

    You must NOT invent company information, policies, procedures,
    prices, rules, order information, or other facts.

    If search_knowledge_base returns found=False, do not try to answer
    the question yourself.

    Instead, tell the user:

    "I couldn't find that information in the company knowledge base."

    If the user's question is unrelated to the company, the knowledge
    base, or order statuses, do not answer the question.

    Instead, tell the user:

    "I can only answer questions about the company knowledge base
    or order statuses."

    Even if you know the answer to an unrelated question, you must
    still refuse to answer it.

    Your responses must always be grounded in information returned
    by your tools.
    """,

    tools=[
        get_order_status,
        search_knowledge_base,
    ],
)