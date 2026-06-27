import { Server } from 'socket.io';

let ioInstance = null;

/**
 * Socket Service for real-time dashboard updates
 */
class SocketService {
    /**
     * Initialize Socket.io on the HTTP server
     * @param {Object} httpServer - HTTP Server instance
     * @param {Array<string>} allowedOrigins - List of CORS allowed origins
     */
    static init(httpServer, allowedOrigins) {
        if (ioInstance) {
            console.warn('SocketService already initialized');
            return ioInstance;
        }

        ioInstance = new Server(httpServer, {
            cors: {
                origin: allowedOrigins,
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        ioInstance.on('connection', (socket) => {
            console.log(`🔌 New Socket client connected: ${socket.id}`);

            // Room joining: Client admin joins a room specifically for their organization
            socket.on('join_org', (orgId) => {
                if (orgId) {
                    socket.join(`org_${orgId}`);
                    console.log(`🔌 Client ${socket.id} joined room: org_${orgId}`);
                }
            });

            socket.on('disconnect', () => {
                console.log(`🔌 Socket client disconnected: ${socket.id}`);
            });
        });

        console.log('✅ Socket.io initialized successfully');
        return ioInstance;
    }

    /**
     * Get the active Socket.io instance
     */
    static getIO() {
        if (!ioInstance) {
            console.error('SocketService not initialized yet');
        }
        return ioInstance;
    }

    /**
     * Broadcast live call update to the organization's room
     * @param {string} orgId 
     * @param {Object} callData 
     */
    static emitLiveCall(orgId, callData) {
        const io = this.getIO();
        if (io) {
            io.to(`org_${orgId}`).emit('live_call_update', callData);
        }
    }

    /**
     * Broadcast credit balance update to the organization's room
     * @param {string} orgId 
     * @param {number} balance 
     */
    static emitWalletUpdate(orgId, balance) {
        const io = this.getIO();
        if (io) {
            io.to(`org_${orgId}`).emit('wallet_update', { balance });
        }
    }
}

export default SocketService;
