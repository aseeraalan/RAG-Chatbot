"use client";

import {
  useState,
  type FormEvent,
} from "react";

import SendIcon from "@mui/icons-material/Send";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";


type Message = {
  id: number;
  text: string;
  sender: "user" | "assistant";
};


export default function ChatPage() {

  const [input, setInput] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    const trimmedInput =
      input.trim();


    if (
      !trimmedInput
      || isLoading
    ) {

      return;
    }


    // ----------------------------------------------
    // Get JWT from sessionStorage
    // ----------------------------------------------

    const token =
      sessionStorage.getItem(
        "access_token"
      );


    if (!token) {

      const errorMessage: Message = {
        id: Date.now(),
        text:
          "Please log in before using the chat.",
        sender: "assistant",
      };


      setMessages(
        (currentMessages) => [
          ...currentMessages,
          errorMessage,
        ]
      );


      return;
    }


    // ----------------------------------------------
    // Add user's message immediately
    // ----------------------------------------------

    const userMessage: Message = {
      id: Date.now(),
      text: trimmedInput,
      sender: "user",
    };


    setMessages(
      (currentMessages) => [
        ...currentMessages,
        userMessage,
      ]
    );


    // Clear input
    setInput("");


    // Show loading indicator
    setIsLoading(true);


    try {

      // --------------------------------------------
      // Call FastAPI
      // --------------------------------------------

      const response = await fetch(
        "http://127.0.0.1:8000/echo",

        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            {
              message: trimmedInput,
            }
          ),
        }
      );


      // --------------------------------------------
      // Read JSON response
      // --------------------------------------------

      const data =
        await response.json();


      // --------------------------------------------
      // Check for backend errors
      // --------------------------------------------

      if (!response.ok) {

        throw new Error(
          data.detail
          || "The request failed."
        );
      }


      // --------------------------------------------
      // Create assistant message
      // --------------------------------------------

      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: data.message,
        sender: "assistant",
      };


      // --------------------------------------------
      // Add assistant response to chat
      // --------------------------------------------

      setMessages(
        (currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]
      );

    }

    catch (error) {

      let errorText =
        "Something went wrong while contacting the assistant.";


      if (error instanceof Error) {

        errorText =
          error.message;

      }


      const errorMessage: Message = {
        id: Date.now() + 1,
        text: errorText,
        sender: "assistant",
      };


      setMessages(
        (currentMessages) => [
          ...currentMessages,
          errorMessage,
        ]
      );

    }

    finally {

      setIsLoading(false);

    }
  }


  return (

    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 6,
        px: 2,
      }}
    >

      <Card
        elevation={6}

        sx={{
          width: "100%",
          maxWidth: 750,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >

        <CardContent
          sx={{
            p: 0
          }}
        >

          {/* Chat heading */}

          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >

            <Typography
              variant="h4"
              component="h1"
              color="primary"

              sx={{
                fontWeight: "bold"
              }}
            >

              RAG Agent Chat

            </Typography>


            <Typography
              color="text.secondary"
            >

              Ask questions about the company
              knowledge base or order statuses.

            </Typography>

          </Box>


          {/* Message history */}

          <List
            sx={{
              minHeight: 400,
              height: 450,
              overflowY: "auto",
              px: 3,
              py: 3,
              backgroundColor:
                "grey.100",
            }}
          >

            {/* Empty state */}

            {
              messages.length === 0
              && !isLoading
              ? (

                <Box
                  sx={{
                    minHeight: 340,
                    display: "flex",
                    flexDirection:
                      "column",
                    justifyContent:
                      "center",
                    alignItems:
                      "center",
                    textAlign:
                      "center",
                  }}
                >

                  <Typography
                    variant="h6"
                    color="text.secondary"

                    sx={{
                      mb: 1
                    }}
                  >

                    No messages yet

                  </Typography>


                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >

                    Type a message below
                    to start the conversation.

                  </Typography>

                </Box>

              )
              : (

                messages.map(
                  (message) => {

                    const isUser =
                      message.sender
                      === "user";


                    return (

                      <ListItem
                        key={
                          message.id
                        }

                        disableGutters

                        sx={{
                          justifyContent:
                            isUser
                              ? "flex-end"
                              : "flex-start",

                          mb: 1.5,
                        }}
                      >

                        <Paper
                          elevation={1}

                          sx={{
                            maxWidth:
                              "75%",

                            px: 2,

                            py: 1.5,

                            borderRadius:
                              3,

                            backgroundColor:
                              isUser
                                ? "primary.main"
                                : "background.paper",

                            color:
                              isUser
                                ? "primary.contrastText"
                                : "text.primary",
                          }}
                        >

                          <Typography
                            variant="body1"

                            sx={{
                              lineHeight:
                                1.5,

                              overflowWrap:
                                "anywhere",
                            }}
                          >

                            {
                              message.text
                            }

                          </Typography>

                        </Paper>

                      </ListItem>

                    );
                  }
                )
              )
            }


            {/* Loading placeholder */}

            {
              isLoading && (

                <ListItem
                  disableGutters

                  sx={{
                    justifyContent:
                      "flex-start",

                    mt: 1,
                  }}
                >

                  <Paper
                    elevation={1}

                    sx={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: 1.5,

                      px: 2,

                      py: 1.5,

                      borderRadius:
                        3,
                    }}
                  >

                    <CircularProgress
                      size={20}
                    />


                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >

                      Assistant is thinking...

                    </Typography>

                  </Paper>

                </ListItem>

              )
            }

          </List>


          {/* Message input */}

          <Box
            component="form"

            onSubmit={
              handleSubmit
            }

            sx={{
              p: 2,
              borderTop:
                "1px solid",
              borderColor:
                "divider",
            }}
          >

            <Stack
              direction="row"
              spacing={1}
            >

              <TextField
                value={input}

                onChange={
                  (event) =>
                    setInput(
                      event.target.value
                    )
                }

                label="Message"

                placeholder=
                  "Type your message..."

                fullWidth

                autoComplete="off"

                disabled={
                  isLoading
                }
              />


              <IconButton
                type="submit"

                color="primary"

                aria-label=
                  "Send message"

                disabled={
                  !input.trim()
                  || isLoading
                }

                sx={{
                  alignSelf:
                    "center",

                  width: 52,

                  height: 52,
                }}
              >

                <SendIcon />

              </IconButton>

            </Stack>

          </Box>

        </CardContent>

      </Card>

    </Box>
  );
}