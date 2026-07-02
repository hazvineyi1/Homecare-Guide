export const streamTutorResponse = async (
  conversationId: number,
  content: string,
  messageType: string,
  onChunk: (text: string) => void,
  onDone: () => void
) => {
  const response = await fetch(`/api/tutor/sessions/${conversationId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, messageType }),
  });
  
  if (!response.body) {
    onDone();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.done) {
            onDone();
            return;
          }
          if (data.content) {
            onChunk(data.content);
          }
        } catch (e) {
          console.error("Error parsing SSE JSON", e);
        }
      }
    }
  }
  onDone();
};
