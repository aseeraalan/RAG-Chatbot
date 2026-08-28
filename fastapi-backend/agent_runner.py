import sys
from pathlib import Path

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types


# --------------------------------------------------
# Locate the RAG Agent Bootcamp folder
# --------------------------------------------------

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)


# --------------------------------------------------
# Locate the adk-agents project
# --------------------------------------------------

ADK_PROJECT = (
    PROJECT_ROOT
    / "adk-agents"
)


# --------------------------------------------------
# Allow Python to import from adk-agents
# --------------------------------------------------

if str(ADK_PROJECT) not in sys.path:

    sys.path.insert(
        0,
        str(ADK_PROJECT),
    )


# --------------------------------------------------
# Import the Day 17 root agent
# --------------------------------------------------

from my_agent.agent import root_agent


# --------------------------------------------------
# ADK application name
# --------------------------------------------------

APP_NAME = "rag_customer_service"


# --------------------------------------------------
# Create an in-memory session service
# --------------------------------------------------

session_service = (
    InMemorySessionService()
)


# --------------------------------------------------
# Create the ADK Runner
# --------------------------------------------------

runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)


# --------------------------------------------------
# Run the agent
# --------------------------------------------------

async def run_agent(
    message: str,
    user_id: str,
) -> str:

    # Each authenticated user gets a conversation
    # called "main_chat".
    session_id = "main_chat"


    # --------------------------------------------------
    # Check whether the session already exists
    # --------------------------------------------------

    session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
    )


    # --------------------------------------------------
    # Create the session if this is the user's
    # first message
    # --------------------------------------------------

    if session is None:

        await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
        )


    # --------------------------------------------------
    # Convert the user's string into ADK Content
    # --------------------------------------------------

    user_message = types.Content(
        role="user",

        parts=[
            types.Part(
                text=message
            )
        ],
    )


    final_response = None


    # --------------------------------------------------
    # Run the agent
    # --------------------------------------------------

    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=user_message,
    ):

        # ADK can create several events while the
        # agent is working:
        #
        # - model activity
        # - tool calls
        # - tool responses
        # - final response
        #
        # We only want the final response.

        if event.is_final_response():

            if (
                event.content
                and event.content.parts
            ):

                text_parts = []


                for part in event.content.parts:

                    if part.text:

                        text_parts.append(
                            part.text
                        )


                if text_parts:

                    final_response = "".join(
                        text_parts
                    )


    # --------------------------------------------------
    # Make sure the agent produced an answer
    # --------------------------------------------------

    if not final_response:

        raise RuntimeError(
            "The agent did not produce "
            "a final response."
        )


    return final_response