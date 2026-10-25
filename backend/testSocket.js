
import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZGM3NzI0NGFkMjBjNGFkZTJlOWViNCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc5Mjg0ODQ4MCwiZXhwIjoxNzkyOTM0ODgwfQ.QuhKW89ZPyKMHWrkJSm6tBVsGmb2Bm3J4nM5vam1aCw";

const socket = io("http://localhost:5000", {
  auth: { token },
  reconnection: false,
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.on("ticket:updated", (data) => {
  console.log("Ticket updated event received:", data);
});

socket.on("ticket:replied", (data) => {
  console.log("Ticket reply event received:", data);
});

socket.on("ticket:created", (data) => {
  console.log("New ticket event received:", data);
});

  socket.emit(
    "ticket:join",
    "6adc873752eb23f7c468c726",
    (result) => {
      console.log("Ticket access:", result);
      
    }
  );
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
  
});
