import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

export default function VoiceCallForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const handleStartCall = async () => {
    if (!file) {
      toast({ title: "Please upload an Excel file", status: "warning" });
      return;
    }

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Assume numbers are in first column, skip header
      const phoneNumbers = rows.slice(1).map((row) => row[0]).filter(Boolean);

      await axios.post("/api/calls/start-bulk", { phoneNumbers });

      toast({ title: "Calls started!", status: "success" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to process file or start calls", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <FormLabel>Upload Excel file with phone numbers:</FormLabel>
      <Input type="file" accept=".xlsx" onChange={handleFileChange} mb={3} />
      <Button colorScheme="teal" onClick={handleStartCall} isLoading={loading}>
        Start Calling
      </Button>
    </Box>
  );
}
