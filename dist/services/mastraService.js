"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastraService = void 0;
require("@mastra/client-js");
class MastraService {
    constructor(endpoint) {
        this.agentClient = null;
        this.endpoint = endpoint;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.agentClient = yield AgentClient.connect(this.endpoint);
                console.log('Connected to Mastra Agent at', this.endpoint);
                return true;
            }
            catch (error) {
                console.error('Failed to connect to Mastra Agent:', error);
                return false;
            }
        });
    }
    updateEndpoint(endpoint) {
        this.endpoint = endpoint;
        this.agentClient = null; // Reset connection
    }
    sendMessage(message, onStreamUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.agentClient) {
                yield this.initialize();
            }
            if (!this.agentClient) {
                throw new Error('Failed to connect to Mastra Agent');
            }
            try {
                let fullResponse = '';
                // streamモードで通信
                yield this.agentClient.agentChat.streamChat({
                    messages: [{ role: 'user', content: message }],
                    onStreamUpdate: (response) => {
                        var _a, _b;
                        if (response.choices && response.choices.length > 0) {
                            const chunk = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.delta) === null || _b === void 0 ? void 0 : _b.content) || '';
                            fullResponse += chunk;
                            onStreamUpdate(fullResponse);
                        }
                    }
                });
                return fullResponse;
            }
            catch (error) {
                console.error('Error sending message to Mastra Agent:', error);
                throw error;
            }
        });
    }
    getConversationHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.agentClient) {
                yield this.initialize();
            }
            if (!this.agentClient) {
                throw new Error('Failed to connect to Mastra Agent');
            }
            try {
                const history = yield this.agentClient.memory.list();
                return history;
            }
            catch (error) {
                console.error('Error getting conversation history:', error);
                throw error;
            }
        });
    }
    deleteAllConversations() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.agentClient) {
                yield this.initialize();
            }
            if (!this.agentClient) {
                throw new Error('Failed to connect to Mastra Agent');
            }
            try {
                yield this.agentClient.memory.deleteAll();
            }
            catch (error) {
                console.error('Error deleting all conversations:', error);
                throw error;
            }
        });
    }
}
exports.MastraService = MastraService;
//# sourceMappingURL=mastraService.js.map