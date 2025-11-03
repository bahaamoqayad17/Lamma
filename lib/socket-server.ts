// Get the Socket.io instance from global
export function getIO() {
  if (typeof global !== "undefined" && (global as any).io) {
    return (global as any).io;
  }
  return null;
}

// Helper function to emit to all clients in a game room
export function emitToGame(gameId: string, event: string, data: any) {
  const io = getIO();
  if (io) {
    io.to(`game:${gameId}`).emit(event, data);
  }
}

// Helper function to emit to a specific client
export function emitToClient(socketId: string, event: string, data: any) {
  const io = getIO();
  if (io) {
    io.to(socketId).emit(event, data);
  }
}
