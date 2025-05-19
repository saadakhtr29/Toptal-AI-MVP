import React from "react";
import { useNavigate } from "react-router-dom";

const modules = [
  { name: "Virtual Recruiter", path: "/virtual-recruiter" },
  { name: "Interviewer", path: "/interviewer" },
  { name: "AI Recruiter", path: "/recruiter" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <Box p={8}>
      <Heading mb={8}>Dashboard</Heading>
      <SimpleGrid columns={[1, 3]} spacing={8}>
        {modules.map((mod) => (
          <Box
            key={mod.name}
            p={6}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="md"
          >
            <Heading size="md" mb={4}>
              {mod.name}
            </Heading>
            <Button colorScheme="teal" onClick={() => navigate(mod.path)}>
              Go to {mod.name}
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
