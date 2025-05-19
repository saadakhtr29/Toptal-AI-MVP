import React from "react";
import { Box, Text, Spinner } from "@chakra-ui/react";

export default function VoiceAgentStatus({ status }) {
  return (
    <Box p={4}>
      <Text fontWeight="bold">Agent Status:</Text>
      <Text>{status}</Text>
      {status === "Listening" && <Spinner size="sm" ml={2} />}
    </Box>
  );
}
