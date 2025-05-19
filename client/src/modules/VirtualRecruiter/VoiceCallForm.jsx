import React, { useState } from "react";
import { Box, Input, Button, FormLabel, useToast } from "@chakra-ui/react";
import axios from "axios";

export default function VoiceCallForm() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleStartCall = async () => {
    setLoading(true);
    try {
      await axios.post("/api/calls/start", { phoneNumber: phone });
      toast({ title: "Call started!", status: "success" });
    } catch (e) {
      toast({ title: "Failed to start call", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <FormLabel>Enter your phone number:</FormLabel>
      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1234567890"
        mb={2}
      />
      <Button colorScheme="teal" onClick={handleStartCall} isLoading={loading}>
        Start Call
      </Button>
    </Box>
  );
}
