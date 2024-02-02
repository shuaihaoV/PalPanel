import { connect } from '@arrowood.dev/socket';

interface RCON_Packet {
    length: number;
    id: number;
    type: number;
    body: string;
}

interface RCON_Response {
    message: string;
    ok: boolean;
}

export class RconSocket {
    private id: number;
    private password: string;
    private isAuthenticated: boolean = false;
    private writer: import("stream/web").WritableStreamDefaultWriter<unknown>;
    private reader: import("stream/web").ReadableStreamDefaultReader<unknown>;
    private socket: any;


    constructor(private host: string, private port: number, private RCON_PASSWORD: string) {
        this.id = Math.floor(Math.random() * 65534) + 1;
        this.socket = connect({ hostname: host, port: port });
        this.writer = this.socket.writable.getWriter();
        this.reader = this.socket.readable.getReader();
        this.password = RCON_PASSWORD;
    }

    public async authenticate(): Promise<RCON_Response> {
        return new Promise<RCON_Response>((resolve, reject) => {
            const buffer = this.createBuffer(this.id, 3, this.password);
            this.send(buffer).then((send_result) => {
                if (send_result.id === this.id && send_result.type === 2) {
                    this.isAuthenticated = true;
                    resolve({
                        message: "Rcon Auth Success!",
                        ok: true
                    })
                } else {
                    resolve({
                        message: "Rcon Auth Failed: Password Error",
                        ok: false
                    })
                }
                return;
            }).catch(e => {
                resolve({
                    message: "Rcon Auth Error: " + e.message,
                    ok: false
                })
            })
        });
    }

    public async sendCommand(command: string): Promise<RCON_Response> {
        if (!this.isAuthenticated) {
            const auth_result = await this.authenticate();
            if(!auth_result.ok){
                return auth_result;
            }
        }
        return new Promise<RCON_Response>((resolve, reject) => {
            if (!this.isAuthenticated) {
                resolve({
                    message: "Rcon Command Error: Rcon Auth Failed",
                    ok: false
                })
                return;
            };
            const buffer = this.createBuffer(this.id, 2, command);
            this.send(buffer).then((send_result) => {
                if (send_result.id === -1) {
                    resolve({
                        message: "Rcon Command Error: Wrong Password",
                        ok: false
                    })
                } else {
                    resolve({
                        message: send_result.body,
                        ok: true
                    })
                }
                return;
            }).catch(e => {
                resolve({
                    message: "Rcon Command Error: " + e.message,
                    ok: false
                })
            })
        })
    }

    public async close(): Promise<void> {
        await this.socket.close(); // Close the socket connection
    }

    private async send(buffer: Buffer) {
        await this.writer.write(buffer);
        const received_buffer = await this.reader.read();
        return this.readBuffer(Buffer.from(received_buffer.value as Buffer));
    }

    private createBuffer(id: number, type: number, body: string) {
        const bodyBuffer = Buffer.from(body, 'utf8');
        const buffer = Buffer.alloc(14 + bodyBuffer.length);
        buffer.writeInt32LE(10 + bodyBuffer.length, 0);
        buffer.writeInt32LE(id, 4);
        buffer.writeInt32LE(type, 8);
        buffer.write(body, 12, 'utf8');
        buffer.writeInt8(0, 12 + bodyBuffer.length);
        buffer.writeInt8(0, 13 + bodyBuffer.length);
        return buffer;
    }
    
    private readBuffer(packet: Buffer): RCON_Packet {
        const length = packet.readInt32LE(0);
        let recv_data: RCON_Packet = {
            length: length,
            id: packet.readInt32LE(4) !== 0 ? packet.readInt32LE(4) : this.id,
            type: packet.readInt32LE(8),
            body: ""
        }
        if (packet.length === 4 + length && !packet.readInt16LE(packet.length - 2)) {
            recv_data.body = packet.toString('utf8', 12, packet.length - 2);
        } else {
            recv_data.body = `Packet Format Error! : ${packet}`
        }
        return recv_data;
    }
}